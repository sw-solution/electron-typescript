/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import CratePage from './containers/Sequence/Create';
import ListPage from './containers/Sequence/List';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.CREATE} component={CratePage} />
        <Route path={routes.LIST} component={ListPage} />
      </Switch>
    </App>
  );
}
