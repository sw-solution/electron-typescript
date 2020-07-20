import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, TextField } from '@material-ui/core';

import {
  selSequenceOutlierMeter,
  setSequenceCurrentStep,
  setSequenceSmothPoints,
  setSequenceDiscardPoints,
} from './slice';

export default function SequenceModifyOutlier() {
  const dispatch = useDispatch();
  const propMeters = useSelector(selSequenceOutlierMeter);

  const [meters, setMeters] = React.useState<number>(propMeters);

  const smoothMode = () => {
    if (meters > 0) {
      dispatch(setSequenceSmothPoints(meters));
      dispatch(setSequenceCurrentStep('modifySpace'));
    }
  };

  const removeMode = () => {
    if (meters > 0) {
      dispatch(setSequenceDiscardPoints(meters));
      dispatch(setSequenceCurrentStep('modifySpace'));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMeters(parseFloat(event.target.value));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Edit Photo Outliers
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box mb={1}>
          <TextField label="Meters" placeholder="0" onChange={handleChange} />
        </Box>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Box mb={1} display="flex" style={{ justifyContent: 'center' }}>
          <Box mr={4} display="inline-block">
            <Button
              onClick={smoothMode}
              variant="contained"
              size="small"
              color="primary"
            >
              Smooth outliers greater than meters
            </Button>
          </Box>
          <Button
            onClick={removeMode}
            variant="contained"
            size="small"
            color="primary"
          >
            Remove outliers greater than meters
          </Button>
        </Box>
      </Grid>
    </>
  );
}
