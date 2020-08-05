import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import createReducer from './create/slice';
// eslint-disable-next-line import/no-cycle
import listReducer from './list/slice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    create: createReducer,
    list: listReducer,
  });
}
