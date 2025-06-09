import { useLogoInfo } from '@/utils/swr';
import { Button, Dropdown, Menu, Space, Tooltip } from '@arco-design/web-react';
import React, { type PropsWithChildren, type CSSProperties, useCallback, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import HeaderLogo from '@/assets/header-logo.png';
import cls from 'classnames';
import { usePathChange } from '@/hooks';
import { IconQuestionCircle, IconUser } from '@arco-design/web-react/icon';
import { getMe } from '@/api/user'

export default function Header({
  className,
  style,
  children
}: PropsWithChildren<{ className?: string; style?: CSSProperties }>) {
  const history = useHistory();
  const { data } = useLogoInfo();
  const { pushPath } = usePathChange();
  const [userInfo, setUserInfo] = useState({
    account: '',
    username: '',
    phone: '',
    created_at: '',
    organization: '',
    role: ''
  })
  function getMeInfo() {
    getMe().then(res => {
      if (res.success) {
        setUserInfo(res.data);
      }
    })
  }
  useEffect(() => {
    getMeInfo()
  },[])


  const logout = useCallback(() => {
    localStorage.removeItem('loginToken');
    pushPath('/login');
  }, [pushPath]);
  
  const onClickUserDropdown = useCallback(
    (action) => {
      switch (action) {
        case 'logout':
          logout();
          break;
        case 'account':
          pushPath('/tenant/compute/appforge/userinfo');
          break;
        default:
          break;
      }
    },
    [logout, pushPath]
  );

  return (
    <div
      className={cls(
        className,
        'flex items-center justify-between bg-[rgb(var(--primary-6))] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] header-bg'
      )}
      style={style}
    >
      <a href="/" className="flex">
        <img className="h-[18px]" src={data?.logoPic || HeaderLogo} />
        <div className="mx-[6px] h-[18px] w-[1px] bg-white"></div>
        <div className="text-[16px] leading-[22px] text-white">应用开发平台</div>
      </a>
      <div className='flex items-center gap-x-[16px]'>
        <Tooltip content="下载帮助文档">
          <IconQuestionCircle className='text-[white] size-[20px] cursor-pointer'/>
        </Tooltip>
        <Dropdown
          droplist={
            <Menu onClickMenuItem={onClickUserDropdown}>
              <Menu.Item key="user" className="h-[48px] flex items-center justify-between hover:bg-[white]">
                <div className='flex items-center gap-x-[8px]'>
                  <div
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[rgb(var(--primary-4))] text-[16px] text-white"
                  >
                    <IconUser />
                  </div>
                  <span className='text-[#151B26] text-[14px]/[20px]'>{userInfo?.username}</span>
                </div>
                <div className='rounded-[4px] border-[1px] border-[#CBD5E1] px-[8px] text-[#6E7B8D] text-[12px]/[20px]'>{userInfo?.role}</div>
              </Menu.Item>
              <Menu.Item key='org' className='bg-[#E7ECF0] hover:bg-[#E7ECF0] h-[24px] px-[12px] flex items-center text-[#151B26] text-[14px]/[20px]'>组织：{userInfo?.organization}</Menu.Item>
              <Menu.Item key="account">我的账号</Menu.Item>
              <Menu.Item key="logout">退出登录</Menu.Item>
            </Menu>
          }
          position="bl"
          triggerProps={{
            className: 'user-info-popup'
          }}
        >
          <div
            className="ml-auto inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-[rgb(var(--primary-4))] text-[16px] text-white"
          >
            <IconUser />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
