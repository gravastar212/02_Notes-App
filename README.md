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
