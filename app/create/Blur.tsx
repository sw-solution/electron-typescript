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

  const bluredCheck = (
    <Checkbox
      checked={blurred}
      onChange={handleChange}
      name="checkedB"
      color="primary"
    />
  );

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h5" align="center" color="textSecondary">
          Create a blurred copy
        </Typography>
        <Typography paragraph>
          You can create a copy of the sequence images with publicly
          identifiable information blurred. Do not use this option if 
          uploading to Mapillary or Google Street View. It is only recommended
          if you plan to use services that do not blur content but you need too
          because images contain lots of sensitive data. BEWARE: It requires a
          lot of computing power.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          color="primary"
          control={bluredCheck}
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
          {`${blurred ? 'Confirm Changes' : 'Skip This Step'}`}
        </Button>
      </Grid>
    </>
  );
}
