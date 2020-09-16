import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import dayjs from 'dayjs';
import {
  selStartTime,
  setSequenceModifyTime,
  selModifyTime,
  selGPXStartTime,
  setCurrentStep,
} from './slice';

interface State {
  modifyTime: string;
}

export default function SequenceStartTime() {
  const dispatch = useDispatch();
  const startTime = useSelector(selStartTime);

  const propModifyTime = useSelector(selModifyTime);
  const gpxStartTime = useSelector(selGPXStartTime);

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
    dispatch(setSequenceModifyTime(time));
    dispatch(setCurrentStep('startTime'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Set Photo Time Offset
        </Typography>
        <Typography paragraph>
          Occasionally photo capture times (original date time) are reported
          incorrectly (usually when clocks change and camera time is not
          updated). You can set an offset in seconds to change the photo times
          to match correct times in GPX track by setting an offset value below.
        </Typography>
        <Typography paragraph>
          The start time of your GPX Track is:
          {gpxStartTime}
        </Typography>
        <Typography paragraph>
          The time in the first photo in the sequence is:
          {startTime}
        </Typography>
        <Typography paragraph>
          Add the following time offset to all photos (in seconds, can be + or
          -). For example 3600 = add one hour to all reported photo times.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Offset (seconds)"
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
          Add offset
        </Button>
      </Grid>
    </>
  );
}
