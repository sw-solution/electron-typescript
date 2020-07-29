import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactMapboxGl, { Layer, Feature, Marker } from 'react-mapbox-gl';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { setSequenceCurrentStep, selPoints } from './slice';

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const points = useSelector(selPoints);

  const resetMode = () => {
    dispatch(setSequenceCurrentStep('tags'));
  };

  const confirmMode = () => {
    dispatch(setSequenceCurrentStep('tags'));
  };

  const editOutliers = () => {
    dispatch(setSequenceCurrentStep('outlier'));
  };

  const editFrames = () => {
    dispatch(setSequenceCurrentStep('frames'));
  };

  const editDirection = () => {
    dispatch(setSequenceCurrentStep('azimuth'));
  };

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
    accessToken:
      'pk.eyJ1IjoidHJla3ZpZXciLCJhIjoiY2tjeWdubXdnMDluYzMwcGdpaXkyZ3JxdyJ9.Lt90NQ1VErfUm8wRyGizGA',
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify GPS
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box mb={3} display="flex" style={{ justifyContent: 'center' }}>
          <Button
            onClick={editOutliers}
            variant="contained"
            size="small"
            style={{ marginRight: '20px' }}
          >
            Edit Outliers
          </Button>

          <Button
            onClick={editFrames}
            variant="contained"
            size="small"
            style={{ marginRight: '20px' }}
          >
            Edit Frames
          </Button>

          <Button onClick={editDirection} variant="contained" size="small">
            Edit Direction
          </Button>
        </Box>

        <Map
          style="mapbox://styles/mapbox/streets-v8"
          containerStyle={{
            height: '400px',
          }}
          center={centerPoint()}
          fitBounds={fitBounds()}
        >
          {points.map((point, idx) => {
            return (
              <Marker
                key={`marker-${idx.toString()}`}
                coordinates={[point.GPSLongitude, point.GPSLatitude]}
                anchor="bottom"
              >
                <div
                  style={{
                    borderBottom: 'solid 10px #3f51b5',
                    borderLeft: 'solid 10px transparent',
                    borderRight: 'solid 10px transparent',
                    height: '20px',
                    width: '20px',
                  }}
                />
              </Marker>
            );
          })}
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
