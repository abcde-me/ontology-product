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
const OntologySceneObjectTypeList = lazy(() => import('./list'));
const OntologySceneObjectTypeCreate = lazy(() => import('./create'));

// 对象类型
export default function OntologySceneObjectType() {
  const match = useRouteMatch();
  const { id } = useParams<{ id: string }>();

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
        <Route
          path={`${match.path}/list`}
          component={OntologySceneObjectTypeList}
        />
        <Route
          path={`${match.path}/create`}
          component={OntologySceneObjectTypeCreate}
        />
      </Switch>
    </Suspense>
  );
}
