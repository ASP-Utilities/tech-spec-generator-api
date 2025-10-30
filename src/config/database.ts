import { PrismaClient } from '@prisma/client';

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
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
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

