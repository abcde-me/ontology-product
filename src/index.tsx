import '@arco-design/web-react';
import '@arco-design/web-react/icon';
import '@arco-themes/react-cecloud-design/css/arco.css';
import '@ccf2e/arco-material/dist/css/index.css';
import '@ccf2e/arco-material/lib/style/css.js';
import '@ceai-front/arco-material/dist/index.css';
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
import { patchHistoryForLocationChange } from '@ceai-front/arco-material';
import { useHistory } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import PageLayout from './pages/admin/layout';
import { store } from './store/createStore';
import type { GlobalState } from './store';
import { GlobalContext } from './context';
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
// import Header from './pages/admin/layout/header';
import { Header } from '@ceai-front/arco-material';
import {
  isInFrame,
  isWujie,
  embedBySingleApp,
  onRouterChange
} from './utils/env';
import { useUserInfo, useUserInfoStore } from './store/userInfoStore';
import { usePathChange, usePermission } from '@/hooks';
import { menus } from '@/pages/admin/layout/menus';
import { is } from 'immer/dist/internal';
import { getLocalStorage } from './utils/storage';
import { ProjectIdKey } from './utils/const';
import { isSameArray } from './utils/array';
import { logout, openNewPage } from '@/utils/env';
import { handlePathName } from '@/hooks/use-path-change';

initI18n();
patchHistoryForLocationChange();

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// 在应用启动时从 localStorage 恢复 projectId
// const initProjectIdFromStorage = () => {
//   const pId = getLocalStorage<string[]>(ProjectIdKey);
//   if (Array.isArray(pId) && pId.length > 1) {
//     useUserInfoStore.getState().setProjectId(pId);
//   }
// };

// initProjectIdFromStorage();

// 路由数组
const flattenRoutes = getFlatRoutes(routes);
const hiddenTopBarRoutes = [
  '/login',
  '/tenant/compute/noto/login',
  '/tenant/compute/noto/appCreate',
  '/tenant/compute/noto/appConfig',
  '/tenant/compute/noto/appChat',
  '/tenant/compute/noto/configurationpage',
  '/tenant/compute/noto/workflowConfig',
  '/tenant/compute/noto/workflowPublic',
  '/tenant/compute/noto/agentCreate',
  '/tenant/compute/noto/labelEditor',
  '/tenant/compute/noto/ragDetail',
  '/tenant/compute/noto/compareFileData',
  '/tenant/compute/noto/ontologyScene/detail'
];

/**
 * 需要隐藏菜单的路由传参类型的地址关键字集合
 * 路由配置类似：/a/b/:c
 */
const hiddenTopBarRouterParamsRouteKeyWords = [
  'tenant/compute/noto/workflowConfig',
  'tenant/compute/noto/ontologyScene/detail'
];

