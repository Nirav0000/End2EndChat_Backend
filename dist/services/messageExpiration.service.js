import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { retentionMs } from './message.service.js';
/** Applies disappearing-message settings once per minute. */
export class MessageExpirationService {
    static async expireDueMessages(io) {
        const now = new Date();
        const databaseExpired = await Message.find({ expiresAt: { $lte: now } })
            .select('_id conversationId')
            .lean();
        const activeDisappearingConvs = await Conversation.find({
            'disappearingMessages.duration': { $exists: true, $ne: 'never' }
        }).select('_id disappearingMessages').lean();
        const additionalExpired = [];
        for (const conv of activeDisappearingConvs) {
            const dur = conv.disappearingMessages?.duration;
            if (!dur || dur === 'never')
                continue;
            const durMs = retentionMs[dur];
            if (!durMs)
                continue;
            const cutoff = new Date(now.getTime() - durMs);
            const oldMsgs = await Message.find({
                conversationId: conv._id,
                createdAt: { $lte: cutoff }
            }).select('_id conversationId').lean();
            additionalExpired.push(...oldMsgs);
        }
        const allExpiredMap = new Map();
        [...databaseExpired, ...additionalExpired].forEach(msg => {
            allExpiredMap.set(msg._id.toString(), msg);
        });
        const allExpired = Array.from(allExpiredMap.values());
        if (allExpired.length) {
            const expiredIds = allExpired.map(message => message._id);
            await Message.deleteMany({ _id: { $in: expiredIds } });
            const byConversation = new Map();
            allExpired.forEach(message => {
                const id = message.conversationId.toString();
                byConversation.set(id, [...(byConversation.get(id) || []), message._id.toString()]);
            });
            for (const [conversationId, messageIds] of byConversation.entries()) {
                const conv = await Conversation.findById(conversationId);
                if (conv && conv.lastMessage && messageIds.includes(conv.lastMessage.toString())) {
                    const newest = await Message.findOne({ conversationId }).sort({ createdAt: -1 }).lean();
                    conv.lastMessage = newest ? newest._id : undefined;
                    await conv.save();
                }
                io.to(`conv:${conversationId}`).emit('messages:expired', { messageIds });
            }
        }
        const personalExpired = await Message.find({
            expiresFor: { $elemMatch: { expiresAt: { $lte: now } } }
        }).select('_id conversationId expiresFor').lean();
        for (const message of personalExpired) {
            const dueSettings = (message.expiresFor || []).filter(setting => setting.expiresAt <= now);
            if (!dueSettings.length)
                continue;
            await Message.updateOne({ _id: message._id }, {
                $addToSet: { deletedFor: { $each: dueSettings.map(setting => setting.userId) } },
                $pull: { expiresFor: { expiresAt: { $lte: now } } }
            });
            dueSettings.forEach(setting => {
                io.to(`user:${setting.userId.toString()}`).emit('messages:expired', {
                    messageIds: [message._id.toString()]
                });
            });
        }
    }
}
//# sourceMappingURL=messageExpiration.service.js.map