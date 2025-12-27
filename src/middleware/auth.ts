import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing auth token' });
  }

  try {
    const token = header.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    console.log('AUTH DECODED JWT:', decoded.id); // 🔥 ADD THIS
    
    req.user = {
      userId: decoded.id,
      email: decoded.email,
    };
    console.log('AUTH ORG ID:',req.user); // 🔥 ADD THIS

    next();
  } catch (err) {
    console.error('AUTH ERROR:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
