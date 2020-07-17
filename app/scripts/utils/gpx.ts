import xml2js from 'xml2js';
import fs from 'fs';
import TrackPoint from '../../types/GPXTrackPoint';

export function parseTrack(arg) {
  const track = arg.trkseg[0].trkpt;
  return track
    .filter((t) => {
      return true ? t.time : false;
    })
    .map((t) => {
      const elevation = t.ele[0];
      const { lat, lon } = t.$;
      const timestamp = t.time[0];
      return new TrackPoint(elevation, lat, lon, timestamp);
    });
}

export function readGPX(dirpath: string, callback: CallableFunction) {
  fs.readFile(dirpath, (err: Error | null, data: string) => {
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
