import React, { useMemo } from 'react';
import { Button, Tag, Typography } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type { ImplicitRelationTask } from '../types';
import {
  formatInstanceScopeSummary,
  formatObjectTypeSummary
} from '../services/scopeInstances';
import styles from './TaskConfigPanel.module.scss';

interface TaskConfigPanelProps {
  task: ImplicitRelationTask;
  /** 未执行发现时可编辑；已执行后锁定 */
  editable?: boolean;
  onEdit: () => void;
}

export default function TaskConfigPanel({
  task,
  editable = true,
  onEdit
}: TaskConfigPanelProps) {
  const scope = task.scope;

  const sceneName = useMemo(() => {
    if (!scope?.ontologySceneId) {
      return '未配置';
    }
    return scope.ontologySceneName || `场景 #${scope.ontologySceneId}`;
  }, [scope]);

  const objectTypeSummary = useMemo(
    () => formatObjectTypeSummary(scope?.objectTypes || []),
    [scope?.objectTypes]
  );

  const instanceSummary = useMemo(() => {
    if (!scope) {
      return '未配置';
    }
    return formatInstanceScopeSummary(
      scope.instanceMode,
      scope.instances.length,
      scope.objectTypes.length
    );
  }, [scope]);

  const selectedInstancePreview = useMemo(() => {
    if (
      !scope ||
      scope.instanceMode !== 'selected' ||
      !scope.instances.length
    ) {
      return '';
    }
    const labels = scope.instances.map(
      (item) => item.instanceLabel || item.instanceId
    );
    if (labels.length <= 4) {
      return labels.join('、');
    }
    return `${labels.slice(0, 4).join('、')} 等 ${labels.length} 个`;
  }, [scope]);

  const algorithmLabel =
    DISCOVERY_ALGORITHM_LABEL[task.algorithm] || task.algorithm;

  return (
    <div className={styles.configSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <div className={styles.sectionTitle}>任务配置</div>
          {!editable ? (
            <span className={styles.configLockedHint}>
              已执行发现，配置不可修改；实例关系变化时可重新执行
            </span>
          ) : null}
        </div>
        {editable ? (
          <Button
            type="outline"
            size="small"
            icon={<IconSettings />}
            onClick={onEdit}
          >
            编辑配置
          </Button>
        ) : null}
      </div>

      <div className={styles.configPanel}>
        <div className={styles.configGrid}>
          <div className={styles.configItem}>
            <div className={styles.configLabel}>本体图谱</div>
            <div className={styles.configValue} title={sceneName}>
              {sceneName}
            </div>
          </div>
          <div className={styles.configItem}>
            <div className={styles.configLabel}>发现算法</div>
            <div className={styles.configValue}>
              <Tag size="small" color="arcoblue">
                {algorithmLabel}
              </Tag>
            </div>
          </div>
          <div className={styles.configItem}>
            <div className={styles.configLabel}>对象类型</div>
            <div className={styles.configValue} title={objectTypeSummary}>
              {objectTypeSummary}
              {scope?.objectTypes?.length ? (
                <span className={styles.configSub}>
                  （{scope.objectTypes.length} 个）
                </span>
              ) : null}
            </div>
          </div>
          <div className={styles.configItem}>
            <div className={styles.configLabel}>实例范围</div>
            <div className={styles.configValue}>
              {scope?.instanceMode === 'all' ? (
                <Tag size="small" color="green">
                  全部实例
                </Tag>
              ) : (
                <Tag size="small" color="orangered">
                  指定实例
                </Tag>
              )}
              <span className={styles.configSub}>{instanceSummary}</span>
            </div>
          </div>
          {selectedInstancePreview ? (
            <div className={`${styles.configItem} ${styles.configItemWide}`}>
              <div className={styles.configLabel}>已选实例</div>
              <div
                className={styles.configValue}
                title={selectedInstancePreview}
              >
                {selectedInstancePreview}
              </div>
            </div>
          ) : null}
          <div className={styles.configItem}>
            <div className={styles.configLabel}>创建时间</div>
            <div className={styles.configValue}>
              {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
          <div className={styles.configItem}>
            <div className={styles.configLabel}>更新时间</div>
            <div className={styles.configValue}>
              {dayjs(task.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>

        <div className={styles.configDesc}>
          <div className={styles.configLabel}>任务描述</div>
          <Typography.Paragraph
            className={styles.configDescText}
            ellipsis={{ rows: 2, showTooltip: true }}
          >
            {task.description || '暂无描述'}
          </Typography.Paragraph>
        </div>
      </div>
    </div>
  );
}
