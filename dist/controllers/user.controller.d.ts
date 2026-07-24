import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class UserController {
    static search(req: AuthRequest, res: Response): Promise<void>;
    static getMe(req: AuthRequest, res: Response): Promise<void>;
    static updateMe(req: AuthRequest, res: Response): Promise<void>;
    static blockUser(req: AuthRequest, res: Response): Promise<void>;
    static unblockUser(req: AuthRequest, res: Response): Promise<void>;
    static reportUser(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map