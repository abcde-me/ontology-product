import React from 'react';
import { Modal, ModalProps } from '@arco-design/web-react';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import styles from './index.module.scss';
import { PyCodeContent } from '@/pages/ontologyScene/componens';

export const FunctionContentDialog = (
  props: ModalProps & {
    data?: OntologyFunctionDetail;
  }
) => {
  const { data, visible, ...otherProps } = props;
  return (
    <Modal
      {...otherProps}
      style={{ width: '900px' }}
      footer={null}
      title={data?.name || '函数详情'}
      visible={visible}
      className={styles['function-content']}
    >
      <PyCodeContent value={data?.content || ''} readOnly />
    </Modal>
  );
};
