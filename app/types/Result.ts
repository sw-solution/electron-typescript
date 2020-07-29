export interface Sequence {
  id: string;
  distance_km: number;
  earliest_time: string;
  latest_time: string;
  durationsec: number;
  average_speed_kmh: number;
  uploader_sequence_name: string;
  uploader_sequence_description: string;
  uploader_transport_type: string;
  uploader_transport_method: string;
  uploader_tags: string;
  created: string;
}

export interface Connection {
  distance_mtrs: number;
  heading_deg: number;
  pitch_deg: number;
  time_sec: number;
  speed_kmh: number;
}

export interface Connections {
  [key: string]: Connection;
}

export interface Photo {
  id: string;
  cli_frame_rate_set: '';
  original_GPSDateTime?: string;
  original_altitude?: number;
  original_latitude?: number;
  original_longitude?: number;
  software_version: number;

  uploader_photo_from_video: boolean;
  uploader_nadir_added: boolean;
  uploader_blur_added: boolean;
  uploader_gps_modified: boolean;

  connections: Connections;
}

export interface Photos {
  [key: string]: Photo;
}

export interface Result {
  sequence: Sequence;
  photo: Photos;
}

export interface Description {
  photo: Photo;
  sequence: Sequence;
}

export interface Descriptions {
  [key: string]: Description;
}
