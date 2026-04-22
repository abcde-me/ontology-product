import React from 'react';
import { Modal, ModalProps } from '@arco-design/web-react';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import styles from './index.module.scss';
import { OsModal, PyCodeContent } from '@/pages/ontologyScene/components';

export const FunctionContentDialog = (
  props: ModalProps & {
    data?: OntologyFunctionDetail;
  }
) => {
  const { data, visible, ...otherProps } = props;
  return (
    <OsModal
      {...otherProps}
      style={{ width: 900, maxHeight: 600 }}
      footer={null}
      title={data?.name || '函数详情'}
      visible={visible}
      className={styles['function-content']}
    >
      <div className={styles['function-content-code']}>
        <PyCodeContent value={data?.content || ''} readOnly />
      </div>
    </OsModal>
  );
};
