import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fallbackLanguage } from 'app-shared/fallbackLanguage';
import type { IFormDesignerActionRejected } from '../../../types/global';

export interface ILanguageState {
  language: any;
  fetched: boolean;
  error: Error;
}

const initialState: ILanguageState = {
  language: fallbackLanguage,
  error: null,
  fetched: false
};

export interface IFetchLanguage {
  languageCode: string;
}

export interface IFetchLanguageFulfilled {
  language: any;
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchLanguage: (state, action: PayloadAction<IFetchLanguage>) => undefined,
    fetchLanguageFulfilled: (state, action: PayloadAction<IFetchLanguageFulfilled>) => {
      const { language } = action.payload;
      state.language = language;
      state.fetched = true;
      state.error = null;
    },
    fetchLanguageRejected: (state, action: PayloadAction<IFormDesignerActionRejected>) => {
      const { error } = action.payload;
      state.fetched = true;
      state.error = error;
    },
  },
});

export const { fetchLanguage, fetchLanguageFulfilled, fetchLanguageRejected } =
  languageSlice.actions;

export default languageSlice.reducer;
