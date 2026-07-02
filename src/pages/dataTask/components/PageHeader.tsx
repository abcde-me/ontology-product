import React from 'react';
import PageHeaderBase from '@/components/PageHeader';

const PAGE_SUBTITLE =
  '统一管理数据同步与调度任务，支持周期调度、单次调度、立即执行等多种调度方式';

export const PageHeader: React.FC = () => (
  <PageHeaderBase title="数据任务2" subTitle={PAGE_SUBTITLE} />
);
