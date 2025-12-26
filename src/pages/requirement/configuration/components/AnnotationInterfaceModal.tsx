import { Image, Modal } from '@arco-design/web-react';
import React from 'react';
import PreviewImage from '../../image/preview-label-image.jpg';
import './AnnotationInterfaceModal.scss';

interface AnnotationInterfaceModalProps {
  visible: boolean;
  onCancel: () => void;
}

const AnnotationInterfaceModal: React.FC<AnnotationInterfaceModalProps> = ({
  visible,
  onCancel
}) => {
  return (
    <Modal
      title="标注界面"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 'auto' }}
      wrapClassName="annotation-interface-modal"
    >
      <Image
        src={PreviewImage}
        width={850}
        height={530}
        style={{ margin: '0 24px 24px' }}
      />
    </Modal>
  );
};

export default AnnotationInterfaceModal;
