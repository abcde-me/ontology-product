import {
  Dropdown,
  Menu,
  Tooltip,
  Link,
  Cascader
} from '@arco-design/web-react';
import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { useHistory } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';
import { usePermission } from '@/context/PermissionContext';
import { menus, filterMenusByPermissions, type MenuModel } from './menus';
import HeaderLogo from '@/assets/header-logo.png';
import cls from 'classnames';
import { ProjectIdKey } from '@/utils/const';
import { setLocalStorage, getLocalStorage } from '@/utils/storage';
import { usePathChange } from '@/hooks';
import { IconQuestionCircle, IconUser } from '@arco-design/web-react/icon';
import { useUserInfo, useUserInfoStore } from '@/store/userInfoStore';
import { handlePathName } from '@/hooks/use-path-change';
import { logout } from '@/utils/env';
import { GetProjOrg, ResourcePermissionActions } from '@/api/modules/project';

// import { getDocContent } from '@/api/datasetsV2';

// 获取第一个有权限的菜单路径
const getFirstAvailableMenuPath = (permissions: string[]): string | null => {
  const filteredMenus = filterMenusByPermissions(menus, permissions);

  const findFirstPath = (menuList: MenuModel[]): string | null => {
    for (const menu of menuList) {
      if (menu.children && menu.children.length > 0) {
        const childPath = findFirstPath(menu.children);
        if (childPath) return childPath;
      } else if (menu.path) {
        return menu.path;
      }
    }
    return null;
  };

  return findFirstPath(filteredMenus);
};

