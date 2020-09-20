import axios from 'axios';
import qs from 'qs';
import { Sequence } from '../../types/Result';
import axiosErrorHandler from '../utils/axios';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    throw err;
  }
);

export const postSequence = async (sequence: Sequence, token: string) => {
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

export const updateSequence = async (
  seqId: string,
  mtpwToken: string,
  seqKey: string,
  mapillaryToken: string
) => {
  const data = {
    mapillary_user_token: mapillaryToken,
    mapillary_sequence_key: seqKey,
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
    const res = await axios(config);
    console.log('res.data: ', res.data);
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

export default postSequence;