function App() {
  const localLayout = useSelector(
    (state: GlobalState) => state?.plugins?.consolePluginnoto?.localLayout
  );
  const location = useLocation();
  const history = useHistory();

  const {
    userActions,
    setUserMenus,
    setUserActions,
    projectId,
    setProjectId,
    fetchUserInfo,
    isInitialized
  } = useUserInfoStore();
  const { createPermissionFilter, setUserPermissions } = usePermission();
  const userInfo = useUserInfo() || {
    id: '',
    name: '',
    account: '',
    phone: '',
    description: '',
    position: '',
    organization: {
      id: '',
      name: '',
      description: '',
      fullOrgPath: ''
    },
    status: '',
    createdAt: '',
    roles: [
      {
        subjectRoleId: '',
        id: '',
        name: '',
        description: '',
        scope: '',
        builtin: true,
        admin: true,
        organizationId: '',
        organizations: null,
        projects: null,
        createdBy: '',
        createdByName: '',
        createdAt: ''
      }
    ]
  };

  const { pushPath } = usePathChange();

  // 用于追踪是否已经初始化过权限
  const permissionInitializedRef = useRef(false);
  // 用于追踪项目是否刚刚切换过
  const projectSwitchedRef = useRef(false);

  // 获取用户信息 - 在 App 初始化时调用
  useEffect(() => {
    // 如果当前在登录页，则不获取用户信息，避免因为 401 触发 logout() 导致重定向死循环
    if (location.pathname.includes('/login')) {
      return;
    }
    // 只在未初始化时获取用户信息，避免重复请求
    if (!isInitialized) {
      fetchUserInfo();
    }
  }, [fetchUserInfo, isInitialized, location.pathname]);

  // 是否单产品集成
  const isEmbedded = embedBySingleApp();

  // 监听路由变化，通知父应用
  useEffect(() => {
    if (isEmbedded) {
      // 通知父应用路由变化，用于更新 URL 参数
      onRouterChange(
        `/noto${location.pathname}${location.search}`,
        `/noto${location.pathname}`
      );
    }
  }, [location.pathname, location.search, isEmbedded]);

  useEffect(() => {
    if (
      projectId &&
      userActions.actions !== null &&
      !window.location.pathname.includes('/tenant/compute/noto/login')
    ) {
      let finalMenus = [...menus];
      if (!userActions.isAdmin) {
        finalMenus = createPermissionFilter(menus);
      }
      // console.log('finalMenus', finalMenus);
      setUserMenus(finalMenus);

      // 只有当项目刚刚切换过时，才跳转到第一个有权限的路由
      if (projectSwitchedRef.current) {
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

  useEffect(() => {
    if (userInfo?.id) {
      const fullProjectIdKey = `${ProjectIdKey}${userInfo?.id}`;
      const pId = getLocalStorage<string[]>(fullProjectIdKey);
      if (Array.isArray(pId) && pId.length > 1) {
        setProjectId(pId);
      }
    }
  }, [userInfo?.id]);

  const refreshPage = useCallback(
    (url: string, from: string) => {
      const pathname = parent.location.pathname;
      console.log('------noto refresh------', url, from, pathname);
      // 这里只能接受来自自身应用的切换，忽略其他应用切换请求
      // url 不包含 /noto/ 前缀，需要直接使用
      if (pathname.includes(`/${from}`)) {
        history.push(url);
      }
    },
    [history]
  );

  const switchProject = useCallback(
    (pId: string[]) => {
      console.log('Wujie ProjectId', pId);
      if (isSameArray(pId, projectId)) return;

      // 重置权限状态
      setUserActions({ isAdmin: false, actions: null });
      // 更新 projectId
      setProjectId(pId);

      // 只有在非 wujie 环境或者已经有 projectId 的情况下才标记为切换
      // 这样可以避免初次加载时自动跳转
      if (!isWujie || (projectId && projectId.length > 0)) {
        // 标记项目已切换，这样权限加载完成后会跳转到新项目的第一个有权限的路由
        projectSwitchedRef.current = true;
      }

      // 重置初始化标记
      permissionInitializedRef.current = true;
    },
    [projectId, setUserActions, setProjectId]
  );

  useEffect(() => {
    (window as any).$wujie?.bus.$on('refresh', refreshPage);
    (window as any).$wujie?.bus.$on('switchProject', switchProject);

    return () => {
      (window as any).$wujie?.bus.$off('refresh', refreshPage);
      (window as any).$wujie?.bus.$off('switchProject', switchProject);
    };
  }, [refreshPage, switchProject]);

  const hidden = useMemo(() => {
    const hiddenMenu =
      (location?.pathname &&
        (hiddenTopBarRoutes.includes(location?.pathname) ||
          hiddenTopBarRouterParamsRouteKeyWords.some((keyWord) =>
            location?.pathname?.includes(keyWord)
          ))) ||
      localLayout?.hideTopBar ||
      isInFrame;
    return hiddenMenu;
  }, [localLayout?.hideTopBar, location?.pathname]);

  return (
    <Layout className="flex h-full flex-col">
      <Layout.Header className={cls({ hidden })}>
        {!hidden && (
          <Header
            title="业务本体构建平台"
            openHelpLink={(linkInfo) => {
              openNewPage('/noto/assets/多模态数据治理平台 - 用户手册.pdf');
            }}
            userInfo={userInfo}
            logout={logout}
            accountCallback={() => {
              pushPath(handlePathName('/userinfo'));
            }}
          />
        )}
      </Layout.Header>
      <Layout.Content className="flex-auto overflow-auto bg-[#F5F7FC]">
        <Switch>
          <Route
            key="login"
            path="/tenant/compute/noto/login"
            component={Login}
            exact
          />
          {/*{flattenRoutes.map((route) => {
            return (
              <Route
                key={route.key}
                path={route.key}
                component={PageLayout}
                exact
              />
            );
          })}*/}
          <Redirect from="/login" to="/tenant/compute/noto/login" exact />
          <Redirect from="/noto" to="/tenant/compute/noto/home" exact />
          <Redirect from="/" to="/tenant/compute/noto/home" exact />
          <Route
            path={'/'}
            render={({ history }) => <PageLayout history={history} />}
          />
          {/*<Route key="*" path="*" component={Page404} />*/}
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

  const contextValue = {
    lang,
    setLang
  };

  return (
    <BrowserRouter basename="/noto">
      <ConfigProvider locale={getArcoLocale()}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <GlobalContext.Provider value={contextValue}>
              <App />
            </GlobalContext.Provider>
          </QueryClientProvider>
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
    render(Index);
  });

  // @ts-expect-error
  module.hot.accept('./pages/login', () => {
    // 当 Login 组件发生变化时，重新渲染
    render(Index);
  });

  // @ts-expect-error
  module.hot.accept('./pages/errorPages', () => {
    // 当错误页面组件发生变化时，重新渲染
    render(Index);
  });

  // 可以继续添加其他需要热更新的组件
}
