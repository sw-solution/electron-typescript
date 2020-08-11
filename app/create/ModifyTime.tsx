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
  selModifyTime,
  setSequenceModifyTime,
  selGPXPoints,
} from './slice';

import { IGeoPoint } from '../types/IGeoPoint';

interface State {
  points: IGeoPoint[];
  modifyTime: string;
}

export default function SequenceStartTime() {
  const dispatch = useDispatch();
  const startTime = useSelector(selStartTime);
  const propModifyTime = useSelector(selModifyTime);
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
    dispatch(setSequenceModifyTime(parseFloat(modifyTime)));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          The start time of your GPS Track is:
          {startTime}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color="primary">
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
