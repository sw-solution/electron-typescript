import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import {
  setSequenceGpxPath,
  setPrevStep,
  setCurrentStep,
  selGPXRequired,
  setProcessStep,
} from './slice';

const { ipcRenderer, remote } = window.require('electron');

export default function SequenceUploadGpx() {
  const dispatch = useDispatch();

  const required = useSelector(selGPXRequired);

  useEffect(() => {
    if (!required) {
      dispatch(setCurrentStep('modifySpace'));
      dispatch(setPrevStep('imagePath'));
    }
  });

  const openFileDialog = async () => {
    const parentWindow = remote.getCurrentWindow();
    const result = await remote.dialog.showOpenDialogSync(parentWindow, {
      properties: ['openFile'],
      filters: [
        {
          name: 'GPX',
          extensions: ['gpx'],
        },
      ],
    });
    if (result) {
      dispatch(setSequenceGpxPath(result[0]));
      dispatch(setProcessStep('startTime'));
      ipcRenderer.send('load_gpx', result[0]);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Please upload the GPS tracks Following formats supported: GPX.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <IconButton onClick={openFileDialog} color="primary">
          <CloudUploadIcon fontSize="large" />
        </IconButton>
        <Typography color="primary">Upload</Typography>
      </Grid>
      <Grid item xs={12} />
    </>
  );
}
