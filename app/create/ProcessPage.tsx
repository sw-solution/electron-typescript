import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';
import { IpcRendererEvent } from 'electron';
import {
  selProgressNextStep,
  selProgressPrevStep,
  setCurrentStep,
} from './slice';

const { ipcRenderer } = window.require('electron');

export default function SequenceProcessPage() {
  const nextStep = useSelector(selProgressNextStep);
  const prevStep = useSelector(selProgressPrevStep);
  const dispatch = useDispatch();
  const [errMessage, setErrMessage] = React.useState<string>('');

  useEffect(() => {
    ipcRenderer.on('finish', (_event: IpcRendererEvent) => {
      dispatch(setCurrentStep(nextStep));
    });

    ipcRenderer.on('error', (_event: IpcRendererEvent, message) => {
      if (message) {
        setErrMessage(message);
      }
      dispatch(setCurrentStep(prevStep));
    });

    return () => {
      ipcRenderer.removeAllListeners('finish');
      ipcRenderer.removeAllListeners('error');
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
        {errMessage !== '' && (
          <Typography paragraph align="center" color="secondary">
            {errMessage}
          </Typography>
        )}
        {errMessage === '' && <LinearProgress />}
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
