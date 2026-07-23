import { ChatRequest } from '../models/ChatRequest.js';
import { User } from '../models/User.js';
import { ConversationService } from './conversation.service.js';
import mongoose from 'mongoose';

export class RequestService {
  static async sendRequest(senderId: string, receiverIdString: string) {
    if (senderId === receiverIdString) {
      throw { name: 'ValidationError', message: 'You cannot send a chat request to yourself' };
    }

    if (!mongoose.Types.ObjectId.isValid(receiverIdString)) {
      throw { name: 'ValidationError', message: 'Invalid User ID format' };
    }

    const receiver = await User.findById(receiverIdString);
    if (!receiver) {
      throw { name: 'ValidationError', message: 'User not found with this ID' };
    }

    // Check if blocked
    if (receiver.isBlocking(senderId)) {
      throw { name: 'ValidationError', message: 'Unable to send request to this user' };
    }

    // Check if request already exists
    const existing = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId: receiverIdString },
        { senderId: receiverIdString, receiverId: senderId }
      ]
    });

    if (existing) {
      if (existing.status === 'pending') {
        throw { name: 'ValidationError', message: 'A pending request already exists between you' };
      }
      if (existing.status === 'accepted') {
        throw { name: 'ValidationError', message: 'You are already in a chat with this user' };
      }
      // If rejected, we can allow sending a new one by updating status back to pending
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.senderId = new mongoose.Types.ObjectId(senderId);
        existing.receiverId = new mongoose.Types.ObjectId(receiverIdString);
        await existing.save();
        return existing;
      }
    }

    const request = new ChatRequest({
      senderId,
      receiverId: receiverIdString,
      status: 'pending'
    });

    await request.save();
    return request;
  }

  static async getPendingRequests(userId: string) {
    return ChatRequest.find({ receiverId: userId, status: 'pending' })
      .populate('senderId', 'name email avatarUrl')
      .lean();
  }

  static async respondToRequest(requestId: string, receiverId: string, status: 'accepted' | 'rejected') {
    if (!['accepted', 'rejected'].includes(status)) {
      throw { name: 'ValidationError', message: 'Invalid status' };
    }

    const request = await ChatRequest.findOne({ _id: requestId, receiverId, status: 'pending' });
    if (!request) {
      throw { name: 'ValidationError', message: 'Pending request not found' };
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // Create conversation
      const conv = await ConversationService.createDirectConversation(request.senderId.toString(), receiverId);
      return { request, conversation: conv };
    }

    return { request };
  }
}
