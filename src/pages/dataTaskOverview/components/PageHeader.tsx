import React from 'react';
import PageHeaderBase from '@/components/PageHeader';

const PAGE_SUBTITLE =
  '查看数据同步任务的运行状态，支持查看日志、终止与重试操作';

export const PageHeader: React.FC = () => (
  <PageHeaderBase title="数据任务" subTitle={PAGE_SUBTITLE} />
);
