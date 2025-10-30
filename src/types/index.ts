/**
 * Shared types for the Tech Spec Generator API
 * These should match the types in your frontend
 */

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  timestamp: string;
  metadata?: {
    userAgent?: string;
    clientVersion?: string;
  };
}

export interface SaveChatRequest {
  sessionId: string;
  messages: Message[];
  timestamp: string;
}

export interface SaveChatResponse {
  success: boolean;
  sessionId: string;
  message: string;
}

