import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import { shell } from 'electron';

import { Typography, Grid, Button } from '@material-ui/core';

import {
  selMapillary,
  selMapillaryToken,
  waitMapiliaryToken,
  setMapilliaryTokenWaiting,
  selSequence,
  setProcessStep,
  selError,
} from './slice';

const { ipcRenderer } = window.require('electron');

export default function DestinationLogin() {
  const dispatch = useDispatch();
  const mapillary = useSelector(selMapillary);
  const mapillaryToken = useSelector(selMapillaryToken);
  const sequence = useSelector(selSequence);
  const error = useSelector(selError);

  const loginUrl = `https://www.mapillary.com/connect?client_id=${process.env.MAPILLARY_APP_ID}&response_type=token&scope=user:email%20private:upload&redirect_uri=${process.env.MAPILLARY_REDIRECT_URI}`;

  const waitingMapillaryToken = useSelector(waitMapiliaryToken);

  useEffect(() => {
    if (mapillaryToken && mapillaryToken !== '' && !error) {
      dispatch(setProcessStep('name'));
      ipcRenderer.send('update_images', sequence);
    }
  }, [dispatch, mapillaryToken, sequence, error]);

  const gotoExternal = (url: string) => {
    shell.openExternal(url);
  };

  const login = () => {
    dispatch(setMapilliaryTokenWaiting(true));
    gotoExternal(loginUrl);
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6">Authentications</Typography>
      </Grid>
      <Grid item xs={12} />
      <Grid item xs={12}>
        {mapillary && (
          <Button
            onClick={login}
            endIcon={<ChevronRightRoundedIcon />}
            size="large"
            color="primary"
            variant="contained"
          >
            {waitingMapillaryToken
              ? 'Logining to Mapillary'
              : 'Login to Mapillary'}
          </Button>
        )}
      </Grid>
    </>
  );
}
