import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Message,
  Select,
  Space
} from '@arco-design/web-react';
import { listOntologyObjectTypeData } from '@/api/ontologySceneLibrary/graph';
import { fetchFieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/services/conditionQuery';
import type { FieldCommentMap } from '@/pages/exploreAnalysis/objectBrowse/utils/fieldDisplayLabel';
import {
  getScenesForObjectType,
  getUniqueObjectTypeOptions,
  loadObjectBrowseScopeOptions,
  resolveObjectTypeInScene,
  type ObjectTypeWithScene
} from '@/pages/exploreAnalysis/objectBrowse/services/objectTypeScope';
import type { OntologScene } from '@/types/ontologySceneApi';
import type { InstanceQueryRow } from '@/pages/exploreAnalysis/objectBrowse/types';
import type {
  GraphLoadSettings,
  QueryResultItem,
  RelationLoadMode,
  SelectedObjectContext
} from '../types';
import { toQueryResultItem } from '../utils/queryResultRow';
import { QueryResultPanel } from './QueryResultPanel';
import styles from '../index.module.scss';

const Option = Select.Option;

interface ObjectSelectDrawerProps {
  visible: boolean;
  initialValues?: Partial<SelectedObjectContext> & {
    instanceIds?: string[];
  };
  loadedInstanceKeys: Set<string>;
  loading?: boolean;
  onClose: () => void;
  onLoad: (
    rows: QueryResultItem[],
    mode: RelationLoadMode,
    graphSettings?: GraphLoadSettings
  ) => void;
}

interface FormValues {
  sceneId?: number;
  objectTypeId?: number;
}

export const ObjectSelectDrawer: React.FC<ObjectSelectDrawerProps> = ({
  visible,
  initialValues,
  loadedInstanceKeys,
  loading = false,
  onClose,
  onLoad
}) => {
  const [form] = Form.useForm<FormValues>();
  const [scenes, setScenes] = useState<OntologScene[]>([]);
  const [allObjectTypes, setAllObjectTypes] = useState<ObjectTypeWithScene[]>(
    []
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [querying, setQuerying] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [queryResults, setQueryResults] = useState<QueryResultItem[]>([]);
  const [selectedResultKeys, setSelectedResultKeys] = useState<string[]>([]);
  const [fieldCommentMap, setFieldCommentMap] = useState<FieldCommentMap>({});

  const sceneId = Form.useWatch('sceneId', form as any);
  const objectTypeId = Form.useWatch('objectTypeId', form as any);

  useEffect(() => {
    if (!visible || !sceneId || !objectTypeId) {
      setFieldCommentMap({});
      return;
    }

    fetchFieldCommentMap(sceneId, objectTypeId)
      .then(setFieldCommentMap)
      .catch(() => setFieldCommentMap({}));
  }, [objectTypeId, sceneId, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setOptionsLoading(true);
    loadObjectBrowseScopeOptions()
      .then(({ scenes: sceneList, allObjectTypes: objectTypeList }) => {
        setScenes(sceneList);
        setAllObjectTypes(objectTypeList);
      })
      .catch(() => Message.error('加载对象类型与场景库失败'))
      .finally(() => setOptionsLoading(false));
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    form.setFieldsValue({
      sceneId: initialValues?.sceneId,
      objectTypeId: initialValues?.objectTypeId
    });
    setKeyword('');
    setHasQueried(false);
    setQueryResults([]);
    setSelectedResultKeys([]);
  }, [form, initialValues?.objectTypeId, initialValues?.sceneId, visible]);

  const objectTypeOptions = useMemo(
    () => getUniqueObjectTypeOptions(allObjectTypes),
    [allObjectTypes]
  );

  const filteredScenes = useMemo(
    () => getScenesForObjectType(allObjectTypes, scenes, objectTypeId),
    [allObjectTypes, objectTypeId, scenes]
  );

  const handleObjectTypeChange = (nextObjectTypeId?: number) => {
    const selected = allObjectTypes.find(
      (item) => item.id === nextObjectTypeId
    );
    const nextSceneId = selected?.sceneId;

    if (nextSceneId) {
      form.setFieldValue('sceneId', nextSceneId);
    } else {
      form.setFieldValue('sceneId', undefined);
    }

    setHasQueried(false);
    setQueryResults([]);
    setSelectedResultKeys([]);
  };

  const handleSceneChange = (nextSceneId?: number) => {
    const currentObjectTypeId = form.getFieldValue('objectTypeId');
    const resolvedObjectTypeId = resolveObjectTypeInScene(
      allObjectTypes,
      nextSceneId,
      currentObjectTypeId
    );

    if (resolvedObjectTypeId && resolvedObjectTypeId !== currentObjectTypeId) {
      form.setFieldValue('objectTypeId', resolvedObjectTypeId);
    }

    setHasQueried(false);
    setQueryResults([]);
    setSelectedResultKeys([]);
  };

  const runQuery = useCallback(async () => {
    if (!sceneId || !objectTypeId) {
      Message.warning('请选择对象类型与场景库');
      return;
    }

    setQuerying(true);
    try {
      const res = await listOntologyObjectTypeData({
        id: objectTypeId,
        page: 1,
        pageSize: 200
      });

      if (res.status !== 200 || res.code !== '') {
        Message.error(res.message || '查询实例失败');
        setQueryResults([]);
        setSelectedResultKeys([]);
        return;
      }

      let rows: InstanceQueryRow[] = res.data?.result ?? [];

      if (keyword.trim()) {
        const lowerKeyword = keyword.trim().toLowerCase();
        rows = rows.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(lowerKeyword)
          )
        );
      }

      const scene = scenes.find((item) => item.id === sceneId);
      const objectType = allObjectTypes.find(
        (item) => item.id === objectTypeId
      );
      const items = rows
        .map((row) =>
          toQueryResultItem(
            row,
            {
              sceneId,
              sceneName: scene?.name,
              objectTypeId,
              objectTypeName: objectType?.name,
              objectTypeCode: objectType?.code,
              instanceId: ''
            },
            'pending'
          )
        )
        .filter((item): item is QueryResultItem => item != null)
        .map((item) => ({
          ...item,
          loadStatus: loadedInstanceKeys.has(item.key)
            ? ('loaded' as const)
            : ('pending' as const)
        }));

      setQueryResults(items);
      setSelectedResultKeys(items.map((item) => item.key));
      setHasQueried(true);

      if (items.length === 0) {
        Message.info('未查询到匹配的实例');
      }
    } catch (error) {
      console.error(error);
      Message.error('查询实例失败');
      setQueryResults([]);
      setSelectedResultKeys([]);
    } finally {
      setQuerying(false);
    }
  }, [
    allObjectTypes,
    keyword,
    loadedInstanceKeys,
    objectTypeId,
    sceneId,
    scenes
  ]);

  const displayResults = useMemo(
    () =>
      queryResults.map((item) => ({
        ...item,
        loadStatus: loadedInstanceKeys.has(item.key)
          ? ('loaded' as const)
          : ('pending' as const)
      })),
    [loadedInstanceKeys, queryResults]
  );

  const handleLoad = (
    rows: QueryResultItem[],
    mode: RelationLoadMode,
    graphSettings?: GraphLoadSettings
  ) => {
    onLoad(rows, mode, graphSettings);
    setQueryResults((prev) =>
      prev.map((item) =>
        rows.some((row) => row.key === item.key)
          ? { ...item, loadStatus: 'loaded' as const }
          : item
      )
    );
  };

  return (
    <Drawer
      width={760}
      title="查询目标对象"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
      maskClosable
      escToExit
    >
      <Form form={form} layout="vertical" className={styles['select-form']}>
        <Form.Item
          label="对象类型"
          field="objectTypeId"
          rules={[{ required: true, message: '请选择对象类型' }]}
        >
          <Select
            placeholder="请选择对象类型"
            allowClear
            loading={optionsLoading}
            onChange={handleObjectTypeChange}
          >
            {objectTypeOptions.map((objectType) => (
              <Option key={objectType.id} value={objectType.id}>
                {objectType.name || objectType.code || objectType.id}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="本体场景库"
          field="sceneId"
          rules={[{ required: true, message: '请选择场景库' }]}
        >
          <Select
            placeholder="请选择场景库"
            allowClear
            loading={optionsLoading}
            disabled={!objectTypeId}
            onChange={handleSceneChange}
          >
            {filteredScenes
              .filter((scene) => scene.id != null)
              .map((scene) => (
                <Option key={scene.id} value={scene.id!}>
                  {scene.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="关键字">
          <Space>
            <Input.Search
              allowClear
              placeholder="按名称、ID 等关键字过滤"
              style={{ width: 360 }}
              value={keyword}
              onChange={setKeyword}
              onSearch={runQuery}
            />
            <Button type="primary" loading={querying} onClick={runQuery}>
              查询实例
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {hasQueried ? (
        <QueryResultPanel
          data={displayResults}
          selectedKeys={selectedResultKeys}
          loading={loading || querying}
          fieldCommentMap={fieldCommentMap}
          onSelectionChange={setSelectedResultKeys}
          onLoad={handleLoad}
        />
      ) : (
        <div className={styles['query-result-placeholder']}>
          选择对象类型与场景库后，点击「查询实例」查看结果
        </div>
      )}
    </Drawer>
  );
};
