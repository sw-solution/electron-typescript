import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import LandscapeIcon from '@material-ui/icons/Landscape';
import PoolIcon from '@material-ui/icons/Pool';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import WavesIcon from '@material-ui/icons/Waves';
import RowingIcon from '@material-ui/icons/Rowing';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import AcUnitIcon from '@material-ui/icons/AcUnit';
import CloudIcon from '@material-ui/icons/Cloud';
import BatteryFullIcon from '@material-ui/icons/BatteryFull';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import EvStationIcon from '@material-ui/icons/EvStation';
import LocalAirportActiveIcon from '@material-ui/icons/LocalAirportActive';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import CloudIcon from '@material-ui/icons/Cloud';

import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

import ShowChartIcon from '@material-ui/icons/ShowChart';

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import { Box, Typography, Grid, IconButton } from '@material-ui/core';

import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

import Map from '../components/Map';

import { setRemoveSeq } from './slice';
import { Summary } from '../types/Result';

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
    right: 0,
    top: 0,
  },
}));

interface Props {
  data: Summary;
}

export default function Sequence({ data }: Props) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const types = {
    Land: <LandscapeIcon color="primary" />,
    Water: <PoolIcon color="primary" />,
    Air: <FlightTakeoffIcon color="primary" />,
    Snow: <AcUnitIcon color="primary" />,
    Powered: <BatteryFullIcon color="primary" />,
  };

  const method = {
    Car: <LocalGasStationIcon color="primary" />,
    Electric Car: <EvStationIcon color="primary" />,
    Electric Bicycle: <DirectionsBikeIcon color="primary" />,
    Plane: <LocalAirportActiveIcon color="primary" />,
    Helicopter: <BatteryFullIcon color="primary" />,
    Drone: <BatteryFullIcon color="primary" />,
    Electric Scooter: <BatteryFullIcon color="primary" />,
    Boat: <BatteryFullIcon color="primary" />,
    Bicycle: <DirectionsBikeIcon color="primary" />,
    Walk: <DirectionsWalkIcon color="primary" />,
    Scooter: <LandscapeIcon color="primary" />,
    Skateboard: <LandscapeIcon color="primary" />,
    Rollerskate: <LandscapeIcon color="primary" />,
    Ski: <AcUnitIcon color="primary" />,
    Snowboard: <AcUnitIcon color="primary" />,
    Snowmobile: <AcUnitIcon color="primary" />,
    Snowshoe: <AcUnitIcon color="primary" />,
    Swim: <PoolIcon color="primary" />,
    Paddleboard: <RowingIcon color="primary" />,
    Scuba Dive: <WavesIcon color="primary" />,
    Surf: <WavesIcon color="primary" />,
    Windsurf: <WavesIcon color="primary" />,
    Kiteboard: <WavesIcon color="primary" />,
    Canoe: <RowingIcon color="primary" />,
    Freedive: <WavesIcon color="primary" />,
    Parachute: <CloudIcon color="primary" />,
    Paraglide: <CloudIcon color="primary" />,
    Hanglide: <CloudIcon color="primary" />,
    Wingsuit: <CloudIcon color="primary" />,
    BASE Jump: <CloudIcon color="primary" />,
    Glider: <CloudIcon color="primary" />,
  };

  const { points } = data;

  const removeSeq = (name: string) => {
    dispatch(setRemoveSeq(name));

    ipcRenderer.send('remove_sequence', name);
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
          <Map points={points} height={200} showPopup={false} />
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
              {types[data.type]}
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
                {data.total_km.toFixed(2)}
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
