import { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const noteId = query.id as string;

  // Extract cookies from the request
  const cookies = req.headers.cookie || '';

  try {
    let response;

    switch (method) {
      case 'GET':
        // Get all notes
        response = await fetch(`${API_URL}/notes`, {
          method: 'GET',
          headers: {
            Cookie: cookies,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        break;

      case 'POST':
        // Create new note
        response = await fetch(`${API_URL}/notes`, {
          method: 'POST',
          headers: {
            Cookie: cookies,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        break;

      case 'PUT':
        // Update note
        if (!noteId) {
          return res.status(400).json({ error: 'Note ID is required' });
        }
        response = await fetch(`${API_URL}/notes/${noteId}`, {
          method: 'PUT',
          headers: {
            Cookie: cookies,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        break;

      case 'DELETE':
        // Delete note
        if (!noteId) {
          return res.status(400).json({ error: 'Note ID is required' });
        }
        response = await fetch(`${API_URL}/notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            Cookie: cookies,
          },
          credentials: 'include',
        });
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
