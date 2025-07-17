import { Breadcrumb } from '@arco-design/web-react';
import { IconHome } from '@arco-design/web-react/icon';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
const BreadcrumbItem = Breadcrumb.Item;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const routes = require('../admin/route').routes || [];
export default function DataLoad() {
  return (
    <div
      style={{
        height: 'calc(100% - 30px)',
        // backgroundColor: '#fff',
        borderRadius: '10px',
        margin: '10px',
        overflowY: 'auto'
      }}
    >
      <Switch>
        <Redirect
          exact
          from="/tenant/compute/modaforge/dataLoad"
          to="/tenant/compute/modaforge/dataLoad/list"
        />
        {routes[2].children.map((route) => {
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
