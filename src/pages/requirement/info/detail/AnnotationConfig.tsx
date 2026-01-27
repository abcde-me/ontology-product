import React, { useState } from 'react';
import { AnnotationTypeEmuns } from '../constants';
import getLabelByValue from '@/utils/getLabelByValue';
import { InfoDescription } from '@ceai-front/arco-material';
import LabelInfo from './labelInfo';
import { useGetModelList } from '../../hooks/useGetModelInfo';
import { Link } from '@arco-design/web-react';
import SelectedDataModal from './SelectedDataModal';

function AnnotationConfig({ requirementDetail }: { requirementDetail: any }) {
  const [visible, setVisible] = useState(false);

  // 从 pkg_edit_history 中提取所有 label_data_set 数据
  const getSelectedData = () => {
    const pkgEditHistory = requirementDetail?.pkg_edit_history || [];
    if (pkgEditHistory.length > 0) {
      // 合并所有 pkg_edit_history 中的 label_data_set
      return pkgEditHistory.flatMap((pkg: any) => pkg?.label_data_set || []);
    }
    // 兼容旧数据结构
    return requirementDetail?.label_data_set || [];
  };

  const selectedData = getSelectedData();
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
          value: (
            <>
              <span>已选数据量 {requirementDetail?.label_count}，</span>
              <Link type="text" onClick={() => setVisible(true)}>
                查看全部
              </Link>
            </>
          )
        },
        {
          label: '拆分任务包',
          value: requirementDetail?.pkg_infos?.length || 1
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
      <SelectedDataModal
        visible={visible}
        onClose={() => setVisible(false)}
        data={selectedData}
      />
    </div>
  );
}
export default AnnotationConfig;
