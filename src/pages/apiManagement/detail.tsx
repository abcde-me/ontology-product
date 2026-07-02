import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Message, Tabs } from '@arco-design/web-react';
import { useHistory, useParams } from 'react-router-dom';
import { ApiDetailHeader } from './components/ApiDetailHeader';
import { ApiDocSection } from './components/ApiDocSection';
import {
  ApiEditForm,
  splitEditFormValues,
  type ApiEditFormValues
} from './components/ApiEditForm';
import { ApiTestPanel } from './components/ApiTestPanel';
import type { OntologyApiCatalogItem, OntologyApiRuntimeRecord } from './types';
import { generateApiDocumentation } from './services/generateApiDocumentation';
import {
  getDetailCatalog,
  getEffectiveApiConfig,
  getOntologyApiDetail,
  updateOntologyApiDraft
} from './services/storage';
import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/platformResource/apiManagement';

const resolveDefaultTab = (status: OntologyApiRuntimeRecord['status']) =>
  status === 'editing' ? 'edit' : 'doc';

export default function ApiManagementDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('doc');
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<OntologyApiRuntimeRecord | null>(null);
  const [catalog, setCatalog] = useState<OntologyApiCatalogItem | null>(null);
  const [editResetKey, setEditResetKey] = useState(0);

  const loadDetail = useCallback(() => {
    const detail = getOntologyApiDetail(id);
    if (!detail) {
      Message.error('API 不存在');
      history.replace(LIST_PATH);
      return;
    }

    setCatalog(getDetailCatalog(detail.catalog, detail.record));
    setRecord(detail.record);
    setActiveTab((current) => {
      const params = new URLSearchParams(history.location.search);
      return (
        params.get('tab') || current || resolveDefaultTab(detail.record.status)
      );
    });
  }, [history, id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [history.location.search]);

  const displayCatalog = useMemo(() => {
    if (!catalog || !record) {
      return null;
    }
    return getDetailCatalog(catalog, record);
  }, [catalog, record]);

  const docConfig = useMemo(() => {
    if (!record) {
      return null;
    }
    return record.status === 'editing'
      ? record.draftConfig
      : getEffectiveApiConfig(record);
  }, [record]);

  const testConfig = useMemo(() => {
    if (!record) {
      return null;
    }
    return getEffectiveApiConfig(record, true);
  }, [record]);

  const editInitialValues = useMemo<ApiEditFormValues | null>(() => {
    if (!record) {
      return null;
    }

    return {
      ...record.draftConfig,
      name: record.customMeta?.name,
      method: record.customMeta?.method,
      category: record.customMeta?.category
    };
  }, [record]);

  const handleSaveDraft = (values: ApiEditFormValues) => {
    setSaving(true);
    try {
      const payload = splitEditFormValues(values, record?.customMeta);

      if (record?.isCustom && record.customMeta && payload.customMeta) {
        const { config: generatedConfig } = generateApiDocumentation(
          {
            name: payload.customMeta.name,
            method: payload.customMeta.method,
            path: payload.customMeta.path,
            category: payload.customMeta.category,
            baseUrl: payload.config.baseUrl
          },
          record.customMeta.code
        );

        payload.config = {
          ...payload.config,
          description: generatedConfig.description,
          useCase: generatedConfig.useCase,
          requestExample: generatedConfig.requestExample,
          responseExample: generatedConfig.responseExample,
          notes: generatedConfig.notes
        };
      }

      const nextRecord = updateOntologyApiDraft(id, payload);
      setRecord(nextRecord);
      setCatalog(getDetailCatalog(catalog!, nextRecord));
      setEditResetKey((value) => value + 1);
      Message.success('草稿已保存');
    } catch (error: any) {
      Message.error(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (
    !record ||
    !displayCatalog ||
    !docConfig ||
    !testConfig ||
    !editInitialValues
  ) {
    return null;
  }

  return (
    <div className={styles['detail-page']}>
      <ApiDetailHeader
        catalog={displayCatalog}
        record={record}
        endpointPath={record.draftConfig.path}
        onBack={() => history.push(LIST_PATH)}
      />

      <Tabs
        activeTab={activeTab}
        className={styles['detail-tabs']}
        onChange={setActiveTab}
      >
        <Tabs.TabPane key="edit" title="编辑配置">
          <div className={styles['detail-tab-panel']}>
            <ApiEditForm
              key={`${record.updatedAt}-${editResetKey}`}
              initialValues={editInitialValues}
              isCustom={record.isCustom}
              catalogName={displayCatalog.name}
              catalogCategory={displayCatalog.category}
              catalogMethod={displayCatalog.method}
              saving={saving}
              onSubmit={handleSaveDraft}
              onReset={() => setEditResetKey((value) => value + 1)}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane key="test" title="接口测试">
          <div className={styles['detail-tab-panel']}>
            <ApiTestPanel catalog={displayCatalog} config={testConfig} />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane key="doc" title="调用说明">
          <div className={styles['detail-tab-panel']}>
            <ApiDocSection
              catalog={displayCatalog}
              config={docConfig}
              showPublishedHint={record.status !== 'editing'}
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
