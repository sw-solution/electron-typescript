export default class TrackPoint {
  public elevation: number;

  public latitude: number;

  public longitude: number;

  public timestamp: string;

  public heartrate: any;

  public cadence: any;

  constructor(
    el: string | null,
    lat: string | null,
    lng: string | null,
    time: string
  ) {
    this.elevation = el ? parseFloat(el) : 0;
    this.latitude = lat ? parseFloat(lat) : 0;
    this.longitude = lng ? parseFloat(lng) : 0;
    this.timestamp = time;
  }
}
