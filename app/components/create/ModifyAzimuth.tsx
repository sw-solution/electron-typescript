import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, TextField } from '@material-ui/core';

import {
  setSequenceCurrentStep,
  selSequenceAzimuth,
  setSequenceAzimuth,
} from './slice';

export default function SequenceModifyAzimuth() {
  const dispatch = useDispatch();
  const propazimuth = useSelector(selSequenceAzimuth);

  const [azimuth, setAzimuth] = React.useState<number>(propazimuth);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) setAzimuth(parseFloat(event.target.value));
  };

  const confirm = () => {
    if (azimuth !== 0) {
      dispatch(setSequenceAzimuth(azimuth));
    }
    dispatch(setSequenceCurrentStep('modifySpace'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify Heading
        </Typography>
        <Typography paragraph align="center" color="textSecondary">
          Edit the direction images are facing
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        style={{
          paddingBottom: '30px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <TextField
          id="outlined-basic"
          label="Azimuth"
          variant="outlined"
          value={azimuth}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Box mb={1} display="flex" style={{ justifyContent: 'center' }}>
          <Button
            onClick={confirm}
            variant="contained"
            size="small"
            color="primary"
          >
            OK
          </Button>
        </Box>
      </Grid>
    </>
  );
}
