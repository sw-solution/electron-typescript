import React from 'react';

import IconButton from '@material-ui/core/IconButton';

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import { Box, Typography, Grid, Avatar, Chip, Badge } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import PublishIcon from '@material-ui/icons/Publish';
import Map from '../components/Map';

import transportType from '../../transports/transport-methods.json';

import { selIntegrations } from '../base/slice';

import { Summary } from '../types/Result';

const useStyles = makeStyles((theme) => ({
  container: {
    borderRadius: '15px',
    padding: '10px',
    boxShadow: 'rgba(114, 126, 140, 0.5) 0px 0px 10px 0px',
    marginBottom: '20px',
    position: 'relative',
  },
  information: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  map: {
    height: '200px',
  },
  removeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  destinationWrapper: {
    textAlign: 'left',
  },
}));

interface Props {
  data: Summary;
  onDelete: CallableFunction;
}

export default function Sequence({ data, onDelete }: Props) {
  const classes = useStyles();

  const { type, method, points } = data;

  const methodIcons = transportType[type].children.reduce(
    (obj: any, item: any) => {
      obj[item.type] = item.icon;
      return obj;
    },
    {}
  );

  const integrations = useSelector(selIntegrations);

  const destinationIcons = Object.keys(data.destination).map((key: string) => {
    let icon = <DoneIcon color="primary" fontSize="small" />;
    if (
      typeof data.destination[key] === 'string' &&
      data.destination[key].startsWith('Error')
    ) {
      icon = <ErrorIcon color="error" fontSize="small" />;
    } else if (data.destination[key] !== '') {
      icon = <PublishIcon color="action" fontSize="small" />;
    }

    return (
      <Badge
        overlap="circle"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        badgeContent={icon}
        key={key}
      >
        <Avatar src={`data:image/png;base64, ${integrations[key].logo}`} />
      </Badge>
    );
  });

  return (
    <Grid xs={12} item className={classes.container}>
      <IconButton
        className={classes.removeButton}
        onClick={() => onDelete(data.name)}
      >
        <DeleteOutlineIcon />
      </IconButton>
      <Grid container alignItems="center" spacing={3}>
        <Grid xs={4} item>
          <Map points={points} height={200} showPopup={false} />
        </Grid>
        <Grid xs={5} item>
          <Typography variant="h5" color="primary" align="left">
            {data.name}
          </Typography>
          <div className={classes.destinationWrapper}>{destinationIcons}</div>
          <Typography color="primary" align="left" paragraph>
            {data.description}
          </Typography>
          <Box className={classes.information}>
            <div>
              <span className={transportType[type].icon} />
              <Typography color="primary" variant="caption" display="block">
                {data.type}
              </Typography>
            </div>
            <div>
              <span className={methodIcons[method]} />
              <Typography color="primary" variant="caption" display="block">
                {data.method}
              </Typography>
            </div>
            <div>
              <span className="fas fa-people-arrows" />
              <Typography color="primary" variant="caption" display="block">
                {data.total_km.toFixed(3)}
                <span>KM</span>
              </Typography>
            </div>
            <div>
              <span className="far fa-images" />
              <Typography color="primary" variant="caption" display="block">
                {points.length}
              </Typography>
            </div>
          </Box>
        </Grid>
        <Grid xs={3} item>
          <div className={classes.information}>
            {data.tags.map((tag: string) => (
              <Chip key={tag} label={tag} color="primary" />
            ))}
          </div>
          <Typography color="primary" variant="caption" display="block">
            <span>Captured:</span>
            {data.captured}
          </Typography>

          <Typography color="primary" variant="caption" display="block">
            <span>Created:</span>
            {data.created}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
