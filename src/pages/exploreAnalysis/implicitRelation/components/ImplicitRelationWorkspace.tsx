import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Button, Message, Space, Tabs } from '@arco-design/web-react';
import { IconExperiment, IconPlus } from '@arco-design/web-react/icon';
import ScenePlanIntroPanel, {
  type ScenePlanIntroPanelHandle
} from '@/pages/sceneCenter/components/ScenePlanIntroPanel';
import type { ImplicitRelationKnowledge } from '../types';
import { saveImplicitRelationKnowledge } from '../services/implicitRelationStore';
import RichRelationPanel, {
  type RichRelationPanelHandle
} from './RichRelationPanel';
import InferenceRulePanel, {
  type InferenceRulePanelHandle
} from './InferenceRulePanel';
import ImplicitRelationTestModal from './ImplicitRelationTestModal';
import styles from './ImplicitRelationWorkspace.module.scss';

type WorkspaceSection = 'richRelation' | 'inferenceRule';

export interface ImplicitRelationWorkspaceHandle {
  saveAll: () => void;
}

interface ImplicitRelationWorkspaceProps {
  taskId: string;
  sceneId?: number;
  knowledge: ImplicitRelationKnowledge;
  onKnowledgeChange: (knowledge: ImplicitRelationKnowledge) => void;
}

const ImplicitRelationWorkspace = forwardRef<
  ImplicitRelationWorkspaceHandle,
  ImplicitRelationWorkspaceProps
>(function ImplicitRelationWorkspace(
  { taskId, sceneId, knowledge, onKnowledgeChange },
  ref
) {
  const introRef = useRef<ScenePlanIntroPanelHandle>(null);
  const richRelationPanelRef = useRef<RichRelationPanelHandle>(null);
  const inferenceRulePanelRef = useRef<InferenceRulePanelHandle>(null);
  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>('richRelation');
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testEntryMode, setTestEntryMode] = useState<'global' | 'item'>(
    'global'
  );
  const [testInitialRuleIds, setTestInitialRuleIds] = useState<string[]>([]);
  const [testInitialRelationIds, setTestInitialRelationIds] = useState<
    string[]
  >([]);

  useImperativeHandle(
    ref,
    () => ({
      saveAll: () => {
        introRef.current?.save();
        saveImplicitRelationKnowledge(taskId, knowledge);
      }
    }),
    [knowledge, taskId]
  );

  const handleOpenTest = (options?: {
    ruleId?: string;
    relationId?: string;
  }) => {
    const isItemTest = Boolean(options?.ruleId || options?.relationId);
    setTestEntryMode(isItemTest ? 'item' : 'global');
    setTestInitialRuleIds(options?.ruleId ? [options.ruleId] : []);
    setTestInitialRelationIds(options?.relationId ? [options.relationId] : []);
    setTestModalVisible(true);
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.introBlock}>
        {sceneId ? (
          <ScenePlanIntroPanel
            ref={introRef}
            sceneId={sceneId}
            pageKey="implicitRelation"
            title="场景介绍"
            editableOnly
            layout="simple"
            hideActions
            editorMinHeight={120}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-text-3)]">
            请先选择本体图谱
          </div>
        )}
      </div>

      <Tabs
        activeTab={activeSection}
        onChange={(key) => setActiveSection(key as WorkspaceSection)}
        className={styles.sectionTabs}
        extra={
          <Space size={8}>
            <Button
              type="outline"
              size="small"
              icon={<IconExperiment />}
              disabled={!sceneId}
              onClick={() => handleOpenTest()}
            >
              测试
            </Button>
            {activeSection === 'richRelation' ? (
              <Button
                type="outline"
                size="small"
                icon={<IconPlus />}
                disabled={!sceneId}
                onClick={() => richRelationPanelRef.current?.openCreate()}
              >
                补充链接
              </Button>
            ) : (
              <Button
                type="outline"
                size="small"
                icon={<IconPlus />}
                disabled={!sceneId}
                onClick={() => inferenceRulePanelRef.current?.openCreate()}
              >
                新增规则
              </Button>
            )}
          </Space>
        }
      >
        <Tabs.TabPane key="richRelation" title="补充链接/关系">
          <span />
        </Tabs.TabPane>
        <Tabs.TabPane key="inferenceRule" title="推理规则">
          <span />
        </Tabs.TabPane>
      </Tabs>

      <div className={styles.tabBody}>
        {activeSection === 'richRelation' ? (
          <RichRelationPanel
            ref={richRelationPanelRef}
            taskId={taskId}
            sceneId={sceneId}
            richRelations={knowledge.richRelations}
            onChange={(richRelations) =>
              onKnowledgeChange({ ...knowledge, richRelations })
            }
            onOpenTest={(relationId) => handleOpenTest({ relationId })}
          />
        ) : (
          <InferenceRulePanel
            ref={inferenceRulePanelRef}
            taskId={taskId}
            sceneId={sceneId}
            knowledge={knowledge}
            onChange={onKnowledgeChange}
            onOpenTest={(ruleId) => handleOpenTest({ ruleId })}
          />
        )}
      </div>

      <ImplicitRelationTestModal
        visible={testModalVisible}
        sceneId={sceneId}
        knowledge={knowledge}
        entryMode={testEntryMode}
        initialRuleIds={testInitialRuleIds}
        initialRelationIds={testInitialRelationIds}
        onClose={() => {
          setTestModalVisible(false);
          setTestEntryMode('global');
          setTestInitialRuleIds([]);
          setTestInitialRelationIds([]);
        }}
      />
    </div>
  );
});

export default ImplicitRelationWorkspace;
