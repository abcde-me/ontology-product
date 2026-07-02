import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Message,
  Modal,
  Typography
} from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import type { GeneratedRichRelation, RichRelationKind } from '../types';
import { RICH_RELATION_KIND_OPTIONS } from '../constants';
import {
  generateRichRelations,
  mergeRichRelations
} from '../services/richRelationGenerator';
import { saveRichRelations } from '../services/implicitRelationStore';

const { Text, Paragraph } = Typography;

interface RichRelationGenerateModalProps {
  visible: boolean;
  taskId: string;
  sceneId?: number;
  richRelations: GeneratedRichRelation[];
  onCancel: () => void;
  onSuccess: (items: GeneratedRichRelation[]) => void;
}

export default function RichRelationGenerateModal({
  visible,
  taskId,
  sceneId,
  richRelations,
  onCancel,
  onSuccess
}: RichRelationGenerateModalProps) {
  const [selectedKinds, setSelectedKinds] = useState<RichRelationKind[]>([
    'symmetric',
    'transitive',
    'inverse'
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedKinds(['symmetric', 'transitive', 'inverse']);
    }
  }, [visible]);

  const handleGenerate = async () => {
    if (!sceneId) {
      Message.warning('请先选择本体图谱');
      return;
    }
    if (!selectedKinds.length) {
      Message.warning('请至少选择一种补充关系类型');
      return;
    }

    setLoading(true);
    try {
      const generated = await generateRichRelations(sceneId, selectedKinds);
      if (!generated.length) {
        Message.info('未生成新的补充链接/关系，可能当前图谱已包含对应关系');
        return;
      }
      const merged = mergeRichRelations(richRelations, generated);
      const saved = saveRichRelations(taskId, merged).richRelations;
      Message.success(`已生成 ${generated.length} 条补充链接/关系`);
      onSuccess(saved);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新增补充链接/关系"
      visible={visible}
      onCancel={onCancel}
      footer={
        <Button
          type="outline"
          icon={<IconRefresh />}
          loading={loading}
          onClick={() => void handleGenerate()}
        >
          生成补充链接/关系
        </Button>
      }
      autoFocus={false}
      unmountOnExit
      style={{ width: 520 }}
    >
      <Paragraph className="mb-4 text-[13px] text-[var(--color-text-3)]">
        基于当前图谱拓扑，选择要生成的关系类型，生成结果将追加到补充链接/关系列表。
      </Paragraph>

      <Checkbox.Group
        direction="vertical"
        value={selectedKinds}
        onChange={(values) => {
          setSelectedKinds(
            (Array.isArray(values) ? values : []).filter(
              (value): value is RichRelationKind =>
                RICH_RELATION_KIND_OPTIONS.some((item) => item.value === value)
            )
          );
        }}
      >
        {RICH_RELATION_KIND_OPTIONS.map((item) => (
          <Checkbox key={item.value} value={item.value}>
            <div>
              <Text>{item.label}</Text>
              <Paragraph className="!mb-0 text-[12px] text-[var(--color-text-3)]">
                {item.description}
              </Paragraph>
            </div>
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Modal>
  );
}
