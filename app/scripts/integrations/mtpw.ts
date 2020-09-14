import axios from 'axios';
import qs from 'qs';
import { Sequence } from '../../types/Result';

export const postSequence = async (sequence: Sequence, token: string) => {
  const data = {
    name: sequence.uploader_sequence_name,
    description: sequence.uploader_sequence_description,
    transport_type: sequence.uploader_transport_type,
    tag: sequence.uploader_tags.join(','),
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
    return {
      mtpwSequence: res.data,
    };
  } catch (error) {
    return {
      mtpwError: error,
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
    console.log('PUT ERROR:', error);
    return {
      seqError: error,
    };
  }
};

export default postSequence;
