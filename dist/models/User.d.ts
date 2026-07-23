import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map