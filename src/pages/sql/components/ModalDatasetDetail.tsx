import React from 'react';
import { Modal } from '@arco-design/web-react';
import DatasetDetail from '@/components/detail';
import { SqlIndexStore, useSqlIndexStore } from '../store';

// interface ModalDatasetDetailProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据集详情 弹框 */
const ModalDatasetDetail = () => {
  const datasetDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.datasetDetailVisible
  );

  const closeDatasetDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDatasetDetail
  );

  return (
    <Modal
      title="数据集详情"
      style={{ width: 960 }}
      visible={datasetDetailVisible}
      footer={null}
      onCancel={closeDatasetDetail}
    >
      <div className="my-dataset-detail pb-[16px]">
        <DatasetDetail isHideEdit={true} detailId="331" />
      </div>
    </Modal>
  );
};

export default ModalDatasetDetail;
