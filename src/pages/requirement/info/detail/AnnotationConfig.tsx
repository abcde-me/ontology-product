import React from 'react';
import { AnnotationTypeEmuns } from '../constants';
import getLabelByValue from '@/utils/getLabelByValue';
import { InfoDescription } from '@ceai-front/arco-material';

function AnnotationConfig({ requirementDetail }: { requirementDetail: any }) {
  const labelToolCode = requirementDetail?.label_tool?.label_tool_code;
  const commonData = [
    {
      title: '标注任务配置',
      items: [
        {
          label: '标注类型',
          value: getLabelByValue(AnnotationTypeEmuns, labelToolCode)
        },
        {
          label: '标注数据',
          value: requirementDetail?.label_count
        },
        {
          label: '拆分任务包',
          value: requirementDetail?.label_count
        },
        {
          label: '预标注模型',
          value: requirementDetail?.model_id
        }
      ]
    }
  ];
  return (
    <div style={{ marginTop: '20px' }}>
      <InfoDescription
        data={commonData}
        column={2}
        titleStyle={{ fontSize: '16px', fontWeight: 'normal' }}
      />
    </div>
  );
}
export default AnnotationConfig;
