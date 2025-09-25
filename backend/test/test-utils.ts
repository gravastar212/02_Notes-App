import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Test database utilities
export class TestDatabase {
  static async cleanup(): Promise<void> {
    // Delete all notes first (due to foreign key constraints)
    await prisma.note.deleteMany();
    // Delete all users
    await prisma.user.deleteMany();
  }

  static async createTestUser(email: string = 'test@example.com', password: string = 'password123'): Promise<{ id: string; email: string; password: string }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      email: user.email,
      password, // Return plain password for testing
    };
  }

  static async createTestNote(userId: string, title: string = 'Test Note', content: string = 'Test content'): Promise<{ id: string; title: string; content: string; userId: string }> {
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
    });

    return {
      id: note.id,
      title: note.title,
      content: note.content || '',
      userId: note.userId,
    };
  }

  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Test data factory
export const TestData = {
  validUser: {
    email: 'testuser@example.com',
    password: 'password123',
  },
  
  validNote: {
    title: 'Test Note Title',
    content: 'This is test note content',
  },
  
  invalidUser: {
    email: 'invalid-email',
    password: '123', // Too short
  },
  
  invalidNote: {
    title: '', // Empty title
    content: 'A'.repeat(10001), // Too long content
  },
};
