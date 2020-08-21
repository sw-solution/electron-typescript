import dayjs, { Dayjs } from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export interface IGeoPointModel {
  id?: string;

  GPSDateTime: Dayjs | string;

  MAPLatitude?: number;

  MAPLongitude?: number;

  MAPAltitude?: number;

  Distance?: number;

  Image?: string;

  Pitch?: number;

  Azimuth?: number;

  camera_make?: string;

  camera_model?: string;

  equirectangular: boolean;

  width: number;
  height: number;
}

export class IGeoPoint {
  id: string;

  public GPSDateTime: Dayjs | string;

  public MAPLatitude?: number;

  public MAPLongitude?: number;

  public MAPAltitude?: number;

  public Distance?: number;

  Image?: string;

  public Pitch?: number;

  public Azimuth?: number;

  public equirectangular: boolean;

  width: number;

  height: number;

  readonly camera_make?: string;

  readonly camera_model?: string;

  constructor({
    id,
    GPSDateTime,
    MAPLatitude,
    MAPLongitude,
    MAPAltitude,
    Image,
    Pitch,
    Azimuth,
    Distance,

    camera_make,
    camera_model,
    equirectangular,
    width,
    height,
  }: IGeoPointModel) {
    this.id = id || uuidv4();
    this.GPSDateTime = GPSDateTime;
    this.MAPLatitude = MAPLatitude;
    this.MAPLongitude = MAPLongitude;
    this.MAPAltitude = MAPAltitude;
    this.Image = Image;
    this.Pitch = Pitch;
    this.Azimuth = Azimuth;
    this.Distance = Distance;

    this.equirectangular = equirectangular;

    this.width = width;
    this.height = height;

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
}
