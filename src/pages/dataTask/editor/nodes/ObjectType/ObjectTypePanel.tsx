import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Form,
  InputNumber,
  Message,
  Popover,
  Radio,
  Select
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { useNodeDataUpdate } from '@ceai-front/workflow';
import { useEdges, useNodes } from 'reactflow';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { ObjectTypeSelect } from '@/pages/ontologyScene/components';
import { INSTANCE_SYNC_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';
import InstanceSyncMappingTable from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormSteps/InstanceSyncStep/InstanceSyncMappingTable';
import {
  applyMappingSourceTypesToFields,
  buildSyncMappingFieldsFromAttributes,
  hasAnySourceMapping,
  mergeOntologyPhysicalPropertiesListForForm,
  objectTypeAttributeToSyncMapping,
  syncLegacySourceFieldsFromPrimaryType
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';
import type {
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  SourceTableField
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/types';
import { fuzzyMatchInstanceSyncByEnglishName } from '@/pages/ontologyScene/modules/objectType/services/fuzzyMatchInstanceSyncByEnglishName';
import { smartMatchInstanceSyncColumns } from '@/pages/ontologyScene/modules/objectType/services/smartMatchInstanceSyncMapping';
import mappingStyles from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeForm.module.scss';
import type { ObjectTypeNodeConfig } from '@/pages/dataTask/types';
import type { OntologScene } from '@/types/ontologySceneApi';
import type { OntologyPhysicalPropertiesList } from '@/types/objectType';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { extractUpstreamOutputFields } from '../../services/extractUpstreamOutputFields';
import styles from './ObjectTypePanel.module.scss';

const DEFAULT_CONFLICT_STRATEGY = 'KEEP_SOURCE' as const;
const DEFAULT_EXCEPTION_STRATEGY = 'STOP_ON_ERROR' as const;
const DEFAULT_PARALLELISM = 1;
const MAPPING_SOURCE_TYPE = INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW;
const UPSTREAM_SOURCE_UNCONFIGURED_MESSAGE = '请连接上游节点并配置输出字段';

const normalizeSyncMappingFields = (
  value: unknown
): InstanceSyncMappingField[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is InstanceSyncMappingField =>
      !!item && typeof item === 'object' && typeof item.propertyID === 'string'
  );
};

const normalizeNodeData = (
  data: Record<string, unknown>
): ObjectTypeNodeConfig => {
  const rawObjectTypeId = data.objectTypeId;
  const objectTypeId =
    typeof rawObjectTypeId === 'number'
      ? rawObjectTypeId
      : typeof rawObjectTypeId === 'string' && rawObjectTypeId.trim()
        ? Number(rawObjectTypeId)
        : undefined;

  const parallelismRaw = data.parallelism;
  const parallelism =
    typeof parallelismRaw === 'number'
      ? parallelismRaw
      : typeof parallelismRaw === 'string' && parallelismRaw.trim()
        ? Number(parallelismRaw)
        : DEFAULT_PARALLELISM;

  return {
    ontologyModelID:
      typeof data.ontologyModelID === 'number'
        ? data.ontologyModelID
        : undefined,
    ontologyModelName: String(data.ontologyModelName ?? ''),
    objectTypeId:
      objectTypeId != null && !Number.isNaN(objectTypeId)
        ? objectTypeId
        : undefined,
    objectTypeName: String(data.objectTypeName ?? ''),
    objectTypeCode: String(data.objectTypeCode ?? ''),
    conflictStrategy:
      data.conflictStrategy === 'KEEP_TARGET'
        ? 'KEEP_TARGET'
        : DEFAULT_CONFLICT_STRATEGY,
    parallelism:
      parallelism != null && !Number.isNaN(parallelism) && parallelism >= 1
        ? Math.floor(parallelism)
        : DEFAULT_PARALLELISM,
    exceptionStrategy:
      data.exceptionStrategy === 'LOG_ERROR_AND_CONTINUE'
        ? 'LOG_ERROR_AND_CONTINUE'
        : DEFAULT_EXCEPTION_STRATEGY,
    syncMappingFields: normalizeSyncMappingFields(data.syncMappingFields)
  };
};

interface ObjectTypePanelProps {
  id: string;
  data: Record<string, unknown>;
}

export default function ObjectTypePanel({ id, data }: ObjectTypePanelProps) {
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const [form] = Form.useForm();
  const nodeData = useMemo(() => normalizeNodeData(data), [data]);
  const nodes = useNodes();
  const edges = useEdges();

  const [scenes, setScenes] = useState<OntologScene[]>([]);
  const [scenesLoading, setScenesLoading] = useState(false);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [smartMatchLoading, setSmartMatchLoading] = useState(false);
  const [objectTypeAttributes, setObjectTypeAttributes] = useState<
    ObjectTypeAttributeField[]
  >([]);
  const [syncMappingFields, setSyncMappingFields] = useState<
    InstanceSyncMappingField[]
  >(() => nodeData.syncMappingFields || []);
  const loadedUpstreamFieldsKeyRef = useRef('');
  const loadedObjectTypeIdRef = useRef<number | undefined>();

  const upstreamFields = useMemo(
    () => extractUpstreamOutputFields(id, nodes, edges),
    [edges, id, nodes]
  );
  const sourceConfigured = upstreamFields.length > 0;
  const mappingSourceTypes = useMemo(() => [MAPPING_SOURCE_TYPE], []);
  const sourceFieldsByType = useMemo(
    () => ({
      [MAPPING_SOURCE_TYPE]: upstreamFields
    }),
    [upstreamFields]
  );

  const patchNodeData = useCallback(
    (patch: Partial<ObjectTypeNodeConfig>) => {
      handleNodeDataUpdate({
        id,
        data: {
          ...data,
          ...patch
        }
      });
    },
    [data, handleNodeDataUpdate, id]
  );

  const persistMappingFields = useCallback(
    (nextFields: InstanceSyncMappingField[]) => {
      const normalized = nextFields.map((field) =>
        syncLegacySourceFieldsFromPrimaryType(field, MAPPING_SOURCE_TYPE)
      );
      setSyncMappingFields(normalized);
      form.setFieldValue('syncMappingFields', normalized);
      patchNodeData({ syncMappingFields: normalized });
    },
    [form, patchNodeData]
  );

  const setMappingFields: React.Dispatch<
    React.SetStateAction<InstanceSyncMappingField[]>
  > = useCallback(
    (updater) => {
      setSyncMappingFields((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const normalized = next.map((field) =>
          syncLegacySourceFieldsFromPrimaryType(field, MAPPING_SOURCE_TYPE)
        );
        form.setFieldValue('syncMappingFields', normalized);
        patchNodeData({ syncMappingFields: normalized });
        return normalized;
      });
    },
    [form, patchNodeData]
  );

  useEffect(() => {
    form.setFieldsValue({
      ontologyModelID: nodeData.ontologyModelID,
      objectTypeId: nodeData.objectTypeId,
      name: nodeData.objectTypeName,
      conflictStrategy: nodeData.conflictStrategy,
      parallelism: nodeData.parallelism,
      exceptionStrategy: nodeData.exceptionStrategy,
      syncMappingFields: nodeData.syncMappingFields || []
    });
    setSyncMappingFields(nodeData.syncMappingFields || []);
  }, [form, nodeData]);

  useEffect(() => {
    const loadScenes = async () => {
      setScenesLoading(true);
      try {
        const res = await listOntologyModel({
          pageNo: -1,
          pageSize: -1,
          order: 'desc'
        });
        if (isOntologyApiSuccess(res) && res.data?.result) {
          setScenes(res.data.result);
        } else {
          setScenes([]);
        }
      } catch (error) {
        console.error('加载本体场景库失败:', error);
        Message.error('加载本体场景库失败');
        setScenes([]);
      } finally {
        setScenesLoading(false);
      }
    };

    void loadScenes();
  }, []);

  useEffect(() => {
    const objectTypeId = nodeData.objectTypeId;
    if (!objectTypeId) {
      loadedObjectTypeIdRef.current = undefined;
      setObjectTypeAttributes([]);
      return;
    }

    if (loadedObjectTypeIdRef.current === objectTypeId) {
      return;
    }

    const loadAttributes = async () => {
      setAttributesLoading(true);
      try {
        const detailRes = await getOntologyObjectTypeDetail({
          id: objectTypeId
        });
        if (!isOntologyApiSuccess(detailRes) || !detailRes.data) {
          Message.error('获取对象类型属性失败');
          setObjectTypeAttributes([]);
          return;
        }

        loadedObjectTypeIdRef.current = objectTypeId;
        const attributes = mergeOntologyPhysicalPropertiesListForForm(
          (detailRes.data.ontologyPhysicalPropertiesList ||
            []) as OntologyPhysicalPropertiesList[]
        );
        setObjectTypeAttributes(attributes);
      } catch (error) {
        console.error('加载对象类型属性失败:', error);
        Message.error('加载对象类型属性失败');
        setObjectTypeAttributes([]);
      } finally {
        setAttributesLoading(false);
      }
    };

    void loadAttributes();
  }, [nodeData.objectTypeId]);

  useEffect(() => {
    if (!objectTypeAttributes.length) {
      return;
    }

    setSyncMappingFields((prev) => {
      const existingByPropertyID = new Map(
        prev.map((field) => [field.propertyID, field])
      );
      const nextFields = buildSyncMappingFieldsFromAttributes(
        objectTypeAttributes,
        {
          existingByPropertyID,
          preserveSourceFields: sourceConfigured
        }
      ).map(
        (field) =>
          applyMappingSourceTypesToFields([field], mappingSourceTypes)[0]
      );
      form.setFieldValue('syncMappingFields', nextFields);
      patchNodeData({ syncMappingFields: nextFields });
      return nextFields;
    });
  }, [
    form,
    mappingSourceTypes,
    objectTypeAttributes,
    patchNodeData,
    sourceConfigured
  ]);

  const applyMappingRelations = useCallback(
    (
      fields: SourceTableField[],
      relations: Array<{
        objectTypeColumnName: string;
        sourceTableColumnName: string;
      }>
    ) => {
      const sourceFieldMap = new Map(
        fields.map((field) => [field.fieldId, field])
      );
      const relationMap = new Map(
        relations.map((relation) => [
          relation.objectTypeColumnName,
          relation.sourceTableColumnName
        ])
      );

      const nextFields = objectTypeAttributes.map((attribute) => {
        const mappedSourceFieldId = relationMap.get(attribute.propertyID);
        const sourceField = mappedSourceFieldId
          ? sourceFieldMap.get(mappedSourceFieldId)
          : undefined;
        const base = objectTypeAttributeToSyncMapping(attribute);
        const sourceMappings = {
          ...(base.sourceMappings || {}),
          ...(sourceField
            ? {
                [MAPPING_SOURCE_TYPE]: {
                  fieldName: sourceField.fieldId,
                  fieldComment: sourceField.fieldComment,
                  fieldType: sourceField.fieldType,
                  fieldOriginName: sourceField.fieldId
                }
              }
            : {})
        };
        return syncLegacySourceFieldsFromPrimaryType(
          {
            ...base,
            sourceMappings,
            sourceColumnName: sourceField?.fieldId,
            sourceColumnComment: sourceField?.fieldComment,
            sourceColumnType: sourceField?.fieldType,
            sourceCoumnOriginName: sourceField?.fieldId
          },
          MAPPING_SOURCE_TYPE
        );
      });

      persistMappingFields(nextFields);
    },
    [objectTypeAttributes, persistMappingFields]
  );

  const applyAutoMapping = useCallback(
    async (
      fields: SourceTableField[],
      options?: { showFeedback?: boolean }
    ) => {
      if (!objectTypeAttributes.length || !fields.length) {
        return;
      }

      setSmartMatchLoading(true);
      try {
        const relations = fuzzyMatchInstanceSyncByEnglishName({
          attributes: objectTypeAttributes,
          sourceFields: fields
        });

        if (relations.length) {
          applyMappingRelations(fields, relations);
          if (options?.showFeedback) {
            Message.success('已根据英文字段名完成自动匹配');
          }
          return;
        }

        const { relations: smartRelations, source } =
          await smartMatchInstanceSyncColumns({
            attributes: objectTypeAttributes,
            sourceFields: fields
          });

        if (!smartRelations.length) {
          if (options?.showFeedback) {
            Message.warning('未能自动匹配到字段映射，请手动配置');
          }
          return;
        }

        applyMappingRelations(fields, smartRelations);
        if (!options?.showFeedback) {
          return;
        }
        if (source === 'llm') {
          Message.success('已根据字段注释完成智能匹配');
        } else if (source === 'api') {
          Message.success('已根据字段名完成自动匹配');
        }
      } catch (error) {
        console.error('自动匹配字段映射失败:', error);
        if (options?.showFeedback) {
          Message.error(
            error instanceof Error ? error.message : '自动匹配字段映射失败'
          );
        }
      } finally {
        setSmartMatchLoading(false);
      }
    },
    [applyMappingRelations, objectTypeAttributes]
  );

  useEffect(() => {
    if (!sourceConfigured || !upstreamFields.length) {
      loadedUpstreamFieldsKeyRef.current = '';
      return;
    }

    const fieldsKey = upstreamFields.map((field) => field.fieldId).join('|');
    if (loadedUpstreamFieldsKeyRef.current === fieldsKey) {
      return;
    }

    loadedUpstreamFieldsKeyRef.current = fieldsKey;
    if (!objectTypeAttributes.length) {
      return;
    }

    setSyncMappingFields((prev) => {
      const hasExistingMapping = prev.some((field) =>
        hasAnySourceMapping(field, mappingSourceTypes)
      );
      if (hasExistingMapping) {
        return prev;
      }
      void applyAutoMapping(upstreamFields);
      return prev;
    });
  }, [
    applyAutoMapping,
    mappingSourceTypes,
    objectTypeAttributes.length,
    sourceConfigured,
    upstreamFields
  ]);

  const handleSmartMatch = () => {
    if (!upstreamFields.length) {
      Message.warning(UPSTREAM_SOURCE_UNCONFIGURED_MESSAGE);
      return;
    }
    void applyAutoMapping(upstreamFields, { showFeedback: true });
  };

  const handleSceneChange = (sceneId: number | undefined) => {
    const scene = scenes.find((item) => item.id === sceneId);
    loadedObjectTypeIdRef.current = undefined;
    setObjectTypeAttributes([]);
    persistMappingFields([]);
    patchNodeData({
      ontologyModelID: sceneId,
      ontologyModelName: scene?.name || '',
      objectTypeId: undefined,
      objectTypeName: '',
      objectTypeCode: '',
      syncMappingFields: []
    });
    form.setFieldsValue({
      objectTypeId: undefined,
      name: '',
      syncMappingFields: []
    });
  };

  const handleObjectTypeChange = (
    objectTypeId: number | undefined,
    option?: { name?: string; code?: string }
  ) => {
    loadedObjectTypeIdRef.current = undefined;
    setObjectTypeAttributes([]);
    persistMappingFields([]);
    patchNodeData({
      objectTypeId,
      objectTypeName: option?.name || '',
      objectTypeCode: option?.code || '',
      syncMappingFields: []
    });
    form.setFieldsValue({
      name: option?.name || '',
      syncMappingFields: []
    });
  };

  return (
    <div className={styles['object-type-panel']}>
      <div className={styles['panel-header']}>
        <div className={styles['panel-header-title']}>本体对象类型配置</div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item label="本体场景库" required>
          <Select
            allowClear
            showSearch
            loading={scenesLoading}
            placeholder="请先选择本体场景库"
            value={nodeData.ontologyModelID}
            filterOption={(inputValue, option) => {
              const label = String(option?.props?.children ?? '');
              return label.toLowerCase().includes(inputValue.toLowerCase());
            }}
            onChange={handleSceneChange}
          >
            {scenes
              .filter((scene) => scene.id != null)
              .map((scene) => (
                <Select.Option key={scene.id} value={scene.id!}>
                  {scene.name || `场景 #${scene.id}`}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="本体对象类型" required>
          <ObjectTypeSelect
            value={nodeData.objectTypeId}
            ontologyModelID={nodeData.ontologyModelID}
            disabled={!nodeData.ontologyModelID}
            placeholder={
              nodeData.ontologyModelID
                ? '请选择本体对象类型'
                : '请先选择本体场景库'
            }
            onChange={handleObjectTypeChange}
          />
        </Form.Item>

        <div className={styles['strategy-section-title']}>同步策略</div>

        <Form.Item label="冲突策略" required>
          <Radio.Group
            value={nodeData.conflictStrategy}
            onChange={(conflictStrategy: 'KEEP_SOURCE' | 'KEEP_TARGET') => {
              patchNodeData({ conflictStrategy });
            }}
          >
            <Radio value="KEEP_SOURCE">保留数据源</Radio>
            <Radio value="KEEP_TARGET">保留目标表</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="并行数">
          <InputNumber
            min={1}
            step={1}
            value={nodeData.parallelism}
            onChange={(parallelism) => {
              patchNodeData({
                parallelism: Number(parallelism) || DEFAULT_PARALLELISM
              });
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="inline-flex items-center gap-[4px]">
              异常策略
              <Popover content="同步出现异常时的处理方式">
                <IconQuestionCircle className="cursor-pointer text-[#86909C]" />
              </Popover>
            </span>
          }
          required
        >
          <Radio.Group
            value={nodeData.exceptionStrategy}
            onChange={(
              exceptionStrategy: 'STOP_ON_ERROR' | 'LOG_ERROR_AND_CONTINUE'
            ) => {
              patchNodeData({ exceptionStrategy });
            }}
          >
            <Radio value="STOP_ON_ERROR">立即停止</Radio>
            <Radio value="LOG_ERROR_AND_CONTINUE">继续消费</Radio>
          </Radio.Group>
        </Form.Item>

        <div className={styles['strategy-section-title']}>映射信息</div>

        {!nodeData.objectTypeId ? (
          <div className={styles['mapping-hint']}>请先选择本体对象类型</div>
        ) : (
          <InstanceSyncMappingTable
            form={form}
            mappingFields={syncMappingFields}
            setMappingFields={setMappingFields}
            mappingSourceTypes={mappingSourceTypes}
            activeSourceType={MAPPING_SOURCE_TYPE}
            sourceFieldsByType={sourceFieldsByType}
            sourceConfigured={sourceConfigured}
            loading={attributesLoading || smartMatchLoading}
            onSmartMatch={handleSmartMatch}
            smartMatchLoading={smartMatchLoading}
            smartMatchTooltip="根据上游输出字段与对象属性进行智能匹配"
            sourceUnconfiguredMessage={UPSTREAM_SOURCE_UNCONFIGURED_MESSAGE}
            styles={{
              ...mappingStyles,
              'modeling-section': `${mappingStyles['modeling-section']} ${styles['mapping-section']}`
            }}
          />
        )}
      </Form>
    </div>
  );
}
