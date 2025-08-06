import { useLogoInfo } from '@/utils/swr';
import { logout, removeLoginToken } from '@/utils/env';
import { Dropdown, Menu, Tooltip, Link } from '@arco-design/web-react';
import React, { type CSSProperties, useCallback } from 'react';
import HeaderLogo from '@/assets/header-logo.png';
import cls from 'classnames';
import { usePathChange } from '@/hooks';
import { IconQuestionCircle, IconUser } from '@arco-design/web-react/icon';
import { useUserInfo, useUserInfoStore } from '@/store/userInfoStore';
import { PrefixV2 } from '@/api/endpoints';
import axios from 'axios';
import { getToken } from '@/utils/request';

export default function Header({
  className,
  style
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const { data } = useLogoInfo();
  const { pushPath } = usePathChange();

  // 从全局 store 获取用户信息
  const userInfo = useUserInfo();
  console.log('userInfo', userInfo);
  const { clearUserInfo } = useUserInfoStore();

  const logoutAction = useCallback(() => {
    removeLoginToken();

    // 清除全局用户信息
    clearUserInfo();

    // 跳转到登录页面
    logout();
  }, [pushPath, clearUserInfo]);

  const onClickUserDropdown = useCallback(
    (action) => {
      switch (action) {
        case 'logout':
          logoutAction();
          break;
        case 'account':
          pushPath('/tenant/compute/modaforge/userinfo');
          break;
        default:
          break;
      }
    },
    [logoutAction, pushPath]
  );

  const goHelp = () => {
    window.open(
      '../../../../assets/多模态数据治理平台 - 用户手册.pdf',
      '_blank'
    );
    // const url = `${PrefixV2}/files/browser/api-demo`;
    // axios
    //   .get(url, {
    //     responseType: 'arraybuffer',
    //     // @ts-ignore
    //     headers: { ...getToken() }
    //   })
    //   .then((res) => {
    //     // 转换pdf
    //     try {
    //       const blob = new Blob([res.data], { type: 'application/pdf' });
    //       const docURL = URL.createObjectURL(blob);
    //       window.open(docURL, '_blank');
    //     } catch {
    //       // Message.error('无法加载PDF文件，请检查文件结构或文件完整性');
    //     }
    //   });
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
        <Tooltip content="查看用户手册">
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
                    {userInfo?.username}
                  </span>
                </div>
                <div className="rounded-[4px] border-[1px] border-[#CBD5E1] px-[8px] text-[12px]/[20px] text-[#6E7B8D]">
                  {userInfo?.role}
                </div>
              </Menu.Item>
              {!userInfo?.is_super_admin && (
                <Menu.Item
                  key="org"
                  className="flex h-[24px] items-center bg-[#E7ECF0] px-[12px] text-[14px]/[20px] text-[#151B26] hover:bg-[#E7ECF0]"
                >
                  组织：{userInfo?.organization}
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
