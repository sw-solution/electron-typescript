import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';
import { IpcRendererEvent } from 'electron';
import {
  selSequenceName,
  selProcessPageNext,
  setCurrentStep,
  setNadirPreview,
} from './slice';

import { selBasePath } from '../base/slice';

import { getSequenceBasePath } from '../scripts/utils';

const { ipcRenderer } = window.require('electron');

export default function SequenceProcessPage() {
  const nextStep = useSelector(selProcessPageNext);
  const name = useSelector(selSequenceName);
  const basepath = useSelector(selBasePath);
  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer.on('finish', (_event: IpcRendererEvent) => {
      if (nextStep !== 'name' && nextStep !== '') {
        dispatch(setCurrentStep(nextStep));
      }
    });

    ipcRenderer.on(
      'loaded_preview_nadir',
      (_event: IpcRendererEvent, preview: any) => {
        dispatch(setNadirPreview(preview));
        dispatch(setCurrentStep('previewNadir'));
      }
    );

    return () => {
      ipcRenderer.removeAllListeners('finish');
      ipcRenderer.removeAllListeners('loaded_preview_nadir');
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
        <LinearProgress />
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Keep the app open during processing.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {nextStep === 'name' && (
          <Typography align="center" color="textSecondary">
            {`Output can be viewed in [${getSequenceBasePath(
              name,
              basepath
            )}] once complete`}
          </Typography>
        )}
      </Grid>
    </>
  );
}
