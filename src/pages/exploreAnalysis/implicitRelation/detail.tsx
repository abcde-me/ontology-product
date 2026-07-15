import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Spin
} from '@arco-design/web-react';
import { IconLeft, IconMessage } from '@arco-design/web-react/icon';
import { useHistory, useParams } from 'react-router-dom';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { DISCOVERY_ALGORITHM_OPTIONS } from './constants';
import type {
  ImplicitAnalysisScope,
  ImplicitDiscoveryAlgorithm,
  ImplicitRelationKnowledge,
  ImplicitRelationTask
} from './types';
import ImplicitRelationWorkspace from './components/ImplicitRelationWorkspace';
import ImplicitRelationChatModal from './components/ImplicitRelationChatModal';
import AnalysisScopeFields, {
  type SceneOption
} from './components/AnalysisScopeFields';
import TaskConfigPanel from './components/TaskConfigPanel';
import { getImplicitRelationKnowledge } from './services/implicitRelationStore';
import { validateAnalysisScope } from './services/scopeInstances';
import {
  getImplicitRelationTask,
  updateImplicitRelationTask
} from './services/taskStorage';
import styles from './index.module.scss';

const { TextArea } = Input;
const LIST_PATH = '/tenant/compute/onto/exploreAnalysis/implicitRelation';

interface EditConfigFormValues {
  description?: string;
  algorithm: ImplicitDiscoveryAlgorithm;
}

