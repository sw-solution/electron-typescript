import React from 'react';
import ReactMapboxGl, { Marker } from 'react-mapbox-gl';

import { IGeoPoint } from '../../types/IGeoPoint';

interface Props {
  points: IGeoPoint[];
  height?: number;
}

export default function Map(props: Props) {
  const { points, height } = props;

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

  const MapBox = ReactMapboxGl({
    accessToken: process.env.MAPBOX_TOKEN || '',
  });

  const markers = points.map((point: IGeoPoint, idx: number) => {
    return (
      <Marker
        key={`marker-${idx.toString()}`}
        coordinates={[point.GPSLongitude || 0, point.GPSLatitude || 0]}
        anchor="center"
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
          }}
        />
      </Marker>
    );
  });
  return (
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
  );
}

Map.defaultProps = {
  height: 350,
};
