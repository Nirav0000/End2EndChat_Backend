import mongoose from 'mongoose';
export declare const retentionMs: Record<'1d' | '3d' | '7d' | '30d', number>;
export declare class MessageService {
    static sendMessage(conversationId: string, senderId: string, data: any): Promise<import("../models/Message.js").IMessage & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static getMessages(conversationId: string, userId: string, before?: string, limit?: number): Promise<(mongoose.FlattenMaps<import("../models/Message.js").IMessage> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static markDelivered(messageIds: string[], userId: string): Promise<mongoose.UpdateWriteOpResult>;
    static markRead(messageIds: string[], userId: string): Promise<mongoose.UpdateWriteOpResult>;
    static addReaction(messageId: string, userId: string, emoji: string): Promise<(mongoose.Document<unknown, {}, import("../models/Message.js").IMessage, {}, {}> & import("../models/Message.js").IMessage & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static removeReaction(messageId: string, userId: string): Promise<(mongoose.Document<unknown, {}, import("../models/Message.js").IMessage, {}, {}> & import("../models/Message.js").IMessage & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static editMessage(messageId: string, userId: string, newText: string): Promise<mongoose.Document<unknown, {}, import("../models/Message.js").IMessage, {}, {}> & import("../models/Message.js").IMessage & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<mongoose.Document<unknown, {}, import("../models/Message.js").IMessage, {}, {}> & import("../models/Message.js").IMessage & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static searchMessages(conversationId: string, query: string, userId: string): Promise<(mongoose.FlattenMaps<import("../models/Message.js").IMessage> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
//# sourceMappingURL=message.service.d.ts.map