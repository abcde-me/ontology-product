import React from 'react';
import { InfoDescription } from '@ceai-front/arco-material';

function QualityConfig({ requirementDetail }: { requirementDetail: any }) {
  const qualityConfigData = [
    {
      title: '质检任务配置',
      items: [
        {
          label: '质检轮次',
          value: requirementDetail?.req_config?.qc_round || 0
        },
        {
          label: '质检修改标注',
          value:
            requirementDetail?.req_config?.is_result_modify === 1
              ? '启用'
              : '禁用'
        },
        {
          label: '驳回至',
          value:
            requirementDetail?.req_config?.reject_to === 1 ? '公池' : '标注员'
        }
      ]
    }
  ];
  return (
    <div style={{ marginTop: '20px' }}>
      <InfoDescription
        data={qualityConfigData}
        column={2}
        titleStyle={{ fontSize: '16px', fontWeight: 'normal' }}
      />
    </div>
  );
}
export default QualityConfig;
