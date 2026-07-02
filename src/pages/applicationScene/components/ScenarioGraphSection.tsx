import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@arco-design/web-react';
import { IconExpand, IconShrink } from '@arco-design/web-react/icon';
import GraphSelector from './GraphSelector';
import ScenarioGraphPanel from './ScenarioGraphPanel';
import styles from '../index.module.scss';

interface ScenarioGraphSectionProps {
  sceneId?: number;
  onSceneChange: (sceneId?: number) => void;
}

export default function ScenarioGraphSection({
  sceneId,
  onSceneChange
}: ScenarioGraphSectionProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const zoomToolbarRef = useRef<HTMLDivElement>(null);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const inGraphDrawer = target?.closest(
        '.graph-section .wk-node-config-panel-wrapper, .graph-fullscreen-layer .wk-node-config-panel-wrapper'
      );
      if (inGraphDrawer) {
        event.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [sceneId]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        exitFullscreen();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [exitFullscreen, fullscreen]);

  const toolbar = (
    <div className={styles['graph-toolbar']}>
      <div className={styles['graph-toolbar-selector']}>
        <GraphSelector
          inline
          value={sceneId}
          onChange={(nextSceneId) => onSceneChange(nextSceneId)}
          zoomSlot={
            sceneId != null ? (
              <div
                ref={zoomToolbarRef}
                className={styles['graph-toolbar-zoom']}
              />
            ) : null
          }
        />
      </div>
      {sceneId != null && (
        <Button
          type="text"
          size="small"
          icon={<IconExpand />}
          onClick={() => setFullscreen(true)}
        >
          全屏
        </Button>
      )}
    </div>
  );

  const graphBody =
    sceneId != null ? (
      <ScenarioGraphPanel sceneId={sceneId} zoomToolbarRef={zoomToolbarRef} />
    ) : (
      <div className={styles['graph-empty-state']}>
        请选择关联图谱后查看本体图谱
      </div>
    );

  const fullscreenLayer =
    fullscreen && sceneId != null
      ? createPortal(
          <div className={styles['graph-fullscreen-layer']}>
            <div className={styles['graph-fullscreen-toolbar']}>
              <span className={styles['graph-fullscreen-title']}>本体图谱</span>
              <div className={styles['graph-toolbar-actions']}>
                <GraphSelector
                  inline
                  value={sceneId}
                  onChange={(nextSceneId) => onSceneChange(nextSceneId)}
                  zoomSlot={
                    <div
                      ref={zoomToolbarRef}
                      className={styles['graph-toolbar-zoom']}
                    />
                  }
                />
                <Button
                  type="text"
                  size="small"
                  icon={<IconShrink />}
                  onClick={exitFullscreen}
                >
                  退出全屏
                </Button>
              </div>
            </div>
            <div className={styles['graph-fullscreen-body']}>
              <ScenarioGraphPanel
                sceneId={sceneId}
                zoomToolbarRef={zoomToolbarRef}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={styles['graph-section']}>
        {toolbar}
        <div
          className={styles['graph-body']}
          data-integrated-zoom={sceneId != null ? 'true' : undefined}
        >
          {graphBody}
        </div>
      </div>
      {fullscreenLayer}
    </>
  );
}
