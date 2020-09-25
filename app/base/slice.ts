import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { RootState, AppThunk } from '../store';
import { Camera } from '../types/Camera';
import { Nadir } from '../types/Nadir';
import { Integration } from '../types/Integration';

interface State {
  cameras: Camera[];
  nadirs: Nadir[];
  integrations: Integration;
  loaded: boolean;
  basepath: string | null;
  tokens: {
    [key: string]: {
      waiting: boolean;
      token: {
        [k1: string]: string;
      };
    };
  };
  boardId: string;
}

const initialState: State = {
  cameras: [],
  nadirs: [],
  integrations: {},
  loaded: false,
  basepath: null,
  tokens: {},
  boardId: uuidv4(),
};

const baseSlice = createSlice({
  name: 'base',
  initialState,
  reducers: {
    endConfigLoad(state, { payload }) {
      state.cameras = [...payload.cameras];
      state.nadirs = [...payload.nadirs];
      state.integrations = { ...payload.integrations };
      state.basepath = payload.basepath;
      state.tokens = { ...payload.tokens };
      state.loaded = true;
    },
    setToken(state, { payload }) {
      state.tokens = {
        ...state.tokens,
        [payload.key]: {
          waiting: false,
          token: payload.token,
        },
      };
    },
    setTokens(state, { payload }) {
      state.tokens = {
        ...state.tokens,
        ...payload,
      };
    },
    setTokenWaiting(state, { payload }) {
      state.tokens = {
        ...state.tokens,
        [payload.key]: {
          ...state.tokens[payload.key],
          waiting: payload.waiting,
        },
      };
    },
  },
});

export const {
  endConfigLoad,
  setToken,
  setTokens,
  setTokenWaiting,
} = baseSlice.actions;

export default baseSlice.reducer;

export const selConfigLoaded = (state: RootState) => state.base.loaded;
export const selCameras = (state: RootState) => state.base.cameras;
export const selNadirs = (state: RootState) => state.base.nadirs;
export const selIntegrations = (state: RootState) => state.base.integrations;

export const setConfigLoadEnd = (config: any): AppThunk => {
  return (dispatch) => {
    dispatch(endConfigLoad(config));
  };
};

export const selBoardId = (state: RootState) => state.base.boardId;

export const selTokens = (state: RootState) => state.base.tokens;

export const selToken = (state: RootState) => (tokenKey: string) => {
  if (state.base.tokens[tokenKey]) {
    return state.base.tokens[tokenKey].token;
  }
  return null;
};
export const selTokenWaiting = (state: RootState) => (tokenKey: string) => {
  if (state.base.tokens[tokenKey]) {
    return state.base.tokens[tokenKey].waiting;
  }
  return false;
};

export const selBasePath = (state: RootState) => state.base.basepath;
