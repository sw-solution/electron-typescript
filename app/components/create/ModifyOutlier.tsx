import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Grid,
  Button,
  Box,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import {
  selSequenceOutlierMeter,
  setSequenceCurrentStep,
  setSequenceSmooth,
  setSequenceDiscard,
  setSequenceOutlierMeters,
} from './slice';

export default function SequenceModifyOutlier() {
  const dispatch = useDispatch();
  const propMeters = useSelector(selSequenceOutlierMeter);

  const [meters, setMeters] = React.useState<number>(propMeters);

  const smoothMode = () => {
    dispatch(setSequenceSmooth());
  };

  const removeMode = () => {
    dispatch(setSequenceDiscard());
  };

  const resetMode = () => {
    dispatch(setSequenceOutlierMeters(0));
    dispatch(setSequenceCurrentStep('modifySpace'));
  };

  const confirmMode = () => {
    dispatch(setSequenceOutlierMeters(meters));
    dispatch(setSequenceCurrentStep('azimuth'));
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
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Box mb={1} display="flex" style={{ justifyContent: 'center' }}>
          <Box mr={2} display="inline-block">
            <TextField label="Meters" placeholder="0" onBlur={handleChange} />
          </Box>

          <Box mr={2} display="inline-block">
            <Tooltip title={`Smooth outliers greater than ${meters} meters`}>
              <Button
                onClick={smoothMode}
                variant="contained"
                size="small"
                color="primary"
              >
                Smooth
              </Button>
            </Tooltip>
          </Box>
          <Tooltip title={`Remove outliers greater than ${meters} meters`}>
            <Button
              onClick={removeMode}
              variant="contained"
              size="small"
              color="primary"
            >
              Remove
            </Button>
          </Tooltip>
        </Box>
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
