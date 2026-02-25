import React from 'react';
import { EllipsisPopover, CopyItemIcon } from '@ceai-front/arco-material';
import { ObjectTypeTag } from '@/pages/ontologyScene/componens';
import styles from './index.module.scss';

interface BasicInfoProps {
  mode: 'action' | 'function';
  name: string;
  code: string;
  description: string;
  ontologyObjectTypeName?: string;
  ontologyObjectTypeIcon?: string;
  ontologyObjectTypeId?: string;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({
  mode,
  name,
  code,
  description,
  ontologyObjectTypeName,
  ontologyObjectTypeIcon,
  ontologyObjectTypeId
}) => {
  const nameLabel = mode === 'action' ? '行为名称：' : '显示名称：';
  const codeLabel = mode === 'action' ? '行为id：' : '函数名称(id)：';

  return (
    <div className={styles['basic-info']}>
      <div className={styles['section-title']}>基本信息</div>
      <div className={styles['info-grid']}>
        <div className={styles['info-item']}>
          <div className={styles['info-label']}>{nameLabel}</div>
          <div className={styles['info-value']}>
            <EllipsisPopover value={name || '-'} />
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
              {ontologyObjectTypeName ? (
                <ObjectTypeTag
                  ontologyObjectTypeIcon={ontologyObjectTypeIcon}
                  ontologyObjectTypeName={ontologyObjectTypeName}
                  ontologyObjectTypeId={ontologyObjectTypeId || ''}
                />
              ) : (
                '-'
              )}
            </div>
          </div>
        )}
        <div className={styles['info-item']}>
          <div className={styles['info-label']}>描述说明：</div>
          <div className={styles['info-value']}>
            <EllipsisPopover value={description || '-'} isEdit={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
