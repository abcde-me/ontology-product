import { Modal } from '@arco-design/web-react';
import React from 'react';
import { SqlIndexStore, useSqlIndexStore } from '../store';

// interface ModalTableDetailProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据表详情 弹框 */
const ModalTableDetail = () => {
  const tableDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.tableDetailVisible
  );

  const closeTableDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeTableDetail
  );

  return (
    <Modal
      title="数据表详情"
      style={{ width: 960 }}
      visible={tableDetailVisible}
      footer={null}
      onCancel={closeTableDetail}
    >
      <div className="pb-[16px]">
        <TableDetail />
      </div>
    </Modal>
  );
};

export default ModalTableDetail;

const TableDetail = () => {
  return <div>TableDetail</div>;
};
