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

import {
  selSequenceOutlierMeter,
  setSequenceCurrentStep,
  setSequenceSmooth,
  setSequenceDiscard,
  setSequenceOutlierMeters,
  selSequenceOutlierMode,
  selPoints,
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

export default function SequenceModifyOutlier() {
  const dispatch = useDispatch();
  const propmeters = useSelector(selSequenceOutlierMeter);
  const mode = useSelector(selSequenceOutlierMode);

  const [metersStr, setMeters] = React.useState<string>(propmeters.toString());

  const proppoints = useSelector(selPoints);
  const [points, setPoints] = React.useState<IGeoPoint[]>(proppoints);

  const classes = useStyles();

  const updatePoints = () => {
    const meters = parseFloat(metersStr);
    if (meters > 0 && mode !== '') {
      const newpoints: IGeoPoint[] = [];
      proppoints.forEach((point: IGeoPoint, idx: number) => {
        if (idx > 0 && idx < points.length - 1) {
          const prevpoint = points[idx - 1];
          const nextpoint = points[idx + 1];
          if (
            (prevpoint.Distance || 0) > meters &&
            (point.Distance || 0) > meters
          ) {
            if (mode === 'S') {
              newpoints.push(
                new IGeoPoint({
                  ...point,
                  GPSLongitude:
                    (prevpoint.GPSLongitude + nextpoint.GPSLongitude) / 2,
                  GPSLatitude:
                    (prevpoint.GPSLatitude + nextpoint.GPSLatitude) / 2,
                })
              );
            }
          } else {
            newpoints.push(point);
          }
        } else {
          newpoints.push(point);
        }
      });
      setPoints(newpoints);
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
    dispatch(setSequenceCurrentStep('modifySpace'));
  };

  const confirmMode = () => {
    const meters = parseFloat(metersStr);
    dispatch(setSequenceOutlierMeters(meters));
    dispatch(setSequenceCurrentStep('azimuth'));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMeters(event.target.value);
  };

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMeters(event.target.value);
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
            onBlur={handleBlur}
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
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
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
