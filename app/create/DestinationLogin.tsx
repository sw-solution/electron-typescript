import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { shell } from 'electron';

import { Typography, Grid, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {
  selSequence,
  setProcessStep,
  selDestination,
  setCurrentStep,
} from './slice';
import { setTokenWaiting, selIntegrations, selTokens } from '../base/slice';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  loginButtonWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      margin: theme.spacing(2),
    },
  },
}));

export default function DestinationLogin() {
  const dispatch = useDispatch();
  const destination = useSelector(selDestination);
  const integrations = useSelector(selIntegrations);
  const sequence = useSelector(selSequence);
  const tokens = useSelector(selTokens);
  const classes = useStyles();

  const gotoExternal = (url: string) => {
    shell.openExternal(url);
  };

  const login = (integration: string) => {
    dispatch(setTokenWaiting({ waiting: true, key: integration }));
    ipcRenderer.send('set_token', integration, { token: null, waiting: true });
    gotoExternal(integrations[integration].loginUrl);
  };

  const enabled =
    Object.keys(destination)
      .filter((key: string) => destination[key])
      .filter(
        (integration: string) =>
          !(tokens[integration] && tokens[integration].token)
      ).length === 0;

  const confirm = () => {
    if (enabled) {
      if (destination.google) {
        dispatch(setCurrentStep('google_place'));
      } else {
        dispatch(setProcessStep('name'));
        ipcRenderer.send('update_images', sequence);
      }
    }
  };

  const items = Object.keys(destination)
    .filter((integration: string) => destination[integration])
    .filter(
      (integration: string) => destination[integration] && integration !== 'mtp'
    )
    .map((integration: string) => {
      const integrationLogo = (
        <img
          src={`data:image/png;base64, ${integrations[integration].logo}`}
          alt={integrations[integration].name}
          width="35"
          height="35"
        />
      );

      let color = 'primary';
      let buttonTitle =
        tokens[integration] && tokens[integration].waiting
          ? 'Logining to'
          : 'Login to';

      if (tokens[integration] && tokens[integration].token) {
        buttonTitle = 'Logged In';
        color = 'default';
      }

      return (
        <Button
          onClick={() => login(integration)}
          endIcon={integrationLogo}
          size="large"
          color={color}
          variant="contained"
          key={integration}
        >
          {buttonTitle}
        </Button>
      );
    });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6">Authentications</Typography>
      </Grid>

      <Grid item xs={12}>
        <div className={classes.loginButtonWrapper}>{items}</div>
      </Grid>
      <Grid item xs={12}>
        <Button
          onClick={confirm}
          endIcon={<ChevronRightIcon />}
          color="primary"
          variant="contained"
          disabled={!enabled}
        >
          Confirm
        </Button>
      </Grid>
    </>
  );
}
