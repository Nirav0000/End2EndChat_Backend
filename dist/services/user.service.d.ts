import mongoose from 'mongoose';
export declare class UserService {
    static searchUsers(query: string, currentUserId: string): Promise<(mongoose.FlattenMaps<import("../models/User.js").IUser> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static getProfile(userId: string): Promise<(mongoose.FlattenMaps<import("../models/User.js").IUser> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static updateProfile(userId: string, updates: any): Promise<(mongoose.FlattenMaps<import("../models/User.js").IUser> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static blockUser(blockerId: string, targetId: string): Promise<(mongoose.Document<unknown, {}, import("../models/User.js").IUser, {}, {}> & import("../models/User.js").IUser & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static unblockUser(blockerId: string, targetId: string): Promise<(mongoose.Document<unknown, {}, import("../models/User.js").IUser, {}, {}> & import("../models/User.js").IUser & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static reportUser(reporterId: string, targetId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map