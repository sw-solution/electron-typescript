import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';
import { IpcRendererEvent } from 'electron';
import {
  selSequenceName,
  selProcessPageNext,
  selPrevStep,
  setCurrentStep,
  setNadirPreview,
} from './slice';

import { getSequenceBasePath } from '../scripts/utils';

const { ipcRenderer } = window.require('electron');

export default function SequenceProcessPage() {
  const nextStep = useSelector(selProcessPageNext);
  const prevStep = useSelector(selPrevStep);
  console.log('prevStep: ', prevStep);
  const name = useSelector(selSequenceName);
  const dispatch = useDispatch();
  const [errMessage, setErrMessage] = React.useState<string>('');

  useEffect(() => {
    ipcRenderer.on('finish', (_event: IpcRendererEvent) => {
      dispatch(setCurrentStep(nextStep));
    });

    ipcRenderer.on(
      'loaded_preview_nadir',
      (_event: IpcRendererEvent, previewnadir) => {
        dispatch(setNadirPreview(previewnadir));
        dispatch(setCurrentStep('previewNadir'));
      }
    );

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
      <Grid item xs={12}>
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
        {prevStep !== 'attachType' && (
          <Typography align="center" color="textSecondary">
            {`Output can be viewed in [${getSequenceBasePath(
              name
            )}] once complete`}
          </Typography>
        )}
      </Grid>
    </>
  );
}
