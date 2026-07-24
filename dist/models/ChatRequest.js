import mongoose, { Schema } from 'mongoose';
const chatRequestSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, {
    timestamps: true
});
// Avoid duplicate requests
chatRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
export const ChatRequest = mongoose.model('ChatRequest', chatRequestSchema);
//# sourceMappingURL=ChatRequest.js.map