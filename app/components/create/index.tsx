import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';

import { push } from 'connected-react-router';

import Drawer from '@material-ui/core/Drawer';
import { Create as CreateIcon, List as ListIcon } from '@material-ui/icons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';

import { IpcRendererEvent } from 'electron';

import Name from './Name';
import Description from './Description';
import Type from './Type';
import Camera from './Camera';
import Method from './Method';
import AttachType from './AttachType';
import UploadImage from './UploadImage';
import UploadGpx from './UploadGpx';
import StartTime from './StartTime';
import ModifyTime from './ModifyTime';
import ModifySpace from './ModifySpace';
import ModifyOutlier from './ModifyOutlier';
import ModifyAzimuth from './ModifyAzimuth';
import Tags from './Tags';
import Nadir from './Nadir';
import UploadNadir from './UploadNadir';
import PreviewNadir from './PreviewNadir';
import ProcessPage from './ProcessPage';

import routes from '../../constants/routes.json';
import {
  getPrevStep,
  selCurrentStep,
  setSequenceCurrentStep,
  setSequencePoints,
  setSequenceStartTime,
  setSequenceGpxPoints,
  setSequenceInit,
} from './slice';

import { setAddSeq } from '../list/slice';
import Logo from '../Logo';

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
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
}));

export default function CreatePageWrapper() {
  const classes = useStyles();
  const prevStep = useSelector(getPrevStep);
  const currentStep = useSelector(selCurrentStep);
  const dispatch = useDispatch();

  const goPrevStep = () => {
    dispatch(setSequenceCurrentStep(prevStep));
  };

  useEffect(() => {
    ipcRenderer.on('set-points', (_event: IpcRendererEvent, points) => {
      dispatch(setSequencePoints(points));
    });

    ipcRenderer.on('start-time', (_event: IpcRendererEvent, starttime) => {
      dispatch(setSequenceStartTime(starttime));
    });

    ipcRenderer.on('add-seq', (_event: IpcRendererEvent, seq) => {
      dispatch(setAddSeq(seq));
      dispatch(setSequenceInit());
      dispatch(push(routes.LIST));
    });

    ipcRenderer.on('load_gpx_points', (_event: IpcRendererEvent, points) => {
      dispatch(setSequenceGpxPoints(points));
    });

    ipcRenderer.on('error', (_event: IpcRendererEvent, error) => {
      console.error(error);
    });

    return () => {
      ipcRenderer.removeAllListeners('start-time');
      ipcRenderer.removeAllListeners('set-points');
      ipcRenderer.removeAllListeners('load_gpx_points');
      ipcRenderer.removeAllListeners('add-seq');
      ipcRenderer.removeAllListeners('error');
    };
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
        <List>
          <ListItem
            button
            component="a"
            onClick={() => {
              dispatch(push(routes.CREATE));
            }}
          >
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText>Create Sequence</ListItemText>
          </ListItem>
          <ListItem
            button
            component="a"
            onClick={() => {
              dispatch(push(routes.LIST));
            }}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText>My Sequences</ListItemText>
          </ListItem>
        </List>
      </Drawer>
      <div className={classes.appBarShift}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5">Create Sequence</Typography>
          </Toolbar>
        </AppBar>
        <div>
          <Box my={1} height="78vh" style={{ textAlign: 'center' }}>
            <Card
              style={{
                height: '100%',
                padding: '30px',
                position: 'relative',
              }}
            >
              <Grid
                container
                alignItems="center"
                style={{
                  height: '100%',
                  paddingTop: '30px',
                  paddingBottom: '30px',
                }}
              >
                {prevStep !== '' && (
                  <Box position="absolute" top={20} left={20} zIndex="modal">
                    <IconButton onClick={goPrevStep}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Box>
                )}

                {currentStep === 'name' && <Name />}
                {currentStep === 'description' && <Description />}
                {currentStep === 'type' && <Type />}
                {currentStep === 'method' && <Method />}
                {currentStep === 'camera' && <Camera />}
                {currentStep === 'attachType' && <AttachType />}
                {currentStep === 'imagePath' && <UploadImage />}
                {currentStep === 'gpx' && <UploadGpx />}
                {currentStep === 'startTime' && <StartTime />}
                {currentStep === 'modifyTime' && <ModifyTime />}
                {currentStep === 'modifySpace' && <ModifySpace />}
                {currentStep === 'outlier' && <ModifyOutlier />}
                {currentStep === 'azimuth' && <ModifyAzimuth />}
                {currentStep === 'tags' && <Tags />}
                {currentStep === 'nadir' && <Nadir />}
                {currentStep === 'nadirPath' && <UploadNadir />}
                {currentStep === 'previewNadir' && <PreviewNadir />}
                {currentStep === 'processPage' && <ProcessPage />}
              </Grid>
            </Card>
          </Box>
        </div>
      </div>
    </div>
  );
}
