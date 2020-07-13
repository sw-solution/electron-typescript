import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
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

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify GPS
        </Typography>
        <Typography align="center" color="textSecondary">
          Edit the spacing of images
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Map zoom={13} center={[51.5, -0.09]} className={classes.map}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, idx) => {
            return (
              <Marker
                key={`marker-${idx.toString()}`}
                position={point.position}
              >
                <Popup>
                  A pretty CSS3 popup.
                  <br />
                  Easily customizable.
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
