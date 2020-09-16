import React, { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@material-ui/lab';

import {
  Modal,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { shell } from 'electron';

import { useSelector } from 'react-redux';
import { selIntegrations, selTokens } from '../base/slice';

import { Summary } from '../types/Result';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 600,
    height: 600,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',

    '& > *': {
      width: '100%',
      textAlign: 'center',
    },
  },
}));

interface Props {
  data: Summary;
  onClose: CallableFunction;
}

interface State {
  openModal: boolean;
  message: string | null;
  dest: {
    [key: string]: boolean | string;
  };
  error: string | null;
}

export default function EditSequence({ data, onClose }: Props) {
  const { destination, name } = data;
  const classes = useStyles();

  const [state, setState] = useState<State>({
    openModal: true,
    dest: destination,
    error: null,
    message: null,
  });

  const [step, setStep] = useState<number>(0);

  const integrations = useSelector(selIntegrations);
  const tokens = useSelector(selTokens);

  const { openModal, dest, error } = state;

  useEffect(() => {
    if (
      step === 1 &&
      data &&
      Object.keys(dest).length &&
      Object.keys(dest)
        .filter((key) => dest[key])
        .filter((key: string) => !(tokens[key] && tokens[key].value)).length ===
        0
    ) {
      setStep(2);
      ipcRenderer.send('update_destination', data, dest);
    }
  }, [data, dest, step, tokens]);

  useEffect(() => {
    ipcRenderer.on('update_loaded_message', (_event, msg) => {
      setState({
        ...state,
        message: msg,
      });
    });
    ipcRenderer.on('update_error', (_event, err) => {
      setState({
        ...state,
        error: err,
      });
      setStep(0);
    });
    return () => {
      ipcRenderer.removeAllListeners('update_loaded_message');
      ipcRenderer.removeAllListeners('update_error');
    };
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      dest: {
        ...state.dest,
        ...Object.keys(integrations).reduce(
          (obj: { [key: string]: boolean }, integration: string) => {
            obj[integration] = event.target.checked;
            return obj;
          },
          {}
        ),
      },
    });
  };

  const items = Object.keys(integrations).map((key) => {
    const checkNode = (
      <Checkbox
        checked={!!dest[key]}
        onChange={handleChange}
        name={key}
        color="primary"
      />
    );
    const integrationLogo = (
      <>
        <img
          src={`data:image/png;base64, ${integrations[key].logo}`}
          alt={integrations[key].name}
          width="70"
          height="70"
        />
      </>
    );

    return (
      <FormControlLabel
        color="primary"
        control={checkNode}
        label={integrationLogo}
        key={key}
      />
    );
  });

  const gotoExternal = (url: string) => {
    shell.openExternal(url);
  };

  const login = (integration: string) => {
    ipcRenderer.send('set_token', integration, { value: null, waiting: true });
    gotoExternal(integrations[integration].loginUrl);
  };

  const loginItems = Object.keys(dest)
    .filter((k: string) => dest[k])
    .filter((integration: string) => dest[integration] && integration !== 'mtp')
    .map((integration: string) => {
      const integrationLogo = (
        <img
          src={`data:image/png;base64, ${integrations[integration].logo}`}
          alt={integrations[integration].name}
          width="70"
          height="70"
        />
      );
      return (
        <Button
          onClick={() => login(integration)}
          endIcon={integrationLogo}
          size="large"
          color="primary"
          variant="contained"
          key={integration}
        >
          {tokens[integration] && tokens[integration].waiting
            ? 'Logining to'
            : 'Login to'}
        </Button>
      );
    });

  const handleClose = () => {
    if (step !== 2) {
      setState({
        ...state,
        openModal: false,
      });
      onClose();
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const modalBody = (
    <div className={classes.paper}>
      <Typography variant="h5">{name}</Typography>

      {error && (
        <div>
          <Alert severity="error">
            <AlertTitle>Error!</AlertTitle>
            <span>{error}</span>
          </Alert>
        </div>
      )}
      {step === 0 && (
        <>
          <div>{items}</div>
          <div>
            <Button
              endIcon={<ChevronRightIcon />}
              color="primary"
              onClick={nextStep}
              variant="contained"
              disabled={
                Object.keys(dest).filter((key: string) => dest[key]).length ===
                0
              }
            >
              Confirm Changes
            </Button>
          </div>
        </>
      )}
      {step === 1 && <div>{loginItems}</div>}
      {step === 2 && (
        <>
          {state.message && (
            <Typography variant="caption" color="textPrimary">
              {state.message}
            </Typography>
          )}
          <LinearProgress />
        </>
      )}
    </div>
  );

  return (
    <Modal open={openModal} onClose={handleClose}>
      {modalBody}
    </Modal>
  );
}
