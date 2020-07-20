import { Dayjs } from 'dayjs';

export interface IGeoPointModel {
  GPSDateTime?: Dayjs;

  GPSLatitude: number;

  GPSLongitude: number;

  GPSAltitude: number;

  Distance?: number;

  OriginalDate?: Dayjs;

  Image?: string;

  Pitch?: number;

  Azimuth?: number;
}

export class IGeoPoint {
  GPSDateTime?: Dayjs;

  GPSLatitude: number;

  GPSLongitude: number;

  GPSAltitude: number;

  OriginalDate?: Dayjs;

  Distance?: number;

  Image?: string;

  Pitch?: number;

  Azimuth?: number;

  constructor({
    GPSDateTime,
    GPSLatitude,
    GPSLongitude,
    GPSAltitude,
    OriginalDate,
    Image,
    Pitch,
    Azimuth,
    Distance,
  }: IGeoPointModel) {
    this.GPSDateTime = GPSDateTime;
    this.GPSLatitude = GPSLatitude;
    this.GPSLongitude = GPSLongitude;
    this.GPSAltitude = GPSAltitude;
    this.OriginalDate = OriginalDate;
    this.Image = Image;
    this.Pitch = Pitch;
    this.Azimuth = Azimuth;
    this.Distance = Distance;
  }

  setImage(imgpath: string) {
    this.Image = imgpath;
  }

  setPitch(pitch: number) {
    this.Pitch = pitch;
  }

  setAzimuth(azimuth: number) {
    this.Azimuth = azimuth;
  }

  setDistance(distance: number) {
    this.Distance = distance;
  }
}
