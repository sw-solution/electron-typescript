import React from 'react';
import { Button, Typography } from '@material-ui/core';
import { shell } from 'electron';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';

import { makeStyles } from '@material-ui/core/styles';
import Logo from './Logo';

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
  const gotoExternal = (url: string) => () => {
    shell.openExternal(url);
  };

  const classes = useStyles();

  return (
    <div className={classes.content}>
      <div className={classes.logoWrapper}>
        <Logo />
      </div>
      <Typography variant="h6">
        <span>You are not logged in</span>
        <Button
          onClick={gotoExternal(process.env.MTP_WEB_AUTH_URL || '')}
          color="primary"
        >
          MTP Trekview.
        </Button>
        <span>Please login with above.</span>
      </Typography>
      <div className={classes.buttonWrapper}>
        <Button
          onClick={gotoExternal(process.env.MTP_WEB_URL || '')}
          endIcon={<ChevronRightRoundedIcon />}
          size="large"
          color="primary"
          variant="contained"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
