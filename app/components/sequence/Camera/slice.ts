import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../../store';

const cameraSlice = createSlice({
  name: 'sequence/camera',
  initialState: {
    value: '',
  },
  reducers: {
    setCamera: (state, { payload }) => {
      // eslint-disable-next-line no-param-reassign
      state.value = payload;
    },
  },
});

export const { setCamera } = cameraSlice.actions;

export const setSequenceCamera = (camera: string): AppThunk => {
  return (dispatch) => {
    dispatch(setCamera(camera));
  };
};

export default cameraSlice.reducer;

export const selSequenceCamera = (state: RootState) =>
  state.sequence.camera.value;
