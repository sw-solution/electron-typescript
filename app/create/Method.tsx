import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';

import PoolIcon from '@material-ui/icons/Pool';
import RowingIcon from '@material-ui/icons/Rowing';

import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';

import { setSequenceMethod, selSequenceMethod, selSequenceType } from './slice';

interface MethodModel {
  component: ReactNode;
  label: string;
}

type MethodsModel = {
  [key in TypeModel]: MethodModel[];
};

export default function SequenceMethod() {
  const method = useSelector(selSequenceMethod);
  const type: TypeModel = useSelector(selSequenceType);
  const dispatch = useDispatch();

  const storeSequenceMethod = (newMethod: string) => {
    dispatch(setSequenceMethod(newMethod));
  };

  const methods: MethodsModel = {
    Powered: [
      {
        component: <LocalGasStationIcon fontSize="large" />,
        label: 'Car',
      },
      {
        component: <EvStationIcon fontSize="large" />,
        label: 'Electric Car',
      },
      {
        component: <DirectionsBikeIcon fontSize="large" />,
        label: 'Electric Bicycle',
      },
      {
        component: <LocalAirportActiveIcon fontSize="large" />,
        label: 'Plane',
      },
      {
        component: <BatteryFullIcon fontSize="large" />,
        label: 'Helicopter',
      },
      {
        component: <BatteryFullIcon fontSize="large" />,
        label: 'Drone',
      },
      {
        component: <BatteryFullIcon fontSize="large" />,
        label: 'Electric Scooter',
      },
      {
        component: <RowingIcon fontSize="large" />,
        label: 'Boat',
      },
      {
        component: <AcUnitIcon fontSize="large" />,
        label: 'Snowmobile',
      },
    ],
    Land: [

      {
        component: <DirectionsBikeIcon fontSize="large" />,
        label: 'Bicycle',
      },
      {
        component: <DirectionsWalkIcon fontSize="large" />,
        label: 'Walk',
      },
      {
        component: <LandscapeIcon fontSize="large" />,
        label: 'Scooter',
      },
      {
        component: <DirectionsBikeIcon fontSize="large" />,
        label: 'Skateboard',
      },
      {
        component: <DirectionsBikeIcon fontSize="large" />,
        label: 'Rollerskate',
      },
    ],
    Snow: [
      {
        component: <AcUnitIcon fontSize="large" />,
        label: 'Ski',
      },
      {
        component: <AcUnitIcon fontSize="large" />,
        label: 'Snowboard',
      },
      {
        component: <AcUnitIcon fontSize="large" />,
        label: 'Snowshoe',
      },
    ],
    Water: [
      {
        component: <PoolIcon fontSize="large" />,
        label: 'Swim',
      },
      {
        component: <RowingIcon fontSize="large" />,
        label: 'Paddleboard',
      },
      {
        component: <WavesIcon fontSize="large" />,
        label: 'Scuba Dive',
      },
      {
        component: <WavesIcon fontSize="large" />,
        label: 'Surf',
      },
      {
        component: <WavesIcon fontSize="large" />,
        label: 'Windsurf',
      },
      {
        component: <WavesIcon fontSize="large" />,
        label: 'Kiteboard',
      },
      {
        component: <RowingIcon fontSize="large" />,
        label: 'Canoe',
      },
      {
        component: <WavesIcon fontSize="large" />,
        label: 'Freedive',
      },
    ],
    Air: [
      {
        component: <CloudIcon fontSize="large" />,
        label: 'Parachute',
      },
      {
        component: <CloudIcon fontSize="large" />,
        label: 'Paraglide',
      },
      {
        component: <CloudIcon fontSize="large" />,
        label: 'Hanglide',
      },
      {
        component: <CloudIcon fontSize="large" />,
        label: 'Wingsuit',
      },
      {
        component: <CloudIcon fontSize="large" />,
        label: 'BASE Jump',
      },
      {
        component: <CloudIcon fontSize="large" />,
        label: 'Glider',
      },
    ],
  };

  const items: ReactNode[] = [];

  methods[type].forEach((it: MethodModel) => {
    const color = it.label === method ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.label}>
        <IconButton
          size="medium"
          color={color}
          onClick={() => storeSequenceMethod(it.label)}
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
          What method of transport was used?
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
