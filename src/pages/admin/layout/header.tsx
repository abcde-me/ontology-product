import { Dropdown, Menu, Tooltip, Link } from '@arco-design/web-react';
import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useState
} from 'react';
import { Select } from '@arco-design/web-react';
import { useProject } from '@/context/ProjectContext';
import HeaderLogo from '@/assets/header-logo.png';
import cls from 'classnames';
import { usePathChange } from '@/hooks';
import { IconQuestionCircle, IconUser } from '@arco-design/web-react/icon';
import { useUserInfo, useUserInfoStore } from '@/store/userInfoStore';
import { handlePathName } from '@/hooks/use-path-change';
import { logout } from '@/utils/env';
import { ListProject } from '@/api/modules/project';

// import { getDocContent } from '@/api/datasetsV2';

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

  // 从全局 store 获取用户信息
  const userInfo = useUserInfo();
  const { clearUserInfo } = useUserInfoStore();

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
    ListProject({}).then((res) => {
      const list = res?.data?.result || [];
      setProjects(list);
      if (list.length && !projectId) {
        setProjectId(list[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);
  const handleProjectChange = (id: string) => {
    setProjectId(id);
  };

  return (
    <div
      className={cls(
        className,
        'header-bg flex items-center justify-between bg-[rgb(var(--primary-6))] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]'
      )}
      style={style}
    >
      <a href="/" className="flex items-center">
        <img className="h-[18px]" src={data?.logoPic || HeaderLogo} />
        <div className="mx-[6px] h-[18px] w-[1px] bg-white"></div>
        <div className="text-[16px] leading-[22px] text-white">
          多模态数据治理平台
        </div>
      </a>
      <div className="flex items-center gap-x-[16px]">
        <Select
          style={{ width: 180, marginRight: 16 }}
          value={projectId}
          onChange={handleProjectChange}
          placeholder="选择项目"
        >
          {projects.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
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
