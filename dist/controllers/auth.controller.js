import { AuthService } from '../services/auth.service.js';
export class AuthController {
    static async register(req, res) {
        const { name, email, password } = req.body;
        const user = await AuthService.register(name, email, password);
        res.status(201).json(user);
    }
    static async login(req, res) {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await AuthService.login(email, password);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/api/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ user, accessToken });
    }
    static async refresh(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
        }
        const tokens = await AuthService.refreshTokens(refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/api/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ accessToken: tokens.accessToken });
    }
    static async logout(req, res) {
        const userId = req.userId;
        if (userId) {
            await AuthService.logout(userId);
        }
        res.clearCookie('refreshToken', { path: '/api/auth' });
        res.json({ success: true });
    }
}
//# sourceMappingURL=auth.controller.js.map