import type { ChatSession } from '../types/index.js';
import { prisma } from '../config/database.js';

/**
 * Storage service for chat sessions
 * Uses PostgreSQL database via Prisma ORM for persistent storage
 */
class StorageService {
  /**
   * Save a chat session (creates new or updates existing)
   */
  async saveSession(session: ChatSession): Promise<void> {
    try {
      await prisma.chatSession.upsert({
        where: { sessionId: session.sessionId },
        update: {
          messages: session.messages as any,
          timestamp: new Date(session.timestamp),
          metadata: session.metadata as any,
        },
        create: {
          sessionId: session.sessionId,
          messages: session.messages as any,
          timestamp: new Date(session.timestamp),
          metadata: session.metadata as any,
        },
      });
      console.log(`Saved session ${session.sessionId} with ${session.messages.length} messages`);
    } catch (error) {
      console.error(`Failed to save session ${session.sessionId}:`, error);
      throw new Error('Failed to save chat session');
    }
  }

  /**
   * Get a chat session by ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { sessionId },
      });

      if (!session) {
        return null;
      }

      return {
        sessionId: session.sessionId,
        messages: session.messages as any,
        timestamp: session.timestamp.toISOString(),
        metadata: session.metadata as any,
      };
    } catch (error) {
      console.error(`Failed to get session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Get all sessions
   */
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        orderBy: { timestamp: 'desc' },
      });

      return sessions.map(session => ({
        sessionId: session.sessionId,
        messages: session.messages as any,
        timestamp: session.timestamp.toISOString(),
        metadata: session.metadata as any,
      }));
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.chatSession.delete({
        where: { sessionId },
      });
      console.log(`Deleted session ${sessionId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Get session count
   */
  async getSessionCount(): Promise<number> {
    try {
      return await prisma.chatSession.count();
    } catch (error) {
      console.error('Failed to get session count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

