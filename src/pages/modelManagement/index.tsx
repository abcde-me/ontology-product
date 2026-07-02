import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Message, Select, Table } from '@arco-design/web-react';
import {
  PageHeader,
  ScenarioConfigDrawer,
  ModelListDrawer
} from './components';
import { useColumns } from './hooks/useColumns';
import type {
  LlmScenarioConfig,
  UpdateLlmScenarioReq
} from '@/types/llmScenario';
import { fetchLlmScenarioList, updateLlmScenario } from './services/api';
import styles from './index.module.scss';

const { Search } = Input;

type EnabledFilter = 'all' | 'enabled' | 'disabled';

export default function ModelManagement() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<LlmScenarioConfig[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modelListVisible, setModelListVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LlmScenarioConfig | null>(
    null
  );
  const [togglingCode, setTogglingCode] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [moduleKeyword, setModuleKeyword] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchLlmScenarioList();
      setData(result.items);
    } catch (error: any) {
      Message.error(error?.message || '加载大模型环节配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    const moduleNormalized = moduleKeyword.trim().toLowerCase();

    return data.filter((item) => {
      if (
        moduleNormalized &&
        !item.module.toLowerCase().includes(moduleNormalized)
      ) {
        return false;
      }

      if (enabledFilter === 'enabled' && !item.enabled) {
        return false;
      }

      if (enabledFilter === 'disabled' && item.enabled) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [item.name, item.module, item.description, item.code, item.model]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [data, enabledFilter, keyword, moduleKeyword]);

  const handleEdit = (record: LlmScenarioConfig) => {
    setEditingRecord(record);
    setDrawerVisible(true);
  };

  const handleToggleEnabled = async (
    record: LlmScenarioConfig,
    enabled: boolean
  ) => {
    setTogglingCode(record.code);
    try {
      await updateLlmScenario({
        code: record.code,
        enabled,
        provider: record.provider,
        model: record.model,
        apiName: record.apiName,
        baseUrl: record.baseUrl
      });
      Message.success(enabled ? '已启用大模型' : '已关闭大模型');
      await loadData();
    } catch (error: any) {
      Message.error(error?.message || '更新失败');
    } finally {
      setTogglingCode(undefined);
    }
  };

  const handleSubmit = async (values: UpdateLlmScenarioReq) => {
    setSaving(true);
    try {
      await updateLlmScenario(values);
      Message.success('配置已保存');
      setDrawerVisible(false);
      setEditingRecord(null);
      await loadData();
    } catch (error: any) {
      Message.error(error?.message || '保存失败');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const columns = useColumns({
    onEdit: handleEdit,
    onToggleEnabled: handleToggleEnabled,
    togglingCode
  });

  return (
    <div className={styles['model-management-page']}>
      <PageHeader onOpenModelList={() => setModelListVisible(true)} />

      <div className={`${styles.toolbar} mt-4`}>
        <Search
          allowClear
          placeholder="搜索环节名称、模块或说明"
          style={{ width: 280 }}
          value={keyword}
          onChange={setKeyword}
        />
        <Input
          allowClear
          placeholder="所属模块"
          style={{ width: 160 }}
          value={moduleKeyword}
          onChange={setModuleKeyword}
        />
        <Select
          placeholder="启用状态"
          style={{ width: 130 }}
          options={[
            { label: '全部', value: 'all' },
            { label: '已启用', value: 'enabled' },
            { label: '未启用', value: 'disabled' }
          ]}
          value={enabledFilter}
          onChange={(value) => setEnabledFilter(value as EnabledFilter)}
        />
      </div>

      <Table
        className="mt-4"
        columns={columns}
        data={filteredData}
        loading={loading}
        rowKey="code"
        border={false}
        pagination={false}
        scroll={{ x: true }}
      />

      <ScenarioConfigDrawer
        visible={drawerVisible}
        record={editingRecord}
        saving={saving}
        onClose={() => {
          setDrawerVisible(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmit}
      />

      <ModelListDrawer
        visible={modelListVisible}
        onClose={() => setModelListVisible(false)}
      />
    </div>
  );
}
