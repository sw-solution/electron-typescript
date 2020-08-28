import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

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
import LocalAirportIcon from '@material-ui/icons/LocalAirport';

import { setSequenceType, selSequenceType } from './slice';

export default function SequenceType() {
  const type = useSelector(selSequenceType);
  const dispatch = useDispatch();

  const storeSequenceType = (newType: string) => {
    dispatch(setSequenceType(newType));
  };

  const buttons = [
    {
      component: <LandscapeIcon fontSize="large" />,
      label: 'Land',
    },
    {
      component: <WavesIcon fontSize="large" />,
      label: 'Water',
    },
    {
      component: <CloudIcon fontSize="large" />,
      label: 'Air',
    },
    {
      component: <AcUnitIcon fontSize="large" />,
      label: 'Snow',
    },
    {
      component: <BatteryFullIcon fontSize="large" />,
      label: 'Powered',
    },
  ];

  const items: ReactNode[] = [];

  buttons.forEach((it) => {
    const color = it.label === type ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.label}>
        <IconButton
          size="medium"
          color={color}
          onClick={() => storeSequenceType(it.label)}
        >
          {it.component}
        </IconButton>
        <Typography color={color}>{it.label}</Typography>
      </Grid>
    );
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Where did you capture content?
        </Typography>
        <Typography paragraph>
          Transport types help people discover your sequence using search queries on Map the Paths Web.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={5} justify="center">
          {items}
        </Grid>
      </Grid>
      <Grid item xs={12} />
    </>
  );
}
