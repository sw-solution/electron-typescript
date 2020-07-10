import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../../store';

const nameSlice = createSlice({
  name: 'sequence/name',
  initialState: {
    value: '',
  },
  reducers: {
    setName: (state, { payload }) => {
      // eslint-disable-next-line no-param-reassign
      state.value = payload;
    },
  },
});

export const { setName } = nameSlice.actions;

export const setSequenceName = (name: string): AppThunk => {
  return (dispatch) => {
    dispatch(setName(name));
  };
};

export default nameSlice.reducer;

export const selSequenceName = (state: RootState) => state.sequence.name.value;
