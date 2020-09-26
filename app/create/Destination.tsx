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
  isRequiredNadir,
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
  const isrequirednadir = useSelector(isRequiredNadir);

  const confirmMode = () => {
    const checked = Object.keys(state).filter(
      (key) => key !== 'mtp' && state[key]
    );
    if (checked.length > 0) {
      dispatch(setDestination(state));
      dispatch(setCurrentStep('destination_login'));
    } else if (sequence.points.length) {
      dispatch(setDestination(state));
      dispatch(setProcessStep('final'));
      ipcRenderer.send('update_images', sequence);
    } else {
      dispatch(setError('There is no photos.'));
    }
  };

  const handleChange = (key: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newState = {
      ...state,
      [key]: event.target.checked,
    };

    if (key === 'mtp' || key === 'mapillary' || event.target.checked) {
      newState.mtp = event.target.checked;
      newState.mapillary = event.target.checked;
    }

    if ((key === 'mtp' || key === 'mapillary') && !event.target.checked) {
      Object.keys(newState).forEach((k: string) => {
        newState[k] = event.target.checked;
      });
    }

    setState(newState);
  };

  const items = Object.keys(integrations)
    .filter(
      (key: string) => key !== 'google' || (key === 'google' && isrequirednadir)
    )
    .sort((a: string, b: string) =>
      integrations[a].order > integrations[b].order ? 1 : -1
    )
    .map((key) => {
      const checkNode = (
        <Checkbox
          checked={!!state[key]}
          onChange={handleChange(key)}
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