export default function Header({
  className,
  style
}: {
  className?: string;
  style?: CSSProperties;
}) {
  // const { data } = useLogoInfo();
  const data = {
    logoPic: HeaderLogo
  };
  const { pushPath } = usePathChange();
  const [projects, setProjects] = useState<any[]>([]);
  const { projectId, setProjectId } = useProject();
  const { setPermissionData } = usePermission();
  const history = useHistory();
  const isMountedRef = useRef(true);

  // 从全局 store 获取用户信息
  const userInfo = useUserInfo();
  const { clearUserInfo } = useUserInfoStore();

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 获取项目权限
  const fetchProjectPermissions = async (
    projectId: string,
    shouldNavigate = false
  ) => {
    try {
      const res = await ResourcePermissionActions({
        projectId: projectId,
        platforms: ['aimdp-manager']
      });
      console.log('获取到权限数据:', res);
      if (res?.data && isMountedRef.current) {
        setPermissionData(res.data);

        // 如果需要导航且有权限数据，跳转到第一个有权限的菜单
        if (shouldNavigate && res.data.actions && res.data.actions.length > 0) {
          const firstMenuPath = getFirstAvailableMenuPath(res.data.actions);
          if (firstMenuPath) {
            console.log('跳转到第一个有权限的菜单:', firstMenuPath);

            // 强制刷新页面组件：如果是相同路径，添加时间戳参数强制刷新
            const currentPath = history.location.pathname;
            if (currentPath === firstMenuPath) {
              console.log('相同路径，强制刷新组件');
              // 添加时间戳参数强制React Router重新渲染组件
              const refreshPath = `${firstMenuPath}?refresh=${Date.now()}`;
              history.replace(refreshPath);
            } else {
              history.push(firstMenuPath);
            }
          }
        }
      }
    } catch (error) {
      console.error('获取权限失败:', error);
    }
  };

  const logoutAction = useCallback(() => {
    // 清除本地存储的 token
    localStorage.removeItem('loginToken');
    localStorage.removeItem('console_token');

    // 清除全局用户信息
    clearUserInfo();

    // 跳转到登录页面
    logout();
  }, [clearUserInfo]);

  const onClickUserDropdown = useCallback(
    (action) => {
      switch (action) {
        case 'logout':
          logoutAction();
          break;
        case 'account':
          pushPath(handlePathName('/userinfo'));
          break;
        default:
          break;
      }
    },
    [logoutAction, pushPath]
  );

  const goHelp = async () => {
    // const res = await getDocContent('file-ea3d6713-147b-4b33-8488-59ddb9be4a0a');
    // const blob = new Blob([res], { type: 'application/pdf' });
    // const docURL = URL.createObjectURL(blob);
    // window.open(docURL, '_blank');
  };

  useEffect(() => {
    const list = async () => {
      try {
        const { data: result } = await GetProjOrg({});
        if (!isMountedRef.current) return;
        setProjects(result);

        if (
          result.length &&
          result[0].projectList &&
          result[0].projectList.length
        ) {
          // 检查当前是否已有有效的项目ID
          if (projectId.length === 2) {
            const org = result.find((r: any) => r.id === projectId[0]);
            if (
              org &&
              org.projectList.find((p: any) => p.id === projectId[1])
            ) {
              console.log('当前项目ID有效，重新获取权限数据:', projectId);
              // 即使项目ID有效，也要重新获取权限数据以确保数据是最新的
              await fetchProjectPermissions(projectId[1]);
              console.log('权限数据获取完成 - 当前项目ID有效分支');
              return;
            }
          }

          // 检查本地存储的项目ID
          const pId = getLocalStorage<string[]>(ProjectIdKey);
          if (Array.isArray(pId) && pId.length === 2) {
            const org = result.find((r: any) => r.id === pId[0]);
            if (org && org.projectList.find((p: any) => p.id === pId[1])) {
              console.log('使用本地存储的项目ID:', pId);
              if (!isMountedRef.current) return;
              setProjectId(pId);

              // 重新获取权限数据（页面刷新时确保权限数据是最新的）
              await fetchProjectPermissions(pId[1]);
              console.log('权限数据获取完成 - 本地存储项目ID分支');
              return;
            }
          }

          // 设置默认项目ID
          const defaultPId = [result[0].id, result[0].projectList[0].id];
          console.log('设置默认项目ID:', defaultPId);
          setLocalStorage(ProjectIdKey, defaultPId);
          if (!isMountedRef.current) return;
          setProjectId(defaultPId);

          // 获取默认项目的权限
          await fetchProjectPermissions(defaultPId[1]);
          console.log('www');
        }
      } catch (error) {
        console.error('获取项目列表失败:', error);
      }
    };
    list();
  }, [setProjectId]);
  const changeProject = async (value: string[]) => {
    setLocalStorage(ProjectIdKey, value);
    setProjectId(value);
    console.log('project changed:', value, projectId);

    // 获取新项目的权限并跳转到第一个有权限的菜单
    await fetchProjectPermissions(value[1], true);
  };

  return (
    <div
      className={cls(
        className,
        'header-bg flex items-center justify-between bg-[rgb(var(--primary-6))] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]'
      )}
      style={style}
    >
      <div className="flex h-full items-center">
        <a href="/" className="flex items-center">
          <img className="h-[18px]" src={data?.logoPic || HeaderLogo} />
          <div className="mx-[6px] h-[18px] w-[1px] bg-white"></div>
          <div className="text-[16px] leading-[22px] text-white">
            多模态数据治理平台
          </div>
        </a>
        <div className="project-selector ml-[24px] flex items-center">
          <Cascader
            placeholder="请选择项目"
            bordered={false}
            style={{
              width: 160,
              backgroundColor: '#FFFFFF33',
              borderRadius: 4
            }}
            dropdownMenuClassName="project-selector-dropdown"
            fieldNames={{
              label: 'title',
              value: 'id',
              children: 'projectList'
            }}
            options={projects}
            showSearch
            filterOption={(input, node) => {
              return (
                node.value.toLowerCase().indexOf(input.toLowerCase()) > -1 ||
                node.label.toLowerCase().indexOf(input.toLowerCase()) > -1
              );
            }}
            value={projectId}
            onChange={(value) => {
              changeProject(value as string[]);
            }}
          ></Cascader>
        </div>
      </div>

      <div className="flex items-center gap-x-[16px]">
        <Tooltip content="下载帮助文档">
          <Link
            href="#"
            icon={
              <IconQuestionCircle className="size-[20px] pt-[2px] text-[white]" />
            }
            onClick={goHelp}
          ></Link>
        </Tooltip>
        <Dropdown
          droplist={
            <Menu onClickMenuItem={onClickUserDropdown}>
              <Menu.Item
                key="user"
                className="flex h-[48px] items-center justify-between hover:bg-[white]"
              >
                <div className="flex items-center gap-x-[8px]">
                  <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[rgb(var(--primary-4))] text-[16px] text-white">
                    <IconUser />
                  </div>
                  <span className="text-[14px]/[20px] text-[#151B26]">
                    {userInfo?.name}
                  </span>
                </div>
                <div className="rounded-[4px] border-[1px] border-[#CBD5E1] px-[8px] text-[12px]/[20px] text-[#6E7B8D]">
                  {userInfo?.roles[0]?.name}
                </div>
              </Menu.Item>
              {userInfo?.organization?.id !== '' && (
                <Menu.Item
                  key="org"
                  className="flex h-[24px] items-center bg-[#E7ECF0] px-[12px] text-[14px]/[20px] text-[#151B26] hover:bg-[#E7ECF0]"
                >
                  组织：{userInfo?.organization?.name}
                </Menu.Item>
              )}

              <Menu.Item key="account">我的账号</Menu.Item>
              <Menu.Item key="logout">退出登录</Menu.Item>
            </Menu>
          }
          position="bl"
          triggerProps={{
            className: 'user-info-popup'
          }}
        >
          <div className="ml-auto inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-[rgb(var(--primary-4))] text-[16px] text-white">
            <IconUser />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
