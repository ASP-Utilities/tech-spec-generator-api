import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler, requestLogger } from './middleware/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logging
app.use(requestLogger); // Custom request logging

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tech Spec Generator API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      saveChat: 'POST /api/chat/save',
      getChat: 'GET /api/chat/:sessionId',
      getAllChats: 'GET /api/chat',
    },
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('🚀 Tech Spec Generator API Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Accepting requests from: ${FRONTEND_URL}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

