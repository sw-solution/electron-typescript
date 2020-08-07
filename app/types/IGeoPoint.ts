import dayjs, { Dayjs } from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export interface IGeoPointModel {
  id?: string;

  GPSDateTime: Dayjs | string;

  GPSLatitude?: number;

  GPSLongitude?: number;

  GPSAltitude?: number;

  Distance?: number;

  Image?: string;

  Pitch?: number;

  Azimuth?: number;

  origin_GPSDateTime?: string;

  origin_GPSLatitude?: number;

  origin_GPSLongitude?: number;

  origin_GPSAltitude?: number;

  origin_Pitch?: number;

  origin_Azimuth?: number;

  camera_make?: string;

  camera_model?: string;

  width: number;
  height: number;
}

export class IGeoPoint {
  id: string;

  GPSDateTime: Dayjs | string;

  GPSLatitude?: number;

  GPSLongitude?: number;

  GPSAltitude?: number;

  Distance?: number;

  Image?: string;

  Pitch?: number;

  Azimuth?: number;

  width: number;

  height: number;

  readonly origin_GPSDateTime?: string;

  readonly origin_GPSLatitude?: number;

  readonly origin_GPSLongitude?: number;

  readonly origin_GPSAltitude?: number;

  readonly origin_Pitch?: number;

  readonly origin_Azimuth?: number;

  readonly camera_make?: string;

  readonly camera_model?: string;

  constructor({
    id,
    GPSDateTime,
    GPSLatitude,
    GPSLongitude,
    GPSAltitude,
    Image,
    Pitch,
    Azimuth,
    Distance,

    origin_GPSDateTime,
    origin_GPSLatitude,
    origin_GPSLongitude,
    origin_GPSAltitude,
    origin_Pitch,
    origin_Azimuth,
    camera_make,
    camera_model,
    width,
    height,
  }: IGeoPointModel) {
    this.id = id || uuidv4();
    this.GPSDateTime = GPSDateTime;
    this.GPSLatitude = GPSLatitude;
    this.GPSLongitude = GPSLongitude;
    this.GPSAltitude = GPSAltitude;
    this.Image = Image;
    this.Pitch = Pitch;
    this.Azimuth = Azimuth;
    this.Distance = Distance;
    this.width = width;
    this.height = height;

    this.origin_GPSDateTime = origin_GPSDateTime;
    this.origin_GPSLatitude = origin_GPSLatitude;
    this.origin_GPSLongitude = origin_GPSLongitude;
    this.origin_GPSAltitude = origin_GPSAltitude;
    this.origin_Pitch = origin_Pitch;
    this.origin_Azimuth = origin_Azimuth;
    this.camera_make = camera_make;
    this.camera_model = camera_model;
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

  convertDateToStr() {
    this.GPSDateTime =
      typeof this.GPSDateTime !== 'string'
        ? this.GPSDateTime.format('YYYY-MM-DDTHH:mm:ss')
        : this.GPSDateTime;
  }

  convertStrToDate() {
    this.GPSDateTime =
      typeof this.GPSDateTime === 'string'
        ? dayjs(this.GPSDateTime)
        : this.GPSDateTime;
  }

  getDateStr() {
    return typeof this.GPSDateTime !== 'string'
      ? this.GPSDateTime.format('YYYY-MM-DDTHH:mm:ss')
      : this.GPSDateTime;
  }

  getDate() {
    return typeof this.GPSDateTime === 'string'
      ? dayjs(this.GPSDateTime)
      : this.GPSDateTime;
  }

  isGpsUpdated() {
    return (
      this.origin_GPSDateTime !== this.getDateStr() ||
      this.origin_GPSAltitude !== this.GPSAltitude ||
      this.origin_GPSLatitude !== this.GPSLatitude
    );
  }
}
