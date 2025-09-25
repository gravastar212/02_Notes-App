# Testing Refresh Token Rotation

## Manual Testing Steps

### 1. Test Login Flow
```bash
# Register a new user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Login with the user
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt
```

### 2. Test Token Refresh
```bash
# Use the refresh token cookie to get a new access token
curl -X POST http://localhost:4000/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

### 3. Test Protected Endpoints
```bash
# Get notes (should work with access token)
curl -X GET http://localhost:4000/notes \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Create a note
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"title": "Test Note", "content": "Test content"}'
```

### 4. Test Logout
```bash
# Logout and clear cookies
curl -X POST http://localhost:4000/auth/logout \
  -b cookies.txt
```

## Frontend Testing

### 1. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test Authentication Flow
1. Navigate to `http://localhost:3000`
2. Register a new account
3. Login with credentials
4. Access dashboard - should show notes
5. Create/edit notes - should work seamlessly
6. Wait for access token to expire (15 minutes)
7. Try to create/edit a note - should automatically refresh token
8. Logout - should clear all tokens and redirect to login

### 3. Test Token Refresh Scenarios
1. **Normal Refresh**: Access token expires, refresh token valid
2. **Invalid Refresh**: Refresh token expired/invalid
3. **Network Error**: Refresh request fails
4. **Concurrent Requests**: Multiple requests during refresh

## Expected Behavior

### ✅ Success Cases
- Login/register sets both access token and refresh token cookie
- API calls automatically include access token in Authorization header
- 401 responses trigger automatic token refresh
- Multiple concurrent requests are queued during refresh
- Successful refresh retries original request
- Logout clears all tokens and cookies

### ❌ Error Cases
- Invalid credentials return 401 with error message
- Expired refresh token redirects to login
- Network errors during refresh redirect to login
- Invalid access token triggers refresh attempt

## Security Features Verified

- ✅ Refresh tokens stored as httpOnly cookies
- ✅ Access tokens stored in localStorage (client-side)
- ✅ Automatic token rotation on refresh
- ✅ Secure cookie settings in production
- ✅ CSRF protection via SameSite cookies
- ✅ Proper error handling and cleanup
