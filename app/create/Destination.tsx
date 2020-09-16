import React, { useState } from 'react';
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
  setDestination,
  selSequence,
  setError,
  setProcessStep,
  setCurrentStep,
} from './slice';

import { selIntegrations } from '../base/slice';

const { ipcRenderer } = window.require('electron');

interface State {
  [key: string]: boolean;
}

export default function Destination() {
  const dispatch = useDispatch();
  const integrations = useSelector(selIntegrations);
  const sequence = useSelector(selSequence);
  const [state, setState] = useState<State>({});

  const confirmMode = () => {
    const checked = Object.keys(state).filter(
      (key) => key !== 'mtp' && state[key]
    );
    if (checked.length > 0) {
      dispatch(setDestination(state));
      dispatch(setCurrentStep('destination_login'));
    } else if (sequence.points.length) {
      dispatch(setDestination(state));
      dispatch(setProcessStep('name'));
      ipcRenderer.send('update_images', sequence);
    } else {
      dispatch(setError('There is no photos.'));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      ...Object.keys(integrations).reduce(
        (obj: { [key: string]: boolean }, integration: string) => {
          obj[integration] = event.target.checked;
          return obj;
        },
        {}
      ),
    });
  };

  const items = Object.keys(integrations).map((key) => {
    const checkNode = (
      <Checkbox
        checked={!!state[key]}
        onChange={handleChange}
        name={key}
        color="primary"
      />
    );
    const integrationLogo = (
      <>
        <img
          src={`data:image/png;base64, ${integrations[key].logo}`}
          alt={integrations[key].name}
          width="70"
          height="70"
        />
      </>
    );

    return (
      <FormControlLabel
        color="primary"
        control={checkNode}
        label={integrationLogo}
        key={key}
      />
    );
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h5" align="center" color="textSecondary">
          Destinations
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {items}
      </Grid>
      <Grid item xs={12}>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          {`${
            Object.keys(state).filter(
              (integration: string) => state[integration]
            ).length > 0
              ? 'Confirm Changes'
              : 'Skip This Step'
          }`}
        </Button>
      </Grid>
    </>
  );
}
