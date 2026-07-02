import React from 'react';
import { Select } from '@arco-design/web-react';
import type { OntologScene } from '@/types/ontologySceneApi';
import styles from './SceneSelectorBar.module.scss';

interface SceneSelectorBarProps {
  loading: boolean;
  scenes: OntologScene[];
  selectedSceneId?: number;
  onSceneChange: (sceneId: number) => void;
  selectedScene?: OntologScene;
  label?: string;
  /** 与场景介绍等模块标题同级样式 */
  labelBold?: boolean;
}

export default function SceneSelectorBar({
  loading,
  scenes,
  selectedSceneId,
  onSceneChange,
  selectedScene,
  label = '目标图谱场景：',
  labelBold = false
}: SceneSelectorBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={labelBold ? styles.sectionLabel : undefined}>
        {label}
      </span>
      <Select
        style={{ width: 320 }}
        placeholder="请选择本体场景库"
        loading={loading}
        value={selectedSceneId}
        onChange={onSceneChange}
        options={scenes
          .filter((scene) => scene.id != null)
          .map((scene) => ({
            label: scene.name || '未命名场景',
            value: scene.id!
          }))}
      />
      {selectedScene && (
        <span className="text-[13px] text-[var(--color-text-3)]">
          对象 {selectedScene.ontologyObjectTypeCounts || 0} · 链接{' '}
          {selectedScene.ontologyLinkTypeCounts || 0}
        </span>
      )}
    </div>
  );
}
