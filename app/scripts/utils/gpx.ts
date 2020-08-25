import xml2js from 'xml2js';
import fs from 'fs';
import TrackPoint from '../../types/GPXTrackPoint';

export function parseTrack(arg: any) {
  const track = arg.trkseg[0].trkpt;
  return track
    .filter((t: any) => {
      return !!t.time;
    })
    .reduce((obj: any, current: any) => {
      const elevation = current.ele[0];
      const { lat, lon } = current.$;
      const timestamp = current.time[0].replace('Z', '');
      obj[timestamp] = new TrackPoint(elevation, lat, lon, timestamp);
      return obj;
    }, {});
}

export function readGPX(dirpath: string, callback: CallableFunction) {
  fs.readFile(dirpath, (err: any, data: string) => {
    if (err) {
      callback(err);
    }
    const parser = new xml2js.Parser();
    parser.parseString(data, (err, xml) => {
      if (err) {
        callback(err);
      }
      callback(null, parseTrack(xml.gpx.trk[0]));
    });
  });
}
