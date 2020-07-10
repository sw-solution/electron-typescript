import { combineReducers } from 'redux';
// eslint-disable-next-line import/no-cycle
import nameReducer from './Name/slice';
// eslint-disable-next-line import/no-cycle
import descriptionReducer from './Description/slice';
// eslint-disable-next-line import/no-cycle
import typeReducer from './Type/slice';
// eslint-disable-next-line import/no-cycle
import methodReducer from './Method/slice';
// eslint-disable-next-line import/no-cycle
import cameraReducer from './Camera/slice';
// eslint-disable-next-line import/no-cycle
import attachTypeReducer from './AttachType/slice';

export default function createSequenceReducer() {
  return combineReducers({
    name: nameReducer,
    description: descriptionReducer,
    type: typeReducer,
    method: methodReducer,
    camera: cameraReducer,
    attachType: attachTypeReducer,
  });
}
