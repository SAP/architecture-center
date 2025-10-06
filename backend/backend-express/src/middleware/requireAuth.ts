import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

interface UserPayload {
    user: { username: string };
    githubAccessToken: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required: No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as UserPayload;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed: Invalid token.' });
    }
};

export default requireAuth;
