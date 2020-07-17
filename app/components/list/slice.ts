import { createSlice } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../store';

const listSlice = createSlice({
  name: 'list',
  initialState: {
    seqs: [],
    loaded: false,
  },
  reducers: {
    startLoad(state) {
      state.loaded = false;
    },
    endLoad(state, { payload }) {
      state.seqs = [...payload];
      state.loaded = true;
    },
    addSeq(state, { payload }) {
      state.seqs = [...state.seqs, payload];
    },
    removeSeq(state, { payload }) {
      state.seqs = state.seqs.filter((s) => s.name !== payload);
    },
  },
});

export const { startLoad, endLoad, addSeq, removeSeq } = listSlice.actions;

export default listSlice.reducer;

export const selLoaded = (state: RootState) => state.list.loaded;
export const selSeqs = (state: RootState) => state.list.seqs;

export const setEndLoad = (seqs: any[]): AppThunk => {
  return (dispatch) => {
    dispatch(endLoad(seqs));
  };
};

export const setAddSeq = (seq: any): AppThunk => {
  return (dispatch) => {
    dispatch(addSeq(seq));
  };
};

export const setRemoveSeq = (name: string): AppThunk => {
  return (dispatch) => {
    dispatch(removeSeq(name));
  };
};
