import React, { lazy, Suspense, useEffect, useMemo } from 'react';
import { Spin, Tabs } from '@arco-design/web-react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation
} from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import { AttributeListTab, LinkListTab, ObjectTypeListTab } from './components';
import {
  getOntologyElementsObjectTypeEditPath,
  isOntologyElementTabKey,
  ONTOLOGY_ELEMENT_TABS,
  ONTOLOGY_ELEMENTS_BASE_PATH,
  ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH,
  ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH
} from './constants';
import { useCompactViewport } from './hooks/useCompactViewport';
import type { OntologyElementTabKey } from './types';
import styles from './index.module.scss';

const OntologyElementsObjectTypeCreate = lazy(
  () => import('./pages/ObjectTypeCreate')
);
const OntologyElementsObjectTypeEdit = lazy(
  () => import('./pages/ObjectTypeEdit')
);

const PAGE_SUBTITLE =
  '先在本体要素库中维护对象类型与链接，再在业务场景库中组合引用';

const TAB_COMPONENTS: Record<OntologyElementTabKey, React.ReactNode> = {
  objectType: <ObjectTypeListTab />,
  attribute: <AttributeListTab />,
  link: <LinkListTab />
};

const isObjectTypeFormRoute = (pathname: string) =>
  pathname.startsWith(ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH) ||
  pathname.includes('/ontologyElements/objectType/edit/');

export default function OntologyElements() {
  const history = useHistory();
  const location = useLocation();
  const { isCompact } = useCompactViewport();

  const activeTab = useMemo<OntologyElementTabKey>(() => {
    const match = location.pathname.match(
      /\/tenant\/compute\/onto\/ontologyElements\/([^/]+)/
    );
    const tabKey = match?.[1] || '';
    if (isOntologyElementTabKey(tabKey)) {
      return tabKey;
    }
    return 'objectType';
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      removeStaleArcoOverlays();
    };
  }, []);

  const handleTabChange = (key: string) => {
    if (isOntologyElementTabKey(key)) {
      history.push(`${ONTOLOGY_ELEMENTS_BASE_PATH}/${key}`);
    }
  };

  if (isObjectTypeFormRoute(location.pathname)) {
    return (
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-white">
            <Spin />
          </div>
        }
      >
        <Switch>
          <Route
            exact
            path={ONTOLOGY_ELEMENTS_OBJECT_TYPE_CREATE_PATH}
            component={OntologyElementsObjectTypeCreate}
          />
          <Route
            exact
            path={getOntologyElementsObjectTypeEditPath(':objectTypeId')}
            component={OntologyElementsObjectTypeEdit}
          />
        </Switch>
      </Suspense>
    );
  }

  return (
    <div className={styles['query-page']}>
      {!isCompact ? (
        <PageHeader
          className={styles['query-page-header']}
          title="本体要素"
          subTitle={PAGE_SUBTITLE}
        />
      ) : null}

      <div
        className={`${styles['query-page-content']} ${
          isCompact ? styles['query-page-content-compact'] : ''
        }`}
      >
        <Tabs
          className={styles['query-tabs']}
          activeTab={activeTab}
          onChange={handleTabChange}
          type="line"
        >
          {ONTOLOGY_ELEMENT_TABS.map((tab) => (
            <Tabs.TabPane key={tab.key} title={tab.label} />
          ))}
        </Tabs>

        <div className={styles['query-tab-panel']}>
          <Switch>
            <Redirect
              exact
              from={ONTOLOGY_ELEMENTS_BASE_PATH}
              to={ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH}
            />
            {ONTOLOGY_ELEMENT_TABS.map((tab) => (
              <Route
                key={tab.key}
                exact
                path={`${ONTOLOGY_ELEMENTS_BASE_PATH}/${tab.key}`}
              >
                {TAB_COMPONENTS[tab.key]}
              </Route>
            ))}
          </Switch>
        </div>
      </div>
    </div>
  );
}
