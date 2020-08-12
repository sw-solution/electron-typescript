import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import { OpenDialogSyncOptions } from 'electron';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import {
  setSequenceImagePath,
  selSequenceAttachType,
  selSequenceName,
} from './slice';

const { ipcRenderer, remote } = window.require('electron');

export default function SequenceUploadImage() {
  const dispatch = useDispatch();
  const attachType = useSelector(selSequenceAttachType);
  const seqName = useSelector(selSequenceName);

  const openFileDialog = async () => {
    const parentWindow = remote.getCurrentWindow();
    let options: OpenDialogSyncOptions;
    let channelName: string;
    if (attachType === 'Video') {
      channelName = 'load_video';
      options = {
        properties: ['openFile'],
        filters: [
          {
            name: 'video',
            extensions: ['mp4'],
          },
        ],
      };
    } else {
      channelName = 'load_images';
      options = {
        properties: ['openDirectory'],
      };
    }
    const result = await remote.dialog.showOpenDialogSync(
      parentWindow,
      options
    );

    if (result) {
      ipcRenderer.send(channelName, result[0], seqName);
      dispatch(setSequenceImagePath(result[0]));
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          {`Please upload the ${
            attachType === 'Video' ? attachType : 'timelapse photos'
          }`}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <IconButton onClick={openFileDialog} color="primary">
          <CloudUploadIcon fontSize="large" />
        </IconButton>
        <Typography color="primary">Upload</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Or use an existing file
        </Typography>
      </Grid>
    </>
  );
}
