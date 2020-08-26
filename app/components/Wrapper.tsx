import React, { ReactNode, useEffect, useState } from 'react';

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  MuiThemeProvider,
  Modal,
  Button,
} from '@material-ui/core';

import { Alert, AlertTitle } from '@material-ui/lab';

import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import muiTheme from '../theme/muiTheme';
import { selSequenceName, setInit, selSequence } from '../create/slice';

const { ipcRenderer } = window.require('electron');

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
  },

  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

interface State {
  showModal: boolean;
}

interface Props {
  children: ReactNode[] | ReactNode;
  title: string;
}

export default function Wrapper({ title, children }: Props) {
  const classes = useStyles();

  const name = useSelector(selSequenceName);
  const sequence = useSelector(selSequence);

  const dispatch = useDispatch();

  const [state, setState] = useState<State>({
    showModal: false,
  });

  useEffect(() => {
    ipcRenderer.on('close_app', (_event: IpcRendererEvent) => {
      if (name !== '') {
        setState({
          showModal: true,
        });
      } else {
        ipcRenderer.send('closed_app', null);
      }
    });
    return () => {
      ipcRenderer.removeAllListeners('close_app');
    };
  });

  const handleClose = () => {
    setState({
      showModal: false,
    });
  };

  const closeApp = () => {
    handleClose();
    ipcRenderer.send('closed_app', sequence);
    dispatch(setInit());
  };

  const modalBody = (
    <div className={classes.paper}>
      <div>
        <Alert severity="warning">
          <AlertTitle>WARNING!</AlertTitle>
          <span>
            All sequence data will be lost if you exit before completing the
            creation process. Are you sure you want to exit? creation
          </span>
        </Alert>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Button
          onClick={() => {
            dispatch(setInit());
            closeApp();
          }}
          color="secondary"
        >
          OK
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </div>
    </div>
  );

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
          <Modal open={state.showModal} onClose={handleClose}>
            {modalBody}
          </Modal>
        </Box>
      </MuiThemeProvider>
    </div>
  );
}
