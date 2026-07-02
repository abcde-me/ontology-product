import React from 'react';
import PageHeaderBase from '@/components/PageHeader';

const PAGE_SUBTITLE =
  '统一管理系统数据源连接配置，支持 MySQL、达梦数据库、Postgre、Iceberg 等数据库，以及第三方 API 和 Kafka 实时数据流的连接测试与维护';

export const PageHeader: React.FC = () => (
  <PageHeaderBase title="数据源管理" subTitle={PAGE_SUBTITLE} />
);
