import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReactMapboxGl, { Marker, ZoomControl } from 'react-mapbox-gl';
import dayjs from 'dayjs';

import {
  Modal,
  ButtonGroup,
  IconButton,
  Box,
  Chip,
  Avatar,
} from '@material-ui/core';
import ReactPannellum from 'react-pannellum';
import { makeStyles } from '@material-ui/core/styles';

import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import Rotate90DegreesCcwIcon from '@material-ui/icons/Rotate90DegreesCcw';
import SpeedIcon from '@material-ui/icons/Speed';
import { getSequenceImagePath } from '../scripts/utils';

import { IGeoPoint } from '../types/IGeoPoint';
import { selSequenceName, selPoints } from '../create/slice';

import markerImg from '../assets/images/marker.svg';

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

interface Props {
  points: IGeoPoint[];
  showPopup?: boolean;
  height?: number;
}

interface State {
  isopen: boolean;
  selected: number;
}

export default function Map(props: Props) {
  const { points, height, showPopup } = props;
  const proppoints = useSelector(selPoints);
  const name = useSelector(selSequenceName);
  const [state, setState] = useState<State>({
    isopen: false,
    selected: -1,
  });

  const classes = useStyles();
  const filteredpoints = points.filter(
    (point: IGeoPoint) => point.MAPLatitude && point.MAPLongitude
  );

  console.log(filteredpoints.length);

  const centerPoint = () => {
    if (filteredpoints.length) {
      const centerIdx = Math.floor(filteredpoints.length / 2);
      const centerpoint = filteredpoints[centerIdx];
      return [centerpoint.MAPLongitude, centerpoint.MAPLatitude];
    }
    return [51.5, -0.09];
  };

  const fitBounds = () => {
    return (showPopup ? filteredpoints : proppoints)
      .filter((point) => point.MAPLatitude && point.MAPLongitude)
      .map((point) => {
        return [point.MAPLongitude, point.MAPLatitude];
      });
  };

  const showPhoto = (idx: number) => () => {
    setState({
      isopen: true,
      selected: idx,
    });
  };

  const nextImage = () => {
    setState({
      ...state,
      selected: (state.selected + 1) % filteredpoints.length,
    });
  };

  const prevImage = () => {
    setState({
      ...state,
      selected:
        (filteredpoints.length + state.selected - 1) % filteredpoints.length,
    });
  };

  const handleClose = () => {
    setState({
      isopen: false,
      selected: -1,
    });
  };

  const getpath = (idx: number) => {
    return getSequenceImagePath(name, filteredpoints[idx.toString()].Image);
  };

  const MapBox = ReactMapboxGl({
    accessToken: process.env.MAPBOX_TOKEN || '',
  });

  let photos = [];

  if (showPopup && name) {
    photos = filteredpoints.map((point: IGeoPoint, idx: number) => {
      let difftime = 0;
      if (idx < filteredpoints.length - 1) {
        difftime = dayjs(filteredpoints[idx + 1].GPSDateTime).diff(
          dayjs(point.GPSDateTime),
          'second'
        );
      }
      return (
        <>
          <div style={{ marginBottom: '5px' }}>
            <Chip
              avatar={<Avatar>M</Avatar>}
              color="primary"
              label={point.Distance ? point.Distance.toFixed(2) : 0}
            />
            <Chip
              icon={<Rotate90DegreesCcwIcon />}
              color="secondary"
              label={point.Azimuth ? point.Azimuth.toFixed(2) : 0}
            />
            <Chip icon={<SpeedIcon />} color="primary" label={difftime} />
            <Chip icon={<SpeedIcon />} label={idx + 1} />
          </div>
          <ReactPannellum
            key={idx}
            style={{ width: '100%', height: 250 }}
            imageSource={getpath(idx)}
            id={`image_${idx.toString()}`}
            sceneId={idx.toString()}
            config={{
              autoLoad: true,
            }}
          />
        </>
      );
    });
  }

  const modalBody = (
    <div className={classes.paper}>
      {state.selected >= 0 && photos.length && (
        <>
          <Box mb={1}>
            <ButtonGroup>
              <IconButton onClick={prevImage}>
                <ChevronLeftRoundedIcon />
              </IconButton>
              <IconButton onClick={nextImage}>
                <ChevronRightRoundedIcon />
              </IconButton>
            </ButtonGroup>
          </Box>
          <Box>{photos[state.selected]}</Box>
        </>
      )}
    </div>
  );

  const markers = filteredpoints.map((point: IGeoPoint, idx: number) => {
    return (
      <Marker
        key={`marker-${idx.toString()}`}
        coordinates={[point.MAPLongitude || 0, point.MAPLatitude || 0]}
        anchor="center"
        onClick={showPhoto(idx)}
      >
        <div
          style={{
            backgroundImage: `url(${markerImg})`,
            backgroundSize: '100% 100%',
            height: '20px',
            width: '20px',
            transform: `rotate(${point.Azimuth}deg)`,
            cursor: 'pointer',
          }}
        />
      </Marker>
    );
  });

  console.log('Markers Length: ', markers.length);

  const drawLines = (map) => {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: filteredpoints.map((point) => {
              return [point.MAPLongitude, point.MAPLatitude];
            }),
          },
        },
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#28a745',
        'line-width': 2,
      },
    });
  };

  return (
    <div>
      <MapBox
        style="mapbox://styles/mapbox/streets-v9"
        containerStyle={{
          height: `${height.toString()}px`,
          width: '100%',
        }}
        center={centerPoint()}
        fitBounds={fitBounds()}
        onStyleLoad={drawLines}
      >
        <ZoomControl />
        {markers}
      </MapBox>
      {state.selected >= 0 && showPopup && (
        <Modal open={state.isopen} onClose={handleClose}>
          {modalBody}
        </Modal>
      )}
    </div>
  );
}

Map.defaultProps = {
  height: 350,
  showPopup: true,
};
