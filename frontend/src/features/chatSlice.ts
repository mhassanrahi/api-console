import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  command: string;
  result: string;
  api: string;
  timestamp: number;
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
        msg => 
          msg.command === action.payload.command && 
          msg.api === action.payload.api && 
          msg.timestamp === action.payload.timestamp
      );
      
      if (!isDuplicate) {
        state.messages.push(action.payload);
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
