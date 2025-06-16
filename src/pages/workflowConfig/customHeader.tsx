import { useLogoInfo } from '@/utils/swr';
import { Button, Space } from '@arco-design/web-react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import HeaderLogo from '@/assets/header-logo.png';

export default function Header() {
  const history = useHistory();
  const { data } = useLogoInfo();
  return (
    <div className="flex h-[50px] items-center bg-[rgb(var(--primary-6))] px-[20px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
      <img className="h-[20px]" src={data?.logoPic || HeaderLogo} />
      <div className="mx-[6px] h-[22px] w-[1px] bg-white"></div>
      <div className="text-[16px] leading-[22px] text-white">AppForge</div>
      <Space className="ml-auto">
        {/* <Button
          className="!border-[rgb(var(--primary-4))] !text-white hover:!border-white"
          type="outline"
          onClick={() => history.push('/tenant/compute/modaforge/appCreate')}
        >
          创建我的应用
        </Button> */}
        <Button
          className="!border-[rgb(var(--primary-4))] !bg-transparent !text-white hover:!border-white"
          type="outline"
          onClick={() => history.push('/tenant/compute/modaforge/workflowList')}
        >
          探索更多工作流
        </Button>
      </Space>
    </div>
  );
}
