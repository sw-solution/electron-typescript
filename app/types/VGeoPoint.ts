export interface VGeoPointModel {
  GPSDateTime: string;

  SampleTime: number;

  MAPLatitude: number;

  MAPLongitude: number;

  MAPAltitude: number;
}

export class VGeoPoint {
  GPSDateTime: string;

  SampleTime: number;

  MAPLatitude: number;

  MAPLongitude: number;

  MAPAltitude: number;

  Image?: string;

  constructor({
    GPSDateTime,
    SampleTime,
    MAPLatitude,
    MAPLongitude,
    MAPAltitude,
  }: VGeoPointModel) {
    this.SampleTime = SampleTime;
    this.GPSDateTime = GPSDateTime;
    this.MAPLatitude = MAPLatitude;
    this.MAPLongitude = MAPLongitude;
    this.MAPAltitude = MAPAltitude;
  }

  setImage(imgpath: string) {
    this.Image = imgpath;
  }
}
