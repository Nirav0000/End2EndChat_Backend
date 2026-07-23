import { User } from '../models/User.js';
import mongoose from 'mongoose';

export class UserService {
  static async searchUsers(query: string, currentUserId: string) {
    const searchRegex = new RegExp(query, 'i');
    return User.find({
      _id: { $ne: currentUserId },
      $or: [{ name: searchRegex }, { email: searchRegex }],
    })
      .select('-passwordHash')
      .limit(20)
      .lean();
  }

  static async getProfile(userId: string) {
    return User.findById(userId).select('-passwordHash').lean();
  }

  static async updateProfile(userId: string, updates: any) {
    const allowedUpdates = ['name', 'phone', 'avatarUrl', 'bio', 'lastSeenVisible'];
    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }
    return User.findByIdAndUpdate(userId, updateData, { new: true }).select('-passwordHash').lean();
  }

  static async blockUser(blockerId: string, targetId: string) {
    return User.findByIdAndUpdate(
      blockerId,
      { $addToSet: { blockedUsers: new mongoose.Types.ObjectId(targetId) } },
      { new: true }
    );
  }

  static async unblockUser(blockerId: string, targetId: string) {
    return User.findByIdAndUpdate(
      blockerId,
      { $pull: { blockedUsers: new mongoose.Types.ObjectId(targetId) } },
      { new: true }
    );
  }

  static async reportUser(reporterId: string, targetId: string, reason: string) {
    // In a real app, save to a Report model
    console.log(`User ${reporterId} reported ${targetId} for: ${reason}`);
    return { success: true };
  }
}
