import mongoose, { Document } from 'mongoose';
export interface IChatRequest extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatRequest: mongoose.Model<IChatRequest, {}, {}, {}, mongoose.Document<unknown, {}, IChatRequest, {}, {}> & IChatRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatRequest.d.ts.map