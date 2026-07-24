import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class RequestController {
    static send(req: AuthRequest, res: Response): Promise<void>;
    static getPending(req: AuthRequest, res: Response): Promise<void>;
    static respond(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=request.controller.d.ts.map