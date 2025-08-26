import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatInput from '../ChatInput';
import chatReducer from '../../features/chatSlice';
import apiSelectionReducer from '../../features/apiSelectionSlice';

// Mock the useSocket hook
jest.mock('../../utils/useSocket', () => ({
  useSocket: jest.fn(() => ({
    current: {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    },
  })),
}));

// Mock AWS Amplify
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
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      chat: chatReducer,
      apiSelection: apiSelectionReducer,
    },
  });
};

describe('ChatInput Component', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };

    // Mock the useSocket hook to return our mock socket
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useSocket } = require('../../utils/useSocket');
    useSocket.mockImplementation(callback => {
      if (callback) {
        callback(mockSocket);
      }
      return { current: mockSocket };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat input form', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Type a command/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  it('handles command submission', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/Type a command/);
    const submitButton = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(input, { target: { value: 'get cat fact' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('chat_command', {
        command: 'get cat fact',
        timestamp: expect.any(Number),
      });
    });
  });

  it('prevents submission when input is empty', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(submitButton);

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('prevents submission when processing', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    const input = screen.getByPlaceholderText(/Type a command/);
    const submitButton = screen.getByRole('button', { name: /Send/i });

    // Simulate processing state by triggering a command
    fireEvent.change(input, { target: { value: 'get cat fact' } });
    fireEvent.click(submitButton);

    // Wait for the first command to be processed
    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
    });

    // Simulate the processing state by triggering the command_status event
    const processingCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'command_status'
    )?.[1];

    if (processingCallback) {
      act(() => {
        processingCallback({ status: 'processing' });
      });
    }

    // Wait for processing state to be set
    await waitFor(() => {
      expect(screen.getByText(/Processing your command/)).toBeInTheDocument();
    });

    // Try to submit again while processing
    fireEvent.change(input, { target: { value: 'get weather Berlin' } });
    fireEvent.click(submitButton);

    // Should still only have one emit call (the second one should be prevented)
    expect(mockSocket.emit).toHaveBeenCalledTimes(1);
  });

  it('handles WebSocket responses', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Simulate receiving an API response
    const mockResponse = {
      command: 'get cat fact',
      result: 'Cats have 230 bones in their body.',
      api: 'Cat Facts',
      timestamp: Date.now(),
    };

    // Find the callback that was registered for 'api_response'
    const apiResponseCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'api_response'
    )?.[1];

    if (apiResponseCallback) {
      act(() => {
        apiResponseCallback(mockResponse);
      });
    }

    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.messages).toHaveLength(1);
      expect(state.chat.messages[0]).toMatchObject({
        command: mockResponse.command,
        result: mockResponse.result,
        api: mockResponse.api,
        timestamp: mockResponse.timestamp,
        pinned: false,
      });
      expect(state.chat.messages[0].id).toBeDefined();
    });
  });

  it('handles error responses', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Simulate receiving an error
    const mockError = {
      status: 'error',
      error: 'API service unavailable',
    };

    const errorCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'command_status'
    )?.[1];

    if (errorCallback) {
      act(() => {
        errorCallback(mockError);
      });
    }

    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.messages).toHaveLength(1);
      expect(state.chat.messages[0].api).toBe('System');
      expect(state.chat.messages[0].result).toBe('API service unavailable');
    });
  });

  it('handles clear chat history', async () => {
    const store = createTestStore();

    // Pre-populate with some messages
    store.dispatch({
      type: 'chat/addMessage',
      payload: {
        command: 'get cat fact',
        result: 'Test message',
        api: 'Cat Facts',
        timestamp: Date.now(),
      },
    });

    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Simulate clear chat history event
    const clearCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'clear_chat_history'
    )?.[1];

    if (clearCallback) {
      act(() => {
        clearCallback();
      });
    }

    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.messages).toHaveLength(0);
    });
  });

  it('shows processing indicator', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Simulate processing state
    const processingCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'command_status'
    )?.[1];

    if (processingCallback) {
      act(() => {
        processingCallback({ status: 'processing' });
      });
    }

    await waitFor(() => {
      expect(screen.getByText(/Processing your command/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();
    });
  });
});
