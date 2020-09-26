import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Typography, Button, Grid } from '@material-ui/core';

import transportType from '../../transports/transport-methods.json';

import { setSequenceMethod, selSequenceMethod, selSequenceType } from './slice';

interface MethodModel {
  component: ReactNode;
  label: string;
}

export default function SequenceMethod() {
  const method = useSelector(selSequenceMethod);
  const type: string = useSelector(selSequenceType);
  const dispatch = useDispatch();

  const storeSequenceMethod = (newMethod: any) => {
    dispatch(setSequenceMethod(newMethod));
  };

  const items: ReactNode[] = [];

  transportType[type].children.forEach((it: MethodModel) => {
    const color = it.type === method ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.type}>
        <Button
          size="medium"
          color={color}
          startIcon={<span className={it.icon} />}
          onClick={() => storeSequenceMethod(it)}
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
          What method of transport was used?
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
