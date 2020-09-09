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

export default function About() {
  const classes = useStyles();

  return (
    <div className={classes.content}>
      <div className={classes.logoWrapper}>
        <Logo />
      </div>
      <Typography variant="h6" align="center" color="textSecondary">
       About
      </Typography>
      <Typography paragraph>
          Map the Paths Desktop Uploader is maintained by the team at Trek View.

          The code is available on Github under an MIT license.

          This software uses the following open-source tools:

          ffmpeg
          exiftool
          imagemagick

          To find out more, go to Map the Paths.
        </Typography>
    </div>

  );
}
