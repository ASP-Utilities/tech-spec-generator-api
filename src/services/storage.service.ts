import type { ChatSession } from '../types/index.js';

/**
 * Storage service for chat sessions
 * Currently uses in-memory storage. Can be extended to use file system or database.
 */
class StorageService {
  private sessions: Map<string, ChatSession>;

  constructor() {
    this.sessions = new Map();
  }

  /**
   * Save a chat session
   */
  async saveSession(session: ChatSession): Promise<void> {
    this.sessions.set(session.sessionId, session);
    console.log(`Saved session ${session.sessionId} with ${session.messages.length} messages`);
  }

  /**
   * Get a chat session by ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions
   */
  async getAllSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Export singleton instance
export const storageService = new StorageService();

