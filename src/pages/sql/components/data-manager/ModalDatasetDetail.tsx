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
      style={{ width: 960, height: 660 }}
      visible={datasetDetailVisible}
      footer={null}
      onCancel={closeDatasetDetail}
    >
      <div className="my-dataset-detail pb-[16px]">
        <DatasetDetail
          isHideEdit={true}
          detailId={detailId}
          datasetDetailVisible={datasetDetailVisible}
        />
      </div>
    </Modal>
  );
};

export default ModalDatasetDetail;
