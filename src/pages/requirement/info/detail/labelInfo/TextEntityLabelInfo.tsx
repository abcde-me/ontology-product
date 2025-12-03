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
      (!start_entity_labels || start_entity_labels.length === 0) &&
      (!target_entity_labels || target_entity_labels.length === 0)
    ) {
      return (
        <div style={{ padding: '16px 0', color: '#86909c' }}>
          暂无实体关系映射
        </div>
      );
    }

    return (
      <div
        style={{
          padding: '12px 10px',
          backgroundColor: '#fff',
          borderRadius: 8
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 13,
            color: '#4e5969',
            lineHeight: '20px'
          }}
        >
          {/* 起始标签 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>起始标签</div>
            {start_entity_labels && start_entity_labels.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {start_entity_labels.map((label, index) => {
                  // 从实体标签中找到对应的颜色和中文名称
                  const entityLabel = labelInfo?.find(
                    (item) => item.label_name_en === label
                  );
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor:
                            entityLabel?.label_colour || '#f5f5f5',
                          borderRadius: 4,
                          flexShrink: 0
                        }}
                      />
                      <span>{entityLabel?.label_name_cn || label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span style={{ color: '#86909c' }}>-</span>
            )}
          </div>

          {/* 目标标签 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>目标标签</div>
            {target_entity_labels && target_entity_labels.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {target_entity_labels.map((label, index) => {
                  // 从实体标签中找到对应的颜色和中文名称
                  const entityLabel = labelInfo?.find(
                    (item) => item.label_name_en === label
                  );
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor:
                            entityLabel?.label_colour || '#f5f5f5',
                          borderRadius: 4,
                          flexShrink: 0
                        }}
                      />
                      <span>{entityLabel?.label_name_cn || label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span style={{ color: '#86909c' }}>-</span>
            )}
          </div>
        </div>
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
