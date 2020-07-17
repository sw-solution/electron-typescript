import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

import Typography from '@material-ui/core/Typography';
import {
  Grid,
  Input,
  Button,
  Box,
  InputAdornment,
  FormControlLabel,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles } from '@material-ui/core/styles';

import {
  setSequenceCurrentStep,
  selPoints,
  setSequenceSmothPoints,
  setSequenceDiscardPoints,
} from './slice';

const useStyles = makeStyles({
  map: {
    height: '300px',
    overflow: 'hidden',
  },
});

export default function SequenceModifySpace() {
  const dispatch = useDispatch();
  const points = useSelector(selPoints);
  const classes = useStyles();
  const [meters, setMeters] = React.useState<string>('0');

  const resetMode = () => {
    dispatch(setSequenceCurrentStep('tags'));
  };

  const confirmMode = () => {
    dispatch(setSequenceCurrentStep('tags'));
  };

  const smoothMode = () => {
    const m = parseFloat(meters);
    if (m > 0) dispatch(setSequenceSmothPoints(parseFloat(meters)));
  };

  const removeMode = () => {
    const m = parseFloat(meters);
    if (m > 0) dispatch(setSequenceDiscardPoints(parseFloat(meters)));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMeters(event.target.value);
  };

  const centerPoint = () => {
    if (points.length) {
      const centerpoint = points[points.length / 2];
      return [centerpoint.GPSLatitude, centerpoint.GPSLongitude];
    }
    return [51.5, -0.09];
  };

  const meterInputElem = (
    <Input
      id="outlined-basic"
      endAdornment={<InputAdornment position="end">M</InputAdornment>}
      value={meters}
      onChange={handleChange}
    />
  );

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Modify GPS
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box mb={1}>
          <FormControlLabel
            value="start"
            control={meterInputElem}
            label="Meters"
            labelPlacement="start"
          />
        </Box>
        <Box mb={1}>
          <Box mr={1} display="inline-block">
            <Button onClick={smoothMode} variant="contained" size="small">
              Smooth outliers greater than meters
            </Button>
          </Box>
          <Button onClick={removeMode} variant="contained" size="small">
            Remove outliers greater than meters
          </Button>
        </Box>
        <Map zoom={18} center={centerPoint()} className={classes.map}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, idx) => {
            return (
              <Marker
                key={`marker-${idx.toString()}`}
                position={[point.GPSLatitude, point.GPSLongitude]}
              >
                <Popup>
                  <div
                    style={{
                      backgroundImage: `url(../${point.Image})`,
                      width: '200px',
                      height: '150px',
                      backgroundSize: '100% auto',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                  />
                </Popup>
              </Marker>
            );
          })}
        </Map>
      </Grid>
      <Grid item xs={12}>
        <Box mr={1} display="inline-block">
          <Button
            endIcon={<ChevronRightIcon />}
            color="secondary"
            onClick={resetMode}
            variant="contained"
          >
            Reset Mods
          </Button>
        </Box>
        <Button
          endIcon={<ChevronRightIcon />}
          color="primary"
          onClick={confirmMode}
          variant="contained"
        >
          Confirm Mods
        </Button>
      </Grid>
    </>
  );
}
