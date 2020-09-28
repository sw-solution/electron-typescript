import React, { useEffect } from 'react';
import { Button, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { shell } from 'electron';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';

import { makeStyles } from '@material-ui/core/styles';
import { push } from 'connected-react-router';
import Logo from './Logo';
import routes from '../constants/routes.json';

import {
  setTokenWaiting,
  selTokenWaiting,
  selToken,
  selIntegrations,
} from '../base/slice';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'absolute',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '30',
    left: '0',
    top: '0',
  },
  logoWrapper: {
    width: '100%',
    textAlign: 'center',
  },
  contentWrapper: {
    width: '70%',
    textAlign: 'center',
    '& > *': {
      marginBottom: 30,
    },
  },
  buttonWrapper: {
    width: '100%',
    textAlign: 'center',
  },
  title: {
    padding: 30,
  },
}));

const tokenKey = 'mtp';

export default function Login() {
  const gotoExternal = (url: string) => {
    shell.openExternal(url);
  };

  const dispatch = useDispatch();
  const tokenWaiting = useSelector(selTokenWaiting)(tokenKey);
  const token = useSelector(selToken)(tokenKey);
  const integrations = useSelector(selIntegrations);

  const classes = useStyles();

  const websiteUrl = process.env.MTP_WEB_URL || '';

  useEffect(() => {
    if (token) {
      dispatch(push(routes.LIST));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (!integrations[tokenKey]) {
      dispatch(push(routes.LIST));
    }
  }, [integrations, dispatch]);

  const login = () => {
    dispatch(setTokenWaiting({ waiting: true, key: tokenKey }));
    ipcRenderer.send('set_token', tokenKey, { token: null, waiting: true });
    gotoExternal(integrations[tokenKey].loginUrl);
  };

  return (
    <div className={classes.content}>
      <div className={classes.logoWrapper}>
        <Logo />
      </div>
      <div className={classes.contentWrapper}>
        <Typography variant="h6" align="center" color="textSecondary">
          Please login
        </Typography>
        <Typography paragraph>
          You need to sign in to Map the Paths Web to continue. Please login by
          clicking the sign in button below. You can get a free account.
          <Button onClick={() => gotoExternal(websiteUrl)} color="primary">
            here
          </Button>
        </Typography>
      </div>

      <div className={classes.buttonWrapper}>
        <Button
          onClick={login}
          endIcon={<ChevronRightRoundedIcon />}
          size="large"
          color="primary"
          variant="contained"
        >
          {tokenWaiting ? 'Signing in' : 'Login'}
        </Button>
      </div>
    </div>
  );
}
