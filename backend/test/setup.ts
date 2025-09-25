import { before, after, beforeEach } from 'mocha';
import { TestDatabase } from './test-utils.js';

// Global test setup and teardown
before(async () => {
  // Clean up database before running tests
  await TestDatabase.cleanup();
});

beforeEach(async () => {
  // Clean up database before each test
  await TestDatabase.cleanup();
});

after(async () => {
  // Clean up database after all tests
  await TestDatabase.cleanup();
  // Disconnect from database
  await TestDatabase.disconnect();
});
