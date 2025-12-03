import React from 'react';
import { AnnotationTypeEmuns } from '../constants';
import getLabelByValue from '@/utils/getLabelByValue';
import { InfoDescription } from '@ceai-front/arco-material';
import LabelInfo from './labelInfo';
import { useGetModelList } from '../../hooks/useGetModelInfo';
function AnnotationConfig({ requirementDetail }: { requirementDetail: any }) {
  const labelToolCode = requirementDetail?.label_tool?.label_tool_code;
  const { data: modelList = [] } = useGetModelList(
    { label_tool_code: labelToolCode, page: 1, page_size: 1000 },
    {
      enabled:
        (labelToolCode === 'IMAGE_ANNOTATION' || labelToolCode === 'TEXT_QA') &&
        !!requirementDetail?.model_id
    }
  );
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
          value: getLabelByValue(modelList, requirementDetail?.model_id)
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
      <LabelInfo
        requirementDetail={requirementDetail}
        labelToolCode={labelToolCode}
      />
    </div>
  );
}
export default AnnotationConfig;
