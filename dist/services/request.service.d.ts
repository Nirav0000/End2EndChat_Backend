import mongoose from 'mongoose';
export declare class RequestService {
    static sendRequest(senderId: string, receiverIdString: string): Promise<mongoose.Document<unknown, {}, import("../models/ChatRequest.js").IChatRequest, {}, {}> & import("../models/ChatRequest.js").IChatRequest & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static getPendingRequests(userId: string): Promise<(mongoose.FlattenMaps<import("../models/ChatRequest.js").IChatRequest> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static respondToRequest(requestId: string, receiverId: string, status: 'accepted' | 'rejected'): Promise<{
        request: mongoose.Document<unknown, {}, import("../models/ChatRequest.js").IChatRequest, {}, {}> & import("../models/ChatRequest.js").IChatRequest & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        conversation: any;
    } | {
        request: mongoose.Document<unknown, {}, import("../models/ChatRequest.js").IChatRequest, {}, {}> & import("../models/ChatRequest.js").IChatRequest & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        conversation?: undefined;
    }>;
}
//# sourceMappingURL=request.service.d.ts.map