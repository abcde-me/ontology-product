import React, { useMemo, useState } from 'react';
import { Button } from '@arco-design/web-react';
import { IconExpand, IconShrink } from '@arco-design/web-react/icon';
import { OntoModal } from '@/components/OSModal';
import { OntologyGraphView } from '@/pages/ontologyScene/modules/graph/OntologyGraphView';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';
import styles from '../index.module.scss';

export interface OntologyGraphModalParams {
  sceneId: number;
  objectTypeId: number;
  objectTypeCode?: string;
  instanceId?: string | number;
}

interface OntologyGraphModalProps {
  visible: boolean;
  params: OntologyGraphModalParams | null;
  onClose: () => void;
}

export const OntologyGraphModal: React.FC<OntologyGraphModalProps> = ({
  visible,
  params,
  onClose
}) => {
  const [fullscreen, setFullscreen] = useState(false);

  const browseParams = useMemo(() => {
    if (!params) {
      return undefined;
    }

    return {
      objectTypeId: params.objectTypeId,
      objectTypeCode: params.objectTypeCode,
      focusNeighbors: true,
      instanceId: params.instanceId
    };
  }, [params]);

  const handleClose = () => {
    setFullscreen(false);
    onClose();
    scheduleOverlayCleanup();
  };

  return (
    <OntoModal
      visible={visible}
      title={
        <div className={styles['graph-modal-title']}>
          <span>本体图谱</span>
          <Button
            type="text"
            size="small"
            className={styles['graph-modal-fullscreen-btn']}
            icon={fullscreen ? <IconShrink /> : <IconExpand />}
            onClick={() => setFullscreen((prev) => !prev)}
          >
            {fullscreen ? '退出全屏' : '全屏'}
          </Button>
        </div>
      }
      footer={null}
      maskClosable={false}
      escToExit
      alignCenter
      unmountOnExit
      style={
        fullscreen
          ? {
              width: '100vw',
              maxWidth: '100vw',
              top: 0,
              paddingBottom: 0
            }
          : {
              width: 'min(1200px, 92vw)'
            }
      }
      wrapClassName={
        fullscreen
          ? styles['graph-modal-wrap-full']
          : styles['graph-modal-wrap']
      }
      className={styles['graph-modal']}
      onCancel={handleClose}
    >
      {params && browseParams ? (
        <div
          className={
            fullscreen
              ? styles['graph-modal-body-full']
              : styles['graph-modal-body']
          }
        >
          <OntologyGraphView
            key={`${params.sceneId}-${params.objectTypeId}-${params.instanceId ?? ''}`}
            sceneId={params.sceneId}
            browseParams={browseParams}
            embedMode
          />
        </div>
      ) : null}
    </OntoModal>
  );
};
