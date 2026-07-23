import { Server, Socket } from 'socket.io';
import { Call } from '../models/Call.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import mongoose from 'mongoose';

export const setupCallHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId!;

  socket.on('call:request', async (data: { calleeId: string; type: 'voice' | 'video'; conversationId?: string }) => {
    try {
      const { calleeId, type, conversationId } = data;

      let convId = conversationId;
      if (!convId) {
        const existingConv = await Conversation.findOne({
          isGroup: false,
          participants: { $all: [userId, calleeId], $size: 2 }
        }).lean();
        if (existingConv) {
          convId = existingConv._id.toString();
        }
      }

      // Create Call record
      const call = new Call({
        callerId: new mongoose.Types.ObjectId(userId),
        calleeId: new mongoose.Types.ObjectId(calleeId),
        conversationId: convId ? new mongoose.Types.ObjectId(convId) : undefined,
        type,
        status: 'missed' // Default status if not picked up
      });
      await call.save();

      // Send the ID back to the caller before notifying the callee.
      socket.emit('call:created', {
        callId: call._id.toString(),
        calleeId
      });

      // Get caller profile details to display on incoming call UI
      const caller = await User.findById(userId).select('name avatarUrl').lean();

      // Relay call request to callee
      io.to(`user:${calleeId}`).emit('call:incoming', {
        callId: call._id.toString(),
        callerId: userId,
        callerName: caller?.name || 'Unknown',
        callerAvatar: caller?.avatarUrl || '',
        type,
        conversationId: convId
      });
    } catch (err) {
      console.error('Error starting call:', err);
    }
  });

  socket.on('call:respond', async (data: { callerId: string; accept: boolean; callId: string }) => {
    try {
      const { callerId, accept, callId } = data;

      if (accept) {
        await Call.findByIdAndUpdate(callId, {
          status: 'completed',
          startedAt: new Date()
        });
      } else {
        const updatedCall = await Call.findByIdAndUpdate(callId, {
          status: 'declined',
          endedAt: new Date(),
          durationSec: 0
        }, { new: true });

        if (updatedCall && updatedCall.conversationId) {
          const callMsg = new Message({
            conversationId: updatedCall.conversationId,
            senderId: updatedCall.callerId,
            type: 'call',
            content: updatedCall.type === 'video' ? 'Declined video call' : 'Declined voice call',
            mediaUrl: updatedCall.type,
            mediaThumbnailUrl: 'declined',
            mediaDurationSec: 0,
            deliveredTo: [updatedCall.calleeId],
            readBy: [updatedCall.callerId]
          });
          await callMsg.save();

          await Conversation.findByIdAndUpdate(updatedCall.conversationId, {
            lastMessage: callMsg._id,
            updatedAt: new Date()
          });

          const populatedMsg = await Message.findById(callMsg._id).lean();
          const callerStr = updatedCall.callerId.toString();
          const calleeStr = updatedCall.calleeId.toString();
          io.to(`user:${callerStr}`).to(`user:${calleeStr}`).emit('message:new', populatedMsg);
        }
      }

      // Relay response to caller
      io.to(`user:${callerId}`).emit('call:response', {
        calleeId: userId,
        accept,
        callId
      });
    } catch (err) {
      console.error('Error responding to call:', err);
    }
  });

  socket.on('call:webrtc-offer', (data: { targetId: string; sdp: any }) => {
    io.to(`user:${data.targetId}`).emit('call:webrtc-offer', {
      senderId: userId,
      sdp: data.sdp
    });
  });

  socket.on('call:webrtc-answer', (data: { targetId: string; sdp: any }) => {
    io.to(`user:${data.targetId}`).emit('call:webrtc-answer', {
      senderId: userId,
      sdp: data.sdp
    });
  });

  socket.on('call:ice-candidate', (data: { targetId: string; candidate: any }) => {
    io.to(`user:${data.targetId}`).emit('call:ice-candidate', {
      senderId: userId,
      candidate: data.candidate
    });
  });

  socket.on('call:end', async (data: { callId: string }) => {
    try {
      const { callId } = data;
      
      const call = await Call.findById(callId);
      if (!call) return;

      const callerId = call.callerId.toString();
      const calleeId = call.calleeId.toString();
      if (userId !== callerId && userId !== calleeId) return;

      let durationSec = 0;
      let status: 'completed' | 'missed' = 'missed';

      if (call.startedAt) {
        const endedAt = new Date();
        durationSec = Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000);
        call.endedAt = endedAt;
        call.durationSec = durationSec;
        call.status = 'completed';
        status = 'completed';
        await call.save();
      } else {
        call.endedAt = new Date();
        call.status = 'missed';
        call.durationSec = 0;
        await call.save();
      }

      if (call.conversationId) {
        let contentLabel = '';
        if (status === 'completed') {
          contentLabel = call.type === 'video' ? 'Video call' : 'Voice call';
        } else {
          contentLabel = call.type === 'video' ? 'Missed video call' : 'Missed voice call';
        }

        const callMsg = new Message({
          conversationId: call.conversationId,
          senderId: call.callerId,
          type: 'call',
          content: contentLabel,
          mediaUrl: call.type,
          mediaThumbnailUrl: status,
          mediaDurationSec: durationSec,
          deliveredTo: [call.calleeId],
          readBy: status === 'completed' ? [call.callerId, call.calleeId] : [call.callerId]
        });
        await callMsg.save();

        await Conversation.findByIdAndUpdate(call.conversationId, {
          lastMessage: callMsg._id,
          updatedAt: new Date()
        });

        const populatedMsg = await Message.findById(callMsg._id).lean();
        io.to(`user:${callerId}`).to(`user:${calleeId}`).emit('message:new', populatedMsg);
      }

      // Relay end notification to target peer
      const targetId = userId === callerId ? calleeId : callerId;
      io.to(`user:${targetId}`).emit('call:ended', {
        senderId: userId,
        callId
      });
    } catch (err) {
      console.error('Error ending call:', err);
    }
  });
};
