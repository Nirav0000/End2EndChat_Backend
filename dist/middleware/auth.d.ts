import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: any;
    userId?: string;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map