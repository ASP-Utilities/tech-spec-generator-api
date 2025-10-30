import { Router } from 'express';
import {
  saveChatSession,
  getChatSession,
  getAllChatSessions,
  healthCheck,
} from '../controllers/chat.controller.js';

const router = Router();

/**
 * Health check route
 */
router.get('/health', healthCheck);

/**
 * Save a chat session
 */
router.post('/chat/save', saveChatSession);

/**
 * Get a specific chat session
 */
router.get('/chat/:sessionId', getChatSession);

/**
 * Get all chat sessions
 */
router.get('/chat', getAllChatSessions);

export default router;

