import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';
import { IpcRendererEvent } from 'electron';
import { selProgressNextStep, setCurrentStep } from './slice';

const { ipcRenderer } = window.require('electron');

export default function SequenceProcessPage() {
  const nextStep = useSelector(selProgressNextStep);
  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer.on('finish', (_event: IpcRendererEvent) => {
      dispatch(setCurrentStep(nextStep));
    });

    return () => {
      ipcRenderer.removeAllListeners('finish');
    };
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Processing
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <LinearProgress />
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Keep the app open during processing.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Output can be viewed in [DIR] once complete
        </Typography>
      </Grid>
    </>
  );
}
