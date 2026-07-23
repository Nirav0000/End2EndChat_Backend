import mongoose, { Schema, Document } from 'mongoose';

export interface ICall extends Document {
  callerId: mongoose.Types.ObjectId;
  calleeId: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  type: 'voice' | 'video';
  status: 'missed' | 'declined' | 'completed';
  startedAt?: Date;
  endedAt?: Date;
  durationSec?: number;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>({
  callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  type: { type: String, enum: ['voice', 'video'], required: true },
  status: { type: String, enum: ['missed', 'declined', 'completed'], required: true },
  startedAt: { type: Date },
  endedAt: { type: Date },
  durationSec: { type: Number }
}, {
  timestamps: true
});

export const Call = mongoose.model<ICall>('Call', callSchema);
