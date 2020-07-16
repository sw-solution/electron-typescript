import { Dayjs } from 'dayjs';

export interface IGeoPointModel {
  GPSDateTime: Dayjs;

  GPSLatitude: number;

  GPSLongitude: number;

  Image?: string;
}

export class IGeoPoint {
  GPSDateTime: Dayjs;

  GPSLatitude: number;

  GPSLongitude: number;

  Image?: string;

  constructor({
    GPSDateTime,
    GPSLatitude,
    GPSLongitude,
    Image,
  }: IGeoPointModel) {
    this.GPSDateTime = GPSDateTime;
    this.GPSLatitude = GPSLatitude;
    this.GPSLongitude = GPSLongitude;
    this.Image = Image;
  }

  setImage(imgpath: string) {
    this.Image = imgpath;
  }
}
