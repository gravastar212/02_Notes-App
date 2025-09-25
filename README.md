# Notes App

A full-stack notes application built as a monorepo with modern web technologies.

## Project Goal

Create a comprehensive notes management application that allows users to create, edit, organize, and manage their notes with a clean and intuitive interface. The application will support user authentication, note categorization, and real-time updates.

## Tech Stack

- **Frontend**: Next.js with Server-Side Rendering (SSR) + Chakra UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with Passport.js
- **Monorepo**: npm workspaces for frontend and backend packages

## Project Structure

```
notes-app/
├── frontend/          # Next.js SSR application with Chakra UI
├── backend/           # Express.js TypeScript API server
├── shared/            # Shared types and utilities
└── docs/              # Documentation and API specs
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations
4. Start development servers: `npm run dev`
