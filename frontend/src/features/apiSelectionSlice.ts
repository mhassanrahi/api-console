import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ApiName =
  | 'Cat Facts'
  | 'Chuck Norris Jokes'
  | 'Bored API'
  | 'GitHub Users'
  | 'Weather'
  | 'Custom Backend';

export interface ApiSelectionState {
  activeApis: ApiName[];
}

const initialState: ApiSelectionState = {
  activeApis: [
    'Cat Facts',
    'Chuck Norris Jokes',
    'Bored API',
    'GitHub Users',
    'Weather',
    'Custom Backend',
  ],
};

const apiSelectionSlice = createSlice({
  name: 'apiSelection',
  initialState,
  reducers: {
    toggleApi(state, action: PayloadAction<ApiName>) {
      if (state.activeApis.includes(action.payload)) {
        state.activeApis = state.activeApis.filter(api => api !== action.payload);
      } else {
        state.activeApis.push(action.payload);
      }
    },
  },
});

export const { toggleApi } = apiSelectionSlice.actions;
export default apiSelectionSlice.reducer;
