import React from 'react';
import { IpcRendererEvent } from 'electron';
import LandscapeIcon from '@material-ui/icons/Landscape';
import PoolIcon from '@material-ui/icons/Pool';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';

import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

import ShowChartIcon from '@material-ui/icons/ShowChart';

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import RowingIcon from '@material-ui/icons/Rowing';

import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';

import { Box, Typography, Grid, IconButton } from '@material-ui/core';

import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

import { Map, TileLayer, Marker } from 'react-leaflet';

import { setRemoveSeq } from './slice';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  container: {
    borderRadius: '15px',
    padding: '10px',
    boxShadow: 'rgba(114, 126, 140, 0.5) 0px 0px 10px 0px',
    marginBottom: '20px',
    position: 'relative',
  },
  information: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  map: {
    height: '200px',
  },
  removeButton: {
    position: 'absolute',
    right: '20px',
    top: '20px',
  },
}));

export default function Sequence({ data }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const type = {
    Land: <LandscapeIcon color="primary" />,
    Water: <PoolIcon color="primary" />,
    Air: <FlightTakeoffIcon color="primary" />,
  };

  const method = {
    Walk: <DirectionsWalkIcon color="primary" />,
    Car: <DirectionsCarIcon color="primary" />,
    Bike: <DirectionsBikeIcon color="primary" />,
    Swim: <PoolIcon color="primary" />,
    Boat: <RowingIcon color="primary" />,
    Plane: <AirplanemodeActiveIcon color="primary" />,
  };

  const { points } = data;

  const centerPoint = () => {
    if (points.length) {
      const centerpoint = points[points.length / 2];
      return [centerpoint.GPSLatitude, centerpoint.GPSLongitude];
    }
    return [51.5, -0.09];
  };

  const removeSeq = (name: string) => {
    dispatch(setRemoveSeq(name));

    ipcRenderer.send('remove-seq', name);
  };

  return (
    <Grid xs={12} item className={classes.container}>
      <IconButton
        className={classes.removeButton}
        onClick={() => removeSeq(data.name)}
      >
        <DeleteOutlineIcon />
      </IconButton>
      <Grid container alignItems="center" spacing={3}>
        <Grid xs={4} item>
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
                />
              );
            })}
          </Map>
        </Grid>
        <Grid xs={5} item>
          <Typography variant="h5" color="primary" align="left">
            {data.name}
          </Typography>
          <Typography color="primary" align="left" paragraph>
            {data.description}
          </Typography>
          <Box className={classes.information}>
            <div>
              {type[data.type]}
              <Typography color="primary" variant="caption" display="block">
                {data.type}
              </Typography>
            </div>
            <div>
              {method[data.method]}
              <Typography color="primary" variant="caption" display="block">
                {data.method}
              </Typography>
            </div>
            <div>
              <ShowChartIcon color="primary" />
              <Typography color="primary" variant="caption" display="block">
                {data.total_km}
                <span>KM</span>
              </Typography>
            </div>
            <div>
              <PhotoLibraryIcon color="primary" />
              <Typography color="primary" variant="caption" display="block">
                {points.length}
              </Typography>
            </div>
          </Box>
        </Grid>
        <Grid xs={3} item>
          <div className={classes.information}>
            {data.tags.map((tag: string) => (
              <Chip key={tag} label={tag} color="primary" />
            ))}
          </div>
          <Typography color="primary" variant="caption" display="block">
            <span>Captured:</span>
            {data.captured}
          </Typography>

          <Typography color="primary" variant="caption" display="block">
            <span>Created:</span>
            {data.created}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
