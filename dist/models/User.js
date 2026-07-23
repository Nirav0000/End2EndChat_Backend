import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String },
    lastSeen: { type: Date },
    lastSeenVisible: { type: Boolean, default: true },
    refreshTokenVersion: { type: Number, default: 0 },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});
userSchema.index({ name: 'text', email: 'text' });
userSchema.methods.isBlocking = function (userId) {
    return this.blockedUsers.some((id) => id.toString() === userId.toString());
};
export const User = mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map