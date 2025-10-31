import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

/**
 * Database configuration for Tech Spec Generator API
 * 
 * Supports two modes:
 * - Local Development: Direct PostgreSQL connection via DATABASE_URL
 * - Production (GCP): Cloud SQL connection with Workload Identity
 */

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error({ context: { error } }, 'Database connection failed');
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error({ context: { error } }, 'Error disconnecting from database');
  }
}

/**
 * Get database connection info (for debugging)
 */
export function getDatabaseInfo() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasCloudSql = !!process.env.CLOUD_SQL_CONNECTION_NAME;
  
  return {
    environment: process.env.NODE_ENV || 'development',
    isProduction,
    cloudSqlEnabled: hasCloudSql,
    connectionName: process.env.CLOUD_SQL_CONNECTION_NAME || 'N/A',
  };
}

export { prisma };
export default prisma;

