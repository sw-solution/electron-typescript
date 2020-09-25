import axios from 'axios';
import qs from 'qs';
import fs from 'fs';
import { Sequence, Result, Summary } from '../../types/Result';
import axiosErrorHandler from '../utils/axios';
import { createdData2List, getSequenceLogPath } from '../utils';
import { findSequences } from './mapillary';
import tokenStore from '../tokens';
import { findActivityAPI, getStravaToken, updateActivityAPI } from './strava';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    throw err;
  }
);

export const postSequenceAPI = async (sequence: Sequence, token: string) => {
  const data = {
    name: sequence.uploader_sequence_name,
    description: sequence.uploader_sequence_description,
    transport_type: sequence.uploader_transport_method,
    tag: sequence.uploader_tags.join(','),
    source: 'mtpdu',
  };
  const config = {
    method: 'post',
    url: `${process.env.MTP_WEB_URL}/api/v1/sequence/create/`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: qs.stringify(data),
  };

  try {
    const res = await axios(config);
    if (res.data.error) {
      return {
        mtpwError: `MTPWCreateSequence: ${res.data.error}`,
      };
    }
    return {
      mtpwSequence: res.data,
    };
  } catch (error) {
    return {
      mtpwError: axiosErrorHandler(error, 'MTPWCreateSequence'),
    };
  }
};

export const updateSequenceDataAPI = async (seqId: string, data: any) => {
  const mtpwToken = tokenStore.getToken('mtp');
  const config = {
    method: 'put',
    url: `${process.env.MTP_WEB_URL}/api/v1/sequence/import/${seqId}/`,
    headers: {
      Authorization: `Bearer ${mtpwToken}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  };

  try {
    const res = await axios(config);
    if (res.data.error) {
      return {
        seqError: `MTPWImportSequence: ${res.data.error}`,
      };
    }
    return {};
  } catch (error) {
    return {
      seqError: axiosErrorHandler(error, 'MTPWImportSequence'),
    };
  }
};

export const updateSequence = async (
  s: Result,
  basepath: string
): Promise<Summary> => {
  const mapillaryToken = tokenStore.getToken('mapillary');
  const stravaToken = tokenStore.getToken('strava');
  const summary = createdData2List(s);
  const { destination } = s.sequence;
  let updated = false;

  if (
    destination &&
    typeof destination.mapillary === 'string' &&
    destination.mapillary !== '' &&
    !destination.mapillary.startsWith('Error') &&
    mapillaryToken
  ) {
    updated = true;
    const { error, data } = await findSequences(
      mapillaryToken,
      destination.mapillary,
      s.photo
    );
    if (data && destination.mtp && typeof destination.mtp === 'string') {
      const { seqError } = await updateSequenceDataAPI(destination.mtp, {
        mapillary_user_token: mapillaryToken,
        mapillary_sequence_key: data,
      });

      if (seqError) {
        summary.destination.mtp = `Error: ${seqError}`;
        s.sequence.destination.mtp = `Error: ${seqError}`;
      } else {
        summary.destination.mapillary = true;
        s.sequence.destination.mapillary = true;
      }
    } else if (error) {
      summary.destination.mapillary = `Error: ${error}`;
      s.sequence.destination.mapillary = `Error: ${error}`;
    }
  }

  if (
    destination &&
    typeof destination.strava === 'string' &&
    destination.strava !== '' &&
    !destination.strava.startsWith('Error') &&
    stravaToken
  ) {
    updated = true;

    const newStravaToken = await getStravaToken(
      tokenStore.getRefreshToken('strava')
    );

    if (newStravaToken.error) {
      summary.destination.strava = `Error: ${newStravaToken.error}`;
      s.sequence.destination.strava = `Error: ${newStravaToken.error}`;
    } else if (newStravaToken.data) {
      tokenStore.set('strava', { waiting: false, token: newStravaToken.data });

      const stravaActivity = await findActivityAPI(
        destination.strava,
        newStravaToken.data.access_token
      );
      if (stravaActivity.error) {
        s.sequence.destination.strava = `Error: ${stravaActivity.error}`;
      } else if (
        stravaActivity.data &&
        stravaActivity.data.activity_id &&
        typeof destination.mtp === 'string' &&
        destination.mtp !== ''
      ) {
        const updateActivity = await updateActivityAPI(
          s.sequence.uploader_transport_type,
          stravaActivity.data.activity_id,
          stravaToken
        );

        if (updateActivity.error) {
          summary.destination.strava = `Error: ${updateActivity.error}`;
          s.sequence.destination.strava = `Error: ${updateActivity.error}`;
        } else {
          const { seqError } = await updateSequenceDataAPI(destination.mtp, {
            strava: true,
          });

          if (seqError) {
            summary.destination.mtp = `Error: ${seqError}`;
            s.sequence.destination.mtp = `Error: ${seqError}`;
          }

          summary.destination.strava = true;
          s.sequence.destination.strava = true;
        }
      }
    }
  }

  if (
    typeof summary.destination.strava === 'boolean' &&
    typeof summary.destination.mapillary === 'boolean' &&
    summary.destination.strava &&
    summary.destination.strava
  ) {
    updated = true;
    summary.destination.mtp = true;
    s.sequence.destination.mtp = true;
  }

  if (updated) {
    fs.writeFileSync(
      getSequenceLogPath(s.sequence.uploader_sequence_name, basepath),
      JSON.stringify(s)
    );
  }

  return summary;
};

export default postSequenceAPI;
