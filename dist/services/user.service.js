import { User } from '../models/User.js';
import mongoose from 'mongoose';
export class UserService {
    static async searchUsers(query, currentUserId) {
        const searchRegex = new RegExp(query, 'i');
        return User.find({
            _id: { $ne: currentUserId },
            $or: [{ name: searchRegex }, { email: searchRegex }],
        })
            .select('-passwordHash')
            .limit(20)
            .lean();
    }
    static async getProfile(userId) {
        return User.findById(userId).select('-passwordHash').lean();
    }
    static async updateProfile(userId, updates) {
        const allowedUpdates = ['name', 'phone', 'avatarUrl', 'bio', 'lastSeenVisible'];
        const updateData = {};
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                updateData[key] = updates[key];
            }
        }
        return User.findByIdAndUpdate(userId, updateData, { new: true }).select('-passwordHash').lean();
    }
    static async blockUser(blockerId, targetId) {
        return User.findByIdAndUpdate(blockerId, { $addToSet: { blockedUsers: new mongoose.Types.ObjectId(targetId) } }, { new: true });
    }
    static async unblockUser(blockerId, targetId) {
        return User.findByIdAndUpdate(blockerId, { $pull: { blockedUsers: new mongoose.Types.ObjectId(targetId) } }, { new: true });
    }
    static async reportUser(reporterId, targetId, reason) {
        // In a real app, save to a Report model
        console.log(`User ${reporterId} reported ${targetId} for: ${reason}`);
        return { success: true };
    }
}
//# sourceMappingURL=user.service.js.map