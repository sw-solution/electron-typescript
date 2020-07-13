import React from 'react';
import { useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';

import { selProgress } from './slice';

export default function SequenceProcessPage() {
  const progress = useSelector(selProgress);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Processing
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography align="center" color="textSecondary">
          {progress}% [processed]
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Keep the app open during processing.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary">
          Output can be viewed in [DIR] once complete
        </Typography>
      </Grid>
    </>
  );
}
