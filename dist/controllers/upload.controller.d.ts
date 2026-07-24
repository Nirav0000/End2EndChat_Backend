import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class UploadController {
    static getPresignedUrl(req: AuthRequest, res: Response): Promise<void>;
    static getFile(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=upload.controller.d.ts.map