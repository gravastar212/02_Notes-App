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

## Authentication Flow

The application uses a secure JWT-based authentication system with refresh token rotation for enhanced security.

### Backend Authentication

#### Token Types
- **Access Token**: Short-lived (15 minutes) JWT for API authentication
- **Refresh Token**: Long-lived (7 days) JWT stored as httpOnly cookie

#### Authentication Endpoints

**POST /auth/register**
- Creates new user account
- Returns access token and user data
- Sets refresh token as httpOnly cookie

**POST /auth/login**
- Authenticates user credentials
- Returns access token and user data
- Sets refresh token as httpOnly cookie

**POST /auth/refresh**
- Verifies refresh token from cookie
- Issues new access token
- Optionally rotates refresh token for enhanced security
- Updates refresh token cookie

**POST /auth/logout**
- Clears refresh token from database
- Removes refresh token cookie
- Invalidates user session

### Frontend Authentication

#### API Client with Automatic Token Refresh

The frontend uses an Axios-based API client (`lib/api.ts`) with automatic token refresh:

```typescript
// Automatic token refresh interceptor
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt to refresh token
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request with new token
        return client(originalRequest);
      } else {
        // Redirect to login if refresh fails
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);
```

#### Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Storage**: Access token stored in localStorage
3. **Cookie Management**: Refresh token automatically managed via httpOnly cookies
4. **API Requests**: Access token automatically added to Authorization header
5. **Token Refresh**: On 401 responses, automatically attempts refresh
6. **Queue Management**: Multiple requests queued during token refresh
7. **Error Handling**: Redirects to login if refresh fails

#### Security Features

- **httpOnly Cookies**: Refresh tokens not accessible via JavaScript
- **Secure Cookies**: HTTPS-only in production
- **SameSite Protection**: CSRF protection
- **Token Rotation**: Refresh tokens rotated on each refresh
- **Automatic Cleanup**: Failed requests properly handled
- **Queue Management**: Prevents multiple refresh attempts

### Usage Examples

#### Frontend API Calls
```typescript
// All API calls automatically handle authentication
const notes = await apiClient.get('/notes');
const newNote = await apiClient.post('/notes', { title, content });
const updatedNote = await apiClient.put(`/notes/${id}`, { title, content });
await apiClient.delete(`/notes/${id}`);
```

#### Authentication Context
```typescript
const { user, login, logout, isLoading } = useAuth();

// Login with automatic token management
await login(email, password);

// Logout clears all tokens and redirects
await logout();
```

#### Server-Side Authentication
```typescript
// Dashboard uses server-side authentication with cookies
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = req.headers.cookie || '';
  
  // Backend validates refresh token from cookie
  const response = await fetch(`${API_URL}/notes`, {
    headers: { Cookie: cookies },
    credentials: 'include',
  });
  
  if (!response.ok) {
    return { redirect: { destination: '/login' } };
  }
  
  return { props: { notes: await response.json() } };
};
```

## Deployment

This application is designed to be deployed on modern cloud platforms with separate deployments for frontend and backend.

### Frontend Deployment (Vercel)

The frontend is configured for deployment on Vercel with Next.js optimization.

#### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

#### Deployment Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from frontend directory
   cd frontend
   vercel
   ```

2. **Environment Variables**
   Set the following environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

3. **Automatic Deployments**
   - Push to `main` branch triggers production deployment
   - Push to other branches creates preview deployments
   - Vercel automatically builds and deploys on every push

#### Vercel Configuration

The `frontend/vercel.json` file includes:
- Next.js framework detection
- API route configuration
- CORS headers for API calls
- Environment variable handling

### Backend Deployment (Railway/Render)

The backend can be deployed on Railway or Render with Docker support.

#### Option 1: Railway Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the backend folder

2. **Environment Variables**
   Set the following environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Database Setup**
   - Add PostgreSQL service in Railway
   - Copy the DATABASE_URL from the PostgreSQL service
   - Run migrations: Railway will automatically run `npm run prisma:migrate`

#### Option 2: Render Deployment

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set root directory to `backend`

2. **Build Configuration**
   ```
   Build Command: npm ci && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   Set the following environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **Database Setup**
   - Create PostgreSQL database in Render
   - Copy the DATABASE_URL
   - Run migrations manually or via Render's build process

#### Docker Deployment

The backend includes a `Dockerfile` for containerized deployment:

```dockerfile
# Multi-stage build for production
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Variables

#### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/notes_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app

# Optional: Database connection pool settings
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=20000
```

#### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
# or
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Database Setup

#### Managed PostgreSQL (Recommended)

1. **Railway PostgreSQL**
   - Add PostgreSQL service in Railway
   - Copy the connection string
   - Set as `DATABASE_URL` environment variable

2. **Render PostgreSQL**
   - Create PostgreSQL database in Render
   - Copy the connection string
   - Set as `DATABASE_URL` environment variable

3. **Other Providers**
   - **Supabase**: Free tier with PostgreSQL
   - **Neon**: Serverless PostgreSQL
   - **PlanetScale**: MySQL alternative
   - **AWS RDS**: Production-grade PostgreSQL

#### Database Migrations

Run migrations after setting up the database:

```bash
# In backend directory
npm run prisma:migrate
npm run prisma:generate
```

### Health Check Endpoint

The backend includes a health check endpoint at `/health`:

```bash
# Check if backend is running
curl https://your-backend-url.com/health

# Expected response
{"ok": true}
```

### Security Considerations

#### Production Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique JWT secrets
   - Rotate secrets regularly

2. **CORS Configuration**
   - Set `FRONTEND_URL` to your actual frontend domain
   - Avoid using wildcards in production

3. **Rate Limiting**
   - Backend includes rate limiting for auth endpoints
   - Adjust limits based on your traffic

4. **HTTPS**
   - Both Vercel and Railway/Render provide HTTPS
   - Ensure all API calls use HTTPS

#### Cookie Configuration

The refresh token cookies are configured for production:

```typescript
// Secure cookie settings
{
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.COOKIE_DOMAIN // Set for production
}
```

### Monitoring and Logs

#### Vercel Monitoring
- Built-in analytics and performance monitoring
- Function logs available in dashboard
- Real-time error tracking

#### Railway Monitoring
- Built-in metrics and logs
- Health check monitoring
- Automatic restarts on crashes

#### Render Monitoring
- Application logs in dashboard
- Health check monitoring
- Performance metrics

### Troubleshooting

#### Common Issues

1. **CORS Errors**
   ```bash
   # Check FRONTEND_URL environment variable
   echo $FRONTEND_URL
   ```

2. **Database Connection**
   ```bash
   # Test database connection
   npm run prisma:studio
   ```

3. **Build Failures**
   ```bash
   # Check Node.js version
   node --version  # Should be 18.x
   
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Health Check Failures**
   ```bash
   # Check if server is running
   curl https://your-backend-url.com/health
   ```

#### Debug Mode

Enable debug logging by setting:
```env
DEBUG=*
NODE_ENV=development
```

### Performance Optimization

#### Frontend (Vercel)
- Automatic Next.js optimizations
- Image optimization
- Static generation for static pages
- Edge functions for API routes

#### Backend (Railway/Render)
- Connection pooling for database
- Rate limiting for API protection
- Compression middleware
- Caching headers for static assets
```

## Quick Start Guide

