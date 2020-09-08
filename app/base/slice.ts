import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { RootState, AppThunk } from '../store';
import { Camera } from '../types/Camera';
import { Nadir } from '../types/Nadir';

interface State {
  cameras: Camera[];
  nadirs: Nadir[];
  loaded: boolean;
  basepath: string | null;
  token: string;
  tokenWaiting: boolean;
  boardId: string;
}

const initialState: State = {
  cameras: [],
  nadirs: [],
  loaded: false,
  basepath: null,
  token: '',
  tokenWaiting: false,
  boardId: uuidv4(),
};

const baseSlice = createSlice({
  name: 'base',
  initialState,
  reducers: {
    endConfigLoad(state, { payload }) {
      state.cameras = [...payload.cameras];
      state.nadirs = [...payload.nadirs];
      state.basepath = payload.basepath;
      state.loaded = true;
    },
    setMTPToken(state, { payload }) {
      state.token = payload;
      state.tokenWaiting = false;
    },
    setMTPTokenWaiting(state, { payload }) {
      state.tokenWaiting = payload;
    },
  },
});

export const {
  endConfigLoad,
  setMTPToken,
  setMTPTokenWaiting,
} = baseSlice.actions;

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

export const selMTPToken = (state: RootState) => state.base.token;
export const selMTPTokenWaiting = (state: RootState) => state.base.tokenWaiting;

export const selBasePath = (state: RootState) => state.base.basepath;
