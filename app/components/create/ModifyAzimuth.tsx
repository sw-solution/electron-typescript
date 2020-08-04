import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, TextField } from '@material-ui/core';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Map from './Map';
import { setSequenceCurrentStep, selSequenceAzimuth, selPoints } from './slice';
import { IGeoPoint } from '../../types/IGeoPoint';

export default function SequenceModifyAzimuth() {
  const dispatch = useDispatch();
  const propazimuth = useSelector(selSequenceAzimuth);
  const proppoints = useSelector(selPoints);

  const [azimuth, setAzimuth] = React.useState<number>(propazimuth);
  const [points, setPoints] = React.useState<IGeoPoint[]>(proppoints);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const newazimuth = parseFloat(event.target.value);
      setAzimuth(newazimuth);
      const newpoints = points.map((p: IGeoPoint) => {
        return new IGeoPoint({
          ...p,
          Azimuth: (p.Azimuth || 0) + newazimuth,
        });
      });
      setPoints(newpoints);
    }
  };

  const resetMode = () => {
    dispatch(setSequenceCurrentStep('outlier'));
  };

  const confirmMode = () => {
    dispatch(setSequenceCurrentStep('tags'));
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
