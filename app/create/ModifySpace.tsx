import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, Slider } from '@material-ui/core';
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
  slider: {
    width: 180,
  },

  info: {
    color: 'grey',
    width: '100%',
  },
}));

interface State {
  frames: number;
  position: number;
  points: IGeoPoint[];
}

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const propframe = useSelector(selSequenceFrame);
  const propposition = useSelector(selSequencePosition);
  const proppoints = useSelector(selPoints);

  const [state, setState] = React.useState<State>({
    frames: propframe,
    position: propposition,
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

  const updatePoints = (positionmeter: number, frames: number) => {
    try {
      const temppoints = discardPointsBySeconds(
        proppoints.map((point: IGeoPoint) => new IGeoPoint({ ...point })),
        frames
      );

      if (positionmeter > 0) {
        const newpoints: IGeoPoint[] = [];

        let previousIdx = 0;
        for (let idx = 0; idx < temppoints.length; idx += 1) {
          const point: IGeoPoint = temppoints[idx];
          if (idx > 0 && idx < temppoints.length - 1) {
            if (point.Distance < positionmeter) {
              const prevpoint = newpoints[previousIdx];
              const nextpoint = temppoints[idx + 1];
              newpoints[previousIdx].setDistance(
                getDistance(prevpoint, nextpoint)
              );
              newpoints[previousIdx].setAzimuth(
                getBearing(prevpoint, nextpoint)
              );
              newpoints[previousIdx].setPitch(getPitch(prevpoint, nextpoint));
            } else {
              previousIdx = newpoints.length;
              newpoints.push(point);
            }
          } else {
            newpoints.push(point);
          }
        }
        discarded = points.length - newpoints.length;
        setState({
          ...state,
          position: positionmeter,
          frames,
          points: [...newpoints],
        });
      } else {
        discarded = points.length - temppoints.length;
        setState({
          ...state,
          position: positionmeter,
          frames,
          points: [...temppoints],
        });
      }
    } catch (e) {
      setState({
        ...state,
        position: positionmeter,
        frames,
      });
    }
  };

  const handleFrameSliderChange = (
    _event: React.ChangeEvent,
    newValue: number
  ) => {
    updatePoints(1, newValue);
  };

  const handlePositionChange = (
    _event: React.ChangeEvent,
    newValue: number
  ) => {
    updatePoints(newValue, 1);
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
            <Grid item xs={6}>
              <Typography>Seconds</Typography>
              <Slider
                value={state.frames}
                onChange={handleFrameSliderChange}
                step={1}
                min={1}
                max={20}
                valueLabelDisplay="on"
              />
              <Typography size="small" align="center" className={classes.info}>
                {`1 photos every ${state.frames} seconds. ${
                  discarded > 0 ? `${discarded} photos will be removed.` : ''
                }`}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Minimum distance</Typography>
              <Slider
                value={state.position}
                onChange={handlePositionChange}
                step={1}
                min={1}
                max={20}
                valueLabelDisplay="on"
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
