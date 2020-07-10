import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../../store';

const attachTypeSlice = createSlice({
  name: 'sequence/attachType',
  initialState: {
    value: '',
  },
  reducers: {
    setAttachType: (state, { payload }) => {
      // eslint-disable-next-line no-param-reassign
      state.value = payload;
    },
  },
});

export const { setAttachType } = attachTypeSlice.actions;

export const setSequenceAttachType = (attachType: string): AppThunk => {
  return (dispatch) => {
    dispatch(setAttachType(attachType));
  };
};

export default attachTypeSlice.reducer;

export const selSequenceAttachType = (state: RootState) =>
  state.sequence.attachType.value;
