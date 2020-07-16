import { Dayjs } from 'dayjs';

export interface VGeoPointModel {
  GPSDateTime: Dayjs;

  SampleTime: number;

  GPSLatitude: number;

  GPSLongitude: number;

  GPSAltitude: number;
}

export class VGeoPoint {
  GPSDateTime: Dayjs;

  SampleTime: number;

  GPSLatitude: number;

  GPSLongitude: number;

  GPSAltitude: number;

  Image?: string;

  constructor({
    GPSDateTime,
    SampleTime,
    GPSLatitude,
    GPSLongitude,
    GPSAltitude,
  }: VGeoPointModel) {
    this.SampleTime = SampleTime;
    this.GPSDateTime = GPSDateTime;
    this.GPSLatitude = GPSLatitude;
    this.GPSLongitude = GPSLongitude;
    this.GPSAltitude = GPSAltitude;
  }

  setImage(imgpath: string) {
    this.Image = imgpath;
  }
}
