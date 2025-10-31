import { afterAll, beforeAll } from 'vitest';

// Set test environment
process.env.NODE_ENV = 'test';
// Use the same PostgreSQL database from .env
// Tests will clean up after themselves

beforeAll(async () => {
  console.log('✅ Test environment initialized');
});

afterAll(async () => {
  console.log('🧹 Test cleanup complete');
});

