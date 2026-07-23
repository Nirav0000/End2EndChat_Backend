import mongoose, { Schema } from 'mongoose';
const messageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image', 'video', 'audio', 'file', 'call'], default: 'text' },
    content: { type: String },
    mediaUrl: { type: String },
    mediaThumbnailUrl: { type: String },
    mediaSizeBytes: { type: Number },
    mediaDurationSec: { type: Number },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            emoji: { type: String }
        }],
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedForEveryone: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    expiresAt: { type: Date, index: true },
    expiresFor: [{
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            expiresAt: { type: Date, required: true }
        }]
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ content: 'text' });
export const Message = mongoose.model('Message', messageSchema);
//# sourceMappingURL=Message.js.map