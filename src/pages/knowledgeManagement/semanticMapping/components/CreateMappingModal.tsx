import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Select,
  Space,
  Tooltip
} from '@arco-design/web-react';
import { IconDelete, IconRobot } from '@arco-design/web-react/icon';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import {
  getUniqueObjectTypeOptions,
  loadObjectBrowseScopeOptions,
  type ObjectTypeWithScene
} from '@/pages/exploreAnalysis/objectBrowse/services/objectTypeScope';
import { fetchQueryableProperties } from '@/pages/exploreAnalysis/objectBrowse/services/conditionQuery';
import { fetchObjectTypeOptions } from '@/pages/exploreAnalysis/objectBrowse/services/semanticQuery2';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type {
  CreateSemanticMappingInput,
  SemanticMappingAttributeRef,
  SemanticMappingCandidate,
  SemanticMappingObjectTypeRef
} from '../types';
import { generateSemanticMappingsFromScenes } from '../services/generateMappings';
import { generateSemanticMappingSynonyms } from '../services/generateSynonyms';
import styles from '../index.module.scss';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

type CreateMode = 'manual' | 'ai';

interface SceneOption {
  id: number;
  name: string;
}

interface AttributeOption {
  key: string;
  objectTypeId: number;
  objectTypeName: string;
  fieldName: string;
  displayName: string;
  columnType?: string;
}

interface CreateMappingFormValues {
  standardTerm: string;
  description?: string;
  synonyms?: string[];
  objectTypeIds?: number[];
  attributeKeys?: string[];
}

interface CreateMappingModalProps {
  visible: boolean;
  saving?: boolean;
  title?: string;
  initialValues?: Partial<CreateSemanticMappingInput>;
  onCancel: () => void;
  onSubmit: (values: CreateSemanticMappingInput) => void;
  onSubmitBatch?: (values: CreateSemanticMappingInput[]) => void;
}

const buildAttributeKey = (objectTypeId: number, fieldName: string) =>
  `${objectTypeId}::${fieldName}`;

const parseAttributeKey = (key: string) => {
  const separator = key.indexOf('::');
  if (separator <= 0) {
    return null;
  }
  const objectTypeId = Number(key.slice(0, separator));
  const fieldName = key.slice(separator + 2);
  if (!Number.isFinite(objectTypeId) || !fieldName) {
    return null;
  }
  return { objectTypeId, fieldName };
};

