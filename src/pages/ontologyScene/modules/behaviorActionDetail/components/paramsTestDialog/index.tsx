import React from 'react';
import { Modal } from '@arco-design/web-react';
import styles from '././index.module.scss';

export const ParamsTestDialog = () => {
  return (
    <Modal
      title={'参数测试'}
      footer={null}
      visible={true}
      style={{ width: '900px' }}
    >
      <div className={styles['params-dialog-content']}>
        <div className={styles['left']}>
          <div className={styles['head']}></div>
          <div className={styles['body']}></div>
          <div className={styles['footer']}></div>
        </div>
        <div className={styles['right']}>
          <div className={styles['head']}></div>
          <div className={styles['body']}></div>
        </div>
      </div>
    </Modal>
  );
};
