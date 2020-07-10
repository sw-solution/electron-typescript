import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../../store';

const typeSlice = createSlice({
  name: 'sequence/type',
  initialState: {
    value: '',
  },
  reducers: {
    setType: (state, { payload }) => {
      // eslint-disable-next-line no-param-reassign
      state.value = payload;
    },
  },
});

export const { setType } = typeSlice.actions;

export const setSequenceType = (type: string): AppThunk => {
  return (dispatch) => {
    dispatch(setType(type));
  };
};

export default typeSlice.reducer;

export const selSequenceType = (state: RootState) => state.sequence.type.value;
