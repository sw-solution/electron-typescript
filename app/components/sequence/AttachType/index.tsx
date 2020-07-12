import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import VideocamIcon from '@material-ui/icons/Videocam';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

import { setSequenceAttachType, selSequenceAttachType } from '../slice';

interface AttachTypeModel {
  component: ReactNode;
  label: string;
}

export default function SequenceAttachType() {
  const attachType = useSelector(selSequenceAttachType);
  const dispatch = useDispatch();

  const storeSequenceAttachType = (newAttachType: string) => {
    dispatch(setSequenceAttachType(newAttachType));
  };

  const attachTypes: AttachTypeModel[] = [
    {
      component: <VideocamIcon fontSize="large" />,
      label: 'Video',
    },
    {
      component: <PhotoCameraIcon fontSize="large" />,
      label: 'Image',
    },
  ];

  const items: ReactNode[] = [];

  attachTypes.forEach((it: AttachTypeModel) => {
    const color = it.label === attachType ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.label} xs={4}>
        <IconButton
          size="medium"
          color={color}
          onClick={() => storeSequenceAttachType(it.label)}
        >
          {it.component}
        </IconButton>
        <Typography color={color}>{it.label}</Typography>
      </Grid>
    );
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          How did you capture the content?
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Grid container spacing={5} justify="center">
          {items}
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }} />
    </>
  );
}
