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
