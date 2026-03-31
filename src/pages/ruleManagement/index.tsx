import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Spin } from '@arco-design/web-react';

const RuleListPage = lazy(() => import('./pages/list'));
const RuleCreatePage = lazy(() => import('./pages/createRule'));
const RuleEditPage = lazy(() => import('./pages/editRule'));

const RuleManagement = () => {
  const match = useRouteMatch();

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spin />
        </div>
      }
    >
      <Switch>
        <Redirect exact from={match.path} to={`${match.path}/list`} />
        <Route path={`${match.path}/list`} component={RuleListPage} />
        <Route path={`${match.path}/info/create`} component={RuleCreatePage} />
        <Route path={`${match.path}/info/edit/:id`} component={RuleEditPage} />
      </Switch>
    </Suspense>
  );
};

export default RuleManagement;
