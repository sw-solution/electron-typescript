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
    Land: [
      {
        component: <DirectionsWalkIcon fontSize="large" />,
        label: 'Walk',
      },
      {
        component: <DirectionsCarIcon fontSize="large" />,
        label: 'Car',
      },
      {
        component: <DirectionsBikeIcon fontSize="large" />,
        label: 'Bike',
      },
    ],
    Water: [
      {
        component: <PoolIcon fontSize="large" />,
        label: 'Swim',
      },
      {
        component: <RowingIcon fontSize="large" />,
        label: 'Boat',
      },
    ],
    Air: [
      {
        component: <AirplanemodeActiveIcon fontSize="large" />,
        label: 'Plane',
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
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Grid container spacing={5} justify="center">
          {items}
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }} />
    </>
  );
}
