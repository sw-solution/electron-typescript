import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Summary } from '../types/Result';

interface State {
  selected?: string;
  step: number;
}

const initialState: State = {
  selected: undefined,
  step: 0,
};

const editSlice = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setEdit(state, { payload }) {
      state.selected = payload;
    },
    setStep(state, { payload }) {
      state.step = payload;
    },
  },
});

export const { setEdit, setStep } = editSlice.actions;

export default editSlice.reducer;

export const selEditSeq = (state: RootState) => {
  if (state.edit.selected) {
    const seqs = state.list.seqs.filter(
      (s: Summary) => s.id === state.edit.selected
    );
    if (seqs.length) return seqs[0];
  }
  return null;
};

export const selStep = (state: RootState) => {
  return state.edit.step;
};
