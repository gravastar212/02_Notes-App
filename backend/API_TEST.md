# Notes API Test Script

## Prerequisites
1. Start the backend server: `npm run dev`
2. Make sure you have a test user in the database (run `npm run db:seed` if needed)

## Test Steps

### 1. Login to get access token
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Create a new note (replace YOUR_ACCESS_TOKEN with token from step 1)
```bash
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"My First Note","content":"This is the content of my first note."}'
```

### 3. Get all notes
```bash
curl -X GET http://localhost:4000/notes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Get a specific note (replace NOTE_ID with actual note ID)
```bash
curl -X GET http://localhost:4000/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Update a note
```bash
curl -X PUT http://localhost:4000/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Updated Note Title","content":"Updated content here."}'
```

### 6. Delete a note
```bash
curl -X DELETE http://localhost:4000/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## API Endpoints Summary

- **POST /auth/login** - Login and get access token
- **GET /notes** - List all user's notes
- **POST /notes** - Create a new note
- **GET /notes/:id** - Get a specific note
- **PUT /notes/:id** - Update a note
- **DELETE /notes/:id** - Delete a note

All notes endpoints require Bearer token authentication.
