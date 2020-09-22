import React, { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@material-ui/lab';

import {
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { shell } from 'electron';

import { useSelector, useDispatch } from 'react-redux';
import { selIntegrations, selTokens } from '../base/slice';
import { selStep, setStep } from './slice';

import { Summary } from '../types/Result';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 'calc(100% - 60px)',
    height: 'calc(100% - 60px)',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    position: 'absolute',

    '& > *': {
      width: '100%',
      textAlign: 'center',
    },
  },
}));

interface Props {
  data: Summary;
}

interface State {
  message: string | null;
  dest: {
    [key: string]: boolean | string;
  };
  error: string | null;
}

export default function EditSequence({ data }: Props) {
  const { destination, name } = data;
  const classes = useStyles();
  const step = useSelector(selStep);
  const dispatch = useDispatch();

  const [state, setState] = useState<State>({
    dest: destination,
    error: null,
    message: null,
  });

  const integrations = useSelector(selIntegrations);
  const tokens = useSelector(selTokens);

  const { dest, error } = state;

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
      dispatch(setStep(2));
      ipcRenderer.send('update_destination', data, dest);
    }
  }, [data, dest, dispatch, step, tokens]);

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
      dispatch(setStep(0));
    });
    return () => {
      ipcRenderer.removeAllListeners('update_loaded_message');
      ipcRenderer.removeAllListeners('update_error');
    };
  });

  const handleChange = (key: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newState = {
      ...state.dest,
      [key]: event.target.checked,
    };

    if (key === 'mtp' || key === 'mapillary') {
      newState.mtp = event.target.checked;
      newState.mapillary = event.target.checked;
    }

    setState({
      ...state,
      dest: newState,
    });
  };

  const items = Object.keys(integrations).map((key) => {
    const checkNode = (
      <Checkbox
        checked={!!dest[key]}
        onChange={handleChange(key)}
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

  const nextStep = () => {
    dispatch(setStep(step + 1));
  };

  return (
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
}
