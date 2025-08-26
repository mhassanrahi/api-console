import { configureStore } from '@reduxjs/toolkit';
import apiSelectionReducer from '../features/apiSelectionSlice';
import chatReducer from '../features/chatSlice';

export const store = configureStore({
  reducer: {
    apiSelection: apiSelectionReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
