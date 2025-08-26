// Global test setup for backend tests

// Mock fetch globally for API service tests
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
