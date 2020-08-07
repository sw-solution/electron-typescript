import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Typography, Box, Grid, IconButton, Button } from '@material-ui/core';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { getImageBasePath } from '../scripts/utils';

import {
  setSequenceNadirPath,
  selSequenceName,
  selPoints,
  setProcessStep,
} from './slice';

import { selNadirs } from '../base/slice';
import { Nadir } from '../types/Nadir';

const { ipcRenderer, remote } = window.require('electron');

export default function SequenceUploadNadir() {
  const dispatch = useDispatch();
  const name = useSelector(selSequenceName);
  const points = useSelector(selPoints);
  const nadirs = useSelector(selNadirs);

  const setPath = (url: string) => {
    dispatch(setSequenceNadirPath(url));
    dispatch(setProcessStep('previewNadir'));
    ipcRenderer.send('upload_nadir', {
      nadirpath: url,
      imagepath: getImageBasePath(name, points[0].Image),
    });
  };

  const openFileDialog = async () => {
    const parentWindow = remote.getCurrentWindow();
    const result = await remote.dialog.showOpenDialogSync(parentWindow, {
      properties: ['openFile'],
      filters: [
        {
          name: 'images',
          extensions: ['jpg', 'png', 'tif'],
        },
      ],
    });
    if (result) {
      setPath(result[0]);
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
      <Grid item xs={12}>
        <IconButton onClick={openFileDialog} color="primary">
          <CloudUploadIcon fontSize="large" />
        </IconButton>
        <Typography color="primary">Upload</Typography>
      </Grid>
      <Grid item xs={12}>
        <Box mb={1}>
          <Typography align="center" color="textSecondary">
            Or choose from default nadirs
          </Typography>
        </Box>
        <Box>
          <Box mr={1}>
            {nadirs.map((nadir: Nadir) => (
              <Button onClick={() => setPath(nadir.url)} key={nadir.url}>
                <img
                  width="70"
                  height="70"
                  src={`data:image/png;base64, ${nadir.image}`}
                  alt="Nadir"
                />
              </Button>
            ))}
          </Box>
        </Box>
      </Grid>
    </>
  );
}
