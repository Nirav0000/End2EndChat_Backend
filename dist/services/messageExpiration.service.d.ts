import type { Server } from 'socket.io';
/** Applies disappearing-message settings once per minute. */
export declare class MessageExpirationService {
    static expireDueMessages(io: Server): Promise<void>;
}
//# sourceMappingURL=messageExpiration.service.d.ts.map