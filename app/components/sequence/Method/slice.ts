import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../../store';

const methodSlice = createSlice({
  name: 'sequence/method',
  initialState: {
    value: '',
  },
  reducers: {
    setMethod: (state, { payload }) => {
      // eslint-disable-next-line no-param-reassign
      state.value = payload;
    },
  },
});

export const { setMethod } = methodSlice.actions;

export const setSequenceMethod = (method: string): AppThunk => {
  return (dispatch) => {
    dispatch(setMethod(method));
  };
};

export default methodSlice.reducer;

export const selSequenceMethod = (state: RootState) =>
  state.sequence.method.value;
