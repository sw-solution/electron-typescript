/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import CreatePageWrapper from './containers/Sequence/Create';
import NamePage from './containers/Sequence/Name';
import DescriptionPage from './containers/Sequence/Description';
import TypePage from './containers/Sequence/Type';
import MethodPage from './containers/Sequence/Method';
import CameraPage from './containers/Sequence/Camera';
import AttachTypePage from './containers/Sequence/AttachType';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route
          path={routes.CREATE.DESCRIPTION}
          render={(matchedProps) => (
            <CreatePageWrapper {...matchedProps}>
              <DescriptionPage />
            </CreatePageWrapper>
          )}
        />
        <Route
          path={routes.CREATE.TYPE}
          render={(matchedProps) => (
            <CreatePageWrapper {...matchedProps}>
              <TypePage />
            </CreatePageWrapper>
          )}
        />
        <Route
          path={routes.CREATE.METHOD}
          render={(matchedProps) => (
            <CreatePageWrapper {...matchedProps}>
              <MethodPage />
            </CreatePageWrapper>
          )}
        />
        <Route
          path={routes.CREATE.CAMERA}
          render={(matchedProps) => (
            <CreatePageWrapper {...matchedProps}>
              <CameraPage />
            </CreatePageWrapper>
          )}
        />
        <Route
          path={routes.CREATE.ATTACH_TYPE}
          render={(matchedProps) => (
            <CreatePageWrapper {...matchedProps}>
              <AttachTypePage />
            </CreatePageWrapper>
          )}
        />
        <Route
          path={routes.CREATE.NAME}
          render={(matchedProps) => (
            <CreatePageWrapper {...matchedProps}>
              <NamePage />
            </CreatePageWrapper>
          )}
        />
      </Switch>
    </App>
  );
}
