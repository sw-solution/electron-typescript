import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { setSequenceCamera, selSequenceCamera } from './slice';

import { selConfigLoaded, selCameras } from '../base/slice';
import { Camera } from '../types/Camera';

const { ipcRenderer } = window.require('electron');

export default function SequenceCamera() {
  const camera = useSelector(selSequenceCamera);
  const dispatch = useDispatch();
  const loaded = useSelector(selConfigLoaded);
  const cameras = useSelector(selCameras);

  if (!loaded) {
    ipcRenderer.send('load_config');
  }

  const storeSequenceCamera = (newCamera: string) => {
    dispatch(setSequenceCamera(newCamera));
  };

  const items: ReactNode[] = [];

  cameras.forEach((it: Camera) => {
    const color = it.name === camera ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.key} xs={4}>
        <Button
          size="medium"
          color={color}
          onClick={() => storeSequenceCamera(it.name)}
        >
          <img
            src={`data:image/png;base64, ${it.image}`}
            alt={it.name}
            width="70"
            height="70"
          />
          <Typography color={color} style={{ textTransform: 'none' }}>
            {it.name}
          </Typography>
        </Button>
      </Grid>
    );
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          What camera did you use?
        </Typography>
        <Typography paragraph>
          Most cameras are supported. Both 360 (equirectangular) and non-360 images are supported. If you don't see your camera listed select "Other Model". The process should still work, but with the caveat we have not tested it.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={5} justify="center">
          {items}
        </Grid>
      </Grid>
    </>
  );
}
