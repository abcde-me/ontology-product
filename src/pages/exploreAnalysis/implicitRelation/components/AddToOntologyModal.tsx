import React, { useEffect, useState } from 'react';
import { Message } from '@arco-design/web-react';
import CreateLinkModal from '@/pages/ontologyScene/modules/links/components/CreateLinkModal';
import { LinkType } from '@/pages/ontologyScene/types/link';
import type {
  DiscoveredImplicitRelation,
  ImplicitRelationTask
} from '../types';

interface AddToOntologyModalProps {
  visible: boolean;
  task: ImplicitRelationTask;
  discoveries: DiscoveredImplicitRelation[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface OntologyLinkDraft {
  id: string;
  sourceObjectTypeId: number;
  targetObjectTypeId: number;
  suggestedName: string;
}

const buildOntologyLinkDrafts = (
  discoveries: DiscoveredImplicitRelation[]
): OntologyLinkDraft[] => {
  const seen = new Set<string>();
  const rows: OntologyLinkDraft[] = [];

  discoveries.forEach((item) => {
    if (item.sourceObjectTypeId == null || item.targetObjectTypeId == null) {
      return;
    }

    const suggestedName = item.suggestedName.trim();
    if (!suggestedName) {
      return;
    }

    const key = `${item.sourceObjectTypeId}|${item.targetObjectTypeId}|${suggestedName.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    rows.push({
      id: key,
      sourceObjectTypeId: item.sourceObjectTypeId,
      targetObjectTypeId: item.targetObjectTypeId,
      suggestedName
    });
  });

  return rows;
};

export default function AddToOntologyModal({
  visible,
  task,
  discoveries,
  onCancel,
  onSuccess
}: AddToOntologyModalProps) {
  const [queue, setQueue] = useState<OntologyLinkDraft[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQueue([]);
      setCurrentIndex(0);
      setModalVisible(false);
      return;
    }

    if (!task.scope?.ontologySceneId) {
      Message.warning('任务未绑定本体场景');
      onCancel();
      return;
    }
    if (!discoveries.length) {
      Message.warning('请先选择要添加的关系');
      onCancel();
      return;
    }

    const invalidCount = discoveries.filter(
      (item) =>
        item.sourceObjectTypeId == null ||
        item.targetObjectTypeId == null ||
        !item.suggestedName.trim()
    ).length;
    const drafts = buildOntologyLinkDrafts(discoveries);

    if (invalidCount > 0) {
      Message.warning(`有 ${invalidCount} 条关系缺少对象类型信息，将被跳过`);
    }
    if (!drafts.length) {
      Message.warning('所选关系缺少对象类型信息，无法添加到本体');
      onCancel();
      return;
    }

    setQueue(drafts);
    setCurrentIndex(0);
    setModalVisible(true);
  }, [discoveries, onCancel, task.scope?.ontologySceneId, visible]);

  const currentDraft = queue[currentIndex];
  const sceneId = task.scope?.ontologySceneId;

  const handleLinkSuccess = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      return;
    }

    if (queue.length > 1) {
      Message.success(`已创建 ${queue.length} 个链接类型`);
    }
    setModalVisible(false);
    onSuccess();
  };

  const handleClose = () => {
    setModalVisible(false);
    onCancel();
  };

  if (!visible || !sceneId || !currentDraft) {
    return null;
  }

  const modalTitle =
    queue.length > 1
      ? `创建链接（${currentIndex + 1}/${queue.length}）`
      : '创建链接';

  return (
    <CreateLinkModal
      key={currentDraft.id}
      visible={modalVisible}
      sceneId={sceneId}
      title={modalTitle}
      closeOnSuccess={false}
      preset={{
        name: currentDraft.suggestedName,
        sourceObjectTypeID: currentDraft.sourceObjectTypeId,
        targetObjectTypeID: currentDraft.targetObjectTypeId,
        linkType: LinkType.ONE_TO_ONE
      }}
      onClose={handleClose}
      onSuccess={handleLinkSuccess}
    />
  );
}
