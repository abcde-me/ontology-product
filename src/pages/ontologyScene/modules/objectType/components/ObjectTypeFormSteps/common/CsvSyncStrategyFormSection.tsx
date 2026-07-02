import React, { useEffect } from 'react';
import { SyncSourceDataStrategyFormState } from '../../ObjectTypeFormUtils/types';
import CsvSyncStrategyCommonFields from './CsvSyncStrategyCommonFields';
import {
  CSV_SYNC_MODE,
  normalizeCsvSyncStrategyFields
} from './instanceSyncStrategyConfig';

export interface CsvSyncStrategyFormSectionProps {
  syncSourceDataStrategy: SyncSourceDataStrategyFormState;
  onStrategyUpdate: (updates: Partial<SyncSourceDataStrategyFormState>) => void;
  readOnly?: boolean;
}

export default function CsvSyncStrategyFormSection({
  syncSourceDataStrategy,
  onStrategyUpdate,
  readOnly = false
}: CsvSyncStrategyFormSectionProps) {
  useEffect(() => {
    const patches = normalizeCsvSyncStrategyFields({
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
    if (syncSourceDataStrategy.mode === CSV_SYNC_MODE.CSV_IMPORT) {
      return;
    }
    onStrategyUpdate({ mode: CSV_SYNC_MODE.CSV_IMPORT });
  }, [syncSourceDataStrategy.mode, onStrategyUpdate]);

  return (
    <CsvSyncStrategyCommonFields
      syncSourceDataStrategy={syncSourceDataStrategy}
      onStrategyUpdate={onStrategyUpdate}
      readOnly={readOnly}
    />
  );
}
