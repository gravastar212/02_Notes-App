import passport from 'passport';
import { type Request, type Response, type NextFunction } from 'express';

// Custom authentication middleware that handles errors properly
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: any, info: any) => {
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
