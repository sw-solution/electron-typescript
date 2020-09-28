import React, { useEffect } from 'react';

import { push } from 'connected-react-router';
import { Create as CreateIcon, List as ListIcon } from '@material-ui/icons';

import {
  Drawer,
  ListItemText,
  ListItemIcon,
  ListItem,
  List,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import { useDispatch, useSelector } from 'react-redux';

import Logo from '../components/Logo';
import Wrapper from '../components/Wrapper';
import { updateIntegrationStatus } from '../list/slice';
import { selEditSeq, setEdit, selStep, setStep } from './slice';

import routes from '../constants/routes.json';
import { Summary } from '../types/Result';

import EditSequence from './EditSequence';

const { ipcRenderer } = window.require('electron');

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawerPaper: {
    width: drawerWidth,
    padding: 8,
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

export default function EditWrapper() {
  const classes = useStyles();

  const dispatch = useDispatch();

  const sequence = useSelector(selEditSeq);
  const step = useSelector(selStep);

  useEffect(() => {
    ipcRenderer.on('update_sequence_finish', (_event, seq: Summary) => {
      dispatch(updateIntegrationStatus(seq));
      dispatch(setEdit(undefined));
      dispatch(setStep(0));
    });
    return () => {
      ipcRenderer.removeAllListeners('update_sequence_finish');
    };
  });

  useEffect(() => {
    if (!sequence) {
      dispatch(push(routes.LIST));
    }
  }, [dispatch, sequence]);

  const gotoPage = (link: string) => {
    dispatch(push(link));
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
          <List>
            <ListItem
              button
              onClick={() => gotoPage(routes.CREATE)}
              disabled={step === 2}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText>Create Sequence</ListItemText>
            </ListItem>
            <ListItem
              button
              onClick={() => gotoPage(routes.LIST)}
              disabled={step === 2}
            >
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText>My Sequences</ListItemText>
            </ListItem>
          </List>
        </div>
      </Drawer>
      <Wrapper title="Edit Sequence">
        {sequence && <EditSequence data={sequence} />}
      </Wrapper>
    </div>
  );
}
