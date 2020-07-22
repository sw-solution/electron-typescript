import React, { useEffect } from 'react';
import { IpcRendererEvent } from 'electron';

import { push } from 'connected-react-router';

import {
  Drawer,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  LinearProgress,
  Button,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';

import { useSelector, useDispatch } from 'react-redux';

import Sequence from './Sequence';
import Logo from '../Logo';
import { selLoaded, selSeqs, setEndLoad } from './slice';

import routes from '../../constants/routes.json';

const { ipcRenderer } = window.require('electron');

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    background: '#fff',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
}));

export default function ListPageWrapper() {
  const classes = useStyles();
  const loaded = useSelector(selLoaded);
  const seqs = useSelector(selSeqs);
  const dispatch = useDispatch();

  if (!loaded) {
    ipcRenderer.send('sequences');
  }
  ipcRenderer.on('loaded_all', (_event: IpcRendererEvent, points) => {
    dispatch(setEndLoad(points));
  });

  useEffect(() => {
    return () => {
      ipcRenderer.removeAllListeners('loaded_all');
    };
  });

  const items = seqs.map((item) => {
    return <Sequence data={item} key={item.name} />;
  });

  return (
    <div>
      <Drawer
        open
        variant="persistent"
        anchor="left"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Logo />
      </Drawer>
      <div className={classes.appBarShift}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5">Browse Sequences</Typography>
          </Toolbar>
        </AppBar>

        <div>
          <Box my={1} height="78vh" px={5} style={{ overFlow: 'scroll' }}>
            {loaded && (
              <Grid container>
                <Grid item xs={12}>
                  <Box style={{ textAlign: 'right', marginBottom: '20px' }}>
                    <Button
                      onClick={() => {
                        dispatch(push(routes.CREATE));
                      }}
                      color="primary"
                      startIcon={<AddIcon />}
                    >
                      Create
                    </Button>
                  </Box>
                </Grid>
                {items}
              </Grid>
            )}
            {!loaded && (
              <div>
                <Box mb={5}>
                  <Typography variant="h5" color="primary">
                    Loading
                  </Typography>
                </Box>
                <LinearProgress />
              </div>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
}
