# Backend - Notes App API

Express.js TypeScript API server with Prisma ORM and PostgreSQL.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

#### Configure DATABASE_URL
Copy the environment template and update with your PostgreSQL connection:
```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your actual PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/notes_app"
```

**Common PostgreSQL setups:**
- **Default PostgreSQL**: `postgresql://postgres:postgres@localhost:5432/notes_app`
- **Custom user**: `postgresql://your_username:your_password@localhost:5432/notes_app`
- **Docker PostgreSQL**: `postgresql://postgres:postgres@localhost:5432/notes_app`

#### Run Migrations
Create and apply database schema:
```bash
npm run db:migrate
```

#### Seed Database
Add test data (creates a test user and sample notes):
```bash
npm run db:seed
# OR use Prisma's built-in seed command:
npx prisma db seed
```

### 3. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📊 Database Management

### Available Scripts
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with test data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:generate` - Generate Prisma client

### Test Data
The seed script creates:
- **Test User**: `test@example.com` / `password123`
- **Sample Notes**: 2 example notes with content

## 🔧 Development

### Code Quality
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

### Build & Deploy
- `npm run build` - Build for production
- `npm run start` - Start production server

## 📁 Project Structure
```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding script
├── src/
│   └── index.ts         # Express server
├── .env                 # Environment variables
└── package.json         # Dependencies & scripts
```

## 🔗 API Endpoints

- `GET /health` - Health check endpoint
