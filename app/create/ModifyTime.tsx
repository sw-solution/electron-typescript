import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {
  selStartTime,
  setSequenceModifyTime,
  selPoints,
  selGPXPoints,
  setSequencePoints,
  selModifyTime,
} from './slice';
import { importGpx } from '../scripts/utils';

interface State {
  modifyTime: string;
}

export default function SequenceStartTime() {
  const dispatch = useDispatch();
  const startTime = useSelector(selStartTime);
  const propModifyTime = useSelector(selModifyTime);

  const points = useSelector(selPoints);
  const gpxPoints = useSelector(selGPXPoints);
  const [state, setState] = React.useState<State>({
    modifyTime: propModifyTime.toString(),
  });

  const { modifyTime } = state;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      modifyTime: event.target.value,
    });
  };

  const correctTime = () => {
    const time = parseFloat(modifyTime);
    const newpoints = importGpx(points, gpxPoints, time);
    dispatch(setSequencePoints(newpoints));
    dispatch(setSequenceModifyTime(time));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Set Photo Time Offset
        </Typography>
        <Typography paragraph>
          Occasionally photo capture times (original date time) are reported incorrectly (usually when clocks change and camera time is not updated). You can set an offset in seconds to change the photo times to match correct times in GPX track by setting an offset value below.
        </Typography>
        <Typography paragraph>
          The start time of your GPS Track is: 
          {gpxStartTime}
        </Typography>
        <Typography paragraph>
          The time in the first photo in the sequence is: 
          {startTime}
        </Typography>
        <Typography paragraph>
          Add the following time offset to all photos (in second, can be + or
          -):
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Sequence Name"
          variant="outlined"
          value={modifyTime}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={correctTime}
          variant="contained"
        >
          Corret
        </Button>
      </Grid>
    </>
  );
}
