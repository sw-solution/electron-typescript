import { createSlice } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { Camera } from '../types/Camera';
import { Nadir } from '../types/Nadir';

interface State {
  cameras: Camera[];
  nadirs: Nadir[];
  loaded: boolean;
}

const initialState: State = {
  cameras: [],
  nadirs: [],
  loaded: false,
};

const baseSlice = createSlice({
  name: 'base',
  initialState,
  reducers: {
    endConfigLoad(state, { payload }) {
      state.cameras = [...payload.cameras];
      state.nadirs = [...payload.nadirs];
      state.loaded = true;
    },
  },
});

export const { endConfigLoad } = baseSlice.actions;

export default baseSlice.reducer;

export const selConfigLoaded = (state: RootState) => state.base.loaded;
export const selCameras = (state: RootState) => state.base.cameras;
export const selNadirs = (state: RootState) => state.base.nadirs;

export const setConfigLoadEnd = (config: any): AppThunk => {
  return (dispatch) => {
    dispatch(endConfigLoad(config));
  };
};
