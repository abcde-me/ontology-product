import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  TableColumnProps,
  Radio,
  Button,
  Message,
  Spin
} from '@arco-design/web-react';
import { PublicProperty } from '@/types/attributes';
import { listOntologyPublicProperties } from '@/api/ontologySceneLibrary/attributes';

export interface PublicAttribute {
  id: number; // 公共属性ID
  name: string; // 公共属性名称（comment字段）
}

interface BindPublicAttributeModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (attribute: PublicAttribute) => void;
  initialSelectedId?: number; // 初始选中的公共属性ID
  columnType?: string; // 支持字段类型
}

const BindPublicAttributeModal: React.FC<BindPublicAttributeModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  initialSelectedId,
  columnType
}) => {
  const [publicProperties, setPublicProperties] = useState<PublicProperty[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  // 加载公共属性列表
  useEffect(() => {
    if (visible) {
      loadPublicProperties();
    }
  }, [visible]);

  // 检查字段类型是否匹配
  const isColumnTypeMatch = (record: PublicProperty): boolean => {
    if (!columnType) return true; // 如果没有传入 columnType，则所有行都可选
    return record.columnType === columnType;
  };

  // 根据 initialSelectedId 设置选中项
  useEffect(() => {
    if (visible && publicProperties.length > 0) {
      if (initialSelectedId !== undefined) {
        const exists = publicProperties.some(
          (item) => item.id === initialSelectedId && isColumnTypeMatch(item)
        );
        if (exists) {
          setSelectedId(initialSelectedId);
        } else {
          // 如果初始ID不存在或类型不匹配，选择第一个类型匹配的项
          const firstMatch = publicProperties.find((item) =>
            isColumnTypeMatch(item)
          );
          if (firstMatch) {
            setSelectedId(firstMatch.id);
          }
        }
      } else {
        // 没有初始选中ID，默认选中第一个类型匹配的项
        const firstMatch = publicProperties.find((item) =>
          isColumnTypeMatch(item)
        );
        if (firstMatch) {
          setSelectedId(firstMatch.id);
        }
      }
    }
  }, [visible, initialSelectedId, publicProperties, columnType]);

  const loadPublicProperties = async () => {
    setLoading(true);
    try {
      const response = await listOntologyPublicProperties({
        pageNo: 1,
        pageSize: 100 // 获取足够多的数据
      });

      if (response.status === 200 && response.code === '') {
        setPublicProperties(response.data.result || []);
      } else {
        Message.error(response.message || '加载公共属性列表失败');
      }
    } catch (error) {
      Message.error('加载公共属性列表失败');
      console.error('加载公共属性列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnProps<PublicProperty>[] = [
    {
      title: '选择',
      dataIndex: 'select',
      width: 80,
      render: (_, record) => {
        const isMatch = isColumnTypeMatch(record);
        return (
          <Radio
            checked={selectedId === record.id}
            onChange={() => setSelectedId(record.id)}
            disabled={!isMatch}
          />
        );
      }
    },
    {
      title: '公共属性名称',
      dataIndex: 'comment',
      width: 160,
      render: (value) => value || '-'
    },
    {
      title: '数据源',
      dataIndex: 'dataSource',
      width: 200,
      render: (value) => value || '-'
    },
    {
      title: '支持字段类型',
      dataIndex: 'columnType',
      width: 150,
      render: (value) => value || '-'
    },
    {
      title: '唯一标识',
      dataIndex: 'name',
      width: 150,
      render: (value) => value || '-'
    }
  ];

  const handleConfirm = () => {
    if (selectedId === undefined) {
      Message.warning('请选择一个公共属性');
      return;
    }

    const selectedProperty = publicProperties.find(
      (item) => item.id === selectedId
    );
    if (selectedProperty) {
      // 再次检查类型是否匹配
      if (!isColumnTypeMatch(selectedProperty)) {
        Message.warning('选中的公共属性类型不匹配');
        return;
      }
      // 传递 id 和 name（comment字段作为name）
      onConfirm({
        id: selectedProperty.id!,
        name: selectedProperty.name!
      });
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
      <Spin loading={loading}>
        <Table
          columns={columns}
          data={publicProperties}
          rowKey="id"
          pagination={false}
          border={false}
        />
      </Spin>
    </Modal>
  );
};

export default BindPublicAttributeModal;
