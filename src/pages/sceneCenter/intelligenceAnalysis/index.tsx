import React from 'react';
import { Spin } from '@arco-design/web-react';
import PageHeader from '@/components/PageHeader';
import ScenePlanIntroPanel from '../components/ScenePlanIntroPanel';
import SceneSelectorBar from '../components/SceneSelectorBar';
import { useSceneCenterScenes } from '../hooks/useSceneCenterScenes';

export default function IntelligenceAnalysis() {
  const {
    loading,
    scenes,
    selectedSceneId,
    setSelectedSceneId,
    selectedScene
  } = useSceneCenterScenes();

  const panelHeightClass = 'h-[calc(100vh-220px)] min-h-[560px]';

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-4">
        <PageHeader
          title="情报分析"
          subTitle="基于本体图谱进行情报关联分析与态势研判"
        />

        <div className="mt-3">
          <SceneSelectorBar
            loading={loading}
            scenes={scenes}
            selectedSceneId={selectedSceneId}
            onSceneChange={setSelectedSceneId}
            selectedScene={selectedScene}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[480px] flex-1 items-center justify-center">
          <Spin tip="正在加载本体场景..." />
        </div>
      ) : !selectedSceneId ? (
        <div className="flex min-h-[480px] flex-1 items-center justify-center text-[var(--color-text-3)]">
          请先在「本体场景库」中创建场景后再编辑场景方案介绍。
        </div>
      ) : (
        <div className="min-h-0 flex-1 px-4 pb-4 pt-3">
          <div
            className={`${panelHeightClass} overflow-hidden rounded-lg border border-[var(--color-border-2)]`}
          >
            <ScenePlanIntroPanel
              sceneId={selectedSceneId}
              pageKey="intelligenceAnalysis"
            />
          </div>
        </div>
      )}
    </div>
  );
}
