import { Modal } from '@arco-design/web-react';
import React from 'react';
import { SqlIndexStore, useSqlIndexStore } from '../store';

// interface ModalDatasetDetailProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据集详情 弹框 */
const ModalDatasetDetail = () => {
  const DatasetDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.DatasetDetailVisible
  );

  const closeDatasetDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDatasetDetail
  );

  return (
    <Modal
      title="数据集详情"
      style={{ width: 960 }}
      visible={DatasetDetailVisible}
      footer={null}
      onCancel={closeDatasetDetail}
    >
      <div className="pb-[16px]">
        <BaseInfo />
        <DataContent />
        <VersionHistory />
      </div>
    </Modal>
  );
};

export default ModalDatasetDetail;

const BaseInfo = () => {
  return <div>BaseInfo</div>;
};

const DataContent = () => {
  return <div>DataContent</div>;
};

const VersionHistory = () => {
  return <div>VersionHistory</div>;
};