export default function ImplicitRelationDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const [task, setTask] = useState<ImplicitRelationTask | null>(null);
  const [knowledge, setKnowledge] = useState<ImplicitRelationKnowledge>({
    result: null
  });
  const [scenesLoading, setScenesLoading] = useState(false);
  const [scenes, setScenes] = useState<SceneOption[]>([]);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [draftScope, setDraftScope] = useState<Partial<ImplicitAnalysisScope>>(
    {}
  );
  const [scopeError, setScopeError] = useState<string>();
  const [chatVisible, setChatVisible] = useState(false);
  const [editForm] = Form.useForm<EditConfigFormValues>();

  const hasResult = Boolean(knowledge.result);
  const configEditable = !hasResult;

  const loadTask = useCallback(() => {
    const detail = getImplicitRelationTask(id);
    if (!detail) {
      Message.error('关系挖掘任务不存在');
      history.replace(LIST_PATH);
      return null;
    }
    setTask(detail);
    setKnowledge(getImplicitRelationKnowledge(id));
    return detail;
  }, [history, id]);

  const loadScenes = useCallback(async () => {
    setScenesLoading(true);
    try {
      const res = await listOntologyModel({
        pageNo: 1,
        pageSize: 100,
        order: 'desc',
        orderBy: 'create_time'
      });
      if (isOntologyApiSuccess(res) && res.data?.result) {
        setScenes(
          res.data.result
            .filter((scene) => scene.id != null)
            .map((scene) => ({
              id: scene.id as number,
              name: scene.name || `场景 #${scene.id}`
            }))
        );
      }
    } catch {
      Message.error('加载本体场景失败');
    } finally {
      setScenesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  useEffect(() => {
    void loadScenes();
  }, [loadScenes]);

  const scope = task?.scope;
  const scopeReady = Boolean(
    scope?.ontologySceneId && scope.objectTypes.length > 0
  );

  const openConfigModal = () => {
    if (!configEditable) {
      Message.warning('已执行发现，配置不可修改；如实例关系有变化请重新执行');
      return;
    }
    setDraftScope(
      task?.scope || {
        instanceMode: 'all',
        objectTypes: [],
        instances: [],
        ontologySceneId: task?.ontologySceneId
      }
    );
    editForm.setFieldsValue({
      description: task?.description,
      algorithm: task?.algorithm || 'community'
    });
    setScopeError(undefined);
    setConfigModalVisible(true);
  };

  const handleSaveConfig = async () => {
    try {
      if (!configEditable) {
        Message.warning('已执行发现，配置不可修改');
        return;
      }
      const values = await editForm.validate();
      const error = validateAnalysisScope(draftScope);
      if (error) {
        setScopeError(error);
        return;
      }
      if (!task) {
        return;
      }

      const next = updateImplicitRelationTask(task.id, {
        scope: draftScope as ImplicitAnalysisScope,
        ontologySceneId: draftScope.ontologySceneId,
        ontologySceneName: draftScope.ontologySceneName,
        algorithm: values.algorithm,
        description: values.description
      });
      setTask(next);
      Message.success('配置已保存');
      setConfigModalVisible(false);
    } catch {
      // form validation
    }
  };

  const handleOpenChat = () => {
    if (!knowledge.result) {
      Message.warning('请先执行发现后再进行问答');
      return;
    }
    setChatVisible(true);
  };

  if (!task) {
    return null;
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderWrap}>
        <div className={styles.detailHeaderCard}>
          <div className={styles.detailHeaderMain}>
            <div className={styles.detailTitle}>{task.name}</div>
            <div className={styles.detailMeta}>
              {task.description || '暂无描述'}
            </div>
          </div>
          <div className={styles.detailHeaderActions}>
            <Button
              type="outline"
              size="small"
              icon={<IconLeft />}
              className={styles.detailBackBtn}
              onClick={() => history.push(LIST_PATH)}
            >
              返回列表
            </Button>
            <Button
              type="outline"
              size="small"
              icon={<IconMessage />}
              disabled={!knowledge.result}
              onClick={handleOpenChat}
            >
              问答
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.header}>
          <TaskConfigPanel
            task={task}
            editable={configEditable}
            onEdit={openConfigModal}
          />
        </div>

        {scenesLoading ? (
          <div className="flex min-h-[480px] flex-1 items-center justify-center">
            <Spin tip="正在加载..." />
          </div>
        ) : !scopeReady ? (
          <div className="flex min-h-[480px] flex-1 flex-col items-center justify-center gap-3 text-[var(--color-text-3)]">
            <div>请先完善任务配置：本体图谱、对象类型与实例范围。</div>
            {configEditable ? (
              <Button type="primary" onClick={openConfigModal}>
                编辑配置
              </Button>
            ) : null}
          </div>
        ) : (
          <div className={styles.body}>
            <ImplicitRelationWorkspace
              task={task}
              knowledge={knowledge}
              onKnowledgeChange={setKnowledge}
            />
          </div>
        )}
      </div>

      <Modal
        title="编辑任务配置"
        visible={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={() => void handleSaveConfig()}
        unmountOnExit
        style={{ width: 680 }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="任务描述" field="description">
            <TextArea
              placeholder="选填，描述分析目标与业务背景"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={500}
              showWordLimit
            />
          </Form.Item>
          <Form.Item
            label="发现算法"
            field="algorithm"
            rules={[{ required: true, message: '请选择发现算法' }]}
          >
            <Radio.Group>
              {DISCOVERY_ALGORITHM_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <div
                      style={{
                        color: 'var(--color-text-3)',
                        fontSize: 12,
                        lineHeight: 1.5,
                        marginTop: 2
                      }}
                    >
                      {option.description}
                    </div>
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <div
            style={{
              marginBottom: 8,
              color: '#1d2129',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            分析范围
          </div>
          <AnalysisScopeFields
            scenes={scenes}
            scenesLoading={scenesLoading}
            value={draftScope}
            onChange={(next) => {
              setDraftScope(next);
              setScopeError(undefined);
            }}
          />
          {scopeError ? (
            <div
              style={{
                marginTop: 8,
                color: 'rgb(var(--danger-6))',
                fontSize: 12
              }}
            >
              {scopeError}
            </div>
          ) : null}
        </div>
      </Modal>

      <ImplicitRelationChatModal
        visible={chatVisible}
        task={task}
        result={knowledge.result}
        onClose={() => setChatVisible(false)}
      />
    </div>
  );
}