export default function CreateMappingModal({
  visible,
  saving,
  title = '新建映射',
  initialValues,
  onCancel,
  onSubmit,
  onSubmitBatch
}: CreateMappingModalProps) {
  const [form] = Form.useForm<CreateMappingFormValues>();
  const [mode, setMode] = useState<CreateMode>('manual');
  const [objectTypes, setObjectTypes] = useState<ObjectTypeWithScene[]>([]);
  const [objectTypesLoading, setObjectTypesLoading] = useState(false);
  const [generatingSynonyms, setGeneratingSynonyms] = useState(false);
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>(
    []
  );
  const [attributesLoading, setAttributesLoading] = useState(false);
  const selectedObjectTypeIds = Form.useWatch('objectTypeIds', form) as
    | number[]
    | undefined;

  const [scenesLoading, setScenesLoading] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneOption[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<number[]>([]);
  const [requirements, setRequirements] = useState('');
  const [generating, setGenerating] = useState(false);
  const [candidates, setCandidates] = useState<SemanticMappingCandidate[]>([]);

  const uniqueObjectTypes = useMemo(
    () => getUniqueObjectTypeOptions(objectTypes),
    [objectTypes]
  );

  const objectTypeMap = useMemo(() => {
    const map = new Map<number, ObjectTypeWithScene>();
    uniqueObjectTypes.forEach((item) => {
      if (item.id != null) {
        map.set(item.id, item);
      }
    });
    return map;
  }, [uniqueObjectTypes]);

  const attributeOptionMap = useMemo(() => {
    const map = new Map<string, AttributeOption>();
    attributeOptions.forEach((item) => {
      map.set(item.key, item);
    });
    return map;
  }, [attributeOptions]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setMode('manual');
    form.resetFields();
    setGeneratingSynonyms(false);
    setSelectedSceneIds([]);
    setRequirements('');
    setCandidates([]);
    setGenerating(false);
    setAttributeOptions([]);

    if (initialValues) {
      const attributeKeys =
        initialValues.objectTypes?.flatMap((ot) =>
          (ot.attributes || []).map((attr) =>
            buildAttributeKey(ot.id, attr.fieldName)
          )
        ) || [];
      form.setFieldsValue({
        standardTerm: initialValues.standardTerm,
        description: initialValues.description,
        synonyms: initialValues.synonyms,
        objectTypeIds: initialValues.objectTypes?.map((item) => item.id),
        attributeKeys
      });
    }

    setObjectTypesLoading(true);
    loadObjectBrowseScopeOptions()
      .then((result) => {
        setObjectTypes(result.allObjectTypes);
      })
      .catch(() => {
        Message.error('加载对象类型失败');
      })
      .finally(() => {
        setObjectTypesLoading(false);
      });

    setScenesLoading(true);
    listOntologyModel({
      pageNo: 1,
      pageSize: 100,
      order: 'desc',
      orderBy: 'create_time'
    })
      .then((res) => {
        if (isOntologyApiSuccess(res) && res.data?.result) {
          setSceneOptions(
            res.data.result
              .filter((scene) => scene.id != null)
              .map((scene) => ({
                id: scene.id as number,
                name: scene.name || `场景 #${scene.id}`
              }))
          );
        }
      })
      .catch(() => {
        Message.error('加载本体场景库失败');
      })
      .finally(() => {
        setScenesLoading(false);
      });
    // 仅在打开弹窗时初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, visible]);

  useEffect(() => {
    if (!visible || mode !== 'manual') {
      return;
    }

    const ids = selectedObjectTypeIds || [];
    if (!ids.length) {
      setAttributeOptions([]);
      setAttributesLoading(false);
      form.setFieldValue('attributeKeys', []);
      return;
    }

    let cancelled = false;
    setAttributesLoading(true);

    Promise.all(
      ids.map(async (objectTypeId) => {
        const objectType = objectTypeMap.get(objectTypeId);
        if (!objectType || objectType.sceneId == null) {
          return [] as AttributeOption[];
        }
        const properties = await fetchQueryableProperties(
          objectType.sceneId,
          objectTypeId
        );
        return properties.map((property) => ({
          key: buildAttributeKey(objectTypeId, property.fieldName),
          objectTypeId,
          objectTypeName:
            objectType.name || objectType.code || `对象类型 #${objectTypeId}`,
          fieldName: property.fieldName,
          displayName: property.label || property.fieldName,
          columnType: property.columnType
        }));
      })
    )
      .then((groups) => {
        if (cancelled) {
          return;
        }
        const nextOptions = groups.flat();
        setAttributeOptions(nextOptions);
        const validKeys = new Set(nextOptions.map((item) => item.key));
        const currentKeys =
          (form.getFieldValue('attributeKeys') as string[] | undefined) || [];
        const nextKeys = currentKeys.filter((key) => validKeys.has(key));
        if (nextKeys.length !== currentKeys.length) {
          form.setFieldValue('attributeKeys', nextKeys);
        }
      })
      .catch(() => {
        if (!cancelled) {
          Message.error('加载对象类型属性失败');
          setAttributeOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAttributesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form, mode, objectTypeMap, selectedObjectTypeIds, visible]);

  const buildObjectTypesPayload = (
    objectTypeIds?: number[],
    attributeKeys?: string[]
  ): SemanticMappingObjectTypeRef[] => {
    const attributesByObjectType = new Map<
      number,
      SemanticMappingAttributeRef[]
    >();

    (attributeKeys || []).forEach((key) => {
      const parsed = parseAttributeKey(key);
      const option = attributeOptionMap.get(key);
      if (!parsed) {
        return;
      }
      const attr: SemanticMappingAttributeRef = {
        fieldName: parsed.fieldName,
        displayName: option?.displayName || parsed.fieldName,
        columnType: option?.columnType
      };
      const list = attributesByObjectType.get(parsed.objectTypeId) || [];
      list.push(attr);
      attributesByObjectType.set(parsed.objectTypeId, list);
    });

    return (objectTypeIds || [])
      .map((id) => {
        const item = objectTypeMap.get(id);
        if (!item || item.id == null) {
          return null;
        }
        const attributes = attributesByObjectType.get(id);
        return {
          id: item.id,
          name: item.name || `对象类型 #${item.id}`,
          code: item.code,
          sceneId: item.sceneId,
          sceneName: item.sceneName,
          attributes: attributes?.length ? attributes : undefined
        };
      })
      .filter(Boolean) as SemanticMappingObjectTypeRef[];
  };

  const handleGenerateSynonyms = async () => {
    const values = form.getFieldsValue();
    const standardTerm = values.standardTerm?.trim();

    if (!standardTerm) {
      Message.warning('请先填写标准术语');
      return;
    }

    setGeneratingSynonyms(true);
    try {
      const result = await generateSemanticMappingSynonyms({
        standardTerm,
        description: values.description,
        existingSynonyms: values.synonyms
      });
      form.setFieldValue('synonyms', result.synonyms);
      Message.success(
        result.source === 'llm'
          ? `已智能生成 ${result.synonyms.length} 个同义词/别名`
          : `已按规则生成 ${result.synonyms.length} 个同义词/别名`
      );
    } catch (error) {
      Message.error(
        error instanceof Error ? error.message : '智能生成同义词失败'
      );
    } finally {
      setGeneratingSynonyms(false);
    }
  };

  const handleManualSubmit = (values: CreateMappingFormValues) => {
    onSubmit({
      standardTerm: values.standardTerm,
      description: values.description,
      synonyms: values.synonyms,
      objectTypes: buildObjectTypesPayload(
        values.objectTypeIds,
        values.attributeKeys
      )
    });
  };

  const handleAiGenerate = async () => {
    if (!selectedSceneIds.length) {
      Message.warning('请先选择本体场景库');
      return;
    }

    const selectedScenes = sceneOptions.filter((item) =>
      selectedSceneIds.includes(item.id)
    );
    if (!selectedScenes.length) {
      Message.error('所选本体场景库不存在');
      return;
    }

    setGenerating(true);
    try {
      const bundles = await Promise.all(
        selectedScenes.map(async (scene) => ({
          sceneId: scene.id,
          sceneName: scene.name,
          objectTypes: await fetchObjectTypeOptions(scene.id)
        }))
      );

      const result = await generateSemanticMappingsFromScenes({
        scenes: bundles,
        requirements
      });

      if (!result.candidates.length) {
        Message.warning('未生成可用映射，请调整场景或生成要求后重试');
        setCandidates([]);
        return;
      }

      setCandidates(result.candidates);
      Message.success(
        result.source === 'llm'
          ? `已智能生成 ${result.candidates.length} 条术语映射，请确认后保存`
          : `已按规则生成 ${result.candidates.length} 条术语映射，请确认后保存`
      );
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const updateCandidate = (
    key: string,
    patch: Partial<SemanticMappingCandidate>
  ) => {
    setCandidates((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const removeCandidate = (key: string) => {
    setCandidates((prev) => prev.filter((item) => item.key !== key));
  };

  const handleOk = () => {
    if (mode === 'manual') {
      form.submit();
      return;
    }

    if (!candidates.length) {
      Message.warning('请先根据本体场景库生成映射');
      return;
    }

    const invalid = candidates.find((item) => !item.standardTerm.trim());
    if (invalid) {
      Message.error('请完善每条映射的标准术语');
      return;
    }

    const payload: CreateSemanticMappingInput[] = candidates.map((item) => ({
      standardTerm: item.standardTerm.trim(),
      description: item.description?.trim(),
      synonyms: item.synonyms,
      objectTypes: item.objectTypes
    }));

    if (onSubmitBatch) {
      onSubmitBatch(payload);
      return;
    }

    payload.forEach((item) => onSubmit(item));
  };

  return (
    <Modal
      title={title}
      visible={visible}
      confirmLoading={saving || generating}
      onCancel={onCancel}
      onOk={handleOk}
      okText={
        mode === 'ai'
          ? candidates.length
            ? `保存（${candidates.length}）`
            : '保存'
          : '确定'
      }
      okButtonProps={
        mode === 'ai'
          ? { disabled: !candidates.length || generating }
          : undefined
      }
      unmountOnExit
      style={{ width: mode === 'ai' ? 720 : 560 }}
    >
      <div className={styles.modeSwitch}>
        <RadioGroup
          type="button"
          value={mode}
          onChange={(value) => {
            setMode(value as CreateMode);
            if (value === 'manual') {
              setCandidates([]);
            }
          }}
        >
          <Radio value="manual">人工创建模式</Radio>
          <Radio value="ai">AI 生成模式</Radio>
        </RadioGroup>
      </div>

      {mode === 'manual' ? (
        <Form
          form={form}
          layout="vertical"
          className={styles.createForm}
          onSubmit={handleManualSubmit}
        >
          <Form.Item
            label="标准术语"
            field="standardTerm"
            rules={[{ required: true, message: '请输入标准术语' }]}
          >
            <Input placeholder="例如：主战坦克" maxLength={64} />
          </Form.Item>

          <Form.Item label="映射描述" field="description">
            <TextArea
              placeholder="选填，说明该映射的业务含义与使用场景；填写后智能生成效果更好"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showWordLimit
            />
          </Form.Item>

          <Form.Item
            label={
              <Space size={8}>
                <span>同义词 / 别名</span>
                <Tooltip content="根据标准术语、映射描述智能生成">
                  <Button
                    type="text"
                    size="mini"
                    icon={<IconRobot />}
                    loading={generatingSynonyms}
                    className="p-0"
                    onClick={() => void handleGenerateSynonyms()}
                  >
                    智能生成
                  </Button>
                </Tooltip>
              </Space>
            }
            field="synonyms"
            extra="可手动输入，或点击智能生成；回车可继续添加"
          >
            <Select
              mode="multiple"
              allowCreate
              allowClear
              placeholder="例如：坦克、装甲履带车辆"
              tokenSeparators={[',', '，', ';', '；']}
              disabled={generatingSynonyms}
            />
          </Form.Item>

          <Form.Item
            label="关联对象类型"
            field="objectTypeIds"
            extra="非必填，可将标准术语关联到已有本体对象类型"
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              loading={objectTypesLoading}
              placeholder="请选择对象类型（可选）"
              filterOption={(inputValue, option) =>
                String(option?.props?.children || '')
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              }
              onChange={() => {
                form.setFieldValue('attributeKeys', []);
              }}
            >
              {uniqueObjectTypes.map((item) =>
                item.id == null ? null : (
                  <Option key={item.id} value={item.id}>
                    {item.name || item.code || `对象类型 #${item.id}`}
                    {item.sceneName ? `（${item.sceneName}）` : ''}
                  </Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="关联属性"
            field="attributeKeys"
            extra={
              selectedObjectTypeIds?.length
                ? '非必填，可从已选对象类型中选择一个或多个属性'
                : '请先选择关联对象类型后再选择属性'
            }
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              loading={attributesLoading}
              disabled={!selectedObjectTypeIds?.length}
              placeholder={
                selectedObjectTypeIds?.length
                  ? '请选择对象类型下的属性（可选）'
                  : '请先选择关联对象类型'
              }
              filterOption={(inputValue, option) =>
                String(option?.props?.children || '')
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              }
            >
              {attributeOptions.map((item) => (
                <Option key={item.key} value={item.key}>
                  {item.displayName}
                  {item.displayName !== item.fieldName
                    ? `（${item.fieldName}）`
                    : ''}
                  {` · ${item.objectTypeName}`}
                  {item.columnType ? ` · ${item.columnType}` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ) : (
        <>
          <Form layout="vertical" className={styles.createForm}>
            <Form.Item
              label="本体场景库"
              required
              extra="可多选，将读取所选场景中的对象类型生成标准术语及映射"
            >
              <Select
                mode="multiple"
                placeholder="请选择本体场景库"
                showSearch
                loading={scenesLoading}
                value={selectedSceneIds}
                onChange={(value) => {
                  setSelectedSceneIds(value as number[]);
                  setCandidates([]);
                }}
                filterOption={(inputValue, option) =>
                  String(option?.props?.children || '')
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              >
                {sceneOptions.map((scene) => (
                  <Option key={scene.id} value={scene.id}>
                    {scene.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="生成要求"
              extra="选填，可说明希望覆盖的业务术语范围、命名风格或关注重点"
            >
              <TextArea
                placeholder="例如：聚焦作战编成与装备保障相关术语，生成可用于检索对齐的标准词与同义词"
                value={requirements}
                onChange={(value) => {
                  setRequirements(value);
                  setCandidates([]);
                }}
                autoSize={{ minRows: 3, maxRows: 6 }}
                maxLength={500}
                showWordLimit
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                loading={generating}
                disabled={!selectedSceneIds.length}
                icon={<IconRobot />}
                onClick={() => void handleAiGenerate()}
              >
                智能生成映射
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.candidateSection}>
            <div className={styles.candidateTitle}>
              生成结果预览
              {candidates.length ? `（${candidates.length}）` : ''}
            </div>
            {!candidates.length ? (
              <Empty description="选择本体场景库并生成后，将在此展示可保存的术语映射" />
            ) : (
              <Space
                direction="vertical"
                size={12}
                className={styles.candidateList}
              >
                {candidates.map((item, index) => (
                  <div key={item.key} className={styles.candidateCard}>
                    <div className={styles.candidateCardHeader}>
                      <span>候选 {index + 1}</span>
                      <Button
                        type="text"
                        status="danger"
                        size="mini"
                        icon={<IconDelete />}
                        onClick={() => removeCandidate(item.key)}
                      />
                    </div>
                    <Input
                      className="mb-2"
                      value={item.standardTerm}
                      maxLength={64}
                      placeholder="标准术语"
                      onChange={(value) =>
                        updateCandidate(item.key, { standardTerm: value })
                      }
                    />
                    <TextArea
                      className="mb-2"
                      value={item.description || ''}
                      placeholder="映射描述（可选）"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      maxLength={500}
                      onChange={(value) =>
                        updateCandidate(item.key, { description: value })
                      }
                    />
                    <Select
                      mode="multiple"
                      allowCreate
                      allowClear
                      placeholder="同义词 / 别名"
                      value={item.synonyms}
                      tokenSeparators={[',', '，', ';', '；']}
                      onChange={(value) =>
                        updateCandidate(item.key, {
                          synonyms: (value as string[]) || []
                        })
                      }
                    />
                    {item.objectTypes.length ? (
                      <div className={styles.candidateMeta}>
                        关联对象类型：
                        {item.objectTypes
                          .map((ot) =>
                            ot.sceneName
                              ? `${ot.name}（${ot.sceneName}）`
                              : ot.name
                          )
                          .join('、')}
                      </div>
                    ) : null}
                  </div>
                ))}
              </Space>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
