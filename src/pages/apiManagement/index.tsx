import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Message, Modal, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import { PageHeader } from './components/PageHeader';
import { ApiTestPanel } from './components/ApiTestPanel';
import { ApiAuthorizationModal } from './components/ApiAuthorizationModal';
import { CreateApiModal } from './components/CreateApiModal';
import { useColumns } from './hooks/useColumns';
import type { CreateOntologyApiInput, OntologyApiListItem } from './types';
import {
  createCustomOntologyApi,
  deleteOntologyApi,
  getDetailCatalog,
  getEffectiveApiConfig,
  getOntologyApiDetail,
  listOntologyApis,
  publishOntologyApi,
  updateOntologyApiStatus
} from './services/storage';
import styles from './index.module.scss';

const { Search } = Input;

export default function ApiManagementList() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<OntologyApiListItem[]>([]);
  const [togglingId, setTogglingId] = useState<string>();
  const [publishingId, setPublishingId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const [testTarget, setTestTarget] = useState<OntologyApiListItem | null>(
    null
  );
  const [authTarget, setAuthTarget] = useState<OntologyApiListItem | null>(
    null
  );
  const [authModalTab, setAuthModalTab] = useState<'add' | 'authorized'>('add');

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      setData(listOntologyApis());
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
      [item.code, item.name, item.category, item.path, item.method]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, keyword]);

  const handleViewDetail = (record: OntologyApiListItem) => {
    history.push(
      `/tenant/compute/onto/platformResource/apiManagement/detail/${record.id}`
    );
  };

  const handleTest = (record: OntologyApiListItem) => {
    setTestTarget(record);
  };

  const handleAuthorize = (record: OntologyApiListItem) => {
    setAuthModalTab('add');
    setAuthTarget(record);
  };

  const handleViewAuthorization = (record: OntologyApiListItem) => {
    setAuthModalTab('authorized');
    setAuthTarget(record);
  };

  const handleOnline = (record: OntologyApiListItem) => {
    setTogglingId(record.id);
    try {
      updateOntologyApiStatus(record.id, 'online');
      Message.success(`「${record.name}」已上线`);
      loadData();
    } catch (error: any) {
      Message.error(error?.message || '上线失败');
    } finally {
      setTogglingId(undefined);
    }
  };

  const handleOffline = (record: OntologyApiListItem) => {
    setTogglingId(record.id);
    try {
      updateOntologyApiStatus(record.id, 'offline');
      Message.success(`「${record.name}」已下线`);
      loadData();
    } catch (error: any) {
      Message.error(error?.message || '下线失败');
    } finally {
      setTogglingId(undefined);
    }
  };

  const handlePublish = (record: OntologyApiListItem) => {
    setPublishingId(record.id);
    try {
      publishOntologyApi(record.id);
      Message.success(`「${record.name}」已发布`);
      loadData();
    } catch (error: any) {
      Message.error(error?.message || '发布失败');
    } finally {
      setPublishingId(undefined);
    }
  };

  const handleDelete = (record: OntologyApiListItem) => {
    setDeletingId(record.id);
    try {
      const result = deleteOntologyApi(record.id);
      Message.success(
        result.removed
          ? `「${record.name}」已删除`
          : `「${record.name}」已恢复默认配置`
      );
      loadData();
    } catch (error: any) {
      Message.error(error?.message || '删除失败');
    } finally {
      setDeletingId(undefined);
    }
  };

  const handleCreate = (values: CreateOntologyApiInput) => {
    setCreating(true);
    try {
      const created = createCustomOntologyApi(values);
      Message.success('API 已创建，请完善说明后发布');
      setCreateVisible(false);
      history.push(
        `/tenant/compute/onto/platformResource/apiManagement/detail/${created.id}?tab=edit`
      );
    } catch (error: any) {
      Message.error(error?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const columns = useColumns({
    onViewDetail: handleViewDetail,
    onTest: handleTest,
    onViewAuthorization: handleViewAuthorization,
    onAuthorize: handleAuthorize,
    onPublish: handlePublish,
    onOnline: handleOnline,
    onOffline: handleOffline,
    onDelete: handleDelete,
    togglingId,
    publishingId,
    deletingId
  });

  const testDetail = testTarget ? getOntologyApiDetail(testTarget.id) : null;
  const testCatalog =
    testDetail && getDetailCatalog(testDetail.catalog, testDetail.record);
  const testConfig =
    testDetail && getEffectiveApiConfig(testDetail.record, true);

  return (
    <div className={styles['api-management-page']}>
      <PageHeader />

      <div className="mt-4 flex items-center justify-between gap-3">
        <Search
          allowClear
          placeholder="搜索 API 编号、名称、分类或 Path"
          style={{ width: 360 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={() => setCreateVisible(true)}
        >
          新建 API
        </Button>
      </div>

      <Table
        className="mt-4"
        columns={columns}
        data={filteredData}
        loading={loading}
        rowKey="id"
        border={false}
        pagination={{ pageSize: 10, showTotal: true }}
        scroll={{ x: true }}
      />

      <Modal
        title="新建 API"
        visible={createVisible}
        footer={null}
        style={{ width: 520 }}
        bodyStyle={{ paddingBottom: 20 }}
        onCancel={() => setCreateVisible(false)}
        unmountOnExit
      >
        <CreateApiModal
          visible={createVisible}
          saving={creating}
          onCancel={() => setCreateVisible(false)}
          onSubmit={handleCreate}
        />
      </Modal>

      <Modal
        title={testTarget ? `接口测试 - ${testTarget.name}` : '接口测试'}
        visible={!!testTarget}
        footer={null}
        style={{ width: 920 }}
        onCancel={() => setTestTarget(null)}
      >
        {testTarget && testDetail && testCatalog && testConfig && (
          <div className={styles['test-modal-body']}>
            <ApiTestPanel catalog={testCatalog} config={testConfig} compact />
          </div>
        )}
      </Modal>

      <Modal
        title={
          authTarget
            ? authModalTab === 'authorized'
              ? `授权列表 - ${authTarget.name}`
              : `API 授权 - ${authTarget.name}`
            : 'API 授权'
        }
        visible={!!authTarget}
        footer={null}
        style={{ width: 560 }}
        bodyStyle={{ paddingBottom: 20 }}
        onCancel={() => setAuthTarget(null)}
        unmountOnExit
      >
        <ApiAuthorizationModal
          api={authTarget}
          initialTab={authModalTab}
          onCancel={() => setAuthTarget(null)}
          onSaved={loadData}
        />
      </Modal>
    </div>
  );
}
