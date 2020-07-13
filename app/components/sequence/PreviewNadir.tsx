import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Pannellum } from 'pannellum-react';

import { setSequenceCurrentStep, selNadirImage } from './slice';

export default function SequencePreviewNadir() {
  const dispatch = useDispatch();
  const imagePath = useSelector(selNadirImage);

  const resetMode = () => {
    dispatch(setSequenceCurrentStep('uploadNadir'));
  };

  const confirmMode = () => {
    dispatch(setSequenceCurrentStep('processPage'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Preview Nadir
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary">
          Here’s an example of how your nadir will appear
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Typography align="center" color="textSecondary" />
      </Grid>
      <Grid item xs={12}>
        <Pannellum image={require(`${imagePath}`)} />
      </Grid>
      <Grid item xs={12}>
        <Box mr={1} display="inline-block">
          <Button
            endIcon={<ChevronRightIcon />}
            color="secondary"
            onClick={resetMode}
            variant="contained"
          >
            Use other nadir
          </Button>
        </Box>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          Confirm nadir
        </Button>
      </Grid>
    </>
  );
}
