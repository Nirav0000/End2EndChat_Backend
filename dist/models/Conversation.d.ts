import mongoose, { Document, Model } from 'mongoose';
export type RetentionDuration = '1d' | '3d' | '7d' | '30d' | 'never';
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
export declare const Conversation: IConversationModel;
export {};
//# sourceMappingURL=Conversation.d.ts.map