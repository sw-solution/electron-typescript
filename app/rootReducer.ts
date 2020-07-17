import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import counterReducer from './features/counter/counterSlice';
// eslint-disable-next-line import/no-cycle
import createReducer from './components/create/slice';
// eslint-disable-next-line import/no-cycle
import listReducer from './components/list/slice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter: counterReducer,
    create: createReducer,
    list: listReducer,
  });
}
