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
  useState,
  useMemo
} from 'react';
import { useHistory } from 'react-router-dom';
import { menus, filterMenusByPermissions, type MenuModel } from './menus';
import HeaderLogo from '@/assets/header-logo.png';
import cls from 'classnames';
import { ProjectIdKey } from '@/utils/const';
import { setLocalStorage, getLocalStorage } from '@/utils/storage';
import { usePathChange, usePermission } from '@/hooks';
import { IconQuestionCircle, IconUser } from '@arco-design/web-react/icon';
import { useUserInfo, useUserInfoStore } from '@/store/userInfoStore';
import { handlePathName } from '@/hooks/use-path-change';
import { logout } from '@/utils/env';
import { GetProjOrg } from '@/api/modules/project';
import { isSameArray } from '@/utils/array';

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
  const isMountedRef = useRef(true);

  // 从全局 store 获取用户信息
  const userInfo = useUserInfo();
  const {
    clearUserInfo,
    setUserActions,
    projectId,
    setProjectId,
    isInitialized,
    fetchUserInfo
  } = useUserInfoStore();
  const { setUserPermissions } = usePermission();
  const { id: userId } = userInfo || {};
  const [projects, setProjects] = useState<Record<string, any>[]>([]);
  const FullStorageKey = useMemo(() => `${ProjectIdKey}${userId}`, [userId]);
  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
  useEffect(() => {
    const list = async () => {
      const { data: result } = await GetProjOrg({});
      setProjects(result);
      const fullProjectIdKey = `${ProjectIdKey}${userInfo?.id}`;
      console.log('fullProjectIdKey', fullProjectIdKey);

      if (result.length) {
        const pId = getLocalStorage<string[]>(fullProjectIdKey);
        if (Array.isArray(pId)) {
          const org = result.find((r) => r.id === pId[0]);
          if (org && org.projectList.find((p) => p.id === pId[1])) {
            setProjectId(pId);
            return;
          }
        }

        const defaultPId = [result[0].id, result[0].projectList[0].id];
        setLocalStorage(fullProjectIdKey, defaultPId);
        setProjectId(defaultPId);
      }
    };

    if (userInfo?.id) {
      list();
    }
  }, [userInfo?.id]);

  // React.useEffect(() => {
  //   if (projectId && projectId[1]) {
  //     setUserPermissions(projectId[1]);
  //   }
  // }, [projectId[1]]);

  useEffect(() => {
    if (!isInitialized) {
      fetchUserInfo();
    }
  }, [fetchUserInfo, isInitialized]);

  const changeProject = (value: string[]) => {
    if (!userId || !userId.length) return;
    if (isSameArray(value, projectId)) return;

    setLocalStorage(FullStorageKey, value);
    // 重置权限状态，这样下次初始化时会重新加载权限
    setUserActions({ isAdmin: false, actions: null });
    setProjectId(value);
  };

  const goHelp = async () => {
    // const res = await getDocContent('file-ea3d6713-147b-4b33-8488-59ddb9be4a0a');
    // const blob = new Blob([res], { type: 'application/pdf' });
    // const docURL = URL.createObjectURL(blob);
    // window.open(docURL, '_blank');
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
            onChange={(value, option) => {
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
