import mongoose, { Schema, Document, Model } from 'mongoose';

export type RetentionDuration = 'after_read' | '1d' | '3d' | '7d' | '30d' | 'never';

export interface IMessageRetentionSetting {
  userId: mongoose.Types.ObjectId;
  duration: RetentionDuration;
  deleteFromDatabase: boolean;
  configuredAt: Date;
}

export interface IDisappearingMessagesSetting {
  duration: RetentionDuration;
  enabledAt: Date;
  enabledBy: mongoose.Types.ObjectId;
}

export interface IConversation extends Document {
  type: 'direct' | 'group';
  participants: mongoose.Types.ObjectId[];
  groupName?: string;
  groupAvatarUrl?: string;
  groupAdmins?: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  mutedBy: mongoose.Types.ObjectId[];
  pinnedBy: mongoose.Types.ObjectId[];
  favoritedBy: mongoose.Types.ObjectId[];
  hiddenBy: mongoose.Types.ObjectId[];
  messageRetention: IMessageRetentionSetting[];
  disappearingMessages?: IDisappearingMessagesSetting;
  createdAt: Date;
  updatedAt: Date;
}

interface IConversationModel extends Model<IConversation> {
  findByParticipant(userId: mongoose.Types.ObjectId | string): Promise<IConversation[]>;
  findDirectBetween(user1Id: mongoose.Types.ObjectId | string, user2Id: mongoose.Types.ObjectId | string): Promise<IConversation | null>;
}

const conversationSchema = new Schema<IConversation>({
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
    duration: { type: String, enum: ['after_read', '1d', '3d', '7d', '30d', 'never'], required: true },
    deleteFromDatabase: { type: Boolean, default: false },
    configuredAt: { type: Date, default: Date.now }
  }],
  disappearingMessages: {
    duration: { type: String, enum: ['after_read', '1d', '3d', '7d', '30d', 'never'] },
    enabledAt: { type: Date },
    enabledBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });

conversationSchema.statics.findByParticipant = function(userId: mongoose.Types.ObjectId | string) {
  return this.find({ participants: userId }).sort({ updatedAt: -1 });
};

conversationSchema.statics.findDirectBetween = function(user1Id: mongoose.Types.ObjectId | string, user2Id: mongoose.Types.ObjectId | string) {
  return this.findOne({
    type: 'direct',
    participants: { $all: [user1Id, user2Id], $size: 2 }
  });
};

export const Conversation = mongoose.model<IConversation, IConversationModel>('Conversation', conversationSchema);
