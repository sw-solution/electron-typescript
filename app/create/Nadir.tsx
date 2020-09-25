import React from 'react';
import { useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import AddIcon from '@material-ui/icons/Add';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { setCurrentStep } from './slice';

export default function SequenceNadir() {
  const dispatch = useDispatch();

  const storeSequenceNadir = () => {
    dispatch(setCurrentStep('nadirPath'));
  };

  const processPage = () => {
    dispatch(setCurrentStep('destination'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Add Nadir
        </Typography>
        <Typography paragraph>
          You can add a nadir with a branded logo. Please be aware of branding
          guidelines for upload destination.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={5} justify="center">
          <Grid item>
            <Button
              size="medium"
              color="secondary"
              onClick={storeSequenceNadir}
              variant="contained"
              endIcon={<AddIcon />}
            >
              Add Nadir
            </Button>
          </Grid>
          <Grid item>
            <Button
              size="medium"
              color="primary"
              onClick={processPage}
              endIcon={<ChevronRightIcon />}
              variant="contained"
            >
              Skip This Step
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
