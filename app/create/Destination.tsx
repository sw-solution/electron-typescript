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
  selMapillary,
  selSequence,
  setMapillary,
  setError,
  setProcessStep,
  setCurrentStep,
} from './slice';

const { ipcRenderer } = window.require('electron');

export default function Destination() {
  const dispatch = useDispatch();
  const mapillary = useSelector(selMapillary);
  const sequence = useSelector(selSequence);

  const confirmMode = () => {
    if (mapillary) {
      dispatch(setCurrentStep('destination_login'));
    } else if (sequence.points.length) {
      ipcRenderer.send('update_images', sequence);
      dispatch(setProcessStep('name'));
    } else {
      dispatch(setError('There is no photos.'));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMapillary(event.target.checked));
  };

  const mapillaryCheck = (
    <Checkbox
      checked={mapillary}
      onChange={handleChange}
      name="checkedB"
      color="primary"
    />
  );

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h5" align="center" color="textSecondary">
          Destinations
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          color="primary"
          control={mapillaryCheck}
          label="Mapillary"
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          {`${mapillary ? 'Confirm Changes' : 'Skip This Step'}`}
        </Button>
      </Grid>
    </>
  );
}
