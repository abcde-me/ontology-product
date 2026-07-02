import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import {
  Button,
  Message,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag
} from '@arco-design/web-react';
import type { GeneratedRichRelation, RichRelationKind } from '../types';
import { RICH_RELATION_KIND_OPTIONS } from '../constants';
import { saveRichRelations } from '../services/implicitRelationStore';
import RichRelationGenerateModal from './RichRelationGenerateModal';
import styles from './RichRelationPanel.module.scss';

interface RichRelationPanelProps {
  taskId: string;
  sceneId?: number;
  richRelations: GeneratedRichRelation[];
  onChange: (items: GeneratedRichRelation[]) => void;
  onOpenTest?: (relationId?: string) => void;
}

export interface RichRelationPanelHandle {
  openCreate: () => void;
}

const kindLabel = (kind: RichRelationKind) =>
  RICH_RELATION_KIND_OPTIONS.find((item) => item.value === kind)?.label || kind;

const RichRelationPanel = forwardRef<
  RichRelationPanelHandle,
  RichRelationPanelProps
>(function RichRelationPanel(
  { taskId, sceneId, richRelations, onChange, onOpenTest },
  ref
) {
  const [modalVisible, setModalVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    openCreate: () => setModalVisible(true)
  }));

  const handleToggleEnabled = useCallback(
    (record: GeneratedRichRelation, enabled: boolean) => {
      const next = richRelations.map((item) =>
        item.id === record.id ? { ...item, enabled } : item
      );
      onChange(saveRichRelations(taskId, next).richRelations);
    },
    [richRelations, taskId, onChange]
  );

  const handleDelete = (record: GeneratedRichRelation) => {
    const next = richRelations.filter((item) => item.id !== record.id);
    onChange(saveRichRelations(taskId, next).richRelations);
    Message.success('已删除');
  };

  const columns = useMemo(
    () => [
      {
        title: '类型',
        dataIndex: 'kind',
        width: 110,
        render: (kind: RichRelationKind) => (
          <Tag color="arcoblue">{kindLabel(kind)}</Tag>
        )
      },
      { title: '关系名称', dataIndex: 'name', width: 160, ellipsis: true },
      {
        title: '关系路径',
        width: 200,
        ellipsis: true,
        render: (_: unknown, record: GeneratedRichRelation) =>
          `${record.sourceNodeName || record.sourceNodeId} → ${record.targetNodeName || record.targetNodeId}`
      },
      { title: '说明', dataIndex: 'description', ellipsis: true },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 72,
        render: (enabled: boolean, record: GeneratedRichRelation) => (
          <Switch
            size="small"
            checked={enabled}
            onChange={(checked) => handleToggleEnabled(record, checked)}
          />
        )
      },
      {
        title: '操作',
        width: 120,
        render: (_: unknown, record: GeneratedRichRelation) => (
          <Space>
            <Button
              type="text"
              size="mini"
              onClick={() => onOpenTest?.(record.id)}
            >
              测试
            </Button>
            <Popconfirm
              title="确认删除该补充链接/关系？"
              onOk={() => handleDelete(record)}
            >
              <Button type="text" size="mini" status="danger">
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleToggleEnabled, onOpenTest, richRelations, taskId, onChange]
  );

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            data={richRelations}
            pagination={false}
            scroll={{ y: 'calc(100vh - 420px)' }}
            noDataElement="暂无补充链接/关系，点击上方补充链接"
          />
        </div>
      </div>

      <RichRelationGenerateModal
        visible={modalVisible}
        taskId={taskId}
        sceneId={sceneId}
        richRelations={richRelations}
        onCancel={() => setModalVisible(false)}
        onSuccess={(items) => {
          onChange(items);
          setModalVisible(false);
        }}
      />
    </div>
  );
});

export default RichRelationPanel;
