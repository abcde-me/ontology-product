import React from 'react';
import { Modal } from '@arco-design/web-react';
import { OPERATION_GUIDE_ITEMS } from '../constants';
import styles from '../index.module.scss';

interface OperationGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OperationGuideModal: React.FC<OperationGuideModalProps> = ({
  visible,
  onClose
}) => {
  return (
    <Modal
      title="操作说明"
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      okText="知道了"
      cancelButtonProps={{ style: { display: 'none' } }}
      style={{ width: 560 }}
    >
      <div className={styles['guide-list']}>
        {OPERATION_GUIDE_ITEMS.map((item) => (
          <div key={item.title} className={styles['guide-item']}>
            <div className={styles['guide-item-title']}>{item.title}</div>
            <div className={styles['guide-item-content']}>{item.content}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
