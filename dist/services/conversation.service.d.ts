import { type RetentionDuration } from '../models/Conversation.js';
import mongoose from 'mongoose';
export declare class ConversationService {
    static readonly retentionMs: Record<Exclude<RetentionDuration, 'never'>, number>;
    static createDirectConversation(userId1: string, userId2: string): Promise<any>;
    static createGroupConversation(creatorId: string, name: string, memberIds: string[]): Promise<mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static getConversations(userId: string): Promise<(mongoose.FlattenMaps<import("../models/Conversation.js").IConversation> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static getConversation(conversationId: string, userId: string): Promise<mongoose.FlattenMaps<import("../models/Conversation.js").IConversation> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static updateGroup(conversationId: string, userId: string, updates: any): Promise<mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static addGroupMembers(conversationId: string, adminId: string, memberIds: string[]): Promise<(mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static removeGroupMember(conversationId: string, adminId: string, memberId: string): Promise<(mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static leaveGroup(conversationId: string, userId: string): Promise<(mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static muteConversation(conversationId: string, userId: string, mute: boolean): Promise<(mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static updateMessageRetention(conversationId: string, userId: string, duration: RetentionDuration, io?: any): Promise<import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static pinConversation(conversationId: string, userId: string, pin: boolean): Promise<(mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static favoriteConversation(conversationId: string, userId: string, favorite: boolean): Promise<(mongoose.Document<unknown, {}, import("../models/Conversation.js").IConversation, {}, {}> & import("../models/Conversation.js").IConversation & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static clearConversation(conversationId: string, userId: string): Promise<{
        success: boolean;
    }>;
    static deleteConversation(conversationId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=conversation.service.d.ts.map