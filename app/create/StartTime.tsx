import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {
  selStartTime,
  selGPXStartTime,
  setCurrentStep,
  setSequenceModifyTime,
  selPoints,
  selGPXPoints,
  setSequencePoints,
} from './slice';
import { importGpx } from '../scripts/utils';

export default function SequenceStartTime() {
  const dispatch = useDispatch();
  const startTime = useSelector(selStartTime);
  const gpxStartTime = useSelector(selGPXStartTime);
  const points = useSelector(selPoints);
  const gpxPoints = useSelector(selGPXPoints);

  const modifyTime = () => {
    dispatch(setCurrentStep('modifyTime'));
  };

  const correctTime = () => {
    const newpoints = importGpx(points, gpxPoints);
    dispatch(setSequencePoints(newpoints));
    dispatch(setSequenceModifyTime(0));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          The start time of your GPS Track is:
          {gpxStartTime}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color="primary">
          The time in the first photo in the sequence is:
          {startTime}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box mr={1} display="inline-block">
          <Button
            endIcon={<ChevronRightIcon />}
            color="secondary"
            onClick={modifyTime}
            variant="contained"
          >
            Modify Photo Times
          </Button>
        </Box>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={correctTime}
          variant="contained"
        >
          Corret
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography color="primary">
          This process will overwrite any existing geotags
        </Typography>
      </Grid>
    </>
  );
}
