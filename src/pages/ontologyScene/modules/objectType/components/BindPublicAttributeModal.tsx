import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  TableColumnProps,
  Radio,
  Button,
  Message
} from '@arco-design/web-react';

export interface PublicAttribute {
  id: string;
  name: string;
  dataSource: string;
  fieldType: string;
  uniqueId: string;
}

interface BindPublicAttributeModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (attribute: PublicAttribute) => void;
  initialSelectedId?: string; // 初始选中的公共属性ID
}

// 模拟公共属性数据
const MOCK_PUBLIC_ATTRIBUTES: PublicAttribute[] = [
  {
    id: 'media_id',
    name: '情报ID',
    dataSource: 'Media_DATA_SET',
    fieldType: 'STRING',
    uniqueId: 'media_id'
  },
  {
    id: 'type',
    name: '类别',
    dataSource: 'Media_DATA_SET',
    fieldType: 'STRING',
    uniqueId: 'type'
  },
  {
    id: 'source',
    name: '来源',
    dataSource: 'Media_DATA_SET',
    fieldType: 'STRING',
    uniqueId: 'source'
  }
];

const BindPublicAttributeModal: React.FC<BindPublicAttributeModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  initialSelectedId
}) => {
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (visible) {
      // 如果有初始选中的ID，则选中它；否则默认选中第一个公共属性
      if (initialSelectedId) {
        setSelectedId(initialSelectedId);
      } else if (MOCK_PUBLIC_ATTRIBUTES.length > 0) {
        setSelectedId(MOCK_PUBLIC_ATTRIBUTES[0].id);
      } else {
        setSelectedId('');
      }
    }
  }, [visible, initialSelectedId]);

  const columns: TableColumnProps<PublicAttribute>[] = [
    {
      title: '选择',
      dataIndex: 'select',
      width: 80,
      render: (_, record) => (
        <Radio
          checked={selectedId === record.id}
          onChange={() => setSelectedId(record.id)}
        />
      )
    },
    {
      title: '公共属性名称',
      dataIndex: 'name',
      width: 150
    },
    {
      title: '数据源',
      dataIndex: 'dataSource',
      width: 150
    },
    {
      title: '支持字段类型',
      dataIndex: 'fieldType',
      width: 150
    },
    {
      title: '唯一标识',
      dataIndex: 'uniqueId',
      width: 150
    }
  ];

  const handleConfirm = () => {
    if (!selectedId) {
      Message.warning('请选择一个公共属性');
      return;
    }

    const selectedAttribute = MOCK_PUBLIC_ATTRIBUTES.find(
      (attr) => attr.id === selectedId
    );
    if (selectedAttribute) {
      onConfirm(selectedAttribute);
    }
  };

  return (
    <Modal
      title="绑定公共属性"
      visible={visible}
      onCancel={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      }
      style={{ width: 800 }}
    >
      <Table
        columns={columns}
        data={MOCK_PUBLIC_ATTRIBUTES}
        rowKey="id"
        pagination={false}
        border={false}
      />
    </Modal>
  );
};

export default BindPublicAttributeModal;
