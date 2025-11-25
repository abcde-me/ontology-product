import React from 'react';

import styles from './index.module.scss';
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

export const getVersionType = (version_type) => {
  switch (version_type) {
    case VersionType.RELEASED:
      return (
        <div className={styles['script-card-content-item-title-icon']}>
          <span
            className={
              version_type === VersionType.RELEASED
                ? styles['released-icon']
                : ''
            }
          />
          <div className={styles['script-card-content-item-title-icon-text']}>
            {VersionTypeEnum.RELEASED}
          </div>
        </div>
      );
    case VersionType.UNRELEASED:
      return (
        <div className={styles['script-card-content-item-title-icon']}>
          <span
            className={
              version_type === VersionType.UNRELEASED
                ? styles['unreleased-icon']
                : ''
            }
          />
          <div className={styles['script-card-content-item-title-icon-text']}>
            {VersionTypeEnum.UNRELEASED}
          </div>
        </div>
      );
    case VersionType.SCHEDULED:
      return (
        <div className={styles['script-card-content-item-title-icon']}>
          <span
            className={
              version_type === VersionType.SCHEDULED
                ? styles['scheduled-icon']
                : ''
            }
          />
          <div className={styles['script-card-content-item-title-icon-text']}>
            {VersionTypeEnum.SCHEDULED}
          </div>
        </div>
      );
    default:
      return (
        <div className={styles['script-card-content-item-title-icon']}>
          <span
            className={
              version_type === VersionType.UNRELEASED
                ? styles['unreleased-icon']
                : ''
            }
          />
          <div className={styles['script-card-content-item-title-icon-text']}>
            {VersionTypeEnum.UNRELEASED}
          </div>
        </div>
      );
  }
};
