import { Modal } from '@arco-design/web-react';
import React from 'react';
import { SqlIndexStore, useSqlIndexStore } from '../store';

// interface ModalTableListProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据库详情 弹框 */
const ModalTableList = () => {
  const dbDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.dbDetailVisible
  );

  const closeDbDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDbDetail
  );

  return (
    <Modal
      title="数据库详情"
      style={{ width: 960 }}
      visible={dbDetailVisible}
      footer={null}
      onCancel={closeDbDetail}
    >
      <div className="pb-[16px]">
        <TableList />
      </div>
    </Modal>
  );
};

export default ModalTableList;

const TableList = () => {
  return <div>TableList</div>;
};