This section provides step-by-step instructions for getting the Notes App running locally and deploying to production.

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/) or use Docker
- **Git** - [Download here](https://git-scm.com/)

### Local Development Setup

#### Option 1: Using Makefile (Recommended)

The project includes a comprehensive Makefile for easy development:

```bash
# Complete setup for new developers
make quickstart

# Or step by step:
make install          # Install all dependencies
make setup-env        # Copy environment templates
make setup-db         # Set up database
make dev             # Start both servers
```

#### Option 2: Manual Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd notes-app
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   
   # Edit backend/.env with your database credentials
   # Edit frontend/.env.local with your backend URL
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   cd backend && npm run prisma:generate
   
   # Run migrations
   cd backend && npm run prisma:migrate
   
   # Optional: Seed with sample data
   cd backend && npm run db:seed
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

### Available Commands

#### Development Commands
```bash
make dev              # Start both backend and frontend
make dev-backend      # Start backend only
make dev-frontend     # Start frontend only
```

#### Testing Commands
```bash
make test             # Run all tests
make test-backend     # Run backend tests only
make test-frontend    # Run frontend tests only
make test-coverage    # Run frontend tests with coverage
make test-watch       # Run frontend tests in watch mode
```

#### Linting Commands
```bash
make lint             # Run linting for both projects
make lint-fix         # Fix linting issues automatically
make lint-backend     # Run backend linting only
make lint-frontend    # Run frontend linting only
```

#### Database Commands
```bash
make setup-db         # Set up database (generate + migrate)
make migrate          # Run database migrations
make migrate-reset     # Reset database (WARNING: deletes data)
make seed             # Seed database with sample data
make db-studio        # Open Prisma Studio
```

#### Build Commands
```bash
make build            # Build both projects for production
make build-backend    # Build backend only
make build-frontend   # Build frontend only
```

#### Utility Commands
```bash
make clean            # Clean all build artifacts and node_modules
make health           # Check if servers are running
make type-check       # Run TypeScript type checking
make help             # Show all available commands
```

### Environment Variables

#### Backend Environment Variables

Create `backend/.env` with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/notes_app"

# JWT Secret (Required - generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# Optional: Logging
LOG_LEVEL=info

# Optional: Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

#### Frontend Environment Variables

Create `frontend/.env.local` with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Database Setup

#### Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database and user
   CREATE DATABASE notes_app;
   CREATE USER notes_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE notes_app TO notes_user;
   \q
   ```

3. **Update DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://notes_user:your_password@localhost:5432/notes_app"
   ```

#### Docker PostgreSQL (Alternative)

```bash
# Run PostgreSQL in Docker
docker run --name notes-postgres \
  -e POSTGRES_DB=notes_app \
  -e POSTGRES_USER=notes_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL
DATABASE_URL="postgresql://notes_user:your_password@localhost:5432/notes_app"
```

### Testing

#### Backend Tests
```bash
# Run all backend tests
cd backend && npm test

# Run tests in watch mode
cd backend && npm run test:watch

# Run specific test file
cd backend && npm test -- test/auth.test.ts
```

#### Frontend Tests
```bash
# Run all frontend tests
cd frontend && npm test

# Run tests with coverage
cd frontend && npm run test:coverage

# Run tests in watch mode
cd frontend && npm run test:watch
```

#### Test Coverage
```bash
# Frontend coverage report
cd frontend && npm run test:coverage

# View coverage report
open frontend/coverage/lcov-report/index.html
```

### Database Migrations

#### Creating Migrations
```bash
# After changing Prisma schema
cd backend && npx prisma migrate dev --name add_new_field

# This will:
# 1. Apply the migration to your database
# 2. Generate Prisma Client
# 3. Create migration files
```

#### Running Migrations
```bash
# Development
cd backend && npm run prisma:migrate

# Production
cd backend && npm run prisma:deploy
```

#### Resetting Database
```bash
# WARNING: This deletes all data!
cd backend && npm run prisma:reset
```

### Production Deployment

#### Frontend (Vercel)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

3. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Preview deployments for other branches

#### Backend (Railway)

1. **Connect Repository**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Connect GitHub repository
   - Select backend folder

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the DATABASE_URL

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<from-postgres-service>
   JWT_SECRET=<your-secret-key>
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Railway automatically builds and deploys
   - Health check available at `/health`

#### Backend (Render)

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Set root directory to `backend`

2. **Build Settings**
   ```
   Build Command: npm ci && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<your-secret-key>
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

### Monitoring and Health Checks

#### Health Check Endpoint
```bash
# Check backend health
curl https://your-backend-url.com/health

# Expected response
{
  "uptime": 123.456,
  "message": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

#### Logging
- **Development**: Logs to console with colors
- **Production**: Logs to files (`logs/error.log`, `logs/combined.log`)
- **Log Levels**: error, warn, info, http, debug

#### Monitoring
- **Vercel**: Built-in analytics and performance monitoring
- **Railway**: Built-in metrics and logs
- **Render**: Application logs and health monitoring

### Troubleshooting

#### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Test connection
   psql -h localhost -p 5432 -U your_user -d your_db
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 4000
   lsof -i :4000
   
   # Kill process
   kill -9 <PID>
   ```

3. **CORS Errors**
   ```bash
   # Check FRONTEND_URL in backend/.env
   echo $FRONTEND_URL
   ```

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   make clean
   make install
   ```

#### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
export LOG_LEVEL=debug

# Start backend
cd backend && npm run dev
```

### Performance Optimization

#### Frontend
- Next.js automatic optimizations
- Image optimization
- Static generation
- Edge functions

#### Backend
- Connection pooling
- Rate limiting
- Compression middleware
- Efficient logging

### Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] Regular dependency updates

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Run linting: `make lint`
6. Commit your changes
7. Push to your fork
8. Create a pull request

### Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Health Check**: `/health` endpoint
- **Logs**: Check application logs for errors
```
