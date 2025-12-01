import React from 'react';
import { InfoDescription, EllipsisPopover } from '@ceai-front/arco-material';

function DistributConfig({ requirementDetail }: { requirementDetail: any }) {
  const distributConfigData = [
    {
      title: '任务分配',
      items: [
        {
          label: '超时释放',
          value: '50分钟'
        },
        {
          label: '分配人员',
          value: '自动分配'
        }
      ]
    }
  ];
  return (
    <div style={{ marginTop: '20px' }}>
      <InfoDescription
        data={distributConfigData}
        column={1}
        titleStyle={{ fontSize: '16px', fontWeight: 'normal' }}
      />
    </div>
  );
}

export default DistributConfig;
