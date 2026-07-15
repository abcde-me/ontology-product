import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Message,
  Table
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useUserInfo } from '@/store/userInfoStore';
import {
  CreateAxiomModal,
  ExtractAxiomModal,
  GenerateAxiomModal
} from './components';
import { DETAIL_PATH } from './constants';
import { useColumns } from './hooks/useColumns';
import type { CreateDomainAxiomInput, DomainAxiomListItem } from './types';
import {
  createDomainAxiom,
  createDomainAxiomsBatch,
  deleteDomainAxiom,
  listDomainAxioms,
  updateDomainAxiom
} from './services/axiomStorage';
import styles from './index.module.scss';

const { Search } = Input;
const MenuItem = Menu.Item;

type CreateMode = 'manual' | 'file' | 'llm' | null;

export default function DomainAxiomList() {
  const history = useHistory();
  const userInfo = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<DomainAxiomListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string>();
  const [togglingId, setTogglingId] = useState<string>();

  const creatorName = userInfo?.username || userInfo?.account || '未知用户';

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      setData(listDomainAxioms());
    } finally {
      setLoading(false);
    }
  }, []);

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
        item.expression,
        item.description || '',
        item.domain || '',
        item.ontologySceneName || '',
        item.applicationScenarioName || '',
        item.sourceFileName || '',
        item.creator
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, keyword]);

  const handleCreateManual = (values: CreateDomainAxiomInput) => {
    setSaving(true);
    try {
      const axiom = createDomainAxiom({
        ...values,
        creator: creatorName
      });
      Message.success(`「${axiom.name}」创建成功`);
      setCreateMode(null);
      loadData();
      history.push(`${DETAIL_PATH}/${axiom.id}`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBatch = (values: CreateDomainAxiomInput[]) => {
    setSaving(true);
    try {
      const axioms = createDomainAxiomsBatch(
        values.map((item) => ({
          ...item,
          creator: creatorName
        }))
      );
      Message.success(`成功入库 ${axioms.length} 条领域公理`);
      setCreateMode(null);
      loadData();
      if (axioms.length === 1) {
        history.push(`${DETAIL_PATH}/${axioms[0].id}`);
      }
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '入库失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = (
    record: DomainAxiomListItem,
    enabled: boolean
  ) => {
    setTogglingId(record.id);
    try {
      updateDomainAxiom(record.id, { enabled });
      Message.success(enabled ? '已启用' : '已停用');
      loadData();
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '更新失败');
    } finally {
      setTogglingId(undefined);
    }
  };

  const handleDelete = (record: DomainAxiomListItem) => {
    setDeletingId(record.id);
    try {
      deleteDomainAxiom(record.id);
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
    onToggleEnabled: handleToggleEnabled,
    onDelete: handleDelete,
    deletingId,
    togglingId
  });

  const createMenu = (
    <Menu
      onClickMenuItem={(key) => {
        setCreateMode(key as CreateMode);
      }}
    >
      <MenuItem key="manual">人工创建</MenuItem>
      <MenuItem key="file">文件提取</MenuItem>
      <MenuItem key="llm">大模型根据本体图谱生成</MenuItem>
    </Menu>
  );

  return (
    <div className={styles.listPage}>
      <PageHeader
        title="领域公理"
        subTitle="定义与维护领域约束、推断规则与公理知识，供推理分析引用"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Search
          allowClear
          placeholder="搜索公理名称、表达式、领域、应用场景或本体场景"
          style={{ width: 360 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Dropdown droplist={createMenu} position="br">
          <Button type="primary" icon={<IconPlus />}>
            新建公理
          </Button>
        </Dropdown>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={filteredData}
        scroll={{ x: 1420 }}
        pagination={{ pageSize: 10, showTotal: true }}
        noDataElement="暂无领域公理，点击右上角新建公理"
      />

      <CreateAxiomModal
        visible={createMode === 'manual'}
        saving={saving}
        onCancel={() => setCreateMode(null)}
        onSubmit={handleCreateManual}
      />
      <ExtractAxiomModal
        visible={createMode === 'file'}
        saving={saving}
        onCancel={() => setCreateMode(null)}
        onSubmit={handleCreateBatch}
      />
      <GenerateAxiomModal
        visible={createMode === 'llm'}
        saving={saving}
        onCancel={() => setCreateMode(null)}
        onSubmit={handleCreateBatch}
      />
    </div>
  );
}
