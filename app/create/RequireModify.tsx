import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Grid, Button, Box, Typography } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

import Map from '../components/Map';

import { setCurrentStep, selPoints } from './slice';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      margin: theme.spacing(2),
    },
  },
  buttonWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function RequireModify() {
  const dispatch = useDispatch();

  const points = useSelector(selPoints);

  const classes = useStyles();

  const confirmMode = () => {
    dispatch(setCurrentStep('destination'));
  };

  const requireModify = () => {
    dispatch(setCurrentStep('modifySpace'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Your temporary sequence
        </Typography>
        <Typography paragraph>
          Here's what your sequence looks like. You can make changes to the GPS positioning or add a nadir by clicking Advance settings. Alternatively you can skip all these steps if you're ready to upload.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Map points={points} />
      </Grid>
      <Grid item xs={12}>
        <Box className={classes.buttonWrapper}>
          <Button
            endIcon={<ChevronRightIcon />}
            color="secondary"
            onClick={requireModify}
            variant="contained"
          >
            Advanced settings
          </Button>
          <Button
            endIcon={<ThumbUpIcon />}
            color="primary"
            onClick={confirmMode}
            variant="contained"
          >
            Skip advanced settings
          </Button>
        </Box>
      </Grid>
    </>
  );
}
