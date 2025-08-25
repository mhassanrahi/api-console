

import { configureStore } from '@reduxjs/toolkit';
import apiSelectionReducer from '../features/apiSelectionSlice';

export const store = configureStore({
  reducer: {
    apiSelection: apiSelectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
