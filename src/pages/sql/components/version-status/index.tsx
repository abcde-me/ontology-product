import React from 'react';

import styles from './index.module.scss';
import { ScriptStatus, ScriptStatusName } from '@/types/sqlDevelopApi';
// 版本类型 已发版 未发版 调度中
export const VersionType = {
  RELEASED: 'released', // 已发版
  UNRELEASED: 'unreleased', // 未发版
  SCHEDULED: 'scheduled' // 调度中
} as const;

export enum VersionTypeEnum {
  RELEASED = '已发版',
  UNRELEASED = '未发版',
  SCHEDULED = '调度中'
}

const iconClassMap: Partial<Record<ScriptStatus, string>> = {
  [ScriptStatus.Released]: 'released-icon',
  [ScriptStatus.Scheduling]: 'scheduled-icon',
  [ScriptStatus.Editing]: 'unreleased-icon',
  [ScriptStatus.EditCompleted]: 'unreleased-icon'
};

interface VersionStatusProps {
  status: ScriptStatus;
}

export default function VersionStatus({ status }: VersionStatusProps) {
  const iconClass = iconClassMap[status] ?? 'unreleased-icon';
  console.log('iconClass', iconClass);

  return (
    <div className="flex items-center">
      <span className={styles[iconClass]} />
      <div className="text-[14px] leading-[22px] text-[var(--color-text-1)]">
        {ScriptStatusName[status]}
      </div>
    </div>
  );
}
