import { BrowserWindow } from 'electron';
import { IGeoPoint } from '../../types/IGeoPoint';
import { Result } from '../../types/Result';
import { Session } from '../../types/Session';
import tokenStore from '../tokens';
import axiosErrorHandler from '../utils/axios';
import { updateSequenceDataAPI, postSequenceAPI } from './mtpw';

import {
  loadMapillarySessionData,
  publishSession,
  uploadImagesMapillary,
} from './mapillary';
import { uploadImagesToGoogle } from './google';

export const getError = (error: any) => {
  return {
    error,
  };
};

export default async (
  mainWindow: BrowserWindow,
  settings: any,
  resultjson: Result,
  points: IGeoPoint[],
  baseDirectory: string,
  messageChannelName: string,
  googlePlace?: string
) => {
  const mapillaryToken = tokenStore.getValue('mapillary');
  const mtpwToken = tokenStore.getValue('mtp');
  const googleToken = tokenStore.getValue('google');

  const { mapillary, mtp, google } = settings;

  if (!mtp || !mtpwToken) return { result: resultjson };

  let mapillarySessionData = null;

  if (mapillary && mapillaryToken) {
    const sessionData: Session = await loadMapillarySessionData(mapillaryToken);
    if (sessionData.error) {
      return getError(sessionData.error);
    }
    if (sessionData.data) {
      mapillarySessionData = sessionData.data;
    }
  }

  if (mapillarySessionData) {
    try {
      await uploadImagesMapillary(
        mainWindow,
        points,
        baseDirectory,
        mapillarySessionData,
        messageChannelName
      );
    } catch (e) {
      return getError(axiosErrorHandler(e, 'MapillaryUploadingImage'));
    }
    const mapillarySessionKey = mapillarySessionData.key;

    const publishSessionData = await publishSession(
      mapillaryToken,
      mapillarySessionData.key
    );
    if (publishSessionData.error) {
      return getError(publishSessionData.error);
    }
    resultjson.sequence.destination.mapillary = mapillarySessionKey;
    resultjson.sequence.destination.mapillary_user_token = mapillaryToken;
  }

  if (google && googleToken) {
    try {
      await uploadImagesToGoogle(
        mainWindow,
        points,
        baseDirectory,
        messageChannelName,
        googlePlace
      );
      resultjson.sequence.destination.google = true;
    } catch (error) {
      return getError(axiosErrorHandler(error, 'GoolgeUploadImages'));
    }
  }

  if (Object.keys(resultjson.sequence.destination).length) {
    const { mtpwSequence, mtpwError } = await postSequenceAPI(
      resultjson.sequence,
      mtpwToken
    );

    const mtpwId = mtpwSequence.unique_id;

    if (mtpwError) {
      return getError(mtpwError);
    }

    const updateSequenceData: { [key: string]: boolean } = {};

    if (google && googleToken) {
      updateSequenceData.google_street_view = true;
    }

    if (Object.keys(updateSequenceData).length) {
      const { seqError } = await updateSequenceDataAPI(mtpwId, {
        google_street_view: true,
      });

      if (seqError) {
        return getError(seqError);
      }
    }

    resultjson.sequence.destination.mtp = mtpwId;
    resultjson.sequence.destination.mtpw_user_token = mtpwToken;
  }

  return { result: resultjson };
};
