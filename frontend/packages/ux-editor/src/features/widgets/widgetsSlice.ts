import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IWidget } from '../../types/global';
import { widgetUrl } from 'app-shared/cdn-paths';

export interface IWidgetState {
  fetched: boolean;
  widgets: IWidget[];
  urls: string[];
  error: any;
}

export interface IFetchWidgetFulfilled {
  widgets: IWidget[];
}

const initialState: IWidgetState = {
  fetched: false,
  widgets: [],
  urls: [widgetUrl()],
  error: null,
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    fetchWidgets: (state, action: PayloadAction<{org, app}>) => {},
    fetchWidgetsFulfilled: (state, action: PayloadAction<IFetchWidgetFulfilled>) => {
      const { widgets } = action.payload;
      state.widgets = widgets;
      state.fetched = true;
      state.error = null;
    },
    fetchWidgetsRejected: (state, action) => {
      const { error } = action.payload;
      state.fetched = true;
      state.error = error;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    fetchWidgetSettings: (state, action: PayloadAction<{org, app}>) => {},
    fetchWidgetSettingsFulfilled: (state, action) => {
      const { widgetUrls } = action.payload;
      state.urls = state.urls.concat(widgetUrls);
    },
    fetchWidgetSettingsRejected: (state, action) => {
      const { error } = action.payload;
      state.error = error;
    },
  },
});

export const {
  fetchWidgets,
  fetchWidgetsFulfilled,
  fetchWidgetsRejected,
  fetchWidgetSettings,
  fetchWidgetSettingsFulfilled,
  fetchWidgetSettingsRejected,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
