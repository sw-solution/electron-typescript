import React, { useEffect, useState } from 'react';
import { IpcRendererEvent } from 'electron';

import { push } from 'connected-react-router';

import {
  Drawer,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
  Grid,
  LinearProgress,
  Button,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs';

import AddIcon from '@material-ui/icons/Add';

import { useSelector, useDispatch } from 'react-redux';

import Sequence from './Sequence';
import Logo from '../components/Logo';
import Wrapper from '../components/Wrapper';
import { selLoaded, selSeqs, setEndLoad } from './slice';

import routes from '../constants/routes.json';
import { Summary, TransportType } from '../types/Result';
import { selCameras } from '../base/slice';
import { Camera } from '../types/Camera';

const { ipcRenderer } = window.require('electron');

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawerPaper: {
    width: drawerWidth,
  },
  filterWrap: {
    '& > *': {
      marginBottom: theme.spacing(2),
    },
    padding: theme.spacing(2),
  },
  gridContainer: {
    display: 'block',
  },
}));

interface State {
  name: string;
  transporttype: TransportType | '';
  model: string;
  capturedStartDate: string;
  capturedEndDate: string;
}

export default function ListPageWrapper() {
  const classes = useStyles();
  const loaded = useSelector(selLoaded);

  const seqs = useSelector(selSeqs);
  const cameras = useSelector(selCameras);
  const dispatch = useDispatch();
  const [state, setState] = useState<State>({
    name: '',
    transporttype: '',
    model: '',
    capturedStartDate: '',
    capturedEndDate: '',
  });

  if (!loaded) {
    ipcRenderer.send('sequences');
  }

  ipcRenderer.on(
    'loaded_sequences',
    (_event: IpcRendererEvent, sequences: Summary[]) => {
      dispatch(setEndLoad(sequences));
    }
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      name: e.target.value,
    });
  };

  const handleTransportType = (
    e: React.ChangeEvent<{ name?: string; value: TransportType }>,
    _child: React.ReactNode
  ) => {
    setState({
      ...state,
      transporttype: e.target.value,
    });
  };

  const handleCameraType = (
    e: React.ChangeEvent<{ name?: string; value: TransportType }>,
    _child: React.ReactNode
  ) => {
    setState({
      ...state,
      model: e.target.value,
    });
  };

  const items: JSX.Element[] = [];
  seqs.forEach((item: Summary) => {
    if (
      item.name.toLowerCase().indexOf(state.name.toLowerCase()) >= 0 &&
      (state.transporttype === '' || item.type === state.transporttype) &&
      (state.model === '' || state.model === item.camera) &&
      (state.capturedStartDate === '' ||
        dayjs(state.capturedStartDate).isBefore(dayjs(item.captured))) &&
      (state.capturedEndDate === '' ||
        dayjs(state.capturedEndDate).isAfter(dayjs(item.captured)))
    ) {
      items.push(<Sequence data={item} key={item.id} />);
    }
  });

  const handleCapturedStartDate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({
      ...state,
      capturedStartDate: event.target.value,
    });
  };

  const handleCapturedEndDate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({
      ...state,
      capturedEndDate: event.target.value,
    });
  };

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
        <div className={classes.filterWrap}>
          <Typography variant="h5"> Filters </Typography>
          <TextField
            label="Tour name search"
            fullWidth
            variant="outlined"
            value={state.name}
            onChange={handleNameChange}
            placeholder="Tour name search"
          />
          <FormControl fullWidth>
            <InputLabel id="transporttype_label_id">Transport Type</InputLabel>
            <Select
              value={state.transporttype}
              onChange={handleTransportType}
              labelId="transporttype_label_id"
            >
              <MenuItem value="">Select Transport Type</MenuItem>
              {Object.keys(TransportType).map((t: string) => (
                <MenuItem value={TransportType[t]} key={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="transporttype_label_id">
              Camera make / model
            </InputLabel>
            <Select
              value={state.model}
              onChange={handleCameraType}
              labelId="transporttype_label_id"
            >
              <MenuItem value="">Select Camera make / model</MenuItem>
              {cameras.map((t: Camera) => (
                <MenuItem value={t.name} key={t.key}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Captured Start Date"
            value={state.capturedStartDate}
            type="date"
            onChange={handleCapturedStartDate}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <TextField
            label="Captured End Date"
            value={state.capturedEndDate}
            type="date"
            onChange={handleCapturedEndDate}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </div>
      </Drawer>
      <Wrapper title="Browse Sequences">
        <Grid container className={classes.gridContainer}>
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
          {items.length ? (
            items
          ) : (
            <Typography>
              No sequences exist that match the search criteria. Why not create
              one? As if you needed an excuse for an adventure!
            </Typography>
          )}
        </Grid>
      </Wrapper>
    </div>
  );
}
