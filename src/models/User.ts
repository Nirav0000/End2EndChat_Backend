import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  lastSeen?: Date;
  lastSeenVisible: boolean;
  refreshTokenVersion: number;
  blockedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isBlocking(userId: mongoose.Types.ObjectId | string): boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String },
  bio: { type: String },
  lastSeen: { type: Date },
  lastSeenVisible: { type: Boolean, default: true },
  refreshTokenVersion: { type: Number, default: 0 },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

userSchema.index({ name: 'text', email: 'text' });

userSchema.methods.isBlocking = function(userId: mongoose.Types.ObjectId | string) {
  return this.blockedUsers.some((id: mongoose.Types.ObjectId) => id.toString() === userId.toString());
};

export const User = mongoose.model<IUser>('User', userSchema);
