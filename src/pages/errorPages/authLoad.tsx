import React from 'react';
import { IconLoading } from '@arco-design/web-react/icon';

/**
 * 权限获取中页面
 */
export const AuthLoad: React.FC = () => {
  return (
    <div className="flex h-full justify-center bg-[#F0F6FE]">
      <div className="pt-[29vh] text-center">
        <IconLoading spin style={{ fontSize: 24, color: '#334155' }} />
        <div className="mt-6 text-[14px] text-[#0F172A]">
          权限加载中，请稍后
        </div>
      </div>
    </div>
  );
};

export default AuthLoad;
