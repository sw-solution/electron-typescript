import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { RootState, AppThunk } from '../store';
import { Camera } from '../types/Camera';
import { Nadir } from '../types/Nadir';

interface State {
  cameras: Camera[];
  nadirs: Nadir[];
  loaded: boolean;
  user: any;
  boardId: string;
}

const initialState: State = {
  cameras: [],
  nadirs: [],
  loaded: false,
  user: {},
  boardId: uuidv4(),
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
    setUser(state, { payload }) {
      state.user = payload;
    },
  },
});

export const { endConfigLoad, setUser } = baseSlice.actions;

export default baseSlice.reducer;

export const selConfigLoaded = (state: RootState) => state.base.loaded;
export const selCameras = (state: RootState) => state.base.cameras;
export const selNadirs = (state: RootState) => state.base.nadirs;

export const setConfigLoadEnd = (config: any): AppThunk => {
  return (dispatch) => {
    dispatch(endConfigLoad(config));
  };
};

export const selBoardId = (state: RootState) => state.base.boardId;

export const selCurrentPath = (state: RootState) => state.router.pathname;
