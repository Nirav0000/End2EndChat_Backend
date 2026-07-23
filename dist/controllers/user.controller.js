import { UserService } from '../services/user.service.js';
export class UserController {
    static async search(req, res) {
        const query = req.query.q || '';
        const users = await UserService.searchUsers(query, req.userId);
        res.json(users);
    }
    static async getMe(req, res) {
        const user = await UserService.getProfile(req.userId);
        res.json(user);
    }
    static async updateMe(req, res) {
        const user = await UserService.updateProfile(req.userId, req.body);
        res.json(user);
    }
    static async blockUser(req, res) {
        await UserService.blockUser(req.userId, req.params.id);
        res.json({ success: true });
    }
    static async unblockUser(req, res) {
        await UserService.unblockUser(req.userId, req.params.id);
        res.json({ success: true });
    }
    static async reportUser(req, res) {
        await UserService.reportUser(req.userId, req.params.id, req.body.reason);
        res.json({ success: true });
    }
}
//# sourceMappingURL=user.controller.js.map