import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Grid,
  Button,
  Box,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Map from '../components/Map';

import { IGeoPoint } from '../types/IGeoPoint';
import { getDistance, getBearing, getPitch } from '../scripts/utils';

import {
  selSequenceOutlierMeter,
  setCurrentStep,
  setSequenceSmooth,
  setSequenceDiscard,
  setSequenceOutlierMeters,
  selSequenceOutlierMode,
  selPoints,
  setSequencePoints,
} from './slice';

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
}));

interface State {
  points: IGeoPoint[];
  metersStr: string;
}

export default function SequenceModifyOutlier() {
  const dispatch = useDispatch();
  const propmeters = useSelector(selSequenceOutlierMeter);
  const mode = useSelector(selSequenceOutlierMode);

  const proppoints = useSelector(selPoints);
  const [state, setState] = React.useState<State>({
    points: proppoints,
    metersStr: propmeters.toString(),
  });

  const { points, metersStr } = state;

  const classes = useStyles();

  const updatePoints = () => {
    try {
      const meters = parseFloat(metersStr);
      if (meters > 0 && mode !== '') {
        const newpoints: IGeoPoint[] = [];

        const temppoints = proppoints.map(
          (point: IGeoPoint) => new IGeoPoint({ ...point })
        );

        let previousIdx = 0;
        temppoints.forEach((point: IGeoPoint, idx: number) => {
          if (idx > 0 && idx < temppoints.length - 1) {
            const prevpoint = newpoints[previousIdx];
            const nextpoint = temppoints[idx + 1];
            if (
              (prevpoint.Distance || 0) > meters &&
              (point.Distance || 0) > meters
            ) {
              if (mode === 'S') {
                const newpoint = new IGeoPoint({
                  ...point,
                  GPSLongitude:
                    (prevpoint.GPSLongitude + nextpoint.GPSLongitude) / 2,
                  GPSLatitude:
                    (prevpoint.GPSLatitude + nextpoint.GPSLatitude) / 2,
                });
                prevpoint.setDistance(getDistance(prevpoint, newpoint));
                prevpoint.setAzimuth(getBearing(prevpoint, newpoint));
                prevpoint.setPitch(getPitch(prevpoint, newpoint));

                newpoint.setDistance(getDistance(nextpoint, newpoint));
                newpoint.setAzimuth(getBearing(newpoint, nextpoint));
                newpoint.setPitch(getPitch(newpoint, nextpoint));
                newpoints.push(newpoint);
              } else {
                prevpoint.setDistance(getDistance(prevpoint, nextpoint));
                prevpoint.setAzimuth(getBearing(prevpoint, nextpoint));
                prevpoint.setPitch(getPitch(prevpoint, nextpoint));
              }
            } else {
              previousIdx = newpoints.length;
              newpoints.push(point);
            }
          } else {
            newpoints.push(point);
          }
        });
        setState({
          ...state,
          points: [...newpoints],
        });
      }
    } catch (e) {
      console.log('Wrong Value');
    }
  };

  const smoothMode = () => {
    dispatch(setSequenceSmooth());
    updatePoints();
  };

  const removeMode = () => {
    dispatch(setSequenceDiscard());
    updatePoints();
  };

  const resetMode = () => {
    dispatch(setSequenceOutlierMeters(0));
    dispatch(setCurrentStep('modifySpace'));
  };

  const confirmMode = () => {
    const meters = parseFloat(metersStr);
    dispatch(setSequenceOutlierMeters(meters));
    dispatch(setCurrentStep('azimuth'));
    dispatch(setSequencePoints(points));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      metersStr: event.target.value,
    });
    updatePoints();
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Edit Photo Outliers
        </Typography>
        <Box mb={1} className={classes.wrapper}>
          <TextField
            label="Meters"
            placeholder="0"
            onChange={handleChange}
            value={metersStr.toString()}
          />

          <Tooltip
            title={`Smooth outliers greater than ${metersStr} metersStr`}
          >
            <Button
              onClick={smoothMode}
              color={mode === 'S' ? 'secondary' : 'primary'}
              variant="contained"
            >
              Smooth
            </Button>
          </Tooltip>
          <Tooltip
            title={`Remove outliers greater than ${metersStr} metersStr`}
          >
            <Button
              onClick={removeMode}
              color={mode === 'D' ? 'secondary' : 'primary'}
              variant="contained"
            >
              Remove
            </Button>
          </Tooltip>
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
