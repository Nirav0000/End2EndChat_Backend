import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
  userId: mongoose.Types.ObjectId;
  emoji: string;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'call';
  content?: string;
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  mediaSizeBytes?: number;
  mediaDurationSec?: number;
  replyTo?: mongoose.Types.ObjectId;
  reactions: IReaction[];
  deliveredTo: mongoose.Types.ObjectId[];
  readBy: mongoose.Types.ObjectId[];
  deletedFor: mongoose.Types.ObjectId[];
  deletedForEveryone: boolean;
  edited: boolean;
  editedAt?: Date;
  expiresAt?: Date;
  expiresFor: { userId: mongoose.Types.ObjectId; expiresAt: Date }[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
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

export const Message = mongoose.model<IMessage>('Message', messageSchema);
