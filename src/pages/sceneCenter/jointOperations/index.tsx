import React, { useEffect, useState } from 'react';
import { Spin, Tabs } from '@arco-design/web-react';
import PageHeader from '@/components/PageHeader';
import type {
  CrossDomainQueryResult,
  JointKnowledgeBundle
} from '@/types/jointOperationsKnowledge';
import { ensureJointOperationsKnowledge } from '@/utils/devJointOperationsKnowledgeStore';
import ResizableLayout from '@/pages/aiOntologyWorkbench/components/ResizableLayout';
import ScenePlanIntroPanel from '../components/ScenePlanIntroPanel';
import SceneSelectorBar from '../components/SceneSelectorBar';
import { useSceneCenterScenes } from '../hooks/useSceneCenterScenes';
import JointOperationsAssistant from './components/JointOperationsAssistant';
import JointOperationsGraphPanel from './components/JointOperationsGraphPanel';
import AxiomRulePanel from './components/AxiomRulePanel';
import CrossDomainQueryPanel from './components/CrossDomainQueryPanel';

export default function JointOperations() {
  const {
    loading,
    scenes,
    selectedSceneId,
    setSelectedSceneId,
    selectedScene
  } = useSceneCenterScenes({ preferJointOperationsScene: true });
  const [activeTab, setActiveTab] = useState('intro');
  const [knowledge, setKnowledge] = useState<JointKnowledgeBundle>({
    axioms: [],
    sceneRules: []
  });
  const [queryResult, setQueryResult] = useState<CrossDomainQueryResult | null>(
    null
  );

  useEffect(() => {
    if (!selectedSceneId) {
      return;
    }
    setKnowledge(ensureJointOperationsKnowledge(selectedSceneId));
  }, [selectedSceneId]);

  const handleQueryResult = (result: CrossDomainQueryResult) => {
    setQueryResult(result);
    setActiveTab('query');
  };

  const panelHeightClass = 'h-[calc(100vh-180px)] min-h-[560px]';

  const renderSceneRequired = (content: React.ReactNode) => {
    if (!selectedSceneId) {
      return (
        <div className="flex h-full min-h-[480px] items-center justify-center text-[var(--color-text-3)]">
          请先在「图谱与智能助手」中选择目标图谱场景。
        </div>
      );
    }
    return content;
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-4">
        <PageHeader
          title="跨域火力协同"
          subTitle="基于图谱、公理与场景规则，实现跨领域数据查询与应用"
        />
      </div>

      {loading ? (
        <div className="flex min-h-[480px] flex-1 items-center justify-center">
          <Spin tip="正在加载本体场景..." />
        </div>
      ) : (
        <div className="min-h-0 flex-1 px-4 pb-4 pt-3">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            destroyOnHide
            lazyload
            className="flex h-full flex-col"
          >
            <Tabs.TabPane key="intro" title="场景方案介绍">
              <div
                className={`${panelHeightClass} overflow-hidden rounded-lg border border-[var(--color-border-2)]`}
              >
                {renderSceneRequired(
                  <ScenePlanIntroPanel
                    sceneId={selectedSceneId!}
                    pageKey="jointOperations"
                  />
                )}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="graph" title="图谱与智能助手">
              <div
                className={`${panelHeightClass} flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-2)]`}
              >
                <div className="flex-shrink-0 border-b border-[var(--color-border-2)] px-4 py-3">
                  <SceneSelectorBar
                    loading={loading}
                    scenes={scenes}
                    selectedSceneId={selectedSceneId}
                    onSceneChange={setSelectedSceneId}
                    selectedScene={selectedScene}
                  />
                </div>
                <div className="min-h-0 flex-1">
                  {!selectedSceneId ? (
                    <div className="flex h-full items-center justify-center text-[var(--color-text-3)]">
                      请先在「本体场景库」中创建联合作战场景并导入对象类型与链接。
                    </div>
                  ) : (
                    <ResizableLayout
                      defaultLeftWidth={380}
                      minLeftWidth={320}
                      maxLeftWidth={520}
                      leftContent={
                        <JointOperationsAssistant
                          sceneId={selectedSceneId}
                          onKnowledgeChange={setKnowledge}
                          onQueryResult={handleQueryResult}
                        />
                      }
                      rightContent={
                        <JointOperationsGraphPanel sceneId={selectedSceneId} />
                      }
                    />
                  )}
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="knowledge" title="公理与场景规则">
              <div
                className={`${panelHeightClass} overflow-hidden rounded-lg border border-[var(--color-border-2)]`}
              >
                {renderSceneRequired(
                  <AxiomRulePanel
                    sceneId={selectedSceneId!}
                    knowledge={knowledge}
                    onChange={setKnowledge}
                  />
                )}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="query" title="跨域查询">
              <div
                className={`${panelHeightClass} overflow-auto rounded-lg border border-[var(--color-border-2)]`}
              >
                {renderSceneRequired(
                  <>
                    <CrossDomainQueryPanel
                      sceneId={selectedSceneId!}
                      scenes={scenes}
                      knowledge={knowledge}
                    />
                    {queryResult && (
                      <div className="border-t border-[var(--color-border-2)] px-4 py-2 text-[12px] text-[var(--color-text-3)]">
                        最近助手查询：{queryResult.summary}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
}
