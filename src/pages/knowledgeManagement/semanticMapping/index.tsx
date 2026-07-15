import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useUserInfo } from '@/store/userInfoStore';
import CreateMappingModal from './components/CreateMappingModal';
import { DETAIL_PATH } from './constants';
import { useColumns } from './hooks/useColumns';
import type {
  CreateSemanticMappingInput,
  SemanticMappingListItem
} from './types';
import {
  createSemanticMapping,
  deleteSemanticMapping,
  listSemanticMappings
} from './services/mappingStorage';
import styles from './index.module.scss';

const { Search } = Input;

export default function SemanticMappingList() {
  const history = useHistory();
  const userInfo = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<SemanticMappingListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string>();

  const resolveCreator = () =>
    userInfo?.username || userInfo?.account || '未知用户';

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      setData(listSemanticMappings());
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
        item.standardTerm,
        item.description || '',
        ...(item.synonyms || []),
        ...(item.objectTypes || []).flatMap((ot) => [
          ot.name,
          ...(ot.attributes || []).map(
            (attr) => attr.displayName || attr.fieldName
          )
        ]),
        item.creator
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, keyword]);

  const handleCreate = (values: CreateSemanticMappingInput) => {
    setCreating(true);
    try {
      const mapping = createSemanticMapping({
        ...values,
        creator: resolveCreator()
      });
      Message.success(`「${mapping.standardTerm}」创建成功`);
      setCreateVisible(false);
      loadData();
      history.push(`${DETAIL_PATH}/${mapping.id}`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateBatch = (values: CreateSemanticMappingInput[]) => {
    if (!values.length) {
      Message.warning('没有可入库的映射');
      return;
    }

    setCreating(true);
    try {
      const creator = resolveCreator();
      const created = values.map((item) =>
        createSemanticMapping({
          ...item,
          creator
        })
      );
      Message.success(`已入库 ${created.length} 条语义映射`);
      setCreateVisible(false);
      loadData();
      if (created.length === 1) {
        history.push(`${DETAIL_PATH}/${created[0].id}`);
      }
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '批量创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (record: SemanticMappingListItem) => {
    setDeletingId(record.id);
    try {
      deleteSemanticMapping(record.id);
      Message.success(`「${record.standardTerm}」已删除`);
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
        title="语义映射"
        subTitle="配置业务概念与本体要素之间的语义对应关系"
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Search
          allowClear
          placeholder="搜索标准术语、同义词、对象类型或属性"
          style={{ width: 360 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => setCreateVisible(true)}
        >
          新建映射
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={filteredData}
        scroll={{ x: 1150 }}
        pagination={{ pageSize: 10, showTotal: true }}
        noDataElement="暂无语义映射，点击右上角新建映射"
      />

      <CreateMappingModal
        visible={createVisible}
        saving={creating}
        onCancel={() => setCreateVisible(false)}
        onSubmit={handleCreate}
        onSubmitBatch={handleCreateBatch}
      />
    </div>
  );
}
