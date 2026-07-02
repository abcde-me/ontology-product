import React from 'react';
import PageHeaderBase from '@/components/PageHeader';

const PAGE_SUBTITLE =
  '基于 Ontology HTTP REST API，支持查看接口说明、在线测试、新建/编辑草稿并发布覆盖线上版本，以及上线/下线控制。';

export const PageHeader: React.FC = () => (
  <PageHeaderBase title="API 管理" subTitle={PAGE_SUBTITLE} />
);
