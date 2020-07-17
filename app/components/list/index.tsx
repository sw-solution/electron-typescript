import React from 'react';
import Drawer from '@material-ui/core/Drawer';

import { Box, AppBar, Toolbar, Typography, Grid } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import Logo from '../Logo';

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
          <Box my={1} height="78vh" style={{ textAlign: 'center' }}>
            <Grid container />
          </Box>
        </div>
      </div>
    </div>
  );
}
