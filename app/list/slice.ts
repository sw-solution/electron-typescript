import { createSlice } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { Summary } from '../types/Result';

interface State {
  seqs: Summary[];
  loaded: boolean;
}

const initialState: State = {
  seqs: [],
  loaded: false,
};

const listSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    startLoad(state) {
      state.loaded = false;
    },
    endLoad(state, { payload }) {
      state.seqs = [...payload];
      state.loaded = true;
    },
    addSeq(state, { payload }) {
      state.seqs = [payload, ...state.seqs];
    },
    removeSeq(state, { payload }) {
      state.seqs = state.seqs.filter((s) => s.name !== payload);
    },
    updateSequence(state, { payload }) {
      state.seqs = state.seqs.map((s) => {
        if (s.id === payload.id) {
          return payload;
        }
        return s;
      });
    },
  },
});

export const {
  startLoad,
  endLoad,
  addSeq,
  removeSeq,
  updateSequence,
} = listSlice.actions;

export default listSlice.reducer;

export const selLoaded = (state: RootState) => state.list.loaded;
export const selSeqs = (state: RootState) => state.list.seqs;
export const selSeqNames = (state: RootState) =>
  state.list.seqs.map((seq: Summary) => seq.name);

export const setEndLoad = (seqs: Summary[]): AppThunk => {
  return (dispatch) => {
    dispatch(endLoad(seqs));
  };
};

export const setAddSeq = (seq: Summary): AppThunk => {
  return (dispatch) => {
    dispatch(addSeq(seq));
  };
};

export const setRemoveSeq = (name: string): AppThunk => {
  return (dispatch) => {
    dispatch(removeSeq(name));
  };
};
