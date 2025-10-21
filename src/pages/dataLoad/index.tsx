import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const routes = require('../admin/route').routes || [];
export default function DataLoad() {
  return (
    <div
      style={{
        height: 'calc(100% - 30px)',
        borderRadius: '10px',
        margin: '20px 20px 20px 0'
      }}
    >
      <Switch>
        <Redirect
          exact
          from="/tenant/compute/modaforge/dataLoad"
          to="/tenant/compute/modaforge/dataLoad/list"
        />
        {routes
          .find((route) => route.name === 'dataLoad')
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
    </div>
  );
}
