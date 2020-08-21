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
  const name = useSelector(selSequenceName);
  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer.on('finish', (_event: IpcRendererEvent) => {
      dispatch(setCurrentStep(nextStep));
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
              name
            )}] once complete`}
          </Typography>
        )}
      </Grid>
    </>
  );
}
