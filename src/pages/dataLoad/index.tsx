import React from 'react';
import { routes } from '../admin/route';
import { Redirect, Route, Switch } from 'react-router';
export default function DataLoad() {
  return <div>
    <Switch>
      <Redirect
        exact
        from="/tenant/compute/modaforge/dataLoad"
        to="/tenant/compute/modaforge/dataLoad/list"
      />
      {routes[2].children.map((route) => {
        return <Route
          key={route.key}
          path={route.key}
          component={route.component}
        />
      })}
    </Switch>

  </div>;
}
