import React from 'react';

export const PageHeader: React.FC = () => {
  return (
    <div>
      <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-[#1d2129]">
        数据源管理
      </div>
      <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
        统一管理系统数据源连接配置，支持
        MySQL、达梦数据库、PostgreSQL等多种数据库类型的连接测试与维护
      </div>
    </div>
  );
};
