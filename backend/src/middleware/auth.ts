import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { type NextFunction, type Request, type Response } from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Custom authentication middleware that handles errors properly
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: unknown) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Server-side authentication middleware that works with refresh tokens
export const authenticateServerSide = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

    // Get user info from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server-side authentication error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
