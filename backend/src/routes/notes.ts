import { type Request, type Response, Router } from 'express';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

// Simple validation helper
const validateNoteData = (data: { title?: unknown; content?: unknown }): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (data.content && typeof data.content !== 'string') {
    errors.push('Content must be a string');
  }

  if (data.content && data.content.length > 10000) {
    errors.push('Content must be less than 10000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// GET /notes - List user's notes
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Notes retrieved successfully',
        notes,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// POST /notes - Create a new note
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { title, content } = req.body;

      // Validate input
      const validation = validateNoteData({ title, content });
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      // Create note
      const note = await prisma.note.create({
        data: {
          title: title.trim(),
          content: content?.trim() || null,
          userId,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(201).json({
        message: 'Note created successfully',
        note,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// GET /notes/:id - Get a specific note
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const noteId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId, // Ensure user can only access their own notes
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json({
        message: 'Note retrieved successfully',
        note,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// PUT /notes/:id - Update a note
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const noteId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { title, content } = req.body;

      // Validate input
      const validation = validateNoteData({ title, content });
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      // Check if note exists and belongs to user
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId,
        },
      });

      if (!existingNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Update note
      const note = await prisma.note.update({
        where: { id: noteId },
        data: {
          title: title.trim(),
          content: content?.trim() || null,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Note updated successfully',
        note,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// DELETE /notes/:id - Delete a note
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const noteId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if note exists and belongs to user
      const existingNote = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId,
        },
      });

      if (!existingNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Delete note
      await prisma.note.delete({
        where: { id: noteId },
      });

      res.json({
        message: 'Note deleted successfully',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
