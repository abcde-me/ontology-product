import React from 'react';
import { Modal } from '@arco-design/web-react';
import DatasetDetail from '@/components/detail';
import './ModalDatasetDetail.scss';

/** 数据集详情 弹框 */
const ModalDatasetDetail = ({
  detailId,
  datasetDetailVisible,
  closeDatasetDetail
}) => {
  return (
    <Modal
      title="数据集详情"
      style={{ width: 960 }}
      visible={datasetDetailVisible}
      footer={null}
      onCancel={closeDatasetDetail}
    >
      <div
        style={{ maxHeight: '700px', overflowY: 'auto' }}
        className="my-dataset-detail"
      >
        <DatasetDetail isHideEdit={true} detailId={detailId} />
      </div>
    </Modal>
  );
};

export default ModalDatasetDetail;
