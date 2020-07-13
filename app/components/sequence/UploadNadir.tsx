import React from 'react';
import { remote } from 'electron';
import { useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { setSequenceNadirPath } from './slice';

export default function SequenceUploadNadir() {
  const dispatch = useDispatch();

  const openFileDialog = async () => {
    const result = await remote.dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [
        {
          name: 'images',
          extensions: ['jpg', 'png', 'tif'],
        },
      ],
    });
    if (result) {
      dispatch(setSequenceNadirPath(result));
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Select the nadir
        </Typography>
        <Typography align="center" color="textSecondary">
          Allowed jpg, png, tif file only. Must be at least 500px x 500px
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <IconButton onClick={openFileDialog} color="primary">
          <CloudUploadIcon fontSize="large" />
        </IconButton>
        <Typography color="primary">Upload</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Or choose from default nadirs
        </Typography>
      </Grid>
    </>
  );
}
