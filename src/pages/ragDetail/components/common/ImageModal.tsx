/**
 * Image Modal Component
 * 图片放大弹窗，最大高度800px
 */

import React from 'react';
import { Modal } from '@arco-design/web-react';
import { useRagDetailStore } from '../../store/ragDetailStore';

const ImageModal: React.FC = () => {
  const { showImageModal, selectedImageUrl, closeImageModal } =
    useRagDetailStore();

  return (
    <Modal
      title="查看大图"
      visible={showImageModal}
      onCancel={closeImageModal}
      footer={null}
      closable={true}
      maskClosable={true}
      style={{ width: 'auto', maxWidth: '90vw' }}
      unmountOnExit
    >
      {selectedImageUrl && (
        <div className="flex items-center justify-center pb-4">
          <img
            src={selectedImageUrl}
            alt="放大图片"
            className="h-auto max-h-[90vh] w-auto min-w-[300px] max-w-[90vw] object-contain"
            style={{ minWidth: '300px', maxWidth: '90vw', maxHeight: '90vh' }}
          />
        </div>
      )}
    </Modal>
  );
};

export default ImageModal;
