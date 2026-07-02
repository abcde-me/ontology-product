import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { GlobalTooltip } from '@ceai-front/arco-material';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const routes = require('../admin/route').routes || [];

export default function DataAsset() {
  return (
    <>
      <Switch>
        <Redirect
          exact
          from="/tenant/compute/onto/ontologyScene"
          to="/tenant/compute/onto/ontologyScene/list"
        />
        {routes
          .find((route) => route.name === 'ontologyScene')
          ?.children?.map((route) => {
            return (
              <Route
                key={route.key}
                path={route.key}
                component={route.component}
              />
            );
          })}
      </Switch>
    </>
  );
}
