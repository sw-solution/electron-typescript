import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReactMapboxGl, { Marker } from 'react-mapbox-gl';
import { Modal, ButtonGroup, IconButton, Box } from '@material-ui/core';
import ReactPannellum from 'react-pannellum';
import { makeStyles } from '@material-ui/core/styles';

import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import { getImageBasePath } from '../scripts/utils';

import { IGeoPoint } from '../types/IGeoPoint';
import { selSequenceName } from '../create/slice';

const { remote } = window.require('electron');

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
  const name = useSelector(selSequenceName);
  const [state, setState] = useState<State>({
    isopen: false,
    selected: -1,
  });
  const classes = useStyles();
  const filteredpoints = points.filter(
    (point: IGeoPoint) => point.GPSLatitude && point.GPSLongitude
  );

  const centerPoint = () => {
    if (points.length) {
      const centerIdx = Math.floor(points.length / 2);
      const centerpoint = points[centerIdx];
      return [centerpoint.GPSLongitude, centerpoint.GPSLatitude];
    }
    return [51.5, -0.09];
  };

  const fitBounds = () => {
    return points.map((point) => {
      return [point.GPSLongitude, point.GPSLatitude];
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
    return getImageBasePath(
      remote.app,
      name,
      filteredpoints[idx.toString()].Image
    );
  };

  const MapBox = ReactMapboxGl({
    accessToken: process.env.MAPBOX_TOKEN || '',
  });

  const photos = filteredpoints.map((_point: IGeoPoint, idx: number) => (
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
  ));
  const modalBody = (
    <div className={classes.paper}>
      {state.selected >= 0 && (
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
          {photos[state.selected]}
        </>
      )}
    </div>
  );

  const markers = filteredpoints.map((point: IGeoPoint, idx: number) => {
    return (
      <Marker
        key={`marker-${idx.toString()}`}
        coordinates={[point.GPSLongitude || 0, point.GPSLatitude || 0]}
        anchor="center"
        onClick={showPhoto(idx)}
      >
        <div
          style={{
            borderBottom: 'solid 10px #3f51b5',
            borderLeft: 'solid 10px transparent',
            borderRight: 'solid 10px transparent',
            boxSizing: 'border-box',
            display: 'inline-block',
            height: '20px',
            width: '20px',
            transform: `rotate(${point.Azimuth}deg)`,
            cursor: 'pointer',
          }}
        />
      </Marker>
    );
  });
  return (
    <div>
      <MapBox
        style="mapbox://styles/mapbox/streets-v8"
        containerStyle={{
          height: `${height.toString()}px`,
        }}
        center={centerPoint()}
        fitBounds={fitBounds()}
      >
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
