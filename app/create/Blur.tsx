import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Typography,
  Grid,
  Button,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {
  selBlur,
  selSequence,
  setProcessStep,
  setBlur,
  setError,
} from './slice';

const { ipcRenderer } = window.require('electron');

export default function SequenceBur() {
  const dispatch = useDispatch();
  const blurred = useSelector(selBlur);
  const sequence = useSelector(selSequence);

  const confirmMode = () => {
    if (sequence.points.length) {
      dispatch(setProcessStep('name'));
      ipcRenderer.send('update_images', sequence);
    } else {
      dispatch(setError('There is no photos.'));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setBlur(event.target.checked));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h5" align="center" color="textSecondary">
          Create a blurred copy
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary">
          You can create a copy of the sequence images with publicly identifiable information blurred. Only recommended if you plan to use services that do not blur content automatically (e.g. Facebook) and images contain lots of sensitive data because it requires a high amount of computing power.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          color="primary"
          control={
            <Checkbox
              checked={blurred}
              onChange={handleChange}
              name="checkedB"
              color="primary"
            />
          }
          label="Blur images?"
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          Confirm Mods
        </Button>
      </Grid>
    </>
  );
}
