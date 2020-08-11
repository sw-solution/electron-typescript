import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import {
  setSequenceGpxPath,
  setCurrentStep,
  selGPXRequired,
  selGPXImport,
  setProcessStep,
} from './slice';

const { ipcRenderer, remote } = window.require('electron');

export default function SequenceUploadGpx() {
  const dispatch = useDispatch();

  const required = useSelector(selGPXRequired);
  const importgpx = useSelector(selGPXImport);

  useEffect(() => {
    if (!required && !importgpx) {
      dispatch(setCurrentStep('modifySpace'));
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
          {`${
            required ? 'There are some images that have no geodata.' : ' .'
          }Please upload the GPS tracks Following formats supported: GPX.`}
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <div>
          <IconButton onClick={openFileDialog} color="primary">
            <CloudUploadIcon fontSize="large" />
          </IconButton>
          <Typography color="primary">Upload</Typography>
        </div>
        {!importgpx && (
          <div>
            <IconButton
              onClick={() => {
                dispatch(setCurrentStep('modifySpace'));
              }}
              color="secondary"
            >
              <DeleteForeverIcon fontSize="large" />
            </IconButton>
            <Typography color="secondary">Discard</Typography>
          </div>
        )}
      </Grid>
      <Grid item xs={12} />
    </>
  );
}
