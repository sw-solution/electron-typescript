import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../../store';

const descriptionSlice = createSlice({
  name: 'sequence/description',
  initialState: {
    value: '',
  },
  reducers: {
    setDescription: (state, { payload }) => {
      // eslint-disable-next-line no-param-reassign
      state.value = payload;
    },
  },
});

export const { setDescription } = descriptionSlice.actions;

export const setSequenceDescription = (description: string): AppThunk => {
  return (dispatch) => {
    dispatch(setDescription(description));
  };
};

export default descriptionSlice.reducer;

export const selSequenceDescription = (state: RootState) =>
  state.sequence.description.value;
