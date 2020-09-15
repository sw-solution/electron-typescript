import axios from 'axios';
import qs from 'qs';
import { Sequence, Summary } from '../../types/Result';
import axiosErrorHandler from '../utils/axios';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    throw err;
  }
);

export const postSequence = async (
  sequence: Sequence | Summary,
  token: string
) => {
  const data = sequence.uploader_sequence_name
    ? {
        name: sequence.uploader_sequence_name,
        description: sequence.uploader_sequence_description,
        transport_type: sequence.uploader_transport_method,
        tag: sequence.uploader_tags.join(','),
      }
    : {
        name: sequence.name,
        description: sequence.description,
        transport_type: sequence.method,
        tag: sequence.tags.join(','),
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

export const updateSequence = async (
  seqId: string,
  mtpwToken: string,
  seqKey: string,
  mapillaryToken: string
) => {
  const data = {
    token: mapillaryToken,
    seq_key: seqKey,
  };

  const config = {
    method: 'put',
    url: `${process.env.MTP_WEB_URL}/api/v1/sequence/import/${seqId}/`,
    headers: {
      Authorization: `Bearer ${mtpwToken}`,
    },
    data: qs.stringify(data),
  };

  try {
    await axios(config);
    return {};
  } catch (error) {
    return {
      seqError: axiosErrorHandler(error, 'MTPWImportSequence'),
    };
  }
};

export default postSequence;
