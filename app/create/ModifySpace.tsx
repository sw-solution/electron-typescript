import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, Slider, TextField, Input } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import Map from '../components/Map';

import {
  setSequenceCurrentStep,
  setSequencePosition,
  setSequenceFrame,
  setSequencePoints,
  setSequenceGpxImport,
  selPoints,
  selSequenceFrame,
  selSequencePosition,
  selGPXRequired,
  selGPXPoints,
  setSequenceError,
} from './slice';
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
}));

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const propframe = useSelector(selSequenceFrame);
  const propposition = useSelector(selSequencePosition);
  const gpxRequired = useSelector(selGPXRequired);

  const [frames, setFrame] = React.useState<number>(propframe);
  const [position, setPosition] = React.useState<number>(propposition);

  const points = useSelector(selPoints);

  const gpxPoints = useSelector(selGPXPoints);

  const classes = useStyles();

  const resetMode = () => {
    dispatch(setSequenceFrame(0));
    dispatch(setSequencePosition(0));
  };

  const confirmMode = () => {
    dispatch(setSequenceFrame(frames));
    dispatch(setSequenceCurrentStep('outlier'));
  };

  const handleFrameSliderChange = (
    _event: React.ChangeEvent,
    newValue: number
  ) => {
    setFrame(newValue);
  };

  const handleFrameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrame(parseInt(event.target.value, 10));
  };

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(parseFloat(event.target.value));
  };

  const importGpxData = () => {
    let importedPoints = 0;
    const newPoints = points.map((point: IGeoPoint) => {
      const pointTime = dayjs(point.GPSDateTime);
      const matchedPoint = gpxPoints.filter(
        (p) => pointTime.diff(dayjs(p.timestamp), 'second') === 0
      );
      if (matchedPoint.length) {
        importedPoints += 1;
        return new IGeoPoint({
          ...point,
          GPSLongitude: matchedPoint[0].longitude,
          GPSLatitude: matchedPoint[0].latitude,
          GPSAltitude: matchedPoint[0].elevation
            ? matchedPoint[0].elevation
            : point.GPSAltitude,
        });
      }
      return point;
    });
    if (importedPoints !== points.length) {
      dispatch(
        setSequenceError(
          `${
            points.length - importedPoints
          } points are not updated. These points may be ignored.`
        )
      );
    }
    dispatch(setSequencePoints(newPoints));
    dispatch(setSequenceGpxImport());
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify GPS
        </Typography>
        <Box mb={1}>
          <Grid container spacing={3}>
            <Grid item xs={9} className={classes.sliderWrapper}>
              <Typography align="right" className={classes.sliderHeader}>
                Frames
              </Typography>
              <Slider
                value={frames}
                onChange={handleFrameSliderChange}
                aria-labelledby="input-slider"
                step={1}
                min={1}
                max={20}
                className={classes.slider}
              />
              <Input
                style={{ width: 42 }}
                value={frames}
                margin="dense"
                onChange={handleFrameChange}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 20,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="outlined-basic"
                label="Position"
                variant="outlined"
                value={position}
                onBlur={handlePositionChange}
              />
            </Grid>
          </Grid>
        </Box>
        {gpxRequired && (
          <Box mb={2}>
            <Button onClick={importGpxData}>
              <AddIcon />
              <span>Import GPX Data</span>
            </Button>
          </Box>
        )}
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
