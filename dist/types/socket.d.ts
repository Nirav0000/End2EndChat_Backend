export interface ServerToClientEvents {
    'message:new': (message: any) => void;
    'message:status-update': (data: {
        messageId: string;
        status: 'delivered' | 'read';
        userId: string;
    }) => void;
    'message:reaction-update': (data: {
        messageId: string;
        userId: string;
        emoji: string;
        type: 'add' | 'remove';
    }) => void;
    'message:deleted': (data: {
        messageId: string;
        message: any;
    }) => void;
    'typing:update': (data: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
    }) => void;
    'presence:update': (data: {
        userId: string;
        status: 'online' | 'offline';
        lastSeen?: Date;
    }) => void;
    'call:incoming': (data: {
        callId: string;
        callerId: string;
        callerName: string;
        callerAvatar: string;
        conversationId?: string;
        type: 'voice' | 'video';
    }) => void;
    'call:created': (data: {
        callId: string;
        calleeId: string;
    }) => void;
    'call:offer': (data: {
        callId: string;
        callerId: string;
        sdp: any;
    }) => void;
    'call:answer': (data: {
        callId: string;
        calleeId: string;
        sdp: any;
    }) => void;
    'call:ice-candidate': (data: {
        callId: string;
        senderId: string;
        candidate: any;
    }) => void;
    'call:ended': (data: {
        callId: string;
        reason: string;
    }) => void;
    'error': (data: {
        code: string;
        message: string;
    }) => void;
}
export interface ClientToServerEvents {
    'message:send': (data: {
        conversationId: string;
        content?: string;
        mediaUrl?: string;
        mediaThumbnailUrl?: string;
        mediaSizeBytes?: number;
        mediaDurationSec?: number;
        replyTo?: string;
        type?: 'text' | 'image' | 'video' | 'audio' | 'file';
    }) => void;
    'message:delivered': (data: {
        messageId: string;
        conversationId: string;
    }) => void;
    'message:read': (data: {
        messageId: string;
        conversationId: string;
    }) => void;
    'message:react': (data: {
        messageId: string;
        conversationId: string;
        emoji: string;
    }) => void;
    'message:delete': (data: {
        messageId: string;
        conversationId: string;
        forEveryone: boolean;
    }) => void;
    'typing:start': (data: {
        conversationId: string;
    }) => void;
    'typing:stop': (data: {
        conversationId: string;
    }) => void;
    'call:offer': (data: {
        callId: string;
        calleeId: string;
        sdp: any;
    }) => void;
    'call:answer': (data: {
        callId: string;
        callerId: string;
        sdp: any;
    }) => void;
    'call:ice-candidate': (data: {
        callId: string;
        targetId: string;
        candidate: any;
    }) => void;
    'call:request': (data: {
        calleeId: string;
        type: 'voice' | 'video';
        conversationId?: string;
    }) => void;
    'call:respond': (data: {
        callerId: string;
        accept: boolean;
        callId: string;
    }) => void;
    'call:webrtc-offer': (data: {
        targetId: string;
        sdp: any;
    }) => void;
    'call:webrtc-answer': (data: {
        targetId: string;
        sdp: any;
    }) => void;
    'call:end': (data: {
        callId: string;
    }) => void;
}
export interface SocketData {
    userId: string;
    name: string;
}
//# sourceMappingURL=socket.d.ts.map