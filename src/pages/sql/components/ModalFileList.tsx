import { Modal } from '@arco-design/web-react';
import React from 'react';
import { SqlIndexStore, useSqlIndexStore } from '../store';

// interface ModalFileListProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据卷详情 弹框 */
const ModalFileList = () => {
  const volumnDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.volumnDetailVisible
  );

  const closeVolumnDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeVolumnDetail
  );

  return (
    <Modal
      title="数据卷详情"
      style={{ width: 960 }}
      visible={volumnDetailVisible}
      footer={null}
      onCancel={closeVolumnDetail}
    >
      <div className="pb-[16px]">
        <FileList />
      </div>
    </Modal>
  );
};

export default ModalFileList;

const FileList = () => {
  return <div>FileList</div>;
};
