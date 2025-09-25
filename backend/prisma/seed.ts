import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', { id: user.id, email: user.email });

  // Create sample notes
  const note1 = await prisma.note.upsert({
    where: { id: 'note-1' },
    update: {},
    create: {
      id: 'note-1',
      title: 'Welcome to Notes App',
      content: 'This is your first note! You can create, edit, and organize your notes here.',
      userId: user.id,
    },
  });

  const note2 = await prisma.note.upsert({
    where: { id: 'note-2' },
    update: {},
    create: {
      id: 'note-2',
      title: 'Getting Started',
      content: 'Here are some tips for using the Notes App:\n\n• Create new notes with descriptive titles\n• Use the search feature to find notes quickly\n• Organize notes with tags or categories\n• Keep your notes updated regularly',
      userId: user.id,
    },
  });

  console.log('✅ Created sample notes:', [
    { id: note1.id, title: note1.title },
    { id: note2.id, title: note2.title },
  ]);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
