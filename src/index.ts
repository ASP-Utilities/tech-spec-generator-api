import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { errorHandler, requestLogger } from './middleware/index.js';
import { testDatabaseConnection, disconnectDatabase, getDatabaseInfo } from './config/database.js';
import swaggerSpec from './config/swagger.js';

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

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Tech Spec Generator API Docs',
  customfavIcon: '/favicon.ico',
}));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tech Spec Generator API',
    version: '1.0.0',
    documentation: '/api-docs',
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

// Start server with database connection check
async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Connecting to database...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('⚠️ Failed to connect to database. Server will start but database operations may fail.');
    }

    const dbInfo = getDatabaseInfo();
    console.log('📊 Database info:', dbInfo);

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('🚀 Tech Spec Generator API Server');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌐 Accepting requests from: ${FRONTEND_URL}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await disconnectDatabase();
  process.exit(0);
});

