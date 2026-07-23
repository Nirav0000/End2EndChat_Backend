import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const chatRequestSchema = new Schema<IChatRequest>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, {
  timestamps: true
});

// Avoid duplicate requests
chatRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export const ChatRequest = mongoose.model<IChatRequest>('ChatRequest', chatRequestSchema);
