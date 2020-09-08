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
  setMTPTokenWaiting,
  selMTPTokenWaiting,
  selMTPToken,
} from '../base/slice';

const useStyles = makeStyles((theme) => ({
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'absolute',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
    left: '-8px',
    top: '-8px',
  },
  logoWrapper: {
    width: '100%',
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    textAlign: 'center',
  },
}));

export default function Login() {
  const gotoExternal = (url: string) => {
    shell.openExternal(url);
  };

  const dispath = useDispatch();
  const tokenWaiting = useSelector(selMTPTokenWaiting);

  const classes = useStyles();

  const loginUrl = `${process.env.MTP_WEB_AUTH_URL}?client_id=${process.env.MTP_WEB_APP_ID}&response_type=token`;
  const websiteUrl = process.env.MTP_WEB_URL || '';

  const mtpToken = useSelector(selMTPToken);

  useEffect(() => {
    if (mtpToken && mtpToken !== '') {
      dispath(push(routes.LIST));
    }
  }, [dispath, mtpToken]);

  const login = () => {
    dispath(setMTPTokenWaiting(true));
    gotoExternal(loginUrl);
  };

  return (
    <div className={classes.content}>
      <div className={classes.logoWrapper}>
        <Logo />
      </div>
      <Typography variant="h6">
        <span>You are not logged in</span>
        <Button onClick={() => gotoExternal(websiteUrl)} color="primary">
          MTP Trekview.
        </Button>
        <span>Please login with above.</span>
      </Typography>
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
