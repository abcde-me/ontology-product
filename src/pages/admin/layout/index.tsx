import { GlobalState } from '@/store';
import '@/style/tailwind.css';
import '@/style/markdowm.less';
import '@/style/scrollbar.css';
import { Layout, Spin } from '@arco-design/web-react';
import * as React from 'react';
import 'github-markdown-css/github-markdown-light.css';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useLocation } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { getFlatRoutes, routes } from '../route';
import Bread from './Bread';
import { LayoutWithSider } from './Sider';
import { useUserInfoStore } from '@/store/userInfoStore';
import { Page403, Page404 } from '@/pages/errorPages';
import PermissionRoute from './PermissionRoute';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';

type LayoutPageProps = {
  history: any;
};

const LayoutPage: React.FC<LayoutPageProps> = () => {
  const location = useLocation();
  const { t } = useTranslation('plugin__console-plugin-aidp');
  const { sidebarIsReady } = useSelector((state: any) => {
    return state?.plugins?.consolePluginSidebar || {};
  });
  const { moduleType } = useSelector((state: GlobalState) => {
    return state?.plugins?.consolePluginTopbar ?? {};
  });
  const dispatch = useDispatch();

  // 用户信息 store
  const { fetchUserInfo, isInitialized } = useUserInfoStore();

  // 路由数组
  const flattenRoutes = getFlatRoutes(routes);

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

  React.useEffect(() => {
    if (!isInitialized) {
      return undefined;
    }
    return scheduleOverlayCleanup();
  }, [isInitialized]);

  React.useEffect(() => {
    return scheduleOverlayCleanup();
  }, [location.pathname]);

  // 如果用户信息还未初始化完成，显示全局loading
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F5F7FC]">
        <Spin size={32} />
      </div>
    );
  }

  // 轮训刷新token，续约token

  return (
    <LayoutWithSider>
      <Layout className="flex h-full min-h-0 flex-1 flex-col overflow-auto">
        <Bread />
        <Layout.Content className="min-h-0 flex-auto overflow-auto">
          <div
            className="layout-detail h-full min-h-[100vh] overflow-auto bg-[#FFFFFF] text-[var(--color-text-2)]"
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
                      // render={() => <PermissionRoute route={route} />}
                      exact={route.exact !== false} // 默认加exact， 除非显示关闭
                    />
                  );
                })}
                <Route key="*" path="*" component={Page404} />
              </Switch>
            </SWRConfig>
          </div>
        </Layout.Content>
      </Layout>
    </LayoutWithSider>
  );
};

// export default withSider(LayoutPage);
export default LayoutPage;
