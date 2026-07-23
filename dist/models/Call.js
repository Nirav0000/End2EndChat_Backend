import mongoose, { Schema } from 'mongoose';
const callSchema = new Schema({
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    type: { type: String, enum: ['voice', 'video'], required: true },
    status: { type: String, enum: ['missed', 'declined', 'completed'], required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSec: { type: Number }
}, {
    timestamps: true
});
export const Call = mongoose.model('Call', callSchema);
//# sourceMappingURL=Call.js.map