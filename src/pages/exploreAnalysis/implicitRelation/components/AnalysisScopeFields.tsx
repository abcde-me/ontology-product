import React, { useEffect, useMemo, useState } from 'react';
import { Message, Radio, Select, Spin, Tag } from '@arco-design/web-react';
import { fetchObjectTypeOptions } from '@/pages/exploreAnalysis/objectBrowse/services/semanticQuery2';
import type { ObjectType } from '@/types/objectType';
import type {
  ImplicitAnalysisScope,
  ImplicitScopeInstance,
  ImplicitScopeObjectType,
  InstanceScopeMode
} from '../types';
import { loadInstanceSelectOptions } from '../services/buildInstanceGraph';
import { MAX_INSTANCES_PER_TYPE } from '../services/scopeInstances';
import styles from './AnalysisScopeFields.module.scss';

const Option = Select.Option;

export interface SceneOption {
  id: number;
  name: string;
}

interface AnalysisScopeFieldsProps {
  scenes: SceneOption[];
  scenesLoading?: boolean;
  value?: Partial<ImplicitAnalysisScope>;
  onChange: (next: Partial<ImplicitAnalysisScope>) => void;
}

export default function AnalysisScopeFields({
  scenes,
  scenesLoading,
  value,
  onChange
}: AnalysisScopeFieldsProps) {
  const sceneId = value?.ontologySceneId;
  const objectTypes = value?.objectTypes || [];
  const instanceMode: InstanceScopeMode = value?.instanceMode || 'all';
  const instances = value?.instances || [];

  const [objectTypeLoading, setObjectTypeLoading] = useState(false);
  const [objectTypeOptions, setObjectTypeOptions] = useState<ObjectType[]>([]);
  const [instanceOptionsLoading, setInstanceOptionsLoading] = useState(false);
  const [instanceOptionsByType, setInstanceOptionsByType] = useState<
    Record<number, ImplicitScopeInstance[]>
  >({});

  useEffect(() => {
    if (!sceneId) {
      setObjectTypeOptions([]);
      return;
    }
    let cancelled = false;
    setObjectTypeLoading(true);
    fetchObjectTypeOptions(sceneId)
      .then((list) => {
        if (!cancelled) {
          setObjectTypeOptions(list.filter((item) => item.id != null));
        }
      })
      .catch(() => {
        if (!cancelled) {
          Message.error('加载对象类型失败');
          setObjectTypeOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setObjectTypeLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sceneId]);

  useEffect(() => {
    if (instanceMode !== 'selected' || !objectTypes.length) {
      return;
    }
    let cancelled = false;
    setInstanceOptionsLoading(true);
    Promise.all(
      objectTypes.map(async (ot) => {
        const options = await loadInstanceSelectOptions(
          sceneId!,
          ot.id,
          ot.name
        );
        return [ot.id, options] as const;
      })
    )
      .then((pairs) => {
        if (cancelled) {
          return;
        }
        const next: Record<number, ImplicitScopeInstance[]> = {};
        pairs.forEach(([id, options]) => {
          next[id] = options;
        });
        setInstanceOptionsByType(next);
      })
      .catch(() => {
        if (!cancelled) {
          Message.error('加载实例列表失败');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInstanceOptionsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [instanceMode, objectTypes]);

  const selectedObjectTypeIds = useMemo(
    () => objectTypes.map((item) => item.id),
    [objectTypes]
  );

  const patch = (partial: Partial<ImplicitAnalysisScope>) => {
    onChange({
      ontologySceneId: value?.ontologySceneId,
      ontologySceneName: value?.ontologySceneName,
      objectTypes: value?.objectTypes || [],
      instanceMode: value?.instanceMode || 'all',
      instances: value?.instances || [],
      ...partial
    });
  };

  const handleSceneChange = (nextSceneId?: number) => {
    const scene = scenes.find((item) => item.id === nextSceneId);
    patch({
      ontologySceneId: nextSceneId,
      ontologySceneName: scene?.name,
      objectTypes: [],
      instances: [],
      instanceMode: 'all'
    });
  };

  const handleObjectTypesChange = (ids: number[]) => {
    const nextTypes: ImplicitScopeObjectType[] = ids.map((id) => {
      const found = objectTypeOptions.find((item) => item.id === id);
      return {
        id,
        name: found?.name,
        code: found?.code
      };
    });
    const allowed = new Set(ids);
    patch({
      objectTypes: nextTypes,
      instances: instances.filter((item) => allowed.has(item.objectTypeId))
    });
  };

  const handleInstanceModeChange = (mode: InstanceScopeMode) => {
    patch({
      instanceMode: mode,
      instances: mode === 'all' ? [] : instances
    });
  };

  const handleInstancesChange = (
    objectTypeId: number,
    objectTypeName: string | undefined,
    selectedIds: string[]
  ) => {
    const options = instanceOptionsByType[objectTypeId] || [];
    const kept = instances.filter((item) => item.objectTypeId !== objectTypeId);
    const added = selectedIds.map((instanceId) => {
      const found = options.find((item) => item.instanceId === instanceId);
      return {
        objectTypeId,
        objectTypeName,
        instanceId,
        instanceLabel: found?.instanceLabel || instanceId
      } as ImplicitScopeInstance;
    });
    patch({ instances: [...kept, ...added] });
  };

  return (
    <div className={styles.scopeFields}>
      <div className={styles.field}>
        <div className={styles.label}>
          本体图谱 <span className={styles.required}>*</span>
        </div>
        <Select
          placeholder="选择本体场景"
          showSearch
          allowClear
          loading={scenesLoading}
          value={sceneId}
          onChange={handleSceneChange}
          filterOption={(inputValue, option) =>
            String(option.props.children ?? '')
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          }
        >
          {scenes.map((scene) => (
            <Option key={scene.id} value={scene.id}>
              {scene.name}
            </Option>
          ))}
        </Select>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          对象类型 <span className={styles.required}>*</span>
        </div>
        <Select
          mode="multiple"
          placeholder={sceneId ? '选择一个或多个对象类型' : '请先选择本体图谱'}
          disabled={!sceneId}
          loading={objectTypeLoading}
          value={selectedObjectTypeIds}
          onChange={(ids) => handleObjectTypesChange(ids as number[])}
          maxTagCount={3}
          showSearch
          filterOption={(inputValue, option) =>
            String(option.props.children ?? '')
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          }
        >
          {objectTypeOptions
            .filter(
              (item): item is ObjectType & { id: number } => item.id != null
            )
            .map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name || `类型 #${item.id}`}
              </Option>
            ))}
        </Select>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          实例范围 <span className={styles.required}>*</span>
        </div>
        <Radio.Group
          direction="vertical"
          value={instanceMode}
          disabled={!objectTypes.length}
          onChange={(mode) =>
            handleInstanceModeChange(mode as InstanceScopeMode)
          }
        >
          <Radio value="all">
            对象类型的全部实例
            <span className={styles.hint}>
              （每类最多 {MAX_INSTANCES_PER_TYPE} 条）
            </span>
          </Radio>
          <Radio value="selected">指定部分实例</Radio>
        </Radio.Group>
      </div>

      {instanceMode === 'selected' && objectTypes.length > 0 ? (
        <div className={styles.instanceBlock}>
          <div className={styles.label}>选择实例</div>
          <Spin loading={instanceOptionsLoading} style={{ display: 'block' }}>
            <div className={styles.instanceGroups}>
              {objectTypes.map((ot) => {
                const options = instanceOptionsByType[ot.id] || [];
                const selected = instances
                  .filter((item) => item.objectTypeId === ot.id)
                  .map((item) => item.instanceId);
                return (
                  <div key={ot.id} className={styles.instanceGroup}>
                    <div className={styles.instanceGroupTitle}>
                      <Tag size="small" color="arcoblue">
                        {ot.name || `类型 #${ot.id}`}
                      </Tag>
                      <span className={styles.hint}>
                        已选 {selected.length} / {options.length}
                      </span>
                    </div>
                    <Select
                      mode="multiple"
                      allowClear
                      showSearch
                      maxTagCount={2}
                      placeholder={`选择「${ot.name || ot.id}」的实例`}
                      value={selected}
                      onChange={(ids) =>
                        handleInstancesChange(
                          ot.id,
                          ot.name,
                          (ids as string[]) || []
                        )
                      }
                      filterOption={(inputValue, option) =>
                        String(option.props.children ?? '')
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      }
                    >
                      {options.map((item) => (
                        <Option key={item.instanceId} value={item.instanceId}>
                          {item.instanceLabel || item.instanceId}
                        </Option>
                      ))}
                    </Select>
                  </div>
                );
              })}
            </div>
          </Spin>
        </div>
      ) : null}
    </div>
  );
}
