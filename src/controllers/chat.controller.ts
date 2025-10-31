import type { Request, Response } from 'express';
import type { SaveChatRequest, SaveChatResponse } from '../types/index.js';
import { storageService } from '../services/storage.service.js';

/**
 * Controller for chat-related endpoints
 */

/**
 * @swagger
 * /api/chat/save:
 *   post:
 *     summary: Save a chat session
 *     description: Save a new chat session or update an existing one. If sessionId is not provided, the server will generate one automatically.
 *     tags: [Chat Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveChatRequest'
 *           examples:
 *             withSessionId:
 *               summary: Save with custom session ID
 *               value:
 *                 sessionId: "chat-custom-123"
 *                 messages:
 *                   - role: "user"
 *                     content: "Hello"
 *                   - role: "model"
 *                     content: "Hi there!"
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *             withoutSessionId:
 *               summary: Save without session ID (server generates)
 *               value:
 *                 messages:
 *                   - role: "user"
 *                     content: "Hello"
 *                   - role: "model"
 *                     content: "Hi there!"
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Chat session saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaveChatResponse'
 *       400:
 *         description: Invalid request (missing or empty messages array)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const saveChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, messages, timestamp } = req.body as SaveChatRequest;

    // Validation
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'messages array is required',
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

    // Generate sessionId if not provided
    const finalSessionId = sessionId || `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Save the session
    await storageService.saveSession({
      sessionId: finalSessionId,
      messages,
      timestamp: timestamp || new Date().toISOString(),
    });

    const response: SaveChatResponse = {
      success: true,
      sessionId: finalSessionId,
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
 * @swagger
 * /api/chat/{sessionId}:
 *   get:
 *     summary: Get a specific chat session
 *     description: Retrieve a chat session by its unique session ID
 *     tags: [Chat Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique session ID
 *         example: "chat-1234567890-abc123"
 *     responses:
 *       200:
 *         description: Chat session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChatSession'
 *       404:
 *         description: Chat session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get all chat sessions
 *     description: Retrieve all stored chat sessions, ordered by most recent first
 *     tags: [Chat Sessions]
 *     responses:
 *       200:
 *         description: List of all chat sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Total number of sessions
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatSession'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API and database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: System is degraded (database connection failed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  let dbHealthy = false;
  let sessionCount = 0;

  try {
    // Test database by attempting to count sessions
    // If this succeeds, the database connection is healthy
    sessionCount = await storageService.getSessionCount();
    dbHealthy = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const healthData = {
    success: true,
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbHealthy,
      sessionCount,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(dbHealthy ? 200 : 503).json(healthData);
};

