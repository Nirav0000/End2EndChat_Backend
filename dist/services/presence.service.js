import { redis, isRedisConnected } from '../config/redis.js';
import { User } from '../models/User.js';
export class PresenceService {
    static async setOnline(userId) {
        if (!isRedisConnected() || !redis)
            return;
        try {
            await redis.set(`presence:${userId}`, 'online');
        }
        catch (error) {
            console.warn('Redis error in setOnline:', error);
        }
    }
    static async setOffline(userId) {
        try {
            if (isRedisConnected() && redis) {
                await redis.del(`presence:${userId}`);
            }
            await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        }
        catch (error) {
            console.warn('Error in setOffline:', error);
        }
    }
    static async getOnlineStatus(userId) {
        if (!isRedisConnected() || !redis)
            return false;
        try {
            const val = await redis.get(`presence:${userId}`);
            return val === 'online';
        }
        catch (error) {
            return false;
        }
    }
    static async getOnlineStatuses(userIds) {
        if (!isRedisConnected() || !redis || userIds.length === 0)
            return {};
        try {
            const pipeline = redis.pipeline();
            userIds.forEach(id => pipeline.get(`presence:${id}`));
            const results = await pipeline.exec();
            const statuses = {};
            userIds.forEach((id, index) => {
                statuses[id] = results?.[index]?.[1] === 'online';
            });
            return statuses;
        }
        catch (error) {
            console.warn('Redis error in getOnlineStatuses:', error);
            return {};
        }
    }
}
//# sourceMappingURL=presence.service.js.map