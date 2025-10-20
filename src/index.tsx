import '@arco-design/web-react';
import '@arco-design/web-react/icon';
import '@arco-themes/react-cecloud-design/css/arco.css';
import '@ccf2e/arco-material/dist/css/index.css';
import '@ccf2e/arco-material/lib/style/css.js';
import '@ccf2e/arco-material';
import './index.css';
import './style/ai.theme.scss';
import './style/theme.scss';
import React, {
  useEffect,
  Suspense,
  useMemo,
  useRef,
  useCallback
} from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, Layout, Spin } from '@arco-design/web-react';
import {} from '@ccf2e/arco-material';
import { useHistory } from 'react-router-dom';
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
import { isInFrame, isWujie } from './utils/env';
import { useUserInfoStore } from './store/userInfoStore';
import { usePermission } from '@/hooks';
import { menus } from '@/pages/admin/layout/menus';
import { is } from 'immer/dist/internal';
import { getLocalStorage } from './utils/storage';
import { ProjectIdKey } from './utils/const';

initI18n();

// 在应用启动时从 localStorage 恢复 projectId
const initProjectIdFromStorage = () => {
  const pId = getLocalStorage<string[]>(ProjectIdKey);
  if (Array.isArray(pId) && pId.length > 1) {
    useUserInfoStore.getState().setProjectId(pId);
  }
};

initProjectIdFromStorage();

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
  '/tenant/compute/modaforge/agentCreate',
  '/tenant/compute/modaforge/labelEditor'
];

function App() {
  const localLayout = useSelector(
    (state: GlobalState) => state?.plugins?.consolePluginmodaforge?.localLayout
  );
  const location = useLocation();
  const history = useHistory();
  const { pushPath } = usePathChange();

  const { userActions, setUserMenus, setUserActions, projectId, setProjectId } =
    useUserInfoStore();
  const { createPermissionFilter, setUserPermissions } = usePermission();

  // 用于追踪是否已经初始化过权限
  const permissionInitializedRef = useRef(false);
  // 用于追踪项目是否刚刚切换过
  const projectSwitchedRef = useRef(false);

  useEffect(() => {
    if (
      projectId &&
      userActions.actions !== null &&
      !window.location.pathname.includes('/tenant/compute/modaforge/login')
    ) {
      let finalMenus = [...menus];
      if (!userActions.isAdmin) {
        finalMenus = createPermissionFilter(menus);
      }
      console.log('finalMenus', finalMenus);
      setUserMenus(finalMenus);

      // 检查当前路由是否在菜单中，如果不在则跳转到第一个路由
      const currentPath = window.location.pathname;
      const isCurrentPathValid = finalMenus.some((menu) => {
        if (menu.children) {
          return menu.children.some(
            (child) => child.path && currentPath.includes(child.path)
          );
        }
        return menu.path && currentPath.includes(menu.path);
      });

      // 只有当前路由无效时才跳转到第一个路由
      // 或者当项目刚刚切换过时，也要跳转到第一个有权限的路由
      if (!isCurrentPathValid || projectSwitchedRef.current) {
        const firstValidPath = finalMenus.find((item) => item.children)
          ?.children?.[0]?.path;
        if (firstValidPath) {
          history.push(firstValidPath);
        }
        projectSwitchedRef.current = false;
      }
    }
  }, [projectId, userActions.actions, userActions.isAdmin]);

  useEffect(() => {
    // 在主应用中加载子应用时，初始化权限
    // 子应用中 isWujie 为 true，需要从 localStorage 恢复的 projectId 初始化权限
    // 只在初始化时调用，不在切换项目时调用
    if (
      isWujie &&
      projectId &&
      projectId[1] &&
      userActions.actions === null &&
      !permissionInitializedRef.current
    ) {
      setUserPermissions(projectId[1]);
      permissionInitializedRef.current = true;
    }
  }, [projectId, userActions.actions, setUserPermissions]);

  const switchProject = useCallback(
    (pId: string[]) => {
      console.log('Wujie ProjectId', pId);
      // 直接使用传入的 pId 调用权限初始化，避免 state 更新的时序问题
      if (pId && pId[1]) {
        setUserPermissions(pId[1]);
      }
      // 重置权限状态
      setUserActions({ isAdmin: false, actions: null });
      // 更新 projectId
      setProjectId(pId);
      // 标记项目已切换，这样权限加载完成后会跳转到新项目的第一个有权限的路由
      projectSwitchedRef.current = true;
      // 重置初始化标记，但不要在这里设置为 false，因为我们已经调用了 setUserPermissions
      permissionInitializedRef.current = true;
    },
    [setUserPermissions, setUserActions, setProjectId]
  );

  useEffect(() => {
    (window as any).$wujie?.bus.$on('switchProject', switchProject);

    return () => {
      (window as any).$wujie?.bus.$off('switchProject', switchProject);
    };
  }, [switchProject]);

  const hidden = useMemo(
    () =>
      (location?.pathname && hiddenTopBarRoutes.includes(location?.pathname)) ||
      localLayout?.hideTopBar ||
      isInFrame,
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
          <Redirect
            from="/modaforge"
            to="/tenant/compute/modaforge/connection"
            exact
          />
          <Redirect from="/" to="/tenant/compute/modaforge/connection" exact />
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
    <BrowserRouter basename="/modaforge">
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

// 创建根元素的函数
const render = (Component) => {
  ReactDOM.render(
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spin block />
        </div>
      }
    >
      <Component />
    </Suspense>,
    document.getElementById('root')
  );
};

// 初始渲染
render(Index);

// 只在开发环境下启用 HMR
// @ts-expect-error
if (process.env.NODE_ENV === 'development' && module.hot) {
  // @ts-expect-error
  module.hot.accept('./pages/admin/layout', () => {
    // 当 App 组件或其依赖发生变化时，重新渲染
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NextApp = require('./pages/admin/layout').default;
    render(Index);
  });

  // @ts-expect-error
  module.hot.accept('./pages/login', () => {
    // 当 Login 组件发生变化时，重新渲染
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NextLogin = require('./pages/login').default;
    render(Index);
  });

  // @ts-expect-error
  module.hot.accept('./pages/errorPages', () => {
    // 当错误页面组件发生变化时，重新渲染
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NextPage404 = require('./pages/errorPages').default;
    render(Index);
  });

  // 可以继续添加其他需要热更新的组件
}
