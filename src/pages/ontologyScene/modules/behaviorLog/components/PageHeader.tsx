import React from 'react';

export const PageHeader: React.FC = () => {
  return (
    <div>
      <div className="mb-1 font-PingFangSc text-[20px] font-[600] leading-[30px] text-[#1d2129]">
        执行记录
      </div>
      <div className="font-PingFangSc text-[14px] font-normal leading-[22px] text-[#4e5969]">
        集中记录本体行为的执行链路与结果快照，保障业务操作的全量追溯、逻辑纠偏及系统级合规审计
      </div>
    </div>
  );
};
