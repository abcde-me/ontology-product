import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Button, Message, Spin } from '@arco-design/web-react';
import { IconLeft, IconSave } from '@arco-design/web-react/icon';
import { useHistory, useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import SceneSelectorBar from '@/pages/sceneCenter/components/SceneSelectorBar';
import { useSceneCenterScenes } from '@/pages/sceneCenter/hooks/useSceneCenterScenes';
import type { ImplicitRelationKnowledge, ImplicitRelationTask } from './types';
import ImplicitRelationWorkspace, {
  type ImplicitRelationWorkspaceHandle
} from './components/ImplicitRelationWorkspace';
import { getImplicitRelationKnowledge } from './services/implicitRelationStore';
import {
  getImplicitRelationTask,
  updateImplicitRelationTask
} from './services/taskStorage';
import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/exploreAnalysis/implicitRelation';

export default function ImplicitRelationDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const {
    loading: scenesLoading,
    scenes,
    selectedSceneId,
    setSelectedSceneId,
    selectedScene
  } = useSceneCenterScenes({ autoSelectFirst: false });
  const [task, setTask] = useState<ImplicitRelationTask | null>(null);
  const [knowledge, setKnowledge] = useState<ImplicitRelationKnowledge>({
    richRelations: [],
    inferenceRules: [],
    llmCommonSensePrompt: ''
  });
  const workspaceRef = useRef<ImplicitRelationWorkspaceHandle>(null);

  const loadTask = useCallback(() => {
    const detail = getImplicitRelationTask(id);
    if (!detail) {
      Message.error('隐性关系任务不存在');
      history.replace(LIST_PATH);
      return null;
    }
    setTask(detail);
    setKnowledge(getImplicitRelationKnowledge(id));
    return detail;
  }, [history, id]);

  useEffect(() => {
    const detail = loadTask();
    if (detail?.ontologySceneId) {
      setSelectedSceneId(detail.ontologySceneId);
    }
  }, [loadTask, setSelectedSceneId]);

  useEffect(() => {
    if (!task || !selectedSceneId || task.ontologySceneId === selectedSceneId) {
      return;
    }
    setTask(
      updateImplicitRelationTask(task.id, {
        ontologySceneId: selectedSceneId
      })
    );
  }, [selectedSceneId, task]);

  const activeSceneId = useMemo(
    () => task?.ontologySceneId ?? selectedSceneId,
    [selectedSceneId, task?.ontologySceneId]
  );

  const handleSaveAll = () => {
    if (!activeSceneId) {
      Message.warning('请先选择本体图谱');
      return;
    }
    workspaceRef.current?.saveAll();
    Message.success('保存成功');
  };

  if (!task) {
    return null;
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderWrap}>
        <div className={styles.detailHeaderCard}>
          <div className={styles.detailHeaderMain}>
            <div className={styles.detailTitle}>{task.name}</div>
            <div className={styles.detailMeta}>
              {task.description || '暂无描述'}
            </div>
          </div>
          <div className={styles.detailHeaderActions}>
            <Button
              type="outline"
              size="small"
              icon={<IconLeft />}
              className={styles.detailBackBtn}
              onClick={() => history.push(LIST_PATH)}
            >
              返回列表
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<IconSave />}
              disabled={!activeSceneId}
              onClick={handleSaveAll}
            >
              保存
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.header}>
          <PageHeader
            title="隐性关系"
            subTitle="基于图谱拓扑与推理规则，发现对称、传递、逆关系等潜在关联"
          />

          <div className="mt-3">
            <SceneSelectorBar
              loading={scenesLoading}
              scenes={scenes}
              selectedSceneId={activeSceneId}
              onSceneChange={setSelectedSceneId}
              selectedScene={selectedScene}
              label="本体图谱："
              labelBold
            />
          </div>
        </div>

        {scenesLoading ? (
          <div className="flex min-h-[480px] flex-1 items-center justify-center">
            <Spin tip="正在加载本体场景..." />
          </div>
        ) : !activeSceneId ? (
          <div className="flex min-h-[480px] flex-1 items-center justify-center text-[var(--color-text-3)]">
            请先选择本体图谱。
          </div>
        ) : (
          <div className={styles.body}>
            <ImplicitRelationWorkspace
              ref={workspaceRef}
              taskId={task.id}
              sceneId={activeSceneId}
              knowledge={knowledge}
              onKnowledgeChange={setKnowledge}
            />
          </div>
        )}
      </div>
    </div>
  );
}
