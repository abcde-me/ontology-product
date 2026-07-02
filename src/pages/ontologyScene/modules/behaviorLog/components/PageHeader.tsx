import React from 'react';
import PageHeaderBase from '@/components/PageHeader';

interface PageHeaderProps {
  activeTab: 'action' | 'function';
}

export const PageHeader: React.FC<PageHeaderProps> = ({ activeTab }) => {
  const typeText = activeTab === 'action' ? '行为' : '函数';

  return (
    <PageHeaderBase
      title="执行记录"
      subTitle={`集中记录本体${typeText}的执行链路与结果快照，保障业务操作的全量追溯、逻辑纠偏及系统级合规审计`}
    />
  );
};
