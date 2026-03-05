import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  TableColumnProps,
  Radio,
  Button,
  Message,
  Popover
} from '@arco-design/web-react';
import { PublicProperty } from '@/types/attributes';
import { listOntologyPublicProperties } from '@/api/ontologySceneLibrary/attributes';
import { useWorkflowTable } from '@/pages/ontologyScene/hooks/useTable';
import { PaginationProps } from '@arco-design/web-react';
import { EllipsisPopover } from '@ceai-front/arco-material';

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
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  // 使用 useWorkflowTable hook 管理表格数据
  const {
    data: publicProperties,
    loading,
    pagination,
    refresh,
    onChange
  } = useWorkflowTable<PublicProperty, any>({
    service: async (params) => {
      const response = await listOntologyPublicProperties({
        pageNo: params.page || 1,
        pageSize: params.page_size || 10
      });

      if (response.status === 200 && response.code === '') {
        const result = response.data.result || [];
        const total = response.data.totalCount || 0;

        return {
          data: {
            items: result,
            total,
            page: params.page || 1,
            page_size: params.page_size || 10
          }
        };
      } else {
        Message.error(response.message || '加载公共属性列表失败');
        return {
          data: {
            items: [],
            total: 0,
            page: params.page || 1,
            page_size: params.page_size || 10
          }
        };
      }
    },
    defaultPageSize: 10,
    manual: false, // 自动管理请求
    formatParams: (formValues, pagination) => {
      return {
        page: pagination.current,
        page_size: pagination.pageSize
      };
    }
  });

  // 当弹窗打开时，重置分页到第一页并触发请求
  useEffect(() => {
    if (visible) {
      // 如果当前不在第一页，重置到第一页（这会触发 onChange 并自动请求数据）
      if (pagination.current !== 1) {
        onChange(
          {
            ...pagination,
            current: 1
          },
          undefined,
          undefined
        );
      } else {
        // 如果已经在第一页，手动刷新数据
        refresh();
      }
    } else {
      // 弹窗关闭时，清空选中状态
      setSelectedId(undefined);
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

  const columns: TableColumnProps<PublicProperty>[] = [
    {
      title: '选择',
      dataIndex: 'select',
      width: 80,
      render: (_, record) => {
        const isMatch = isColumnTypeMatch(record);
        return isMatch ? (
          <Radio
            checked={selectedId === record.id}
            onChange={() => setSelectedId(record.id)}
          />
        ) : (
          <Popover content="与表字段的字段类型不符">
            <Radio
              checked={selectedId === record.id}
              onChange={() => setSelectedId(record.id)}
              disabled={!isMatch}
            />
          </Popover>
        );
      }
    },
    {
      title: '公共属性名称',
      dataIndex: 'comment',
      width: 160,
      render: (value) => {
        return <EllipsisPopover value={value || '-'} />;
      }
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
      render: (value) => {
        return <EllipsisPopover value={value || '-'} />;
      }
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
      <Table
        columns={columns}
        loading={loading}
        data={publicProperties}
        rowKey="id"
        pagination={Number(pagination?.total) > 10 ? pagination : false}
        border={false}
        onChange={onChange}
      />
    </Modal>
  );
};

export default BindPublicAttributeModal;
