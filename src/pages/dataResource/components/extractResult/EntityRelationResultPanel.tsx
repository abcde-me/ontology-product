import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space,
  Table,
  Typography
} from '@arco-design/web-react';
import { IconApps, IconLink } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type {
  EntityRelationExtractResult,
  ExtractedEntity,
  ExtractedRelation
} from '../../types/fileExtract';
import { updateFileExtractTask } from '../../services/fileExtractStorage';
import { EntityRelationGraph } from './EntityRelationGraph';
import { ExtractResultSection } from './ExtractResultSection';
import styles from '../../index.module.scss';

const TABLE_SCROLL_HEIGHT = 280;

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface EntityRelationResultPanelProps {
  taskId: string;
  result: EntityRelationExtractResult;
  onSaved: () => void;
}

export const EntityRelationResultPanel: React.FC<
  EntityRelationResultPanelProps
> = ({ taskId, result, onSaved }) => {
  const [entities, setEntities] = useState<ExtractedEntity[]>(
    result.entities || []
  );
  const [relations, setRelations] = useState<ExtractedRelation[]>(
    result.relations || []
  );
  const [entityModalVisible, setEntityModalVisible] = useState(false);
  const [relationModalVisible, setRelationModalVisible] = useState(false);
  const [editingEntity, setEditingEntity] = useState<ExtractedEntity | null>(
    null
  );
  const [editingRelation, setEditingRelation] =
    useState<ExtractedRelation | null>(null);
  const [entityForm] = Form.useForm();
  const [relationForm] = Form.useForm();
  const [highlightedEntityId, setHighlightedEntityId] = useState<string | null>(
    null
  );
  const [highlightedRelationId, setHighlightedRelationId] = useState<
    string | null
  >(null);

  const entityNameMap = useMemo(
    () => new Map(entities.map((entity) => [entity.id, entity.name])),
    [entities]
  );

  const persist = (
    nextEntities: ExtractedEntity[],
    nextRelations: ExtractedRelation[]
  ) => {
    setEntities(nextEntities);
    setRelations(nextRelations);
    updateFileExtractTask(taskId, {
      result: {
        ...result,
        entities: nextEntities,
        relations: nextRelations
      }
    });
    onSaved();
  };

  const openCreateEntity = () => {
    setEditingEntity(null);
    entityForm.resetFields();
    setEntityModalVisible(true);
  };

  const openEditEntity = (entity: ExtractedEntity) => {
    setEditingEntity(entity);
    entityForm.setFieldsValue(entity);
    setEntityModalVisible(true);
  };

  const submitEntity = async () => {
    const values = await entityForm.validate();
    const payload: ExtractedEntity = {
      id: editingEntity?.id || createId('entity'),
      name: String(values.name).trim(),
      type: String(values.type).trim(),
      description: String(values.description || '').trim() || undefined
    };

    const nextEntities = editingEntity
      ? entities.map((item) => (item.id === editingEntity.id ? payload : item))
      : [...entities, payload];

    persist(nextEntities, relations);
    setEntityModalVisible(false);
    Message.success(editingEntity ? '实体已更新' : '实体已添加');
  };

  const deleteEntity = (entityId: string) => {
    const nextEntities = entities.filter((item) => item.id !== entityId);
    const nextRelations = relations.filter(
      (item) =>
        item.sourceEntityId !== entityId && item.targetEntityId !== entityId
    );
    persist(nextEntities, nextRelations);
    Message.success('实体已删除');
  };

  const openCreateRelation = () => {
    setEditingRelation(null);
    relationForm.resetFields();
    setRelationModalVisible(true);
  };

  const openEditRelation = (relation: ExtractedRelation) => {
    setEditingRelation(relation);
    relationForm.setFieldsValue(relation);
    setRelationModalVisible(true);
  };

  const submitRelation = async () => {
    const values = await relationForm.validate();
    const payload: ExtractedRelation = {
      id: editingRelation?.id || createId('relation'),
      sourceEntityId: values.sourceEntityId,
      targetEntityId: values.targetEntityId,
      relationType: String(values.relationType).trim(),
      description: String(values.description || '').trim() || undefined
    };

    const nextRelations = editingRelation
      ? relations.map((item) =>
          item.id === editingRelation.id ? payload : item
        )
      : [...relations, payload];

    persist(entities, nextRelations);
    setRelationModalVisible(false);
    Message.success(editingRelation ? '关系已更新' : '关系已添加');
  };

  const deleteRelation = (relationId: string) => {
    persist(
      entities,
      relations.filter((item) => item.id !== relationId)
    );
    Message.success('关系已删除');
  };

  const toggleEntityHighlight = (entityId: string) => {
    setHighlightedRelationId(null);
    setHighlightedEntityId((current) =>
      current === entityId ? null : entityId
    );
  };

  const toggleRelationHighlight = (relationId: string) => {
    setHighlightedEntityId(null);
    setHighlightedRelationId((current) =>
      current === relationId ? null : relationId
    );
  };

  const entityColumns: ColumnProps<ExtractedEntity>[] = [
    { title: '实体名称', dataIndex: 'name', width: 140 },
    { title: '实体类型', dataIndex: 'type', width: 120 },
    { title: '说明', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Space size={12}>
          <Button
            type="text"
            className={styles['table-action']}
            onClick={(event) => {
              event.stopPropagation();
              openEditEntity(record);
            }}
          >
            编辑
          </Button>
          <Button
            type="text"
            status="danger"
            className={styles['table-action']}
            onClick={(event) => {
              event.stopPropagation();
              deleteEntity(record.id);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const relationColumns: ColumnProps<ExtractedRelation>[] = [
    {
      title: '源实体',
      dataIndex: 'sourceEntityId',
      width: 120,
      render: (value) => entityNameMap.get(value) || value
    },
    {
      title: '关系类型',
      dataIndex: 'relationType',
      width: 110
    },
    {
      title: '目标实体',
      dataIndex: 'targetEntityId',
      width: 120,
      render: (value) => entityNameMap.get(value) || value
    },
    { title: '说明', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Space size={12}>
          <Button
            type="text"
            className={styles['table-action']}
            onClick={(event) => {
              event.stopPropagation();
              openEditRelation(record);
            }}
          >
            编辑
          </Button>
          <Button
            type="text"
            status="danger"
            className={styles['table-action']}
            onClick={(event) => {
              event.stopPropagation();
              deleteRelation(record.id);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const entityOptions = entities.map((entity) => ({
    label: entity.name,
    value: entity.id
  }));

  return (
    <div className={styles['entity-relation-workspace']}>
      <ExtractResultSection
        title="关系图谱"
        contentVariant="graph"
        stats={`${entities.length} 个实体 · ${relations.length} 条关系`}
        hint="点击下方列表行，可在图谱中高亮对应节点与关系"
      >
        <EntityRelationGraph
          entities={entities}
          relations={relations}
          highlightedEntityId={highlightedEntityId}
          highlightedRelationId={highlightedRelationId}
        />
      </ExtractResultSection>

      <ExtractResultSection
        title="提取明细"
        hint="支持新增、编辑与删除，修改将自动保存"
      >
        <div className={styles['entity-relation-details-grid']}>
          <div
            className={`${styles['entity-relation-detail-panel']} ${styles['entity-relation-detail-panel--entity']}`}
          >
            <div className={styles['entity-relation-detail-header']}>
              <div className={styles['entity-relation-detail-title']}>
                <span className={styles['entity-relation-detail-icon']}>
                  <IconApps />
                </span>
                <Typography.Text bold>实体列表</Typography.Text>
                <Badge
                  count={entities.length}
                  maxCount={999}
                  className={styles['entity-relation-detail-badge']}
                />
              </div>
              <Button type="primary" size="small" onClick={openCreateEntity}>
                新增实体
              </Button>
            </div>
            <div className={styles['entity-relation-detail-body']}>
              <Table
                rowKey="id"
                columns={entityColumns}
                data={entities}
                pagination={false}
                border={false}
                className={styles['entity-relation-table']}
                scroll={{ y: TABLE_SCROLL_HEIGHT }}
                rowClassName={(record) =>
                  record.id === highlightedEntityId
                    ? styles['entity-relation-row-active-entity']
                    : ''
                }
                onRow={(record) => ({
                  onClick: () => toggleEntityHighlight(record.id)
                })}
              />
            </div>
          </div>

          <div
            className={`${styles['entity-relation-detail-panel']} ${styles['entity-relation-detail-panel--relation']}`}
          >
            <div className={styles['entity-relation-detail-header']}>
              <div className={styles['entity-relation-detail-title']}>
                <span className={styles['entity-relation-detail-icon']}>
                  <IconLink />
                </span>
                <Typography.Text bold>关系列表</Typography.Text>
                <Badge
                  count={relations.length}
                  maxCount={999}
                  className={styles['entity-relation-detail-badge']}
                />
              </div>
              <Button type="primary" size="small" onClick={openCreateRelation}>
                新增关系
              </Button>
            </div>
            <div className={styles['entity-relation-detail-body']}>
              <Table
                rowKey="id"
                columns={relationColumns}
                data={relations}
                pagination={false}
                border={false}
                className={styles['entity-relation-table']}
                scroll={{ y: TABLE_SCROLL_HEIGHT }}
                rowClassName={(record) =>
                  record.id === highlightedRelationId
                    ? styles['entity-relation-row-active-relation']
                    : ''
                }
                onRow={(record) => ({
                  onClick: () => toggleRelationHighlight(record.id)
                })}
              />
            </div>
          </div>
        </div>
      </ExtractResultSection>

      <Modal
        title={editingEntity ? '编辑实体' : '新增实体'}
        visible={entityModalVisible}
        onOk={() => void submitEntity()}
        onCancel={() => setEntityModalVisible(false)}
        unmountOnExit
      >
        <Form form={entityForm} layout="vertical">
          <Form.Item label="实体名称" field="name" rules={[{ required: true }]}>
            <Input placeholder="请输入实体名称" />
          </Form.Item>
          <Form.Item label="实体类型" field="type" rules={[{ required: true }]}>
            <Input placeholder="请输入实体类型" />
          </Form.Item>
          <Form.Item label="说明" field="description">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRelation ? '编辑关系' : '新增关系'}
        visible={relationModalVisible}
        onOk={() => void submitRelation()}
        onCancel={() => setRelationModalVisible(false)}
        unmountOnExit
      >
        <Form form={relationForm} layout="vertical">
          <Form.Item
            label="源实体"
            field="sourceEntityId"
            rules={[{ required: true, message: '请选择源实体' }]}
          >
            <Select placeholder="请选择源实体" options={entityOptions} />
          </Form.Item>
          <Form.Item
            label="关系类型"
            field="relationType"
            rules={[{ required: true }]}
          >
            <Input placeholder="如：指挥、关联、包含" />
          </Form.Item>
          <Form.Item
            label="目标实体"
            field="targetEntityId"
            rules={[{ required: true, message: '请选择目标实体' }]}
          >
            <Select placeholder="请选择目标实体" options={entityOptions} />
          </Form.Item>
          <Form.Item label="说明" field="description">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
