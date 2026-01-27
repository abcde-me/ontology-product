import React, { useState } from 'react';
import { InfoDescription, EllipsisPopover } from '@ceai-front/arco-material';
import TaskAllocation from './tsakAllocation';
import { Link } from '@arco-design/web-react';
import SelectedDataModal from './SelectedDataModal';

function DistributConfig({ requirementDetail }: { requirementDetail: any }) {
  const [visible, setVisible] = useState(false);

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

  const distributConfigData = [
    {
      title: '任务分配',
      items: [
        {
          label: '超时释放',
          value: requirementDetail?.req_config?.task_effective_minute + '分钟'
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
        }
      ]
    }
  ];
  return (
    <div style={{ marginTop: '20px' }}>
      <InfoDescription
        data={distributConfigData}
        column={2}
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
        <SelectedDataModal
          visible={visible}
          onClose={() => setVisible(false)}
          data={selectedData}
        />
      </div>
    </div>
  );
}

export default DistributConfig;
