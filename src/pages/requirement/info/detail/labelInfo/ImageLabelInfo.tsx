import React, { useState } from 'react';
import { Table, Tooltip, Tag } from '@arco-design/web-react';
import { shapeOptions } from '@/pages/requirement/common';

interface LabelInfoAttribute {
  id: number;
  order_num: number;
  attribute_name_cn: string;
  attribute_name_en: string;
  input_type: number;
}

interface LabelInfoAttributeGroup {
  id: number;
  order_num: number;
  attribute_group_name: string;
  attribute_group_class: number; // 1单选/2多选/3输入框
  attribute_group_type: number; // 1必选/2非必选
  label_info_attribute: LabelInfoAttribute[];
}

interface LabelInfo {
  id: number;
  label_mappings: string[];
  order_num: number;
  label_name_cn: string;
  label_name_en: string;
  label_shape: number; // 3=矩形
  label_colour: string;
  label_info_attribute_groups: LabelInfoAttributeGroup[];
}

function ImageLabelInfo({
  labelInfo,
  hasModel
}: {
  labelInfo: LabelInfo[];
  hasModel?: boolean;
}) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(
    []
  );

  // 获取标注工具显示文本
  const getLabelShapeText = (shape: number) => {
    const shapeOption = shapeOptions.find((option) => option.value === shape);
    return shapeOption?.label || '未知';
  };

  // 获取标注工具图标
  const getLabelShapeIcon = (shape: number) => {
    const shapeOption = shapeOptions.find((option) => option.value === shape);
    return shapeOption?.icon;
  };

  // 获取属性组类型显示文本
  const getAttributeGroupClassText = (classType: number) => {
    const classMap: Record<number, string> = {
      1: '单选',
      2: '多选',
      3: '输入框'
    };
    return classMap[classType] || '未知';
  };

  // 渲染模型映射标签
  const renderModelMappings = (mappings: string[]) => {
    if (!mappings || mappings.length === 0 || !mappings[0]) {
      return '-';
    }

    const maxVisible = 2; // 最多显示2个标签
    const visibleMappings = mappings.slice(0, maxVisible);
    const hiddenCount = mappings.length - maxVisible;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {visibleMappings.map((mapping, index) => (
          <Tag
            key={index}
            style={{
              backgroundColor: '#f5f5f5',
              border: 'none',
              color: '#1d2129',
              padding: '2px 8px',
              fontSize: 13
            }}
          >
            {mapping}
          </Tag>
        ))}
        {hiddenCount > 0 && (
          <Tooltip
            content={
              <div>
                {mappings.slice(maxVisible).map((mapping, index) => (
                  <div key={index} style={{ marginBottom: 4 }}>
                    {mapping}
                  </div>
                ))}
              </div>
            }
          >
            <Tag
              style={{
                backgroundColor: '#f5f5f5',
                border: 'none',
                color: '#1d2129',
                padding: '2px 8px',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              +{hiddenCount}
            </Tag>
          </Tooltip>
        )}
      </div>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '标签名称',
      dataIndex: 'label_name_en',
      width: 200,
      render: (value: string) => value || '-'
    },
    {
      title: '展示名称',
      dataIndex: 'label_name_cn',
      width: 200,
      render: (value: string) => value || '-'
    },
    // 只有当 hasModel 为 true 时才显示模型映射列
    ...(hasModel
      ? [
          {
            title: '模型映射',
            dataIndex: 'label_mappings',
            width: 200,
            render: (mappings: string[]) => renderModelMappings(mappings)
          }
        ]
      : []),
    {
      title: '标注工具',
      dataIndex: 'label_shape',
      width: 120,
      render: (shape: number) => {
        const icon = getLabelShapeIcon(shape);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && (
              <img
                src={icon}
                alt={getLabelShapeText(shape)}
                style={{
                  width: 16,
                  height: 16,
                  objectFit: 'contain'
                }}
              />
            )}
            <span>{getLabelShapeText(shape)}</span>
          </div>
        );
      }
    },
    {
      title: '标注颜色',
      dataIndex: 'label_colour',
      width: 120,
      render: (color: string) => {
        return (
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color || '#ccc',
              borderRadius: 4,
              border: '1px solid #e5e7eb'
            }}
          />
        );
      }
    }
  ];

  // 展开行内容渲染
  const expandedRowRender = (record: LabelInfo) => {
    const { label_info_attribute_groups } = record;

    if (
      !label_info_attribute_groups ||
      label_info_attribute_groups.length === 0
    ) {
      return (
        <div style={{ padding: '16px 0', color: '#86909c' }}>暂无属性组</div>
      );
    }

    return (
      <div>
        {label_info_attribute_groups.map((group, groupIndex) => (
          <div
            key={group.id || groupIndex}
            style={{
              marginBottom:
                groupIndex < label_info_attribute_groups.length - 1 ? 16 : 0,
              padding: '12px 10px',
              backgroundColor: '#fff',
              borderRadius: 8
            }}
          >
            {/* 属性组头部信息 */}
            <div
              style={{
                paddingBottom: 8,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '22px',
                borderBottom: '1px solid #E2E8F0'
              }}
            >
              <span style={{ color: '#6E7B8D' }}>属性{groupIndex + 1}: </span>
              <span style={{ fontWeight: 500, color: '#1E293B' }}>
                {group.attribute_group_name || '-'}
              </span>
              <span style={{ margin: '0 12px', color: '#E2E8F0' }}>|</span>
              <span style={{ color: '#1E293B' }}>
                {getAttributeGroupClassText(group.attribute_group_class)}
              </span>
              <span style={{ margin: '0 12px', color: '#E2E8F0' }}>|</span>
              {group.attribute_group_type === 1 && (
                <span style={{ color: '#1E293B' }}>必须标注</span>
              )}
            </div>

            {/* 属性选项列表 - 两列布局 */}
            {group.label_info_attribute &&
              group.label_info_attribute.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px 24px',
                    paddingTop: 8
                  }}
                >
                  {group.label_info_attribute.map((attr, attrIndex) => (
                    <div
                      key={attr.id || attrIndex}
                      style={{
                        fontSize: 14,
                        color: '#6E7B8D',
                        lineHeight: '22px'
                      }}
                    >
                      <span>选项{attrIndex + 1}: </span>
                      <span
                        style={{
                          color: '#1E293B',
                          fontSize: 14,
                          lineHeight: '22px'
                        }}
                      >
                        {attr.attribute_name_en || '-'}
                        {attr.attribute_name_cn &&
                          ` (${attr.attribute_name_cn})`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
        rowKey="id"
      />
    </div>
  );
}

export default ImageLabelInfo;
