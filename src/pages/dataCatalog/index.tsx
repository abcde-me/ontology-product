import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const routes = require('../admin/route').routes || [];

export default function DataAsset() {
  return (
    <Switch>
      <Redirect
        exact
        from="/tenant/compute/modaforge/dataCatalog"
        to="/tenant/compute/modaforge/dataCatalog/list"
      />
      {routes
        .find((route) => route.name === 'dataCatalog')
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
  );
}
