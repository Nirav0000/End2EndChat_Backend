import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
export class AuthService {
    static async register(name, email, password) {
        const passwordHash = await bcryptjs.hash(password, 12);
        const user = new User({ name, email, passwordHash, refreshTokenVersion: 0 });
        await user.save();
        const userObj = user.toObject();
        delete userObj.passwordHash;
        return userObj;
    }
    static async login(email, password) {
        const user = await User.findOne({ email }).exec();
        if (!user) {
            throw { name: 'ValidationError', message: 'Invalid credentials' };
        }
        const isMatch = await bcryptjs.compare(password, user.passwordHash);
        if (!isMatch) {
            throw { name: 'ValidationError', message: 'Invalid credentials' };
        }
        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id, user.refreshTokenVersion);
        return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };
    }
    static generateAccessToken(userId) {
        return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    }
    static generateRefreshToken(userId, tokenVersion) {
        return jwt.sign({ userId, version: tokenVersion }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }
    static async refreshTokens(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.userId).exec();
            if (!user || user.refreshTokenVersion !== decoded.version) {
                throw new Error('Invalid refresh token');
            }
            const newAccessToken = this.generateAccessToken(user.id);
            const newRefreshToken = this.generateRefreshToken(user.id, user.refreshTokenVersion);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (err) {
            throw { name: 'JsonWebTokenError', message: 'Invalid or expired refresh token' };
        }
    }
    static async logout(userId) {
        await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
    }
}
//# sourceMappingURL=auth.service.js.map