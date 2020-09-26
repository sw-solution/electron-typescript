import axios from 'axios';

import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import { BrowserWindow } from 'electron';
import dayjs from 'dayjs';
import Async from 'async';
import tokenStore from '../tokens';
import { IGeoPoint } from '../../types/IGeoPoint';
import { sendToClient } from '../utils';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    throw err;
  }
);

export const uploadImage = async (
  mainWindow: BrowserWindow,
  token: string,
  item: IGeoPoint,
  baseDirectory: string,
  messageChannelName: string,
  googlePlace?: string
) => {
  sendToClient(
    mainWindow,
    messageChannelName,
    `${item.Image} is uploading to Google Street View`
  );

  const urlres = await axios({
    url: `https://streetviewpublish.googleapis.com/v1/photo:startUpload?key=${process.env.GOOGLE_API_KEY}`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Length': 0,
    },
  });
  const uploadReference = urlres.data;
  const { uploadUrl } = uploadReference;
  const filepath = path.join(baseDirectory, item.Image);
  const data = fs.readFileSync(filepath);

  console.log(`Upload ${item.Image} to Google Street`);

  await axios({
    method: 'post',
    url: uploadUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    data,
  });

  console.log(`Update ${item.Image} to Google Street`);

  const metaData = {
    uploadReference,
    pose: {
      heading: item.Azimuth,
      altitude: item.MAPAltitude,
      pitch: item.Pitch,
      latLngPair: {
        latitude: item.MAPLatitude,
        longitude: item.MAPLongitude,
      },
    },
    captureTime: {
      seconds: Math.floor(dayjs(item.GPSDateTime).toDate().getTime() / 1000),
    },
  };

  if (googlePlace) {
    metaData.places = [
      {
        placeId: googlePlace,
      },
    ];
  }

  console.log('metaData: ', metaData);

  await axios({
    method: 'post',
    url: `https://streetviewpublish.googleapis.com/v1/photo?key=${process.env.GOOGLE_API_KEY}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: metaData,
  });
};

export const uploadImagesToGoogle = (
  mainWindow: BrowserWindow,
  points: IGeoPoint[],
  baseDirectory: string,
  messageChannelName: string,
  googlePlace?: string
) => {
  const token = tokenStore.getToken('google');

  return new Promise((resolve, reject) => {
    Async.eachOfLimit(
      points,
      1,
      (point: IGeoPoint, _key: any, cb: CallableFunction) => {
        uploadImage(
          mainWindow,
          token,
          point,
          baseDirectory,
          messageChannelName,
          googlePlace
        )
          // eslint-disable-next-line promise/no-callback-in-promise
          .then(() => cb(null))
          // eslint-disable-next-line promise/no-callback-in-promise
          .catch((err) => cb(err));
      },
      (err) => {
        if (!err) resolve();
        else reject(err);
      }
    );
  });
};
