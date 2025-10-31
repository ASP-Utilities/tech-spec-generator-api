import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storageService } from '../../src/services/storage.service';
import { prisma } from '../../src/config/database';
import type { ChatSession } from '../../src/types';

describe('StorageService', () => {
  // Clean up database before and after each test
  beforeEach(async () => {
    await prisma.chatSession.deleteMany();
  });

  afterEach(async () => {
    await prisma.chatSession.deleteMany();
  });

  describe('saveSession', () => {
    it('should save a new chat session', async () => {
      const session: ChatSession = {
        sessionId: 'test-session-1',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'model', content: 'Hi there!' },
        ],
        timestamp: new Date().toISOString(),
      };

      await storageService.saveSession(session);

      const saved = await storageService.getSession('test-session-1');
      expect(saved).toBeDefined();
      expect(saved?.sessionId).toBe('test-session-1');
      expect(saved?.messages).toHaveLength(2);
    });

    it('should update an existing chat session', async () => {
      const session: ChatSession = {
        sessionId: 'test-session-2',
        messages: [{ role: 'user', content: 'First message' }],
        timestamp: new Date().toISOString(),
      };

      // Save initial session
      await storageService.saveSession(session);

      // Update with more messages
      const updatedSession: ChatSession = {
        ...session,
        messages: [
          { role: 'user', content: 'First message' },
          { role: 'model', content: 'Response' },
        ],
      };

      await storageService.saveSession(updatedSession);

      const saved = await storageService.getSession('test-session-2');
      expect(saved?.messages).toHaveLength(2);
    });

    it('should handle sessions with metadata', async () => {
      const session: ChatSession = {
        sessionId: 'test-session-3',
        messages: [{ role: 'user', content: 'Test' }],
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: 'test-agent',
          clientVersion: '1.0.0',
        },
      };

      await storageService.saveSession(session);

      const saved = await storageService.getSession('test-session-3');
      expect(saved?.metadata).toBeDefined();
      expect(saved?.metadata?.userAgent).toBe('test-agent');
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const session: ChatSession = {
        sessionId: 'test-session-4',
        messages: [{ role: 'user', content: 'Test' }],
        timestamp: new Date().toISOString(),
      };

      await storageService.saveSession(session);
      const retrieved = await storageService.getSession('test-session-4');

      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe('test-session-4');
    });

    it('should return null for non-existent session', async () => {
      const retrieved = await storageService.getSession('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions exist', async () => {
      const sessions = await storageService.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all saved sessions', async () => {
      const session1: ChatSession = {
        sessionId: 'test-session-5',
        messages: [{ role: 'user', content: 'Test 1' }],
        timestamp: new Date().toISOString(),
      };

      const session2: ChatSession = {
        sessionId: 'test-session-6',
        messages: [{ role: 'user', content: 'Test 2' }],
        timestamp: new Date().toISOString(),
      };

      await storageService.saveSession(session1);
      await storageService.saveSession(session2);

      const sessions = await storageService.getAllSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.sessionId)).toContain('test-session-5');
      expect(sessions.map(s => s.sessionId)).toContain('test-session-6');
    });

    it('should return sessions ordered by timestamp (most recent first)', async () => {
      const oldSession: ChatSession = {
        sessionId: 'old-session',
        messages: [{ role: 'user', content: 'Old' }],
        timestamp: new Date('2024-01-01').toISOString(),
      };

      const newSession: ChatSession = {
        sessionId: 'new-session',
        messages: [{ role: 'user', content: 'New' }],
        timestamp: new Date('2024-12-01').toISOString(),
      };

      await storageService.saveSession(oldSession);
      await storageService.saveSession(newSession);

      const sessions = await storageService.getAllSessions();
      expect(sessions[0].sessionId).toBe('new-session');
      expect(sessions[1].sessionId).toBe('old-session');
    });
  });

  describe('deleteSession', () => {
    it('should delete an existing session', async () => {
      const session: ChatSession = {
        sessionId: 'test-session-7',
        messages: [{ role: 'user', content: 'Test' }],
        timestamp: new Date().toISOString(),
      };

      await storageService.saveSession(session);
      const deleted = await storageService.deleteSession('test-session-7');

      expect(deleted).toBe(true);

      const retrieved = await storageService.getSession('test-session-7');
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent session', async () => {
      const deleted = await storageService.deleteSession('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('getSessionCount', () => {
    it('should return 0 when no sessions exist', async () => {
      const count = await storageService.getSessionCount();
      expect(count).toBe(0);
    });

    it('should return correct count of sessions', async () => {
      const session1: ChatSession = {
        sessionId: 'test-session-8',
        messages: [{ role: 'user', content: 'Test 1' }],
        timestamp: new Date().toISOString(),
      };

      const session2: ChatSession = {
        sessionId: 'test-session-9',
        messages: [{ role: 'user', content: 'Test 2' }],
        timestamp: new Date().toISOString(),
      };

      await storageService.saveSession(session1);
      await storageService.saveSession(session2);

      const count = await storageService.getSessionCount();
      expect(count).toBe(2);
    });
  });
});

