import mongoose, { Schema } from 'mongoose';
const conversationSchema = new Schema({
    type: { type: String, enum: ['direct', 'group'], required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    groupName: { type: String },
    groupAvatarUrl: { type: String },
    groupAdmins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    mutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    hiddenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messageRetention: [{
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            duration: { type: String, enum: ['1d', '3d', '7d', '30d', 'never'], required: true },
            deleteFromDatabase: { type: Boolean, default: false },
            configuredAt: { type: Date, default: Date.now }
        }],
    disappearingMessages: {
        duration: { type: String, enum: ['1d', '3d', '7d', '30d', 'never'] },
        enabledAt: { type: Date },
        enabledBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }
}, {
    timestamps: true
});
conversationSchema.index({ participants: 1 });
conversationSchema.statics.findByParticipant = function (userId) {
    return this.find({ participants: userId }).sort({ updatedAt: -1 });
};
conversationSchema.statics.findDirectBetween = function (user1Id, user2Id) {
    return this.findOne({
        type: 'direct',
        participants: { $all: [user1Id, user2Id], $size: 2 }
    });
};
export const Conversation = mongoose.model('Conversation', conversationSchema);
//# sourceMappingURL=Conversation.js.map