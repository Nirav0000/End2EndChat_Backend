export declare class PresenceService {
    static setOnline(userId: string): Promise<void>;
    static setOffline(userId: string): Promise<void>;
    static getOnlineStatus(userId: string): Promise<boolean>;
    static getOnlineStatuses(userIds: string[]): Promise<Record<string, boolean>>;
}
//# sourceMappingURL=presence.service.d.ts.map