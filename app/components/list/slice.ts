import { createSlice } from '@reduxjs/toolkit';

const listSlice = createSlice({
  name: 'list',
  initialState: {
    seqs: [],
  },
  reducers: {},
});

export default listSlice.reducer;
