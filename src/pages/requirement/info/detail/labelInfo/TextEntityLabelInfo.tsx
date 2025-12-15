import React from 'react';
import { Table } from '@arco-design/web-react';

interface EntityLabel {
  label_id?: string;
  order_num: number;
  label_name_cn: string; // 展示名称
  label_name_en: string; // 存储名称
  label_colour: string; // 标签颜色
}

interface EntityRelation {
  relation_id?: string;
  order_num: number;
  relation_name_cn: string; // 展示名称
  relation_name_en: string; // 存储名称
  start_entity_labels: string[]; // 起始标签
  target_entity_labels: string[]; // 目标标签
  colour?: string;
}

function TextEntityLabelInfo({
  labelInfo,
  entityRelations
}: {
  labelInfo: EntityLabel[];
  entityRelations: EntityRelation[];
}) {
  // 实体标签列定义
  const entityColumns = [
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

  // 关系标签列定义
  const relationColumns = [
    {
      title: '标签名称',
      dataIndex: 'relation_name_en',
      width: 200,
      render: (value: string) => value || '-'
    },
    {
      title: '展示名称',
      dataIndex: 'relation_name_cn',
      width: 200,
      render: (value: string) => value || '-'
    }
  ];

  // 展开行内容渲染 - 显示实体关系映射
  const expandedRowRender = (record: EntityRelation) => {
    const { start_entity_labels, target_entity_labels } = record;

    if (
      !start_entity_labels ||
      start_entity_labels.length === 0 ||
      !target_entity_labels ||
      target_entity_labels.length === 0
    ) {
      return (
        <div style={{ padding: '16px 0', color: '#86909c' }}>
          暂无实体关系映射
        </div>
      );
    }

    // 将起始标签和目标标签组合成表格数据（笛卡尔积）
    const tableData: {
      key: string;
      startLabel: string;
      targetLabel: string;
    }[] = [];
    const startLabels = start_entity_labels || [];
    const targetLabels = target_entity_labels || [];

    startLabels.forEach((startLabel, i) => {
      targetLabels.forEach((targetLabel, j) => {
        tableData.push({
          key: `${i}-${j}`,
          startLabel,
          targetLabel
        });
      });
    });

    // 渲染标签单元格
    const renderLabelCell = (labelName: string) => {
      const entityLabel = labelInfo?.find(
        (item) => item.label_name_en === labelName
      );

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: entityLabel?.label_colour || '#f5f5f5',
              borderRadius: 4,
              flexShrink: 0
            }}
          />
          <span>{entityLabel?.label_name_cn || labelName}</span>
        </div>
      );
    };

    const expandColumns = [
      {
        title: '起始标签',
        dataIndex: 'startLabel',
        width: '50%',
        bodyCellStyle: { backgroundColor: '#fff' },
        render: (value: string) => renderLabelCell(value)
      },
      {
        title: '目标标签',
        dataIndex: 'targetLabel',
        width: '50%',
        bodyCellStyle: { backgroundColor: '#fff' },
        render: (value: string) => renderLabelCell(value)
      }
    ];

    return (
      <div
        style={{
          padding: '12px 10px',
          borderRadius: 8
        }}
      >
        <Table
          columns={expandColumns}
          data={tableData}
          pagination={false}
          border={false}
          rowKey="key"
        />
      </div>
    );
  };

  const hasEntityLabels = labelInfo && labelInfo.length > 0;
  const hasRelations = entityRelations && entityRelations.length > 0;

  return (
    <div style={{ marginTop: 16 }}>
      {/* 实体标签和关系标签 - 两列布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 实体标签 */}
        <div>
          <div
            style={{
              marginBottom: 4,
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '22px',
              color: 'rgb(110, 123, 141)'
            }}
          >
            实体标签:
          </div>
          {hasEntityLabels ? (
            <Table
              columns={entityColumns}
              data={labelInfo}
              pagination={false}
              border={false}
              rowKey={(record) => record.label_id || record.order_num}
            />
          ) : (
            <div
              style={{
                padding: '40px 0',
                textAlign: 'center',
                color: '#86909c'
              }}
            >
              暂无实体标签
            </div>
          )}
        </div>

        {/* 关系标签 */}
        <div>
          <div
            style={{
              marginBottom: 4,
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '22px',
              color: 'rgb(110, 123, 141)'
            }}
          >
            关系标签:
          </div>
          {hasRelations ? (
            <Table
              columns={relationColumns}
              data={entityRelations}
              pagination={false}
              border={false}
              expandedRowRender={expandedRowRender}
              expandProps={{ width: 30 }}
              rowKey={(record) => record.relation_id || record.order_num}
            />
          ) : (
            <div
              style={{
                padding: '40px 0',
                textAlign: 'center',
                color: '#86909c'
              }}
            >
              暂无关系标签
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextEntityLabelInfo;
