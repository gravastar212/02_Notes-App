# Server-Side Authentication Helper

The `withAuth` helper provides a clean way to add authentication to Next.js pages using `getServerSideProps`. It automatically handles token validation, refresh, and redirection for unauthenticated users.

## Features

- **Automatic Authentication**: Validates refresh tokens from httpOnly cookies
- **Token Refresh**: Automatically attempts to refresh expired tokens
- **Flexible Options**: Support for required and optional authentication
- **Type Safety**: Full TypeScript support with proper type inference
- **Error Handling**: Graceful handling of authentication failures
- **User Data**: Provides authenticated user information to components

## Usage Examples

### Required Authentication

Use `requireAuth` for pages that must be authenticated. Users will be redirected to `/login` if not authenticated.

```typescript
import { requireAuth } from '@/lib/withAuth';

interface DashboardProps {
  authData: {
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
    accessToken: string;
  };
  // ... other props
}

export const getServerSideProps = requireAuth<DashboardProps>(
  async (context, authData) => {
    // Your server-side logic here
    // authData.user contains the authenticated user info
    
    return {
      props: {
        authData,
        // ... other props
      },
    };
  }
);
```

### Optional Authentication

Use `optionalAuth` for pages that work with or without authentication.

```typescript
import { optionalAuth } from '@/lib/withAuth';

interface HomeProps {
  authData: {
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
    accessToken: string;
  } | null; // Note: authData can be null
}

export const getServerSideProps = optionalAuth<HomeProps>(
  async (context, authData) => {
    // authData will be null if user is not authenticated
    // authData will contain user info if authenticated
    
    return {
      props: {
        authData,
        // ... other props
      },
    };
  }
);
```

### Custom Options

Use `withAuth` directly for custom configuration.

```typescript
import { withAuth } from '@/lib/withAuth';

export const getServerSideProps = withAuth<MyProps>(
  async (context, authData) => {
    // Your logic here
    return { props: { authData } };
  },
  {
    redirectTo: '/custom-login', // Custom redirect destination
    requireAuth: true, // Whether authentication is required
  }
);
```

## API Reference

### `requireAuth<P>(getServerSideProps?)`

A simplified wrapper that requires authentication.

**Parameters:**
- `getServerSideProps` (optional): Your server-side logic function
- `P`: TypeScript interface for your page props

**Returns:** `getServerSideProps` function that requires authentication

### `optionalAuth<P>(getServerSideProps?)`

A wrapper that works with or without authentication.

**Parameters:**
- `getServerSideProps` (optional): Your server-side logic function
- `P`: TypeScript interface for your page props

**Returns:** `getServerSideProps` function that handles optional authentication

### `withAuth<P>(getServerSideProps?, options?)`

The main wrapper function with full configuration options.

**Parameters:**
- `getServerSideProps` (optional): Your server-side logic function
- `options` (optional): Configuration object
  - `redirectTo`: Custom redirect destination (default: '/login')
  - `requireAuth`: Whether authentication is required (default: true)

**Returns:** `getServerSideProps` function with authentication

## Authentication Flow

1. **Cookie Extraction**: Extracts refresh token from httpOnly cookies
2. **User Validation**: Calls `/auth/me` endpoint to validate user
3. **Token Refresh**: If validation fails, attempts to refresh token
4. **Retry**: Retries user validation with refreshed token
5. **Redirect**: Redirects to login if all attempts fail (when required)
6. **Success**: Provides user data to your page component

## Error Handling

The helper handles various error scenarios:

- **No Cookies**: Redirects to login (if required) or provides null authData
- **Invalid Token**: Attempts refresh, then redirects if refresh fails
- **Network Errors**: Graceful fallback with proper error handling
- **Server Errors**: Logs errors and provides fallback behavior

## Type Safety

The helper provides full TypeScript support:

```typescript
interface AuthData {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  accessToken: string;
}

// For required auth
interface RequiredProps {
  authData: AuthData;
  // ... other props
}

// For optional auth
interface OptionalProps {
  authData: AuthData | null;
  // ... other props
}
```

## Backend Requirements

The helper requires these backend endpoints:

- `GET /auth/me`: Returns current user information
- `POST /auth/refresh`: Refreshes expired tokens
- `POST /auth/logout`: Clears authentication cookies

## Security Features

- **httpOnly Cookies**: Refresh tokens not accessible via JavaScript
- **Automatic Refresh**: Seamless token renewal without user interaction
- **Secure Redirects**: Proper handling of authentication failures
- **Type Safety**: Prevents authentication-related runtime errors

## Example Pages

### Protected Dashboard
```typescript
// pages/dashboard.tsx
export const getServerSideProps = requireAuth<DashboardProps>(
  async (context, authData) => {
    // Fetch user-specific data
    const notes = await fetchUserNotes(authData.user.id);
    
    return {
      props: {
        authData,
        notes,
      },
    };
  }
);
```

### Public Home Page
```typescript
// pages/index.tsx
export const getServerSideProps = optionalAuth<HomeProps>(
  async (context, authData) => {
    // Show different content based on auth status
    const featuredContent = authData 
      ? await fetchPersonalizedContent(authData.user.id)
      : await fetchPublicContent();
    
    return {
      props: {
        authData,
        content: featuredContent,
      },
    };
  }
);
```

This helper makes server-side authentication simple, secure, and type-safe for your Next.js application!
