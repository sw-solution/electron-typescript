import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export interface IGeoPointModel {
  id?: string;

  GPSDateTime?: string;

  DateTimeOriginal: string;

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

  width?: number;
  height?: number;

  tags?: any;
}

export class IGeoPoint {
  id: string;

  public GPSDateTime?: string;

  public DateTimeOriginal: string;

  public MAPLatitude?: number;

  public MAPLongitude?: number;

  public MAPAltitude?: number;

  public Distance?: number;

  Image?: string;

  public Pitch?: number;

  public Azimuth?: number;

  public equirectangular: boolean;

  width?: number;

  height?: number;

  readonly camera_make?: string;

  readonly camera_model?: string;

  readonly tags?: any;

  constructor({
    id,
    GPSDateTime,
    DateTimeOriginal,
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
    tags,
  }: IGeoPointModel) {
    this.id = id || uuidv4();
    this.GPSDateTime = GPSDateTime;
    this.DateTimeOriginal = DateTimeOriginal;
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
    this.tags = tags;
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

  getDate() {
    return dayjs(this.GPSDateTime);
  }

  getDateOriginal() {
    return dayjs(this.DateTimeOriginal);
  }
}
