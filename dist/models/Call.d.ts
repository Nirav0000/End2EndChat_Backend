import mongoose, { Document } from 'mongoose';
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
export declare const Call: mongoose.Model<ICall, {}, {}, {}, mongoose.Document<unknown, {}, ICall, {}, {}> & ICall & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Call.d.ts.map