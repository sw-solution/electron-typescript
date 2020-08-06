import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReactMapboxGl, { Marker } from 'react-mapbox-gl';
import Modal from '@material-ui/core/Modal';
import ReactPannellum from 'react-pannellum';
import { makeStyles } from '@material-ui/core/styles';
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
    console.log('showPhoto: ', idx);
    setState({
      isopen: true,
      selected: idx,
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

  const currentImagePath = state.selected >= 0 ? getpath(state.selected) : null;

  const modalBody = (
    <div className={classes.paper}>
      {currentImagePath && (
        <ReactPannellum
          style={{ width: 200, height: 150 }}
          imageSource={currentImagePath}
          id={`image_${state.selected}`}
          sceneId={state.selected.toString()}
          config={{
            autoLoad: true,
          }}
        />
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
