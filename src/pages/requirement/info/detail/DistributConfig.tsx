import React from 'react';
import { InfoDescription, EllipsisPopover } from '@ceai-front/arco-material';
import TaskAllocation from './tsakAllocation';

function DistributConfig({ requirementDetail }: { requirementDetail: any }) {
  const distributConfigData = [
    {
      title: '任务分配',
      items: [
        {
          label: '超时释放',
          value: requirementDetail?.req_config?.task_effective_minute + '分钟'
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
      <div
        style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start' }}
      >
        <div
          style={{
            fontSize: '14px',
            color: 'rgb(110, 123, 141)',
            flexShrink: 0,
            marginRight: '16px'
          }}
        >
          分配人员:
        </div>
        <TaskAllocation requirementDetail={requirementDetail} />
      </div>
    </div>
  );
}

export default DistributConfig;
