import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactMapboxGl, { Layer, Feature, Marker } from 'react-mapbox-gl';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, Slider } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { IGeoPoint } from '../../types/IGeoPoint';

import {
  setSequenceCurrentStep,
  selPoints,
  selSequenceFrame,
  setSequenceFrame,
} from './slice';

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const propframe = useSelector(selSequenceFrame);

  const [frames, setFrame] = React.useState<number>(propframe);

  const points = useSelector(selPoints);

  const resetMode = () => {
    dispatch(setSequenceCurrentStep('tags'));
  };

  const confirmMode = () => {
    dispatch(setSequenceFrame(frames));
    dispatch(setSequenceCurrentStep('outlier'));
  };

  const handleSliderChange = (_event: any, newValue: number) => {
    setFrame(newValue);
  };

  // const editOutliers = () => {
  //   dispatch(setSequenceCurrentStep('outlier'));
  // };

  // const editFrames = () => {
  //   dispatch(setSequenceCurrentStep('frames'));
  // };

  // const editDirection = () => {
  //   dispatch(setSequenceCurrentStep('azimuth'));
  // };

  const centerPoint = () => {
    if (points.length) {
      const centerIdx = Math.floor(points.length / 2);
      const centerpoint = points[centerIdx];
      return [centerpoint.GPSLongitude, centerpoint.GPSLatitude];
    }
    return [51.5, -0.09];
  };

  const fitBounds = () => {
    return points.map((point) => {
      return [point.GPSLongitude, point.GPSLatitude];
    });
  };

  const Map = ReactMapboxGl({
    accessToken: process.env.MAPBOX_TOKEN || '',
  });

  const markers = points.map((point: IGeoPoint, idx: number) => {
    return (
      <Marker
        key={`marker-${idx.toString()}`}
        coordinates={[point.GPSLongitude || 0, point.GPSLatitude || 0]}
        anchor="center"
      >
        <div
          style={{
            borderBottom: 'solid 10px #3f51b5',
            borderLeft: 'solid 10px transparent',
            borderRight: 'solid 10px transparent',
            boxSizing: 'border-box',
            display: 'inline-block',
            height: '20px',
            width: '20px',
            transform: `rotate(${point.Azimuth}deg)`,
          }}
        />
      </Marker>
    );
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify GPS
        </Typography>
        <Slider
          value={frames}
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
        />
      </Grid>
      <Grid item xs={12}>
        <Map
          style="mapbox://styles/mapbox/streets-v8"
          containerStyle={{
            height: '400px',
          }}
          center={centerPoint()}
          fitBounds={fitBounds()}
        >
          {markers}
        </Map>
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
