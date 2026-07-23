import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class ConversationController {
    static getConversations(req: AuthRequest, res: Response): Promise<void>;
    static createConversation(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getMessages(req: AuthRequest, res: Response): Promise<void>;
    static updateConversation(req: AuthRequest, res: Response): Promise<void>;
    static leaveConversation(req: AuthRequest, res: Response): Promise<void>;
    static pinConversation(req: AuthRequest, res: Response): Promise<void>;
    static favoriteConversation(req: AuthRequest, res: Response): Promise<void>;
    static muteConversation(req: AuthRequest, res: Response): Promise<void>;
    static updateMessageRetention(req: AuthRequest, res: Response): Promise<void>;
    static clearConversation(req: AuthRequest, res: Response): Promise<void>;
    static deleteConversation(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=conversation.controller.d.ts.map