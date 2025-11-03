import React from 'react';
import { Modal, Button } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';

interface DeleteConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm
}) => {
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 400 }}
      className="delete-confirm-modal"
    >
      <div className="flex flex-col">
        <div className="mb-4 flex items-start">
          <IconExclamationCircle
            className="mr-3 mt-0.5 flex-shrink-0"
            style={{ fontSize: 24, color: '#FF7D00' }}
          />
          <div className="flex-1">
            <div className="mb-2 text-base font-semibold text-[#1D2129]">
              确定删除资产吗?
            </div>
            <div className="text-sm text-[#4E5969]">删除后，不可恢复</div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={onConfirm}>
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
