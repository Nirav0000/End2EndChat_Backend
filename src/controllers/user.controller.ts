import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserService } from '../services/user.service.js';

export class UserController {
  static async search(req: AuthRequest, res: Response) {
    const query = req.query.q as string || '';
    const users = await UserService.searchUsers(query, req.userId!);
    res.json(users);
  }

  static async getMe(req: AuthRequest, res: Response) {
    const user = await UserService.getProfile(req.userId!);
    res.json(user);
  }

  static async updateMe(req: AuthRequest, res: Response) {
    const user = await UserService.updateProfile(req.userId!, req.body);
    res.json(user);
  }

  static async blockUser(req: AuthRequest, res: Response) {
    await UserService.blockUser(req.userId!, req.params.id as string);
    res.json({ success: true });
  }

  static async unblockUser(req: AuthRequest, res: Response) {
    await UserService.unblockUser(req.userId!, req.params.id as string);
    res.json({ success: true });
  }

  static async reportUser(req: AuthRequest, res: Response) {
    await UserService.reportUser(req.userId!, req.params.id as string, req.body.reason);
    res.json({ success: true });
  }
}
