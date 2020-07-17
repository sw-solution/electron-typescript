import { BrowserWindow } from 'electron';
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
      GPSDateTime: item.GPSDateTime.format('YYYY-MM-DDTHH:mm:ss'),
      GPSLongitude: item.GPSLongitude,
      GPSLatitude: item.GPSLatitude,
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
