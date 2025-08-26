import '@testing-library/jest-dom';

// Mock AWS Amplify globally
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(() =>
    Promise.resolve({
      tokens: {
        idToken: {
          toString: () => 'mock-token',
        },
      },
    })
  ),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock Socket.IO client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
