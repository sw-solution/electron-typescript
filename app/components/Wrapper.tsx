import React, { ReactNode } from 'react';

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  MuiThemeProvider,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import muiTheme from '../theme/muiTheme';

const drawerWidth = 300;
const useStyles = makeStyles((theme) => ({
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  contentWrapper: {
    textAlign: 'center',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'auto',
  },
  content: {
    minHeight: 'calc(100vh - 80px)',
    padding: '30px',
    position: 'relative',
    display: 'flex',
    background: '#fff',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
  },
}));

interface Props {
  children: ReactNode[] | ReactNode;
  title: string;
}

export default function Wrapper({ title, children }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.appBarShift}>
      <MuiThemeProvider theme={muiTheme}>
        <AppBar position="static" style={{ backgroundColor: '#28a745' }}>
          <Toolbar>
            <Typography variant="h5">{title}</Typography>
          </Toolbar>
        </AppBar>

        <Box className={classes.contentWrapper}>
          <Box className={classes.content}>{children}</Box>
        </Box>
      </MuiThemeProvider>
    </div>
  );
}
