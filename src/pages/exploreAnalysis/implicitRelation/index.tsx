import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import PageHeader from '@/components/PageHeader';
import CreateTaskModal from './components/CreateTaskModal';
import { useColumns } from './hooks/useColumns';
import type {
  CreateImplicitRelationTaskInput,
  ImplicitRelationTaskListItem
} from './types';
import {
  createImplicitRelationTask,
  deleteImplicitRelationTask,
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
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<ImplicitRelationTaskListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string>();
  const [sceneNameMap, setSceneNameMap] = useState<Record<number, string>>({});

  const loadSceneNames = useCallback(async () => {
    try {
      const res = await listOntologyModel({
        pageNo: 1,
        pageSize: 100,
        order: 'desc',
        orderBy: 'create_time'
      });

      if (isOntologyApiSuccess(res) && res.data?.result) {
        const map: Record<number, string> = {};
        res.data.result.forEach((scene) => {
          if (scene.id != null) {
            map[scene.id] = scene.name || `场景 #${scene.id}`;
          }
        });
        setSceneNameMap(map);
      }
    } catch {
      // ignore scene name loading errors
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
    void loadSceneNames();
  }, [loadSceneNames]);

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

  const columns = useColumns({
    onViewDetail: (record) => history.push(`${DETAIL_PATH}/${record.id}`),
    onDelete: handleDelete,
    deletingId
  });

  return (
    <div className={styles.listPage}>
      <PageHeader
        title="隐性关系"
        subTitle="创建隐性关系分析任务，基于图谱拓扑与推理规则发现潜在关联"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
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
        noDataElement="暂无隐性关系任务，点击右上角新建"
      />

      <CreateTaskModal
        visible={createVisible}
        saving={creating}
        onCancel={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
