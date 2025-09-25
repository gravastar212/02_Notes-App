import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/index.ts';
import { TestDatabase, TestData } from './test-utils.ts';

describe('Notes API', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    // Clean up database
    await TestDatabase.cleanup();
    
    // Create test user
    const user = await TestDatabase.createTestUser(TestData.validUser.email, TestData.validUser.password);
    userId = user.id;

    // Login to get access token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send(TestData.validUser);

    accessToken = loginResponse.body.accessToken;
  });

  describe('POST /notes', () => {
    it('should create a new note successfully', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(TestData.validNote)
        .expect(201);

      expect(response.body).to.have.property('message', 'Note created successfully');
      expect(response.body).to.have.property('note');
      expect(response.body.note).to.have.property('id');
      expect(response.body.note).to.have.property('title', TestData.validNote.title);
      expect(response.body.note).to.have.property('content', TestData.validNote.content);
      expect(response.body.note).to.have.property('createdAt');
      expect(response.body.note).to.have.property('updatedAt');
    });

    it('should return 401 without access token', async () => {
      const response = await request(app)
        .post('/notes')
        .send(TestData.validNote)
        .expect(401);

      expect(response.body).to.have.property('error', 'User not authenticated');
    });

    it('should return 401 with invalid access token', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', 'Bearer invalid-token')
        .send(TestData.validNote)
        .expect(401);

      expect(response.body).to.have.property('error', 'User not authenticated');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Some content' })
        .expect(400);

      expect(response.body).to.have.property('error', 'Validation failed');
      expect(response.body).to.have.property('details');
      expect(response.body.details).to.include('Title is required and must be a non-empty string');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '', content: 'Some content' })
        .expect(400);

      expect(response.body).to.have.property('error', 'Validation failed');
      expect(response.body).to.have.property('details');
      expect(response.body.details).to.include('Title is required and must be a non-empty string');
    });

    it('should return 400 for title too long', async () => {
      const longTitle = 'A'.repeat(201); // 201 characters
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: longTitle, content: 'Some content' })
        .expect(400);

      expect(response.body).to.have.property('error', 'Validation failed');
      expect(response.body).to.have.property('details');
      expect(response.body.details).to.include('Title must be less than 200 characters');
    });

    it('should return 400 for content too long', async () => {
      const longContent = 'A'.repeat(10001); // 10001 characters
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Valid Title', content: longContent })
        .expect(400);

      expect(response.body).to.have.property('error', 'Validation failed');
      expect(response.body).to.have.property('details');
      expect(response.body.details).to.include('Content must be less than 10000 characters');
    });

    it('should create note with only title (no content)', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Title Only Note' })
        .expect(201);

      expect(response.body).to.have.property('message', 'Note created successfully');
      expect(response.body.note).to.have.property('title', 'Title Only Note');
      expect(response.body.note).to.have.property('content', null);
    });
  });

  describe('GET /notes', () => {
    beforeEach(async () => {
      // Create some test notes
      await TestDatabase.createTestNote(userId, 'First Note', 'First content');
      await TestDatabase.createTestNote(userId, 'Second Note', 'Second content');
      await TestDatabase.createTestNote(userId, 'Third Note', 'Third content');
    });

    it('should get all notes for authenticated user', async () => {
      const response = await request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).to.have.property('message', 'Notes retrieved successfully');
      expect(response.body).to.have.property('notes');
      expect(response.body.notes).to.be.an('array');
      expect(response.body.notes).to.have.length(3);
      
      // Check that notes are sorted by createdAt desc
      const notes = response.body.notes;
      expect(notes[0]).to.have.property('title', 'Third Note');
      expect(notes[1]).to.have.property('title', 'Second Note');
      expect(notes[2]).to.have.property('title', 'First Note');
    });

    it('should return 401 without access token', async () => {
      const response = await request(app)
        .get('/notes')
        .expect(401);

      expect(response.body).to.have.property('error', 'User not authenticated');
    });

    it('should return empty array for user with no notes', async () => {
      // Create a new user with no notes
      const newUser = await TestDatabase.createTestUser('newuser@example.com', 'password123');
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: 'newuser@example.com', password: 'password123' });
      
      const newAccessToken = loginResponse.body.accessToken;

      const response = await request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(response.body).to.have.property('message', 'Notes retrieved successfully');
      expect(response.body).to.have.property('notes');
      expect(response.body.notes).to.be.an('array');
      expect(response.body.notes).to.have.length(0);
    });
  });

  describe('GET /notes/:id', () => {
    let noteId: string;

    beforeEach(async () => {
      // Create a test note
      const note = await TestDatabase.createTestNote(userId, 'Test Note', 'Test content');
      noteId = note.id;
    });

    it('should get a specific note by ID', async () => {
      const response = await request(app)
        .get(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).to.have.property('message', 'Note retrieved successfully');
      expect(response.body).to.have.property('note');
      expect(response.body.note).to.have.property('id', noteId);
      expect(response.body.note).to.have.property('title', 'Test Note');
      expect(response.body.note).to.have.property('content', 'Test content');
    });

    it('should return 401 without access token', async () => {
      const response = await request(app)
        .get(`/notes/${noteId}`)
        .expect(401);

      expect(response.body).to.have.property('error', 'User not authenticated');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = 'non-existent-id';
      const response = await request(app)
        .get(`/notes/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).to.have.property('error', 'Note not found');
    });

    it('should return 404 for note belonging to another user', async () => {
      // Create another user and their note
      const otherUser = await TestDatabase.createTestUser('other@example.com', 'password123');
      const otherNote = await TestDatabase.createTestNote(otherUser.id, 'Other Note', 'Other content');

      const response = await request(app)
        .get(`/notes/${otherNote.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).to.have.property('error', 'Note not found');
    });
  });

  describe('PUT /notes/:id', () => {
    let noteId: string;

    beforeEach(async () => {
      // Create a test note
      const note = await TestDatabase.createTestNote(userId, 'Original Title', 'Original content');
      noteId = note.id;
    });

    it('should update a note successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const response = await request(app)
        .put(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).to.have.property('message', 'Note updated successfully');
      expect(response.body).to.have.property('note');
      expect(response.body.note).to.have.property('id', noteId);
      expect(response.body.note).to.have.property('title', updateData.title);
      expect(response.body.note).to.have.property('content', updateData.content);
    });

    it('should return 401 without access token', async () => {
      const response = await request(app)
        .put(`/notes/${noteId}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body).to.have.property('error', 'User not authenticated');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = 'non-existent-id';
      const response = await request(app)
        .put(`/notes/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).to.have.property('error', 'Note not found');
    });

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: '' }) // Empty title
        .expect(400);

      expect(response.body).to.have.property('error', 'Validation failed');
      expect(response.body).to.have.property('details');
      expect(response.body.details).to.include('Title is required and must be a non-empty string');
    });
  });

  describe('DELETE /notes/:id', () => {
    let noteId: string;

    beforeEach(async () => {
      // Create a test note
      const note = await TestDatabase.createTestNote(userId, 'Note to Delete', 'Content to delete');
      noteId = note.id;
    });

    it('should delete a note successfully', async () => {
      const response = await request(app)
        .delete(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).to.have.property('message', 'Note deleted successfully');

      // Verify note is deleted
      const getResponse = await request(app)
        .get(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(getResponse.body).to.have.property('error', 'Note not found');
    });

    it('should return 401 without access token', async () => {
      const response = await request(app)
        .delete(`/notes/${noteId}`)
        .expect(401);

      expect(response.body).to.have.property('error', 'User not authenticated');
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = 'non-existent-id';
      const response = await request(app)
        .delete(`/notes/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).to.have.property('error', 'Note not found');
    });

    it('should return 404 for note belonging to another user', async () => {
      // Create another user and their note
      const otherUser = await TestDatabase.createTestUser('other@example.com', 'password123');
      const otherNote = await TestDatabase.createTestNote(otherUser.id, 'Other Note', 'Other content');

      const response = await request(app)
        .delete(`/notes/${otherNote.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).to.have.property('error', 'Note not found');
    });
  });
});
