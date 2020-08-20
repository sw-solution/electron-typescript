import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, TextField } from '@material-ui/core';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Map from '../components/Map';
import {
  setCurrentStep,
  selSequenceAzimuth,
  selPoints,
  setSequencePoints,
  resetPoints,
} from './slice';
import { IGeoPoint } from '../types/IGeoPoint';

interface State {
  points: IGeoPoint[];
  azimuth: number;
}

export default function SequenceModifyAzimuth() {
  const dispatch = useDispatch();
  const propazimuth = useSelector(selSequenceAzimuth);
  const proppoints = useSelector(selPoints);

  const [state, setState] = React.useState<State>({
    points: proppoints,
    azimuth: propazimuth,
  });

  const { points, azimuth } = state;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const newazimuth = parseFloat(event.target.value);
      const newpoints = proppoints.map((p: IGeoPoint) => {
        return new IGeoPoint({
          ...p,
          Azimuth: (p.Azimuth || 0) + newazimuth,
        });
      });
      setState({
        azimuth: newazimuth,
        points: newpoints,
      });
    }
  };

  const resetMode = () => {
    dispatch(resetPoints());
  };

  const confirmMode = () => {
    dispatch(setCurrentStep('tags'));
    dispatch(setSequencePoints(points));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify Heading
        </Typography>
        <TextField
          id="outlined-basic"
          label="Azimuth"
          variant="outlined"
          value={azimuth}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Map points={points} />
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
