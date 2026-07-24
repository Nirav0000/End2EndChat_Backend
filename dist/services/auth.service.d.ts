export declare class AuthService {
    static register(name: string, email: string, password: string): Promise<import("../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static login(email: string, password: string): Promise<{
        user: {
            id: any;
            name: string;
            email: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static generateAccessToken(userId: string): string;
    static generateRefreshToken(userId: string, tokenVersion: number): string;
    static refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static logout(userId: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map