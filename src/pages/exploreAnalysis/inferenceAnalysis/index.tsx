import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, Space, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import PageHeader from '@/components/PageHeader';
import { listDomainAxioms } from '@/pages/knowledgeManagement/domainAxiom/services/axiomStorage';
import { listSemanticMappings } from '@/pages/knowledgeManagement/semanticMapping/services/mappingStorage';
import { useUserInfo } from '@/store/userInfoStore';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import CompareTasksModal from './components/CompareTasksModal';
import CreateTaskModal from './components/CreateTaskModal';
import DomainAxiomsPreviewModal from './components/DomainAxiomsPreviewModal';
import SemanticMappingsPreviewModal from './components/SemanticMappingsPreviewModal';
import { useColumns } from './hooks/useColumns';
import type {
  CreateInferenceAnalysisTaskInput,
  InferenceAnalysisTask,
  InferenceAnalysisTaskListItem
} from './types';
import {
  createInferenceAnalysisTask,
  deleteInferenceAnalysisTask,
  listInferenceAnalysisTasks,
  updateInferenceAnalysisTask
} from './services/taskStorage';
import {
  runInferenceAnalysis,
  type InferenceKnowledgeContext
} from './services/runInference';
import styles from './index.module.scss';

const { Search } = Input;
const DETAIL_PATH =
  '/tenant/compute/onto/exploreAnalysis/inferenceAnalysis/detail';
const MAX_COMPARE_COUNT = 5;

const buildCopyName = (name: string) => {
  const base = name.trim() || '推理任务';
  const suffix = '（副本）';
  const maxLen = 64;
  if (base.length + suffix.length <= maxLen) {
    return `${base}${suffix}`;
  }
  return `${base.slice(0, maxLen - suffix.length)}${suffix}`;
};

const buildInferenceKnowledge = (
  task: Pick<
    InferenceAnalysisTask,
    'ontologySceneIds' | 'semanticMappingIds' | 'domainAxiomIds'
  >,
  sceneNameMap: Record<number, string>
): InferenceKnowledgeContext => {
  const ontologySceneNames = (task.ontologySceneIds || []).map(
    (id) => sceneNameMap[id] || `场景 #${id}`
  );

  const mappingMap = new Map(
    listSemanticMappings().map((item) => [item.id, item] as const)
  );
  const axiomMap = new Map(
    listDomainAxioms().map((item) => [item.id, item] as const)
  );

  const semanticMappings = (task.semanticMappingIds || [])
    .map((id) => mappingMap.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      standardTerm: item.standardTerm,
      synonyms: item.synonyms,
      description: item.description,
      objectTypeNames: (item.objectTypes || []).map((ot) => ot.name)
    }));

  const domainAxioms = (task.domainAxiomIds || [])
    .map((id) => axiomMap.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      name: item.name,
      expression: item.expression,
      description: item.description,
      domain: item.domain
    }));

  return {
    ontologySceneNames,
    semanticMappings,
    domainAxioms
  };
};

