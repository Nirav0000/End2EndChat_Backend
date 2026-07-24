import mongoose, { Document } from 'mongoose';
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
    expiresFor: {
        userId: mongoose.Types.ObjectId;
        expiresAt: Date;
    }[];
    createdAt: Date;
}
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Message.d.ts.map