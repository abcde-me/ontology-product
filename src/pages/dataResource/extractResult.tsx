import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Message, Spin, Tag } from '@arco-design/web-react';
import { IconSave } from '@arco-design/web-react/icon';
import { useHistory, useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import {
  FILE_EXTRACT_TASK_LIST_PATH,
  FILE_EXTRACT_TASK_STATUS_LABEL
} from './constants/fileExtract';
import { EntityRelationResultPanel } from './components/extractResult/EntityRelationResultPanel';
import { ExtractResultSection } from './components/extractResult/ExtractResultSection';
import { InstanceResultPanel } from './components/extractResult/InstanceResultPanel';
import { OntologyModelResultPanel } from './components/extractResult/OntologyModelResultPanel';
import { SaveToOntologySceneModal } from './components/extractResult/SaveToOntologySceneModal';
import { getFileExtractTask } from './services/fileExtractStorage';
import type {
  EntityRelationExtractResult,
  FileExtractTask,
  InstanceExtractResult,
  OntologyModelExtractResult
} from './types/fileExtract';
import styles from './index.module.scss';

const LIST_PATH = FILE_EXTRACT_TASK_LIST_PATH;

const statusColorMap = {
  pending: 'gray',
  running: 'arcoblue',
  completed: 'green',
  failed: 'red'
} as const;

export default function FileExtractResultPage() {
  const history = useHistory();
  const { taskId = '' } = useParams<{ taskId: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<FileExtractTask | null>(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const ontologyObjectTypes = useMemo(() => {
    if (task?.extractType !== 'ontology_model' || !task.result) {
      return [];
    }
    return (task.result as OntologyModelExtractResult).objectTypes || [];
  }, [task]);

  const loadTask = useCallback(() => {
    setLoading(true);
    const nextTask = getFileExtractTask(taskId);
    setTask(nextTask);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const goBack = () => {
    history.push(LIST_PATH);
  };

  const renderResult = () => {
    if (!task?.result) {
      return (
        <div className={styles['extract-result-empty']}>
          {task?.status === 'failed'
            ? task.errorMessage || '提取失败，请返回重试'
            : '暂无提取结果'}
        </div>
      );
    }

    switch (task.extractType) {
      case 'entity_relation':
        return (
          <EntityRelationResultPanel
            taskId={task.id}
            result={task.result as EntityRelationExtractResult}
            onSaved={loadTask}
          />
        );
      case 'ontology_model':
        return (
          <OntologyModelResultPanel
            result={task.result as OntologyModelExtractResult}
          />
        );
      case 'instance':
        return (
          <InstanceResultPanel
            targetTableId={task.targetTableId}
            targetTableName={task.targetTableName}
            result={task.result as InstanceExtractResult}
            onSaved={loadTask}
          />
        );
      default:
        return null;
    }
  };

  if (!loading && !task) {
    Message.error('提取任务不存在或已被删除');
    goBack();
    return null;
  }

  return (
    <div className={styles['extract-result-page']}>
      <PageHeader
        title="提取结果"
        showBack
        backPath={LIST_PATH}
        extra={
          ontologyObjectTypes.length ? (
            <Button
              type="primary"
              icon={<IconSave />}
              onClick={() => setSaveModalVisible(true)}
            >
              保存到本体场景库
            </Button>
          ) : undefined
        }
      />

      <SaveToOntologySceneModal
        visible={saveModalVisible}
        objectTypes={ontologyObjectTypes}
        onClose={() => setSaveModalVisible(false)}
      />

      <div className={styles['extract-result-page-content']}>
        <Spin loading={loading}>
          {task ? (
            <>
              <ExtractResultSection title="任务信息" contentVariant="task">
                <div className={styles['extract-result-meta']}>
                  <div className={styles['extract-result-meta-row']}>
                    <div className={styles['extract-result-meta-item']}>
                      <span className={styles['extract-result-meta-label']}>
                        提取状态
                      </span>
                      <Tag color={statusColorMap[task.status]}>
                        {FILE_EXTRACT_TASK_STATUS_LABEL[task.status]}
                      </Tag>
                    </div>
                    <div className={styles['extract-result-meta-item']}>
                      <span className={styles['extract-result-meta-label']}>
                        创建时间
                      </span>
                      <span className={styles['extract-result-meta-value']}>
                        {task.createdAt}
                      </span>
                    </div>
                    <div className={styles['extract-result-meta-item']}>
                      <span className={styles['extract-result-meta-label']}>
                        结束时间
                      </span>
                      <span className={styles['extract-result-meta-value']}>
                        {task.completedAt || '-'}
                      </span>
                    </div>
                  </div>
                  <div className={styles['extract-result-meta-line']}>
                    <span className={styles['extract-result-meta-label']}>
                      来源文件
                    </span>
                    <span className={styles['extract-result-meta-value']}>
                      {task.fileName}
                    </span>
                  </div>
                  <div className={styles['extract-result-meta-line']}>
                    <span className={styles['extract-result-meta-label']}>
                      提取要求
                    </span>
                    <span className={styles['extract-result-meta-value']}>
                      {task.requirement}
                    </span>
                  </div>
                  {task.extractType === 'instance' && task.targetTableName ? (
                    <div className={styles['extract-result-meta-line']}>
                      <span className={styles['extract-result-meta-label']}>
                        目标数据表
                      </span>
                      <span className={styles['extract-result-meta-value']}>
                        {task.targetTableName}
                      </span>
                    </div>
                  ) : null}
                </div>
              </ExtractResultSection>
              {renderResult()}
            </>
          ) : null}
        </Spin>
      </div>
    </div>
  );
}
