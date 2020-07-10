import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { setSequenceCamera, selSequenceCamera } from './slice';

import garminImg from '../../../assets/images/camera/garmin.png';
import goprofusionImg from '../../../assets/images/camera/goprofusion.png';
import gopromaxImg from '../../../assets/images/camera/gopromax.png';
import insta360Img from '../../../assets/images/camera/insta360.png';
import ricohImg from '../../../assets/images/camera/ricoh.png';

import routes from '../../../constants/routes.json';

interface CameraModel {
  component: ReactNode;
  label: string;
}

export default function SequenceCamera() {
  const camera = useSelector(selSequenceCamera);
  const dispatch = useDispatch();

  const storeSequenceCamera = (newCamera: string) => {
    dispatch(setSequenceCamera(newCamera));
    dispatch(push(routes.CREATE.ATTACH_TYPE));
  };

  const cameras: CameraModel[] = [
    {
      component: <img src={garminImg} alt="Garmin" width="100" />,
      label: 'Garmin',
    },
    {
      component: <img src={goprofusionImg} alt="GoPro Fusion" width="100" />,
      label: 'GoPro Fusion',
    },
    {
      component: <img src={gopromaxImg} alt="GoPro Max" width="100" />,
      label: 'GoPro Max',
    },
    {
      component: <img src={insta360Img} alt="Insta 360" width="100" />,
      label: 'Insta 360',
    },
    {
      component: <img src={ricohImg} alt="Ricoh" width="100" />,
      label: 'Ricoh',
    },
  ];

  const items: ReactNode[] = [];

  cameras.forEach((it: CameraModel) => {
    const color = it.label === camera ? 'secondary' : 'primary';
    items.push(
      <Grid item key={it.label} xs={4}>
        <Button
          size="medium"
          color={color}
          onClick={() => storeSequenceCamera(it.label)}
        >
          {it.component}
        </Button>
        <Typography color={color}>{it.label}</Typography>
      </Grid>
    );
  });

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          What camera did you use?
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Grid container spacing={5} justify="center">
          {items}
        </Grid>
      </Grid>
    </>
  );
}
