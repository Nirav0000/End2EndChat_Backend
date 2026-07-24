import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.userId).select('-passwordHash').lean();
        if (!user) {
            res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found' } });
            return;
        }
        req.user = user;
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
};
//# sourceMappingURL=auth.js.map