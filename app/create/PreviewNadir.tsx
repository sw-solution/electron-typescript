import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ReactPannellum from 'react-pannellum';

import {
  setCurrentStep,
  selSequence,
  selPreviewNadir,
  selPoints,
} from './slice';

const { ipcRenderer } = window.require('electron');

export default function SequencePreviewNadir() {
  const dispatch = useDispatch();
  const sequence = useSelector(selSequence);
  const imagePath = useSelector(selPreviewNadir);
  const points = useSelector(selPoints);

  const resetMode = () => {
    dispatch(setCurrentStep('nadir'));
  };

  const confirmMode = () => {
    ipcRenderer.send('update_images', sequence);
    dispatch(setCurrentStep('processPage'));
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
      <Grid item xs={12}>
        <Typography align="center" color="textSecondary" />
      </Grid>
      <Grid item xs={12}>
        <ReactPannellum
          imageSource={imagePath}
          id="preview_nadir"
          sceneId="1"
          config={{
            autoLoad: true,
          }}
          style={{
            width: '500px',
            height: `${(
              (points[0].height / points[0].width) *
              500
            ).toString()}px`,
          }}
        />
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
