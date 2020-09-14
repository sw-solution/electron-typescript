import axios from 'axios';
import axiosRetry from 'axios-retry';
import FormData from 'form-data';
import fs from 'fs';

import { Session } from '../../types/Session';
import { Photos } from '../../types/Result';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log(err.response.data);
    throw new Error(JSON.stringify(err.response.data));
  }
);

export const loadMapillarySessionData = async (
  token: string
): Promise<Session> => {
  try {
    let sessoinDataData = await axios.post(
      `https://a.mapillary.com/v3/me/uploads?client_id=${process.env.MAPILLARY_APP_ID}`,
      {
        type: 'images/sequence',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    sessoinDataData = sessoinDataData.data;
    if (sessoinDataData.error) {
      return {
        error: sessoinDataData.error,
      };
    }
    return {
      data: sessoinDataData,
    };
  } catch (e) {
    return {
      error: e,
    };
  }
};

export const publishSession = async (
  token: string,
  sessionKey: string
): Promise<any> => {
  try {
    const publishConfig = {
      method: 'put',
      url: `https://a.mapillary.com/v3/me/uploads/${sessionKey}/closed?client_id=${process.env.MAPILLARY_APP_ID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    await axios(publishConfig);
    return {};
  } catch (error) {
    return {
      error,
    };
  }
};

export const uploadImage = (
  filepath: string,
  filename: string,
  sessoinData: any
) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    Object.keys(sessoinData.fields).forEach((k: string) => {
      formData.append(k, sessoinData.fields[k]);
    });

    formData.append('key', `${sessoinData.key_prefix}${filename}`);

    formData.append('file', fs.createReadStream(filepath), {
      filename,
    });

    formData.getLength((err, length: number) => {
      console.log(`getting length of ${filename}: ${length}`);
      if (err) return reject(err);

      const config = {
        method: 'post',
        url: sessoinData.url,
        headers: {
          ...formData.getHeaders(),
          'Content-Length': length,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        data: formData,
      };

      axiosRetry(axios, { retries: 3 });
      // eslint-disable-next-line promise/no-promise-in-callback
      axios(config)
        .then(() => resolve())
        .catch((err: any) => reject(err));
    });
  });
};

export const getUser = async (token: string) => {
  const userRes = await axios.get(
    `https://a.mapillary.com/v3/me?client_id=${process.env.MAPILLARY_APP_ID}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return userRes.data;
};

export const getUploadedSessions = async (
  token: string,
  sessionKey: string
) => {
  const sessionsRes = await axios.get(
    `https://a.mapillary.com/v3/me/uploads?client_id=${process.env.MAPILLARY_APP_ID}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  sessionsRes.data.forEach((s: any) => {
    if (s.key === sessionKey) {
      if (s.error) {
        return s.error.reason;
      }
    }
  });

  return null;
};

export const findSequences = async (
  token: string,
  sessionKey: string,
  photos: Photos
) => {
  try {
    const points = Object.values(photos);
    const user = await getUser(token);
    const uploadeSessions = await getUploadedSessions(token, sessionKey);

    if (uploadeSessions) {
      return {
        error: uploadeSessions,
      };
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const mapillarySequenceRes = await axios.get(
      `https://a.mapillary.com/v3/sequences?userkeys=${user.key}&client_id=${process.env.MAPILLARY_APP_ID}&start_time=${startPoint.modified.GPSDateTime}&end_time=${endPoint.modified.GPSDateTime}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (mapillarySequenceRes.data.features.length) {
      return {
        data: true,
      };
    }
    return {};
  } catch (e) {
    return { error: e };
  }
};
