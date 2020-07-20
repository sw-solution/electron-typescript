import { BrowserWindow } from 'electron';
import dayjs from 'dayjs';
import { IGeoPoint } from '../../types/IGeoPoint';

export function sendToClient(
  win: BrowserWindow,
  channelname: string,
  ...args: any[]
) {
  // eslint-disable-next-line global-require

  win.webContents.send(channelname, ...args);
}

export function sendPoints(win: BrowserWindow, points: IGeoPoint[]) {
  sendToClient(
    win,
    'set-points',
    points.map((item: IGeoPoint) => ({
      GPSDateTime: item.GPSDateTime
        ? item.GPSDateTime.format('YYYY-MM-DDTHH:mm:ss')
        : '',
      OriginalDate: item.OriginalDate
        ? item.OriginalDate.format('YYYY-MM-DDTHH:mm:ss')
        : '',
      GPSLongitude: item.GPSLongitude,
      GPSLatitude: item.GPSLatitude,
      GPSAltitude: item.GPSAltitude,
      Distance: item.Distance,
      Azimuth: item.Azimuth,
      Pitch: item.Pitch,
      Image: item.Image,
    }))
  );
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function getDistance(point1: any, point2: any) {
  if (!point1 || !point2) {
    return 0;
  }
  const lat2 = point2.GPSLatitude;
  const lon2 = point2.GPSLongitude;
  const lat1 = point1.GPSLatitude;
  const lon1 = point1.GPSLongitude;
  const R = 6371 * 1000; // Radius of the earth in meter
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export function createdData2List(data: any) {
  return {
    tags: data.steps.tags,
    name: data.steps.name,
    description: data.steps.description,
    type: data.steps.type,
    method: data.steps.method,
    points: data.points,
    total_km: 0.2,
    created: data.created,
    captured: dayjs(data.steps.startTime).format('YYYY-MM-DD'),
  };
}

export function getBearing(point1: IGeoPoint, point2: IGeoPoint) {
  const lng1 = point1.GPSLongitude;
  const lat1 = point1.GPSLatitude;
  const lng2 = point2.GPSLongitude;
  const lat2 = point2.GPSLatitude;

  const dLon = lng2 - lng1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = deg2rad(Math.atan2(y, x));
  return 360 - ((brng + 360) % 360);
}
