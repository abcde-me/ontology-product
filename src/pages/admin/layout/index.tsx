import useAuthTimeout from '@/hooks/useAuthTimeout';
import { GlobalState } from '@/store';
import '@/style/tailwind.css';
import '@/style/markdowm.less';
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

type LayoutPageProps = {
  history: any;
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

  // 路由数组
  const flattenRoutes = getFlatRoutes(routes);

  // 快速验证版本：
  // 1. 用户操作时token续约（token有效期1分钟）
  // 2. 用户不操作1分钟后自动登出
  useAuthTimeout({
    logoutTimeout: 60, // 1分钟无操作自动登出
    renewBeforeExpire: 1, // 在过期前30秒续约
    renewEndpoint: '/api/auth/v1/renew'
  });

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
                    component={route.component}
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
