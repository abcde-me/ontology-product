import React from 'react';
import { Button } from '@arco-design/web-react';
import { IconUnorderedList } from '@arco-design/web-react/icon';
import PageHeaderBase from '@/components/PageHeader';

const PAGE_SUBTITLE =
  '配置系统中各业务环节是否启用大模型，以及对应的模型提供商、模型 ID 与 API Key 关联。列表会根据系统中已注册的大模型环节自动更新。';

interface PageHeaderProps {
  onOpenModelList?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onOpenModelList }) => (
  <PageHeaderBase
    title="模型管理"
    subTitle={PAGE_SUBTITLE}
    extra={
      <Button icon={<IconUnorderedList />} onClick={onOpenModelList}>
        模型列表
      </Button>
    }
  />
);
