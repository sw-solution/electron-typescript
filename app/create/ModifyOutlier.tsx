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
  setOutlierMode,
  setSequenceOutlierMeters,
  selSequenceOutlierMode,
  selPoints,
  setSequencePoints,
  resetPoints,
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
  mode: string;
}

export default function SequenceModifyOutlier() {
  const dispatch = useDispatch();
  const propmeters = useSelector(selSequenceOutlierMeter);
  const propmode = useSelector(selSequenceOutlierMode);

  const proppoints = useSelector(selPoints);
  const [state, setState] = React.useState<State>({
    points: proppoints,
    metersStr: propmeters.toString(),
    mode: propmode,
  });

  const { points, metersStr, mode } = state;

  const classes = useStyles();

  const updatePoints = (meterstr: string, m: string) => {
    try {
      const meters = parseFloat(meterstr);
      if (meters > 0 && m !== '') {
        const newpoints: IGeoPoint[] = [];

        const temppoints = proppoints.map(
          (point: IGeoPoint) => new IGeoPoint({ ...point })
        );

        let previousIdx = 0;
        for (let idx = 0; idx < temppoints.length; idx += 1) {
          const point: IGeoPoint = temppoints[idx];
          if (idx > 0 && idx < temppoints.length - 1) {
            const prevpoint = newpoints[previousIdx];
            const nextpoint = temppoints[idx + 1];
            const distance = getDistance(prevpoint, point);
            if (distance > meters && (point.Distance || 0) > meters) {
              if (m === 'S') {
                const newpoint = new IGeoPoint({
                  ...point,
                  MAPLongitude:
                    (prevpoint.MAPLongitude + nextpoint.MAPLongitude) / 2,
                  MAPLatitude:
                    (prevpoint.MAPLatitude + nextpoint.MAPLatitude) / 2,
                  MAPAltitude:
                    (prevpoint.MAPAltitude + nextpoint.MAPAltitude) / 2,
                });

                newpoints[previousIdx].setDistance(
                  getDistance(prevpoint, newpoint)
                );
                newpoints[previousIdx].setAzimuth(
                  getBearing(prevpoint, newpoint)
                );
                newpoints[previousIdx].setPitch(getPitch(prevpoint, newpoint));

                newpoint.setDistance(getDistance(nextpoint, newpoint));
                newpoint.setAzimuth(getBearing(newpoint, nextpoint));
                newpoint.setPitch(getPitch(newpoint, nextpoint));
                previousIdx = newpoints.length;
                newpoints.push(newpoint);
              } else {
                newpoints[previousIdx].setDistance(
                  getDistance(prevpoint, nextpoint)
                );
                newpoints[previousIdx].setAzimuth(
                  getBearing(prevpoint, nextpoint)
                );
                newpoints[previousIdx].setPitch(getPitch(prevpoint, nextpoint));
              }
            } else {
              previousIdx = newpoints.length;
              newpoints.push(point);
            }
          } else {
            newpoints.push(point);
          }
        }
        setState({
          ...state,
          metersStr: meterstr,
          points: [...newpoints],
          mode: m,
        });
      } else {
        setState({
          ...state,
          metersStr: meterstr,
          mode: m,
        });
      }
    } catch (e) {
      console.log('Wrong Value');
    }
  };

  const smoothMode = () => {
    if (mode !== 'S') updatePoints(metersStr, 'S');
  };

  const removeMode = () => {
    if (mode !== 'D') updatePoints(metersStr, 'D');
  };

  const resetMode = () => {
    setState({
      ...state,
      metersStr: '0',
      mode: '',
      points: proppoints,
    });
  };

  const confirmMode = () => {
    const meters = parseFloat(metersStr);
    dispatch(setSequenceOutlierMeters(meters));
    dispatch(setCurrentStep('azimuth'));
    dispatch(setSequencePoints(points));
    dispatch(setOutlierMode(mode));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePoints(event.target.value, mode);
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Fix Photo Outliers
        </Typography>
        <Typography paragraph>
          You can remove OR normalise images that have incorrect geo-tags (not
          both). This is useful if you have corrupted GPS, but no backup GPS
          track. Discard simply removes any photos futher than the value entered
          from the expected path. Normalise estimates the correct position and
          assigns that position to the image.
        </Typography>
        <Box mb={1} className={classes.wrapper}>
          <TextField
            label="Meters"
            placeholder="0"
            onChange={handleChange}
            value={metersStr}
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
          {`${
            metersStr === '0' && mode === ''
              ? 'Skip This Step'
              : 'Confirm Changes'
          }`}
        </Button>
      </Grid>
    </>
  );
}
