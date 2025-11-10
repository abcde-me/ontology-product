/**
 * Image Modal Component
 * 图片放大弹窗，最大高度800px
 */

import React from 'react';
import { Modal } from '@arco-design/web-react';
import { useRagDetailStore } from '../store/ragDetailStore';

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
            className="max-h-[800px] w-auto object-contain"
            style={{ maxWidth: '90vw' }}
          />
        </div>
      )}
    </Modal>
  );
};

export default ImageModal;
