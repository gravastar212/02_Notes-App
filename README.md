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
