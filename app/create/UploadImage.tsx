import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
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

  const [corrupted, setCorrupted] = useState<boolean>(false);

  const openFileDialog = async () => {
    const parentWindow = remote.getCurrentWindow();
    let options: OpenDialogSyncOptions;
    let channelName: string;
    if (attachType === 'video') {
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
      ipcRenderer.send(channelName, result[0], seqName, corrupted);
      dispatch(setSequenceImagePath(result[0]));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCorrupted(event.target.checked);
  };

  const corrupedCheck = (
    <Checkbox
      checked={corrupted}
      onChange={handleChange}
      name="checkedB"
      color="primary"
    />
  );
  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          {`Please upload the ${
            attachType === 'video' ? attachType : 'timelapse photos'
          }`}
        </Typography>

        <FormControlLabel
          color="primary"
          control={corrupedCheck}
          label="check for corrupted images (recommended if you suspect very dark frames)"
        />
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
