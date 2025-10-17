import useAuthTimeout from '@/hooks/useAuthTimeout';
import { GlobalState } from '@/store';
import '@/style/tailwind.css';
import '@/style/markdowm.less';
import '@/style/scrollbar.css';
import useCheckHideRegion from '@/utils/useCheckHideRegion';
import { Layout } from '@arco-design/web-react';
import * as React from 'react';
import 'github-markdown-css/github-markdown-light.css';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { getFlatRoutes, routes } from '../route';
import Bread from './Bread';
import { withSider } from './Sider';
import { useUserInfoStore } from '@/store/userInfoStore';
import { usePermission } from '@/context/PermissionContext';
import { Page403 } from '@/pages/errorPages';
import { Spin } from '@arco-design/web-react';

type LayoutPageProps = {
  history: any;
};
// 带权限检查的路由组件
const PermissionRoute: React.FC<{ route: any }> = ({ route }) => {
  const { hasPermission, isLoading, isInitialized } = usePermission();

  // 如果权限还在加载中，显示全屏居中的加载状态
  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin />
      </div>
    );
  }

  // 如果路由没有权限要求，直接渲染
  if (!route.permission) {
    return <route.component />;
  }

  // 检查权限
  if (hasPermission(route.permission)) {
    return <route.component />;
  }

  // 无权限时显示403页面
  return <Page403 />;
};

const LayoutPage: React.FC<LayoutPageProps> = () => {
  const { t } = useTranslation('plugin__console-plugin-aidp');
  const { sidebarIsReady } = useSelector((state: any) => {
    return state?.plugins?.consolePluginSidebar || {};
  });
  const { moduleType } = useSelector((state: GlobalState) => {
    return state?.plugins?.consolePluginTopbar ?? {};
  });
  useCheckHideRegion();
  const dispatch = useDispatch();

  // 用户信息 store
  const { fetchUserInfo, isInitialized } = useUserInfoStore();

  // 路由数组
  const flattenRoutes = getFlatRoutes(routes);

  // 身份验证超时管理：
  // 开发环境：token有效期1分钟，剩余30秒时续约
  // 生产环境：token有效期60分钟，剩余30分钟时续约
  // useAuthTimeout({
  //   renewBeforeExpire: 30, // 开发环境30秒，生产环境10分钟
  //   renewEndpoint: '/api/auth/v1/renew'
  // });

  // 获取用户信息 - 在 layout 初始化时调用
  React.useEffect(() => {
    // 只在未初始化时获取用户信息，避免重复请求
    if (!isInitialized) {
      fetchUserInfo();
    }
  }, [fetchUserInfo, isInitialized]);

  // 入口文件的useEffect方法
  React.useEffect(() => {
    // 如果是Region化的页面，将显示Region选择器
    dispatch({
      type: 'update-visibleAreaSelect',
      payload: {
        visibleAreaSelect: /\/region\/([\w-]+)\/console\//.test(
          window.location.href
        )
      }
    });
    dispatch({
      type: 'update-topMenuSelectedKeys',
      payload: { topMenuSelectedKeys: ['productService'] } // 都不选中设置空数组
    });
    dispatch({
      type: 'update-serviceCode',
      payload: { serviceCode: 'AIDP' } // region化项目传项目的serviceCode，中心化项目设置空字符串
    });
  }, [dispatch, moduleType]);

  React.useEffect(() => {
    if (sidebarIsReady) {
      dispatch({
        type: 'update-sidebar',
        payload: {
          sidebarType: 'main',
          properties: {
            menuGroupCode: 'menu_tenant_aidp',
            titleName: t('AIDP'),
            forceSelectedKey: ''
          }
        }
      });
      return () => {
        dispatch({
          type: 'update-sidebar',
          payload: {
            sidebarType: 'main',
            properties: {
              menuGroupCode: 'menu_tenant_aidp',
              titleName: t('AIDP'),
              forceSelectedKey: ''
            }
          }
        });
      };
    }
  }, [dispatch, sidebarIsReady, t]);

  // 轮训刷新token，续约token

  return (
    <Layout className="flex h-full overflow-auto">
      <Bread />
      <Layout.Content className="flex-auto overflow-auto">
        <div
          className="h-full overflow-auto text-[var(--color-text-2)]"
          data-user-loaded
        >
          <SWRConfig value={{ revalidateOnFocus: false }}>
            <Switch>
              {flattenRoutes.map((route) => {
                return (
                  <Route
                    key={route.key}
                    path={route.key}
                    render={() => <PermissionRoute route={route} />}
                  />
                );
              })}
            </Switch>
          </SWRConfig>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default withSider(LayoutPage);
