import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../../src/routes/index';
import { errorHandler } from '../../src/middleware/index';
import { prisma } from '../../src/config/database';

// Create test app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);
app.use(errorHandler);

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Ensure database is clean
    await prisma.chatSession.deleteMany();
  });

  afterAll(async () => {
    await prisma.chatSession.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.chatSession.deleteMany();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('connected');
    });

    it('should include session count in health check', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.database).toHaveProperty('sessionCount');
      expect(typeof response.body.database.sessionCount).toBe('number');
    });
  });

  describe('POST /api/chat/save', () => {
    it('should save a new chat session without sessionId', async () => {
      const chatData = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'model', content: 'Hi there!' },
        ],
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/chat/save')
        .send(chatData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('message');
      expect(response.body.sessionId).toMatch(/^chat-/);
    });

    it('should save a chat session with provided sessionId', async () => {
      const chatData = {
        sessionId: 'custom-session-id',
        messages: [
          { role: 'user', content: 'Test' },
        ],
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/chat/save')
        .send(chatData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.sessionId).toBe('custom-session-id');
    });

    it('should return 400 when messages array is missing', async () => {
      const chatData = {
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/chat/save')
        .send(chatData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when messages array is empty', async () => {
      const chatData = {
        messages: [],
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/chat/save')
        .send(chatData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should update existing session when saving with same sessionId', async () => {
      const sessionId = 'update-test-session';
      const initialData = {
        sessionId,
        messages: [{ role: 'user', content: 'First' }],
        timestamp: new Date().toISOString(),
      };

      // Save initial
      await request(app)
        .post('/api/chat/save')
        .send(initialData)
        .set('Content-Type', 'application/json');

      // Update with more messages
      const updatedData = {
        sessionId,
        messages: [
          { role: 'user', content: 'First' },
          { role: 'model', content: 'Second' },
        ],
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/chat/save')
        .send(updatedData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);

      // Verify the update
      const getResponse = await request(app).get(`/api/chat/${sessionId}`);
      expect(getResponse.body.data.messages).toHaveLength(2);
    });
  });

  describe('GET /api/chat/:sessionId', () => {
    it('should retrieve an existing chat session', async () => {
      // First, save a session
      const saveResponse = await request(app)
        .post('/api/chat/save')
        .send({
          sessionId: 'get-test-session',
          messages: [{ role: 'user', content: 'Test' }],
          timestamp: new Date().toISOString(),
        })
        .set('Content-Type', 'application/json');

      const sessionId = saveResponse.body.sessionId;

      // Then retrieve it
      const response = await request(app).get(`/api/chat/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.sessionId).toBe(sessionId);
      expect(response.body.data.messages).toHaveLength(1);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app).get('/api/chat/non-existent-session');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('GET /api/chat', () => {
    it('should return empty array when no sessions exist', async () => {
      const response = await request(app).get('/api/chat');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual([]);
    });

    it('should return all saved sessions', async () => {
      // Save multiple sessions
      await request(app)
        .post('/api/chat/save')
        .send({
          sessionId: 'session-1',
          messages: [{ role: 'user', content: 'Test 1' }],
          timestamp: new Date().toISOString(),
        });

      await request(app)
        .post('/api/chat/save')
        .send({
          sessionId: 'session-2',
          messages: [{ role: 'user', content: 'Test 2' }],
          timestamp: new Date().toISOString(),
        });

      // Get all sessions
      const response = await request(app).get('/api/chat');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });
  });
});

