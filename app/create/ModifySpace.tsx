import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, Slider, TextField, Input } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import Map from '../components/Map';

import {
  setCurrentStep,
  setSequencePosition,
  setSequenceFrame,
  setSequencePoints,
  setSequenceGpxImport,
  selPoints,
  selSequenceFrame,
  selSequencePosition,
  resetPoints,
} from './slice';

import {
  getDistance,
  getBearing,
  getPitch,
  discardPointsBySeconds,
} from '../scripts/utils';
import { IGeoPoint } from '../types/IGeoPoint';

const useStyles = makeStyles((theme) => ({
  sliderHeader: {
    width: 80,
    color: 'rgba(0, 0, 0, 0.54)',
  },
  slider: {
    width: 180,
  },
  sliderInput: {
    width: 42,
  },
  sliderWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  info: {
    color: 'grey',
    width: '100%',
  },
}));

interface State {
  frames: number;
  position: string;
  points: IGeoPoint[];
}

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const propframe = useSelector(selSequenceFrame);
  const propposition = useSelector(selSequencePosition);
  const proppoints = useSelector(selPoints);

  const [state, setState] = React.useState<State>({
    frames: propframe,
    position: propposition.toString(),
    points: proppoints,
  });

  const { points } = state;

  const classes = useStyles();

  let discarded = 0;

  const resetMode = () => {
    dispatch(resetPoints());
    dispatch(setSequenceFrame(0));
    dispatch(setSequencePosition(0));
  };

  const confirmMode = () => {
    dispatch(setSequencePoints(points));
    dispatch(setSequenceFrame(state.frames));
    dispatch(setCurrentStep('outlier'));
  };

  const updatePoints = (positionstr: string, frames: number) => {
    try {
      const seconds = Math.ceil(1 / frames);
      const positionmeter = parseFloat(positionstr);

      const temppoints = discardPointsBySeconds(
        proppoints.map((point: IGeoPoint) => new IGeoPoint({ ...point })),
        seconds
      );

      console.log(temppoints.length);

      if (positionmeter > 0) {
        const newpoints: IGeoPoint[] = [];

        let previousIdx = 0;
        temppoints.forEach((point: IGeoPoint, idx: number) => {
          if (idx > 0 && idx < temppoints.length - 1) {
            if (point.Distance < positionmeter) {
              const prevpoint = newpoints[previousIdx];
              const nextpoint = temppoints[idx + 1];
              prevpoint.setDistance(getDistance(prevpoint, nextpoint));
              prevpoint.setAzimuth(getBearing(prevpoint, nextpoint));
              prevpoint.setPitch(getPitch(prevpoint, nextpoint));
            } else {
              previousIdx = newpoints.length;
              newpoints.push(point);
            }
          } else {
            newpoints.push(point);
          }
        });
        discarded = points.length - newpoints.length;
        console.log(points.length, newpoints.length, positionmeter);
        setState({
          ...state,
          position: positionstr,
          frames,
          points: [...newpoints],
        });
      } else {
        discarded = points.length - temppoints.length;
        setState({
          ...state,
          position: positionstr,
          frames,
          points: [...temppoints],
        });
      }
    } catch (e) {
      setState({
        ...state,
        position: positionstr,
        frames,
      });
    }
  };

  const handleFrameSliderChange = (
    _event: React.ChangeEvent,
    newValue: number
  ) => {
    updatePoints(state.position, newValue);
  };

  const handleFrameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePoints(state.position, parseFloat(event.target.value));
  };

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePoints(event.target.value, state.frames);
  };

  const uploadGpx = () => {
    dispatch(setSequenceGpxImport());
    dispatch(setCurrentStep('gpx'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify GPS
        </Typography>
        <Box mb={1}>
          <Grid container spacing={3}>
            <Grid item xs={8} className={classes.sliderWrapper}>
              <Typography align="right" className={classes.sliderHeader}>
                Frames
              </Typography>
              <Slider
                value={state.frames}
                onChange={handleFrameSliderChange}
                aria-labelledby="input-slider"
                step={0.05}
                min={0.05}
                max={1}
                className={classes.slider}
              />
              <Input
                style={{ width: 50 }}
                value={state.frames}
                margin="dense"
                onChange={handleFrameChange}
                inputProps={{
                  step: 0.05,
                  min: 0.05,
                  max: 1,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
              <Typography size="small" align="center" className={classes.info}>
                {`1 photos every ${Math.ceil(1 / state.frames)} seconds. ${
                  discarded > 0 ? `${discarded} photos will be removed.` : ''
                }`}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Minimum distance between images (in meters)"
                variant="outlined"
                value={state.position}
                onChange={handlePositionChange}
              />
            </Grid>
          </Grid>
        </Box>
        <Box mb={2}>
          <Button onClick={uploadGpx}>
            <AddIcon />
            <span>Import GPX Data</span>
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Map points={points} />
      </Grid>
      <Grid item xs={12}>
        <Box mr={1} display="inline-block">
          <Button
            endIcon={<ChevronRightIcon />}
            color="secondary"
            onClick={resetMode}
            variant="contained"
          >
            Reset Mods
          </Button>
        </Box>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          Confirm Mods
        </Button>
      </Grid>
    </>
  );
}
