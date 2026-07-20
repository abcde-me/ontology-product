import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import PageHeader from '@/components/PageHeader';
import CreateTaskModal from './components/CreateTaskModal';
import ScenarioConfigModal from './components/ScenarioConfigModal';
import ScenarioGoalView from './components/ScenarioGoalView';
import ImplicitRelationChatModal from './components/ImplicitRelationChatModal';
import { useColumns } from './hooks/useColumns';
import { IMPLICIT_RELATION_USAGE_SCENARIOS } from './constants';
import type {
  CreateImplicitRelationTaskInput,
  ImplicitDiscoveryResult,
  ImplicitRelationTask,
  ImplicitRelationTaskListItem,
  ImplicitRelationUsageScenario
} from './types';
import { getImplicitRelationKnowledge } from './services/implicitRelationStore';
import {
  createImplicitRelationTask,
  deleteImplicitRelationTask,
  getImplicitRelationTask,
  listImplicitRelationTasks
} from './services/taskStorage';
import styles from './index.module.scss';

const { Search } = Input;
const DETAIL_PATH =
  '/tenant/compute/onto/exploreAnalysis/implicitRelation/detail';

export default function ImplicitRelationList() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [scenarioConfigVisible, setScenarioConfigVisible] = useState(false);
  const [activeScenario, setActiveScenario] =
    useState<ImplicitRelationUsageScenario>();
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<ImplicitRelationTaskListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string>();
  const [scenesLoading, setScenesLoading] = useState(false);
  const [scenes, setScenes] = useState<Array<{ id: number; name: string }>>([]);
  const [sceneNameMap, setSceneNameMap] = useState<Record<number, string>>({});
  const [chatVisible, setChatVisible] = useState(false);
  const [chatTask, setChatTask] = useState<ImplicitRelationTask | null>(null);
  const [chatResult, setChatResult] = useState<ImplicitDiscoveryResult | null>(
    null
  );

  const handleScenarioConfigSubmit = (
    values: CreateImplicitRelationTaskInput
  ) => {
    setCreating(true);
    try {
      const task = createImplicitRelationTask(values);
      Message.success(`「${task.name}」创建成功`);
      setScenarioConfigVisible(false);
      setActiveScenario(undefined);
      history.push(`${DETAIL_PATH}/${task.id}`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleScenarioSelect = (scenario: ImplicitRelationUsageScenario) => {
    setActiveScenario(scenario);
    setScenarioConfigVisible(true);
  };

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
        const nextScenes: Array<{ id: number; name: string }> = [];
        const map: Record<number, string> = {};
        res.data.result.forEach((scene) => {
          if (scene.id == null) {
            return;
          }
          const name = scene.name || `场景 #${scene.id}`;
          nextScenes.push({ id: scene.id, name });
          map[scene.id] = name;
        });
        setScenes(nextScenes);
        setSceneNameMap(map);
      }
    } catch {
      // ignore
    } finally {
      setScenesLoading(false);
    }
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const tasks = listImplicitRelationTasks().map((item) => ({
        ...item,
        ontologySceneName: item.ontologySceneId
          ? sceneNameMap[item.ontologySceneId]
          : undefined
      }));
      setData(tasks);
    } finally {
      setLoading(false);
    }
  }, [sceneNameMap]);

  useEffect(() => {
    void loadScenes();
  }, [loadScenes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return data;
    }

    return data.filter((item) =>
      [item.name, item.description || '', item.ontologySceneName || '']
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, keyword]);

  const handleCreate = (values: CreateImplicitRelationTaskInput) => {
    setCreating(true);
    try {
      const task = createImplicitRelationTask(values);
      Message.success(`「${task.name}」创建成功`);
      setCreateVisible(false);
      history.push(`${DETAIL_PATH}/${task.id}`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (record: ImplicitRelationTaskListItem) => {
    setDeletingId(record.id);
    try {
      deleteImplicitRelationTask(record.id);
      Message.success(`「${record.name}」已删除`);
      loadData();
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setDeletingId(undefined);
    }
  };

  const handleAsk = (record: ImplicitRelationTaskListItem) => {
    const task = getImplicitRelationTask(record.id);
    const knowledge = getImplicitRelationKnowledge(record.id);
    if (!task || !knowledge.result) {
      Message.warning('该任务暂无挖掘结果，请先进入详情执行发现');
      return;
    }
    setChatTask(task);
    setChatResult(knowledge.result);
    setChatVisible(true);
  };

  const columns = useColumns({
    onViewDetail: (record) => history.push(`${DETAIL_PATH}/${record.id}`),
    onAsk: handleAsk,
    onDelete: handleDelete,
    deletingId
  });

  return (
    <div className={styles.listPage}>
      <PageHeader
        title="关系挖掘"
        subTitle="从「发现隐藏的关系/隐藏的路径/可聚合的群组、相近时间地点关联、核心节点、薄弱环节」等场景进入详情配置"
      />

      <section className={styles.scenarioSection}>
        <ScenarioGoalView
          scenarios={IMPLICIT_RELATION_USAGE_SCENARIOS}
          onSelect={handleScenarioSelect}
        />
      </section>

      <div className={styles.taskListHeader}>
        <Search
          allowClear
          placeholder="搜索任务名称、描述或关联图谱"
          style={{ width: 320 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => setCreateVisible(true)}
        >
          新建
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={filteredData}
        pagination={{ pageSize: 10, showTotal: true }}
        noDataElement="暂无关系挖掘任务，点击右上角新建"
      />

      <CreateTaskModal
        visible={createVisible}
        saving={creating}
        scenesLoading={scenesLoading}
        scenes={scenes}
        onCancel={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />

      <ScenarioConfigModal
        visible={scenarioConfigVisible}
        saving={creating}
        scenario={activeScenario}
        scenesLoading={scenesLoading}
        scenes={scenes}
        onCancel={() => {
          setScenarioConfigVisible(false);
          setActiveScenario(undefined);
        }}
        onSubmit={handleScenarioConfigSubmit}
      />

      <ImplicitRelationChatModal
        visible={chatVisible}
        task={chatTask}
        result={chatResult}
        onClose={() => {
          setChatVisible(false);
          setChatTask(null);
          setChatResult(null);
        }}
      />
    </div>
  );
}
