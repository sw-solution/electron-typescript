import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from 'react-google-autocomplete';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Button from '@material-ui/core/Button';
import { grey } from '@material-ui/core/colors';

import { setGooglePlace, selSequence, setProcessStep } from './slice';

interface State {
  googlePlace: string | null;
}

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  placeWrapper: {
    width: '90%',
    borderRadius: 4,
    borderColor: grey[500],
    borderWidth: 1,
    fontSize: '1rem',
    padding: theme.spacing(2),
  },
}));

export default function GooglePlace() {
  const [state, setState] = useState<State>({
    googlePlace: null,
  });
  const dispatch = useDispatch();
  const sequence = useSelector(selSequence);
  const classes = useStyles();
  const handleChange = (place) => {
    setState({
      googlePlace: place.place_id,
    });
  };

  const confirmMode = () => {
    if (state.googlePlace) dispatch(setGooglePlace(state.googlePlace));

    dispatch(setProcessStep('name'));
    ipcRenderer.send('update_images', sequence);
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          How would you select the place for your sequence?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          style={{ width: '90%' }}
          className={classes.placeWrapper}
          onPlaceSelected={handleChange}
          types={['(regions)']}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          {state.googlePlace ? 'Confirm Changes' : 'Skip the Step'}
        </Button>
      </Grid>
    </>
  );
}
