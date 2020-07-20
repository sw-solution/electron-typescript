import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { Grid, Button, Box, Input, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import FilterFramesIcon from '@material-ui/icons/FilterFrames';

import {
  setSequenceCurrentStep,
  selSequenceFrame,
  setSequenceFrame,
} from './slice';

const useStyles = makeStyles({
  root: {
    width: 350,
  },
  input: {
    width: 42,
  },
});

export default function SequenceModifyFrame() {
  const dispatch = useDispatch();
  const propframe = useSelector(selSequenceFrame);
  const classes = useStyles();

  const [frames, setFrame] = React.useState<number>(propframe);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrame(parseFloat(event.target.value));
  };

  const handleSliderChange = (_event: any, newValue: number) => {
    setFrame(newValue);
  };

  const handleBlur = () => {
    if (frames < 1) {
      setFrame(1);
    } else if (frames > 50) {
      setFrame(50);
    }
  };

  const confirm = () => {
    dispatch(setSequenceFrame(frames));
    dispatch(setSequenceCurrentStep('modifySpace'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Edit Frames
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
        <div className={classes.root}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FilterFramesIcon />
            </Grid>
            <Grid item xs>
              <Slider
                value={frames}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
              />
            </Grid>
            <Grid item>
              <Input
                className={classes.input}
                value={frames}
                margin="dense"
                onChange={handleChange}
                onBlur={handleBlur}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 50,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>
        </div>
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
