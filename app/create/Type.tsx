import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Typography, Button, Grid } from '@material-ui/core';

import { setSequenceType, selSequenceType } from './slice';
import transportType from '../../transports/transport-methods.json';

export default function SequenceType() {
  const type = useSelector(selSequenceType);
  const dispatch = useDispatch();

  const storeSequenceType = (newType: string) => {
    dispatch(setSequenceType(newType));
  };

  const buttons = Object.keys(transportType).map((type: string) => {
    return transportType[type];
  });

  const items: ReactNode[] = [];

  buttons.forEach((it) => {
    const color = it.type === type ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.type}>
        <Button
          size="medium"
          color={color}
          startIcon={<span className={it.icon} />}
          onClick={() => storeSequenceType(it.type)}
        >
          {it.type}
        </Button>
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
          Transport types help people discover your sequence using search
          queries on Map the Paths Web.
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