export default function InferenceAnalysisList() {
  const history = useHistory();
  const userInfo = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<InferenceAnalysisTaskListItem[]>([]);
  const [sceneNameMap, setSceneNameMap] = useState<Record<number, string>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string>();
  const [createInitialValues, setCreateInitialValues] =
    useState<Partial<CreateInferenceAnalysisTaskInput>>();
  const [createModalTitle, setCreateModalTitle] = useState('新建推理');
  const [mappingPreviewTask, setMappingPreviewTask] =
    useState<InferenceAnalysisTaskListItem>();
  const [axiomPreviewTask, setAxiomPreviewTask] =
    useState<InferenceAnalysisTaskListItem>();
  const [rerunningId, setRerunningId] = useState<string>();

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
      const mappingNameMap: Record<string, string> = {};
      listSemanticMappings().forEach((item) => {
        mappingNameMap[item.id] = item.standardTerm;
      });
      const axiomNameMap: Record<string, string> = {};
      listDomainAxioms().forEach((item) => {
        axiomNameMap[item.id] = item.name;
      });

      const tasks = listInferenceAnalysisTasks().map((item) => ({
        ...item,
        ontologySceneNames: (item.ontologySceneIds || []).map(
          (id) => sceneNameMap[id] || `场景 #${id}`
        ),
        semanticMappingNames: (item.semanticMappingIds || []).map(
          (id) => mappingNameMap[id] || id
        ),
        domainAxiomNames: (item.domainAxiomIds || []).map(
          (id) => axiomNameMap[id] || id
        )
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
      [
        item.name,
        item.description || '',
        item.creator,
        ...(item.ontologySceneNames || []),
        ...(item.semanticMappingNames || []),
        ...(item.domainAxiomNames || []),
        item.resultContent || ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, keyword]);

  const selectedTasks = useMemo(
    () => data.filter((item) => selectedRowKeys.includes(item.id)),
    [data, selectedRowKeys]
  );

  const openCreateModal = (
    title: string,
    initialValues?: Partial<CreateInferenceAnalysisTaskInput>
  ) => {
    setCreateModalTitle(title);
    setCreateInitialValues(initialValues);
    setCreateVisible(true);
  };

  const handleCreate = async (values: CreateInferenceAnalysisTaskInput) => {
    setCreating(true);
    let createdTaskId: string | undefined;
    try {
      const creator = userInfo?.username || userInfo?.account || '未知用户';
      const task = createInferenceAnalysisTask({
        ...values,
        resultContent: undefined,
        creator
      });
      createdTaskId = task.id;

      const knowledge = buildInferenceKnowledge(task, sceneNameMap);

      const inference = await runInferenceAnalysis({
        name: task.name,
        description: task.description,
        inferenceType: task.inferenceType,
        knowledge
      });

      updateInferenceAnalysisTask(task.id, {
        resultContent: inference.resultContent,
        inferencePath: inference.inferencePath,
        relatedNodes: inference.relatedNodes,
        status: 'completed'
      });

      Message.success(
        inference.source === 'llm'
          ? `「${task.name}」创建成功，已完成智能推理`
          : `「${task.name}」创建成功，已生成推理结果`
      );
      setCreateVisible(false);
      setCreateInitialValues(undefined);
      loadData();
      history.push(`${DETAIL_PATH}/${task.id}`);
    } catch (error) {
      if (createdTaskId) {
        try {
          updateInferenceAnalysisTask(createdTaskId, {
            resultContent:
              error instanceof Error
                ? `推理未完成：${error.message}`
                : '推理未完成，请稍后重试或重新创建任务',
            status: 'completed'
          });
          loadData();
          history.push(`${DETAIL_PATH}/${createdTaskId}`);
        } catch {
          // ignore secondary update failure
        }
      }
      Message.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (record: InferenceAnalysisTaskListItem) => {
    openCreateModal('复制新建推理', {
      name: buildCopyName(record.name),
      description: record.description,
      inferenceType: record.inferenceType,
      ontologySceneIds: record.ontologySceneIds,
      semanticMappingIds: record.semanticMappingIds,
      domainAxiomIds: record.domainAxiomIds
    });
  };

  const handleRerun = async (record: InferenceAnalysisTaskListItem) => {
    if (record.status !== 'completed') {
      Message.warning('仅已完成的任务支持重新推理');
      return;
    }
    if (rerunningId) {
      Message.warning('已有任务正在重推，请稍候');
      return;
    }

    setRerunningId(record.id);
    try {
      updateInferenceAnalysisTask(record.id, {
        status: 'running'
      });
      loadData();

      const knowledge = buildInferenceKnowledge(record, sceneNameMap);
      const inference = await runInferenceAnalysis({
        name: record.name,
        description: record.description,
        inferenceType: record.inferenceType,
        knowledge
      });

      updateInferenceAnalysisTask(record.id, {
        resultContent: inference.resultContent,
        inferencePath: inference.inferencePath,
        relatedNodes: inference.relatedNodes,
        status: 'completed'
      });
      Message.success(
        inference.source === 'llm'
          ? `「${record.name}」已重新完成智能推理`
          : `「${record.name}」已重新生成推理结果`
      );
      loadData();
    } catch (error) {
      try {
        updateInferenceAnalysisTask(record.id, {
          status: 'completed',
          resultContent:
            error instanceof Error
              ? `重推未完成：${error.message}`
              : '重推未完成，请稍后重试'
        });
      } catch {
        // ignore
      }
      Message.error(error instanceof Error ? error.message : '重推失败');
      loadData();
    } finally {
      setRerunningId(undefined);
    }
  };

  const handleDelete = (record: InferenceAnalysisTaskListItem) => {
    setDeletingId(record.id);
    try {
      deleteInferenceAnalysisTask(record.id);
      Message.success(`「${record.name}」已删除`);
      setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));
      loadData();
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '删除失败');
    } finally {
      setDeletingId(undefined);
    }
  };

  const handleCompare = () => {
    if (selectedRowKeys.length < 2) {
      Message.warning('请至少勾选 2 个任务进行比对');
      return;
    }
    if (selectedRowKeys.length > MAX_COMPARE_COUNT) {
      Message.warning(`最多同时比对 ${MAX_COMPARE_COUNT} 个任务`);
      return;
    }
    setCompareVisible(true);
  };

  const columns = useColumns({
    onViewDetail: (record) => history.push(`${DETAIL_PATH}/${record.id}`),
    onCopy: handleCopy,
    onRerun: handleRerun,
    onDelete: handleDelete,
    onViewSemanticMappings: setMappingPreviewTask,
    onViewDomainAxioms: setAxiomPreviewTask,
    deletingId,
    rerunningId
  });

  return (
    <div className={styles.listPage}>
      <PageHeader
        title="推理分析"
        subTitle="基于本体知识与规则进行推理分析与结论解释"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Search
          allowClear
          placeholder="搜索任务名称、描述、结果或创建人"
          style={{ width: 320 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Space size={12}>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => openCreateModal('新建推理')}
          >
            新建推理
          </Button>
          <Button
            type="primary"
            disabled={selectedRowKeys.length < 2}
            onClick={handleCompare}
          >
            推理比对
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={filteredData}
        scroll={{ x: 1600 }}
        pagination={{ pageSize: 10, showTotal: true }}
        noDataElement="暂无推理任务，点击右上角新建推理"
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          checkStrictly: true,
          onChange: (keys) => {
            const nextKeys = keys as string[];
            if (nextKeys.length > MAX_COMPARE_COUNT) {
              Message.warning(`最多同时比对 ${MAX_COMPARE_COUNT} 个任务`);
              setSelectedRowKeys(nextKeys.slice(0, MAX_COMPARE_COUNT));
              return;
            }
            setSelectedRowKeys(nextKeys);
          }
        }}
      />

      <CreateTaskModal
        visible={createVisible}
        saving={creating}
        title={createModalTitle}
        initialValues={createInitialValues}
        onCancel={() => {
          setCreateVisible(false);
          setCreateInitialValues(undefined);
        }}
        onSubmit={handleCreate}
      />

      <CompareTasksModal
        visible={compareVisible}
        tasks={selectedTasks}
        onCancel={() => setCompareVisible(false)}
      />

      <SemanticMappingsPreviewModal
        visible={Boolean(mappingPreviewTask)}
        mappingIds={mappingPreviewTask?.semanticMappingIds}
        taskName={mappingPreviewTask?.name}
        onCancel={() => setMappingPreviewTask(undefined)}
      />

      <DomainAxiomsPreviewModal
        visible={Boolean(axiomPreviewTask)}
        axiomIds={axiomPreviewTask?.domainAxiomIds}
        taskName={axiomPreviewTask?.name}
        onCancel={() => setAxiomPreviewTask(undefined)}
      />
    </div>
  );
}
