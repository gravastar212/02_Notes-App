import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from './middleware/passport.ts';
import authRoutes from './routes/auth.ts';
import notesRoutes from './routes/notes.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize passport
app.use(passport.initialize());

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  // eslint-disable-next-line no-console
  console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/auth`);
  // eslint-disable-next-line no-console
  console.log(`📝 Notes endpoints available at http://localhost:${PORT}/notes`);
});

export default app;
