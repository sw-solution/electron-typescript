import { createSlice } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { Camera } from '../types/Camera';

interface State {
  cameras: Camera[];
  loaded: boolean;
}

const initialState: State = {
  cameras: [],
  loaded: false,
};

const baseSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    endConfigLoad(state, { payload }) {
      state.cameras = [...payload.cameras];
      state.loaded = true;
    },
  },
});

export const { endConfigLoad } = baseSlice.actions;

export default baseSlice.reducer;

export const selConfigLoaded = (state: RootState) => state.base.loaded;
export const selCameras = (state: RootState) => state.base.cameras;

export const setConfigLoadEnd = (config: any): AppThunk => {
  return (dispatch) => {
    dispatch(endConfigLoad(config));
  };
};
