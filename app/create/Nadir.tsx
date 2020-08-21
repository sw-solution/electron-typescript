import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import AddIcon from '@material-ui/icons/Add';
import SkipNextIcon from '@material-ui/icons/SkipNext';

import { setCurrentStep } from './slice';

export default function SequenceNadir() {
  const dispatch = useDispatch();

  const storeSequenceNadir = () => {
    dispatch(setCurrentStep('nadirPath'));
  };

  const processPage = () => {
    dispatch(setCurrentStep('blur'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Add Nadir
        </Typography>
        <Typography align="center" color="textSecondary">
          You can add a nadir with a branded logo
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={5} justify="center">
          <Grid item>
            <IconButton
              size="medium"
              color="secondary"
              onClick={storeSequenceNadir}
            >
              <AddIcon fontSize="large" />
            </IconButton>
            <Typography color="secondary">Add Nadir</Typography>
          </Grid>
          <Grid item>
            <IconButton size="medium" color="primary" onClick={processPage}>
              <SkipNextIcon fontSize="large" />
            </IconButton>
            <Typography color="primary">Skip This Step</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Please be aware of branding guidelines for upload destinations
        </Typography>
      </Grid>
    </>
  );
}
