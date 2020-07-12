import React from 'react';
import { remote } from 'electron';
import { useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { setSequenceImagePath } from './slice';

export default function SequenceUploadImage() {
  const dispatch = useDispatch();

  const openFileDialog = async () => {
    const result = await remote.dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    });
    if (result) {
      dispatch(setSequenceImagePath(result));
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Please upload the [timelapse photos | video file]
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <IconButton onClick={openFileDialog} color="primary">
          <CloudUploadIcon fontSize="large" />
        </IconButton>
        <Typography color="primary">Upload</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Typography variant="h6" align="center" color="textSecondary">
          Or use an existing file
        </Typography>
      </Grid>
    </>
  );
}
