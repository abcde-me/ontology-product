import React from 'react';
import { Tag } from '@arco-design/web-react';
import type { OntologyApiStatus } from '../types';

const STATUS_META: Record<OntologyApiStatus, { text: string; color: string }> =
  {
    editing: { text: '编辑中', color: 'orange' },
    online: { text: '已上线', color: 'green' },
    offline: { text: '已下线', color: 'gray' }
  };

export const ApiStatusTag: React.FC<{ status: OntologyApiStatus }> = ({
  status
}) => {
  const meta = STATUS_META[status];
  return (
    <Tag color={meta.color} bordered>
      {meta.text}
    </Tag>
  );
};
