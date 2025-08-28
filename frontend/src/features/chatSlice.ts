import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export interface ChatMessage {
  command: string;
  result: string;
  api: string;
  timestamp: number;
  pinned?: boolean;
  id?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

// Async thunk for toggling pin status
export const toggleMessagePinAsync = createAsyncThunk<
  { messageId: string; pinned: boolean },
  string,
  { rejectValue: string }
>('chat/togglePin', async (messageId: string, { rejectWithValue }) => {
  try {
    const response = await apiService.toggleMessagePin(messageId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to toggle pin');
    }
    return {
      messageId,
      pinned: response.data.pinned,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

// Async thunk for clearing all messages
export const clearMessagesAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('chat/clearMessages', async (_, { rejectWithValue }) => {
  try {
    const response = await apiService.clearChatMessages();
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to clear messages');
    }
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      // Check for duplicate messages to prevent duplicates
      const isDuplicate = state.messages.some(
        (msg: ChatMessage) =>
          msg.command === action.payload.command &&
          msg.api === action.payload.api &&
          msg.timestamp === action.payload.timestamp
      );

      if (!isDuplicate) {
        const messageWithId = {
          ...action.payload,
          id:
            action.payload.id ||
            `${action.payload.api}-${action.payload.timestamp}-${Date.now()}`,
          pinned: false,
        };
        state.messages.push(messageWithId);
      }
    },
    togglePinnedMessage(state, action: PayloadAction<string>) {
      const message = state.messages.find(msg => msg.id === action.payload);
      if (message) {
        message.pinned = !message.pinned;
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
    loadMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(toggleMessagePinAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleMessagePinAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update the message in the store with the new pinned status
        const message = state.messages.find(
          msg => msg.id === action.payload.messageId
        );
        if (message) {
          message.pinned = action.payload.pinned;
        }
      })
      .addCase(toggleMessagePinAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to toggle pin';
      })
      .addCase(clearMessagesAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearMessagesAsync.fulfilled, state => {
        state.loading = false;
        state.messages = []; // Clear messages from store
      })
      .addCase(clearMessagesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to clear messages';
      });
  },
});

export const { addMessage, clearMessages, togglePinnedMessage, loadMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
