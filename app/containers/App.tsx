import React, { useEffect, useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { IpcRendererEvent } from 'electron';

import { Modal, Button } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { selSequenceName, setInit, selSequence } from '../create/slice';

import {
  selConfigLoaded,
  setConfigLoadEnd,
  setUser,
  selCurrentPath,
} from '../base/slice';
import routes from '../constants/routes.json';

const { ipcRenderer } = window.require('electron');
const useStyles = makeStyles((theme) => ({
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

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  const sequence = useSelector(selSequence);
  const name = useSelector(selSequenceName);
  const configLoaded = useSelector(selConfigLoaded);

  const dispatch = useDispatch();

  const currentPath = useSelector(selCurrentPath);

  const classes = useStyles();

  const [state, setState] = useState<State>({
    showModal: false,
  });

  useEffect(() => {
    if (!configLoaded) {
      ipcRenderer.send('load_config');
    }

    ipcRenderer.on('loaded_user', (_event: IpcRendererEvent, user) => {
      if (user) {
        dispatch(setUser(user));
      } else if (currentPath !== routes.LOGIN) {
        dispatch(push(routes.LOGIN));
      }
    });

    ipcRenderer.on('loaded_config', (_event: IpcRendererEvent, config) => {
      dispatch(setConfigLoadEnd(config));
    });

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
      ipcRenderer.removeAllListeners('loaded_config');
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
    <>
      <div>{children}</div>
      <Modal open={state.showModal} onClose={handleClose}>
        {modalBody}
      </Modal>
    </>
  );
}
