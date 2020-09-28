import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import createReducer from './create/slice';
// eslint-disable-next-line import/no-cycle
import listReducer from './list/slice';
// eslint-disable-next-line import/no-cycle
import editReducer from './edit/slice';
// eslint-disable-next-line import/no-cycle
import baseReducer from './base/slice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    create: createReducer,
    list: listReducer,
    edit: editReducer,
    base: baseReducer,
  });
}
