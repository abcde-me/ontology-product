import '@arco-design/web-react';
import '@arco-design/web-react/icon';
import '@arco-themes/react-cecloud-design/css/arco.css';
import '@ccf2e/arco-material/dist/css/index.css';
import '@ccf2e/arco-material/lib/style/css.js';
import '@ccf2e/arco-material';
import './index.css';

import React, { useEffect, Suspense, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  ConfigProvider,
  Layout,
  Spin,
  Dropdown,
  Menu
} from '@arco-design/web-react';
import {} from '@ccf2e/arco-material';
import { IconUser } from '@arco-design/web-react/icon';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import PageLayout from './pages/admin/layout';
import { store } from './store/createStore';
import type { GlobalState } from './store';
import { GlobalContext } from './context';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import {
  init as initI18n,
  LAST_LANGUAGE_LOCAL_STORAGE_KEY,
  FALLBACK_LNG
} from './i18n';
import { useSelector } from 'react-redux';
import cls from 'classnames';
import { getFlatRoutes, routes } from './pages/admin/route';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  useLocation
} from 'react-router-dom';
import Login from './pages/login';
import { Page404 } from './pages/errorPages';
import { usePathChange } from '@/hooks';
import Header from './pages/admin/layout/header';

initI18n();

// 路由数组
const flattenRoutes = getFlatRoutes(routes);
const hiddenTopBarRoutes = [
  '/login',
  '/tenant/compute/modaforge/login',
  '/tenant/compute/modaforge/appCreate',
  '/tenant/compute/modaforge/appConfig',
  '/tenant/compute/modaforge/appChat',
  '/tenant/compute/modaforge/configurationpage',
  '/tenant/compute/modaforge/workflowConfig',
  '/tenant/compute/modaforge/workflowPublic',
  '/tenant/compute/modaforge/agentCreate'
];

function App() {
  const localLayout = useSelector(
    (state: GlobalState) => state?.plugins?.consolePluginmodaforge?.localLayout
  );
  const location = useLocation();
  const { pushPath } = usePathChange();

  const hidden = useMemo(
    () =>
      (location?.pathname && hiddenTopBarRoutes.includes(location?.pathname)) ||
      localLayout?.hideTopBar,
    [localLayout?.hideTopBar, location?.pathname]
  );

  return (
    <Layout className="flex h-full flex-col">
      <Layout.Header className={cls({ hidden })}>
        {!hidden && <Header />}
      </Layout.Header>
      <Layout.Content className="flex-auto overflow-auto bg-[var(--color-bg-4)]">
        <Switch>
          <Route
            key="login"
            path="/tenant/compute/modaforge/login"
            component={Login}
            exact
          />
          {flattenRoutes.map((route) => {
            return (
              <Route
                key={route.key}
                path={route.key}
                component={PageLayout}
                exact
              />
            );
          })}
          <Redirect from="/login" to="/tenant/compute/modaforge/login" exact />
          <Redirect from="/" to="/tenant/compute/modaforge/home" exact />
          <Route key="*" path="*" component={Page404} />
        </Switch>
      </Layout.Content>
    </Layout>
  );
}

function Index() {
  const [lang, setLang] = useStorage(
    LAST_LANGUAGE_LOCAL_STORAGE_KEY,
    FALLBACK_LNG
  );
  const [theme, setTheme] = useStorage('arco-theme', 'light');

  function getArcoLocale() {
    switch (lang) {
      case 'zh':
        return zhCN;
      case 'en':
        return enUS;
      default:
        return zhCN;
    }
  }

  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  const contextValue = {
    lang,
    setLang,
    theme,
    setTheme
  };

  return (
    <BrowserRouter>
      <ConfigProvider locale={getArcoLocale()}>
        <Provider store={store}>
          <GlobalContext.Provider value={contextValue}>
            <App />
          </GlobalContext.Provider>
        </Provider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

ReactDOM.render(
  <Suspense
    fallback={
      <div className="flex h-screen w-screen items-center justify-center">
        <Spin block />
      </div>
    }
  >
    <Index />
  </Suspense>,
  document.getElementById('root')
);
