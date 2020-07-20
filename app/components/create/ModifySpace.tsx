import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles } from '@material-ui/core/styles';

import { setSequenceCurrentStep, selPoints } from './slice';

const useStyles = makeStyles({
  map: {
    height: '300px',
    overflow: 'hidden',
  },
});

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const points = useSelector(selPoints);
  const classes = useStyles();

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

  const centerPoint = () => {
    if (points.length) {
      const centerIdx = Math.floor(points.length / 2);
      const centerpoint = points[centerIdx];
      return [centerpoint.GPSLatitude, centerpoint.GPSLongitude];
    }
    return [51.5, -0.09];
  };

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

          <Button onClick={editFrames} variant="contained" size="small">
            Edit Direction
          </Button>
        </Box>

        <Map zoom={18} center={centerPoint()} className={classes.map}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, idx) => {
            return (
              <Marker
                key={`marker-${idx.toString()}`}
                position={[point.GPSLatitude, point.GPSLongitude]}
              >
                <Popup>
                  <div
                    style={{
                      backgroundImage: `url(../${point.Image})`,
                      width: '200px',
                      height: '150px',
                      backgroundSize: '100% auto',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                  />
                </Popup>
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
