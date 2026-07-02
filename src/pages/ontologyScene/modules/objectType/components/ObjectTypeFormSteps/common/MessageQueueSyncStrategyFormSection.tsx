import React, { useEffect } from 'react';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import KafkaSyncStrategyCommonFields from './KafkaSyncStrategyCommonFields';
import {
  MESSAGE_QUEUE_SYNC_MODE,
  normalizeMessageQueueSyncStrategyFields
} from './instanceSyncStrategyConfig';

export interface MessageQueueSyncStrategyFormSectionProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function MessageQueueSyncStrategyFormSection({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: MessageQueueSyncStrategyFormSectionProps) {
  useEffect(() => {
    const patches = normalizeMessageQueueSyncStrategyFields({
      mode: syncSourceDataStrategy.mode,
      syncScope: syncSourceDataStrategy.syncScope,
      exceptionStrategy: syncSourceDataStrategy.exceptionStrategy
    });
    if (!Object.keys(patches).length) {
      return;
    }
    onStrategyUpdate(patches);
  }, [
    syncSourceDataStrategy.mode,
    syncSourceDataStrategy.syncScope,
    syncSourceDataStrategy.exceptionStrategy,
    onStrategyUpdate
  ]);

  useEffect(() => {
    if (syncSourceDataStrategy.mode === MESSAGE_QUEUE_SYNC_MODE.KAFKA_CDC) {
      return;
    }
    onStrategyUpdate({ mode: MESSAGE_QUEUE_SYNC_MODE.KAFKA_CDC });
  }, [syncSourceDataStrategy.mode, onStrategyUpdate]);

  return (
    <>
      <KafkaSyncStrategyCommonFields
        syncSourceDataStrategy={syncSourceDataStrategy}
        onStrategyUpdate={onStrategyUpdate}
        readOnly={readOnly}
      />
    </>
  );
}
