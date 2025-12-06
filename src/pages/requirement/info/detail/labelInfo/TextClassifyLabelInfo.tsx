import React, { useState } from 'react';
import { Table } from '@arco-design/web-react';

interface FileLabelAttribute {
  attribute_id?: string;
  order_num: number;
  attribute_name_cn: string; // 中文名称（展示名称）
  attribute_name_en: string; // 英文名称（存储名称）
  input_type: number; // 输入类型：1选项，2输入框
}

interface FileLabelInfo {
  attribute_id?: string;
  order_num: number;
  attribute_group_name: string; // 属性组名称
  attribute_group_class: number; // 1单选/2多选/3输入框
  attribute_group_type: number; // 1必选/2非必选
  file_label_attribute: FileLabelAttribute[];
}

function TextClassifyLabelInfo({ labelInfo }: { labelInfo: FileLabelInfo[] }) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(
    []
  );

  // 获取属性组类型显示文本
  const getAttributeGroupClassText = (classType: number) => {
    const classMap: Record<number, string> = {
      1: '单选',
      2: '多选',
      3: '输入框'
    };
    return classMap[classType] || '未知';
  };

  // 表格列定义
  const columns = [
    {
      title: '属性名称',
      dataIndex: 'attribute_group_name',
      width: 300,
      render: (value: string) => value || '-'
    },
    {
      title: '状态',
      dataIndex: 'attribute_group_class',
      width: 150,
      render: (value: number) => getAttributeGroupClassText(value)
    },
    {
      title: '必须标注',
      dataIndex: 'attribute_group_type',
      width: 150,
      render: (value: number) => (value === 1 ? '是' : '否')
    }
  ];

  // 展开行内容渲染
  const expandedRowRender = (record: FileLabelInfo) => {
    const { file_label_attribute } = record;

    if (!file_label_attribute || file_label_attribute.length === 0) {
      return (
        <div style={{ padding: '16px 0', color: '#86909c' }}>暂无选项</div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0 24px',
          paddingTop: 8
        }}
      >
        {file_label_attribute.map((attr, attrIndex) => (
          <div
            key={attr.attribute_id || attrIndex}
            style={{
              marginBottom:
                attrIndex < file_label_attribute.length - 1 ? 16 : 0,
              padding: '12px 10px',
              backgroundColor: '#fff',
              borderRadius: 8
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: '#6E7B8D',
                lineHeight: '22px'
              }}
            >
              <span>选项{attrIndex + 1}:</span>
              <span style={{ marginLeft: 8, color: '#1E293B' }}>
                {attr.attribute_name_en || '-'}
              </span>
              {attr.attribute_name_cn && (
                <span style={{ marginLeft: 4, color: '#1E293B' }}>
                  ({attr.attribute_name_cn})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 处理展开/收起
  const handleExpandedRowsChange = (keys: (string | number)[]) => {
    setExpandedRowKeys(keys);
  };

  if (!labelInfo || labelInfo.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#86909c' }}>
        暂无标签信息
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          marginBottom: 4,
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '22px',
          color: 'rgb(110, 123, 141)'
        }}
      >
        标签和属性:
      </div>
      <Table
        columns={columns}
        data={labelInfo}
        pagination={false}
        border={false}
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={handleExpandedRowsChange}
        expandedRowRender={expandedRowRender}
        expandProps={{ width: 30 }}
        rowKey={(record) => record.attribute_id || record.order_num}
      />
    </div>
  );
}

export default TextClassifyLabelInfo;
