import React, { Suspense, lazy } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useParams
} from 'react-router-dom';
import { Spin } from '@arco-design/web-react';

// 懒加载子组件
const OntologySceneLinksList = lazy(() => import('./list'));
const OntologySceneLinksCreate = lazy(() => import('./create'));
const OntologySceneLinksEdit = lazy(() => import('./edit'));

// 对象类型
export default function OntologySceneObjectType() {
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
        <Redirect exact from={match.path} to={`${match.url}/list`} />
        <Route path={`${match.path}/list`} component={OntologySceneLinksList} />
        <Route
          path={`${match.path}/create`}
          component={OntologySceneLinksCreate}
        />
        <Route
          path={`${match.path}/edit/:linkId`}
          component={OntologySceneLinksEdit}
        />
      </Switch>
    </Suspense>
  );
}
