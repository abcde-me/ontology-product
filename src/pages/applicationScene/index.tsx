import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { PageHeader } from './components/PageHeader';
import { CreateScenarioModal } from './components/CreateScenarioModal';
import { useColumns } from './hooks/useColumns';
import type {
  ApplicationScenarioListItem,
  CreateApplicationScenarioInput
} from './types';
import {
  createApplicationScenario,
  deleteApplicationScenario,
  listApplicationScenarios
} from './services/storage';
import styles from './index.module.scss';

const { Search } = Input;
const DETAIL_PATH = '/tenant/compute/onto/sceneCenter/applicationScene/detail';

export default function ApplicationSceneList() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<ApplicationScenarioListItem[]>([]);
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
      const scenarios = listApplicationScenarios().map((item) => ({
        ...item,
        ontologySceneName: item.ontologySceneId
          ? sceneNameMap[item.ontologySceneId]
          : undefined
      }));
      setData(scenarios);
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

  const handleCreate = (values: CreateApplicationScenarioInput) => {
    setCreating(true);
    try {
      const scenario = createApplicationScenario(values);
      Message.success(`「${scenario.name}」创建成功`);
      setCreateVisible(false);
      history.push(`${DETAIL_PATH}/${scenario.id}`);
    } catch (error: any) {
      Message.error(error?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (record: ApplicationScenarioListItem) => {
    setDeletingId(record.id);
    try {
      deleteApplicationScenario(record.id);
      Message.success(`「${record.name}」已删除`);
      loadData();
    } catch (error: any) {
      Message.error(error?.message || '删除失败');
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
    <div className={styles['application-scene-page']}>
      <PageHeader
        title="应用场景"
        subTitle="创建应用场景，关联图谱与规则，通过大模型对话驱动实例推理查询"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Search
          allowClear
          placeholder="搜索场景名称、描述或关联图谱"
          style={{ width: 320 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => setCreateVisible(true)}
        >
          创建应用场景
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={filteredData}
        pagination={{ pageSize: 10, showTotal: true }}
        noDataElement="暂无应用场景，点击右上角创建"
      />

      <CreateScenarioModal
        visible={createVisible}
        saving={creating}
        onCancel={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
