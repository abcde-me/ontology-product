import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Input,
  Message,
  Modal,
  Select,
  Table
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import type {
  CreateLlmModelReq,
  LlmModelConfig,
  UpdateLlmModelReq
} from '@/types/llmModel';
import {
  createLlmModel,
  deleteLlmModel,
  fetchLlmModelList,
  updateLlmModel
} from '../services/modelApi';
import {
  formatTokenCount,
  getAllModelsTokenUsageSummary,
  getModelTokenUsageMap
} from '@/services/llmTokenUsageStorage';
import type { LlmModelTokenUsageMap } from '@/types/llmTokenUsage';
import { useModelColumns } from '../hooks/useModelColumns';
import { ModelConfigFormModal } from './ModelConfigFormModal';
import styles from '../index.module.scss';

const { Search } = Input;

type ModelTypeFilter = 'all' | LlmModelConfig['modelType'];

export interface ModelListDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const ModelListDrawer: React.FC<ModelListDrawerProps> = ({
  visible,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string>();
  const [data, setData] = useState<LlmModelConfig[]>([]);
  const [tokenUsageMap, setTokenUsageMap] = useState<LlmModelTokenUsageMap>({});
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<ModelTypeFilter>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LlmModelConfig | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchLlmModelList();
      setData(result.items);
      setTokenUsageMap(getModelTokenUsageMap());
    } catch (error: any) {
      Message.error(error?.message || '加载模型列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const filteredData = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return data.filter((item) => {
      if (typeFilter !== 'all' && item.modelType !== typeFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [
        item.name,
        item.provider,
        item.model,
        item.apiName,
        item.baseUrl,
        item.description
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [data, keyword, typeFilter]);

  const handleCreate = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleEdit = (record: LlmModelConfig) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleDelete = (record: LlmModelConfig) => {
    Modal.confirm({
      title: '确认删除该模型配置？',
      content: `删除后，引用「${record.name}」的业务环节需重新选择模型。`,
      onOk: async () => {
        setDeletingId(record.id);
        try {
          await deleteLlmModel(record.id);
          Message.success('模型配置已删除');
          await loadData();
        } catch (error: any) {
          Message.error(error?.message || '删除失败');
        } finally {
          setDeletingId(undefined);
        }
      }
    });
  };

  const handleSubmit = async (
    values: CreateLlmModelReq | UpdateLlmModelReq
  ) => {
    setSaving(true);
    try {
      if ('id' in values) {
        await updateLlmModel(values);
        Message.success('模型配置已更新');
      } else {
        await createLlmModel(values);
        Message.success('模型配置已创建');
      }
      setFormVisible(false);
      setEditingRecord(null);
      await loadData();
    } catch (error: any) {
      Message.error(error?.message || '保存失败');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const columns = useModelColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    deletingId,
    tokenUsageMap
  });

  const tokenSummary = getAllModelsTokenUsageSummary();

  return (
    <>
      <Drawer
        width={1080}
        title="模型列表"
        visible={visible}
        onCancel={onClose}
        footer={null}
        unmountOnExit
      >
        <div className={styles['model-list-desc']}>
          管理当前系统中的模型配置信息，供各业务环节引用。支持创建、编辑和删除自定义模型，系统预置模型可编辑但不可删除。
        </div>

        <div className={styles['token-summary-card']}>
          <div className={styles['token-summary-item']}>
            <div className={styles['token-summary-label']}>累计 Token</div>
            <div className={styles['token-summary-value']}>
              {formatTokenCount(tokenSummary.totalTokens)}
            </div>
          </div>
          <div className={styles['token-summary-item']}>
            <div className={styles['token-summary-label']}>输入 Token</div>
            <div className={styles['token-summary-value']}>
              {formatTokenCount(tokenSummary.promptTokens)}
            </div>
          </div>
          <div className={styles['token-summary-item']}>
            <div className={styles['token-summary-label']}>输出 Token</div>
            <div className={styles['token-summary-value']}>
              {formatTokenCount(tokenSummary.completionTokens)}
            </div>
          </div>
          <div className={styles['token-summary-item']}>
            <div className={styles['token-summary-label']}>总调用次数</div>
            <div className={styles['token-summary-value']}>
              {tokenSummary.requestCount.toLocaleString('zh-CN')}
            </div>
          </div>
        </div>

        <div className={`${styles.toolbar} mt-4`}>
          <Search
            allowClear
            placeholder="搜索模型名称、提供商或模型 ID"
            style={{ width: 280 }}
            value={keyword}
            onChange={setKeyword}
          />
          <Select
            placeholder="模型类型"
            style={{ width: 130 }}
            options={[
              { label: '全部类型', value: 'all' },
              { label: '对话模型', value: 'chat' },
              { label: '向量模型', value: 'embedding' }
            ]}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as ModelTypeFilter)}
          />
          <Button type="primary" icon={<IconPlus />} onClick={handleCreate}>
            新建模型
          </Button>
        </div>

        <Table
          className="mt-4"
          columns={columns}
          data={filteredData}
          loading={loading}
          rowKey="id"
          border={false}
          pagination={{ pageSize: 8, showTotal: true }}
          scroll={{ x: true }}
        />
      </Drawer>

      <Modal
        title={editingRecord ? `编辑模型：${editingRecord.name}` : '新建模型'}
        visible={formVisible}
        footer={null}
        onCancel={() => {
          setFormVisible(false);
          setEditingRecord(null);
        }}
        unmountOnExit
      >
        <ModelConfigFormModal
          visible={formVisible}
          record={editingRecord}
          saving={saving}
          onCancel={() => {
            setFormVisible(false);
            setEditingRecord(null);
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
};
