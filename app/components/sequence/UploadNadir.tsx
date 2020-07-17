import React from 'react';
import { useDispatch } from 'react-redux';

import { Typography, Box, Grid, IconButton, Button } from '@material-ui/core';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { setSequenceNadirPath } from './slice';
import nadir1 from '../../assets/images/nadir1.png';
import nadir2 from '../../assets/images/nadir2.png';

const { ipcRenderer, remote } = window.require('electron');

export default function SequenceUploadNadir() {
  const dispatch = useDispatch();

  const setPath = (url: string) => {
    dispatch(setSequenceNadirPath(url));
    ipcRenderer.send('upload_nadir', url);
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

  const defaultNadir = (url: string) => {
    setPath(url);
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
        <Box mb={1}>
          <Typography align="center" color="textSecondary">
            Or choose from default nadirs
          </Typography>
        </Box>
        <Box>
          <Box mr={1}>
            <Button
              onClick={() => defaultNadir('app/assets/images/nadir1.png')}
            >
              <img src={nadir1} width="70px" alt="nadir1" />
            </Button>
            <Button
              onClick={() => defaultNadir('app/assets/images/nadir2.png')}
            >
              <img src={nadir2} width="70px" alt="nadir2" />
            </Button>
          </Box>
        </Box>
      </Grid>
    </>
  );
}
