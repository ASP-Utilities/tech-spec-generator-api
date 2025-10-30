import type { Request, Response } from 'express';
import type { SaveChatRequest, SaveChatResponse } from '../types/index.js';
import { storageService } from '../services/storage.service.js';

/**
 * Controller for chat-related endpoints
 */

/**
 * Save a chat session
 * POST /api/chat/save
 */
export const saveChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, messages, timestamp } = req.body as SaveChatRequest;

    // Validation
    if (!sessionId || !messages || !Array.isArray(messages)) {
      res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'sessionId and messages array are required',
      });
      return;
    }

    if (messages.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'messages array cannot be empty',
      });
      return;
    }

    // Save the session
    await storageService.saveSession({
      sessionId,
      messages,
      timestamp: timestamp || new Date().toISOString(),
    });

    const response: SaveChatResponse = {
      success: true,
      sessionId,
      message: 'Chat session saved successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save chat session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a specific chat session
 * GET /api/chat/:sessionId
 */
export const getChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await storageService.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Chat session not found',
      });
      return;
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all chat sessions
 * GET /api/chat
 */
export const getAllChatSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await storageService.getAllSessions();

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching all chat sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat sessions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Health check endpoint
 * GET /api/health
 */
export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    sessionCount: storageService.getSessionCount(),
  });
};

