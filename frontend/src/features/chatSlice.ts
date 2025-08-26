import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      // Check for duplicate messages to prevent duplicates
      const isDuplicate = state.messages.some(
t        msg =>
          msg.command === action.payload.command &&
          msg.api === action.payload.api &&
          msg.timestamp === action.payload.timestamp
      );

      if (!isDuplicate) {
        const messageWithId = {
          ...action.payload,
          id: `${action.payload.api}-${action.payload.timestamp}-${Date.now()}`,
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
  },
});

export const { addMessage, clearMessages, togglePinnedMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
