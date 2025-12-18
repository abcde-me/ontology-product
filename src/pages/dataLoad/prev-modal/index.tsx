import React, { useEffect, useState } from 'react';
import {
  Input,
  Message,
  Modal,
  Spin,
  Table,
  Tooltip
} from '@arco-design/web-react';
import styles from './index.module.scss';

interface PreviewModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  setVisible: (visible: boolean) => void;
  previewData: {
    data: any;
  };
  loading: boolean;
}

const PreviewModal = ({
  visible,
  onOk,
  onCancel,
  setVisible,
  previewData,
  loading
}: PreviewModalProps) => {
  console.log(previewData, '123', String(previewData?.data?.data));

  // 定义列标题
  const allKeys = [
    ...new Set(previewData?.data?.data?.flatMap((obj) => Object.keys(obj)))
  ];
  const columnCount = allKeys.length;

  // 计算其他列的宽度：如果超过5个就设置为120，否则平分剩余宽度
  const getOtherColumnWidth = () => {
    if (columnCount > 5) {
      return 120;
    } else {
      // 假设表格总宽度为1000px，减去序号列60px，剩余宽度平分
      const remainingWidth = 600 - 60;
      return Math.floor(remainingWidth / columnCount);
    }
  };

  const otherColumnWidth = getOtherColumnWidth();

  const setColumns = () => {
    return allKeys.map((title, index) => ({
      title: <div style={{ whiteSpace: 'nowrap' }}>{title}</div>,
      dataIndex: title,
      width: otherColumnWidth,
      key: title,
      render: (value: string, record: any) => (
        <Tooltip content={title === 'address' ? value : ''}>
          <div className={styles.previewCell}>{value}</div>
        </Tooltip>
      )
    }));
  };

  const columns: any = [
    {
      title: <div style={{ whiteSpace: 'nowrap' }}>序号</div>,
      dataIndex: 'id',
      width: 60,
      key: 'id'
    },
    ...setColumns()
  ];

  // 计算表格总宽度，确保超过容器宽度才能触发滚动
  const tableTotalWidth = 60 + otherColumnWidth * columnCount;

  return (
    <Modal
      title="预览"
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      autoFocus={false}
      focusLock={true}
      footer={null}
      style={{
        width: 1200
      }}
    >
      <Spin loading={loading}>
        <div className={styles.previewContent}>
          <div className={styles.jsonPreview}>
            <div className={styles.jsonTitle}>JSON格式</div>
            <div className={styles.jsonTextArea}>
              {JSON.stringify(previewData?.data?.data)}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.jsonTitle}>储存到数据库效果</div>
            <Table
              // scroll={{ x: Math.max(tableTotalWidth, 1300) }}
              scroll={{
                x: true
              }}
              columns={columns}
              data={previewData?.data?.data}
              style={{ flex: 1, maxWidth: 680 }}
            />
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default PreviewModal;
