import React from 'react';
import { CopyItemIcon } from '@ceai-front/arco-material';
import { ObjectTypeTag } from '@/pages/ontologyScene/componens';
import EllipsisTextWithTooltip from '../EllipsisTextWithTooltip';
import styles from './index.module.scss';
import classNames from 'classnames';

interface BasicInfoProps {
  mode: 'action' | 'function';
  name: string;
  code: string;
  description?: string;
  detailData?: any; // 传入完整的详情数据，用于提取对象类型信息
}

export const BasicInfo: React.FC<BasicInfoProps> = ({
  mode,
  name,
  code,
  description,
  detailData
}) => {
  const nameLabel = mode === 'action' ? '行为名称：' : '显示名称：';
  const codeLabel = mode === 'action' ? '行为id：' : '函数名称(id)：';

  // 使用正确的字段名提取对象类型信息
  // @ts-ignore
  const objectTypeIcon = detailData?.associated_object_type_icon || '-';
  const objectTypeName =
    detailData?.associated_object_type ||
    detailData?.ontologyObjectTypeName ||
    detailData?.objectTypeName ||
    '全局对象';
  const objectTypeId = String(
    detailData?.ontologyObjectTypeId ||
      detailData?.objectTypeId ||
      detailData?.objectTypeID ||
      detailData?.associated_object_type_id ||
      ''
  );

  return (
    <div className={styles['basic-info']}>
      <div className={styles['section-title']}>基本信息</div>
      <div
        className={classNames([
          styles['info-grid'],
          styles[`${mode}-info-grid`]
        ])}
      >
        <div className={styles['info-item']}>
          <div className={styles['info-label']}>{nameLabel}</div>
          <div className={styles['info-value']}>
            <EllipsisTextWithTooltip value={name || '-'} />
          </div>
        </div>
        <div className={styles['info-item']}>
          <div className={styles['info-label']}>{codeLabel}</div>
          <div className={styles['info-value']}>
            <div className="flex items-center gap-2">
              <span>{code || '-'}</span>
              {code && <CopyItemIcon className="flex-shrink-0" value={code} />}
            </div>
          </div>
        </div>
        {mode === 'action' && (
          <div className={styles['info-item']}>
            <div className={styles['info-label']}>所属对象类型：</div>
            <div className={styles['info-value']}>
              <ObjectTypeTag
                ontologyObjectTypeIcon={objectTypeIcon}
                ontologyObjectTypeName={objectTypeName}
                ontologyObjectTypeId={objectTypeId}
                className={styles['obj-tag']}
              />
            </div>
          </div>
        )}
        <div
          className={`${styles['info-item']} ${mode === 'function' ? styles['full-width'] : ''}`}
        >
          <div className={styles['info-label']}>描述说明：</div>
          <div className={styles['info-value']}>
            <EllipsisTextWithTooltip value={description || '-'} />
          </div>
        </div>
      </div>
    </div>
  );
};
