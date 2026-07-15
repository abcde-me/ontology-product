import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Message } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './ObjectTypeForm.module.scss';
import {
  DATA_SOURCE_TYPE,
  DataSourceType,
  INSTANCE_SYNC_SOURCE_TYPE,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import ObjectTypeIconSelector from './ObjectTypeIconSelector';
import ModelingStep from './ObjectTypeFormSteps/ModelingStep';
import InstanceSyncStep from './ObjectTypeFormSteps/InstanceSyncStep';
import { syncStrategyStateToFormValues } from './ObjectTypeFormSteps/common/SyncSourceDataStrategyFormSection';
import {
  isApiPollingMode,
  applyInstanceSyncStrategyDefaults
} from './ObjectTypeFormSteps/common/instanceSyncStrategyConfig';
import { DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT } from '../services/extractObjectTypeFileParse';
import { normalizeKafkaTopicName } from '../services/kafkaTopicNames';
import { syncScopeRequiresIncrementalPollingFields } from './ObjectTypeFormUtils/syncScopeRequiresIncrementalPollingFields';
import ObjectTypeFormSteps from './ObjectTypeFormSteps/ObjectTypeFormSteps';
import {
  AttributeField,
  InstanceSyncMappingField,
  ObjectTypeAttributeField,
  ObjectTypeDataSourceState,
  ObjectTypeFormData,
  SqlSourceDataInfo,
  SyncSourceDataStrategyFormState
} from './ObjectTypeFormUtils/types';
import { normalizeSqlConnectorId } from './ObjectTypeFormUtils/normalizeSqlConnectorId';
import {
  INSTANCE_SYNC_SOURCE_UNCONFIGURED_MESSAGE,
  isInstanceSyncSourceConfigured,
  legacyFieldToObjectTypeAttribute,
  mergeOntologyPhysicalPropertiesForForm,
  mergeOntologyPhysicalPropertiesListForForm
} from './ObjectTypeFormUtils/attributeFields';
import { buildStreamParseFormValidateFields } from './ObjectTypeFormUtils/instanceSyncStreamParse';
import { buildObjectTypeFormData } from './ObjectTypeFormHooks/useObjectTypeSubmit';
import { resolveManualObjectTypeSchemaFilePath } from '../services/resolveManualObjectTypeSchemaFilePath';
import type { OntologyPhysicalPropertiesList } from '@/types/objectType';
import { useAutoOntologyObjectTypeCodeFromName } from '@/pages/ontologyScene/hooks/useAutoOntologyObjectTypeCodeFromName';
import {
  OBJECT_TYPE_CODE_EXTRA,
  objectTypeCodeValidatorRule
} from '@/utils/generateOntologyObjectTypeCodeName';
import { isDevSchemaFilePath } from '@/utils/ontologyCsvTemplate';
import {
  generateObjectTypeCsvTemplate,
  resolveGeneratedObjectTypeParsedSchema
} from '../services/generateObjectTypeCsvTemplate';
import { applyObjectTypeParsedSchema } from './ObjectTypeFormUtils/applyObjectTypeParsedSchema';
import GenerateCsvSchemaRequirementModal from './GenerateCsvSchemaRequirementModal';
import type { DataResourceTable } from '@/pages/dataResource/types';
import { buildDataResourceObjectTypeDescriptionFromTables } from '../services/dataResourceMapping';
import { fetchSceneObjectTypeCodes } from '@/pages/ontologyScene/modules/graph/services/graphCreateServices';

export type { ObjectTypeFormData } from './ObjectTypeFormUtils/types';

const FormItem = Form.Item;
const { TextArea } = Input;

const BASIC_STEP = 0;
const MODELING_STEP = 1;
const INSTANCE_SYNC_STEP = 2;

const clampStep = (step: number, maxStep: number) =>
  Math.min(maxStep, Math.max(BASIC_STEP, step));

const maxStepForDataSourceType = (type: DataSourceType | undefined) =>
  type === DATA_SOURCE_TYPE.MANUAL_CREATION ||
  type === DATA_SOURCE_TYPE.LOCAL_CSV ||
  type === DATA_SOURCE_TYPE.DATA_RESOURCE
    ? MODELING_STEP
    : INSTANCE_SYNC_STEP;

const CREATE_TWO_STEPS = ['基本信息', '属性信息'] as const;

type BasicInfoValues = Partial<
  Pick<
    ObjectTypeFormData,
    'code' | 'name' | 'description' | 'icon' | 'ontologyModelID'
  >
>;

const DEFAULT_INSTANCE_SYNC_VALUES = {
  syncMode: 'BINLOG_CDC',
  conflictStrategy: 'KEEP_SOURCE',
  syncScope: 'FULL_THEN_INCREMENTAL',
  jdbcPollingIntervalSeconds: 60,
  pollFetchSize: 500,
  fullSyncBatchSize: 500,
  parallelism: 1,
  exceptionStrategy: 'STOP_ON_ERROR'
};

const DEFAULT_SYNC_SOURCE_DATA_STRATEGY: SyncSourceDataStrategyFormState = {
  instanceSyncSourceType: INSTANCE_SYNC_SOURCE_TYPE.DATABASE,
  sourceDataInfo: {
    queryMode: 'selected'
  },
  mode: 'BINLOG_CDC',
  conflictStrategy: 'KEEP_SOURCE',
  syncScope: 'FULL_THEN_INCREMENTAL',
  jdbcPollingIntervalSeconds: 60,
  pollFetchSize: 500,
  fullSyncBatchSize: 500,
  parallelism: 1,
  exceptionStrategy: 'STOP_ON_ERROR'
};

/** 与详情接口对齐的合并结果；用于首次 state 与 useEffect，避免子步骤后 mount 时仍停留在默认 CDC */
function mergeSyncStrategyFromInitialValues(
  initial: Partial<ObjectTypeFormData> | undefined
): SyncSourceDataStrategyFormState | undefined {
  if (!initial?.syncSourceDataStrategy) {
    return undefined;
  }
  const initialSyncSourceDataInfo =
    initial.syncSourceDataStrategy.sourceDataInfo;
  return applyInstanceSyncStrategyDefaults({
    ...DEFAULT_SYNC_SOURCE_DATA_STRATEGY,
    ...initial.syncSourceDataStrategy,
    messageQueueTopic: normalizeKafkaTopicName(
      initial.syncSourceDataStrategy.messageQueueTopic
    ),
    sourceDataInfo: {
      ...(initialSyncSourceDataInfo || { queryMode: 'selected' }),
      queryMode:
        initialSyncSourceDataInfo?.queryMode === 'sql' ? 'sql' : 'selected'
    }
  });
}

/** Form.Item 绑定 field 时会用表单值覆盖子组件的 value，需与 SqlSourceDataInfo 一致才能回显 */
function buildSqlSourceSelectorFormFields(
  prefix: 'modeling' | 'sync',
  info?: Partial<
    Pick<
      SqlSourceDataInfo,
      'connectorId' | 'databaseName' | 'tableName' | 'queryMode' | 'sql'
    >
  >
): Record<string, unknown> {
  if (!info) {
    return {};
  }
  const queryMode = info.queryMode === 'sql' ? 'sql' : 'selected';
  const connectorId = normalizeSqlConnectorId(info.connectorId);
  return {
    [`${prefix}Connector`]: connectorId,
    [`${prefix}QueryMode`]: queryMode,
    [`${prefix}DatabaseTable`]:
      queryMode === 'selected' &&
      connectorId !== undefined &&
      info.databaseName &&
      info.tableName
        ? [info.databaseName, info.tableName]
        : undefined,
    [`${prefix}Sql`]: info.sql
  };
}

/** 从详情 initialValues 解析与第 2 步建模一致的数据源信息 */
function getModelingSourceInfoFromInitial(
  initial: Partial<ObjectTypeFormData>
): SqlSourceDataInfo | undefined {
  if (initial._dataSource?.type !== DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
    return undefined;
  }
  if (initial.sourceDataInfo) {
    return {
      ...initial.sourceDataInfo,
      queryMode: initial.sourceDataInfo.queryMode === 'sql' ? 'sql' : 'selected'
    };
  }
  return {
    connectorId: initial._dataSource.connectorId,
    connectorName: initial._dataSource.connectorName,
    connectorSubtype: initial._dataSource.connectorSubtype,
    databaseName: initial._dataSource.database,
    tableName: initial._dataSource.table,
    queryMode: initial._dataSource.queryMode === 'sql' ? 'sql' : 'selected',
    sql: initial._dataSource.sql
  };
}

/** 将建模数据源写入第 3 步实例同步（与「下一步」进入第 3 步行为一致） */
function applySyncSourceFromModelingInfo(
  form: ReturnType<typeof Form.useForm>[0],
  info: SqlSourceDataInfo,
  setSyncSourceDataStrategy: React.Dispatch<
    React.SetStateAction<SyncSourceDataStrategyFormState>
  >
) {
  const queryMode = info.queryMode === 'sql' ? 'sql' : 'selected';
  const sourceDataInfo: SqlSourceDataInfo = {
    connectorId: normalizeSqlConnectorId(info.connectorId),
    connectorName: info.connectorName,
    connectorSubtype: info.connectorSubtype,
    databaseName: info.databaseName,
    tableName: info.tableName,
    projectID: info.projectID,
    queryMode,
    sql: info.sql
  };
  setSyncSourceDataStrategy((prev) => {
    const next = applyInstanceSyncStrategyDefaults({
      ...prev,
      sourceDataInfo
    });
    if (next.mode !== prev.mode) {
      form.setFieldValue('syncMode', next.mode);
    }
    return next;
  });
  form.setFieldsValue(buildSqlSourceSelectorFormFields('sync', sourceDataInfo));
}

interface ObjectTypeFormProps {
  initialValues?: Partial<ObjectTypeFormData>;
  onSubmit: (data: ObjectTypeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean;
  isEdit?: boolean;
  initialStep?: number;
  /** 受控步骤（编辑态由父组件持有，避免回退时被 initialValues 刷新重置） */
  step?: number;
  /** 编辑态下一步/上一步后调用，可在此重新请求 GetOntologyObjectType 刷新 initialValues */
  onStepChange?: (stepIndex: number) => void | Promise<void>;
  /** 编辑态下是否允许配置/保存第 3 步实例同步（列表「配置」?step=3） */
  allowInstanceSyncEdit?: boolean;
  /** 创建态仅两步：基本信息 + 属性信息，不进入实例同步 */
  twoStepOnly?: boolean;
}

export interface ObjectTypeFormRef {
  submit: () => void;
}

const ObjectTypeForm = React.forwardRef<ObjectTypeFormRef, ObjectTypeFormProps>(
  (
    {
      initialValues,
      onSubmit,
      onCancel,
      loading = false,
      showFooter = true,
      isEdit = false,
      initialStep,
      step: controlledStep,
      onStepChange,
      allowInstanceSyncEdit = false,
      twoStepOnly = false
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [selectedIcon, setSelectedIcon] = useState<string>(
      initialValues?.icon || ''
    );
    const [dataSource, setDataSource] = useState<ObjectTypeDataSourceState>({
      type: DATA_SOURCE_TYPE.MANUAL_CREATION,
      queryMode: 'selected'
    });
    const [modelingSourceDataInfo, setModelingSourceDataInfo] =
      useState<SqlSourceDataInfo>({
        queryMode: 'selected'
      });
    const [attributeFields, setAttributeFields] = useState<AttributeField[]>(
      []
    );
    const [objectTypeAttributes, setObjectTypeAttributes] = useState<
      ObjectTypeAttributeField[]
    >([]);
    const [syncSourceDataStrategy, setSyncSourceDataStrategy] =
      useState<SyncSourceDataStrategyFormState>(
        () =>
          mergeSyncStrategyFromInitialValues(initialValues) ??
          DEFAULT_SYNC_SOURCE_DATA_STRATEGY
      );
    const [syncMappingFields, setSyncMappingFields] = useState<
      InstanceSyncMappingField[]
    >([]);
    const [generatingSchema, setGeneratingSchema] = useState(false);
    const [
      generateRequirementModalVisible,
      setGenerateRequirementModalVisible
    ] = useState(false);
    const [pendingGenerateBasicInfo, setPendingGenerateBasicInfo] = useState<{
      name: string;
      description?: string;
      code?: string;
    }>();
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [, setFileUploaded] = useState(false);
    const [isReUpload, setIsReUpload] = useState(false);
    const [initialFileList, setInitialFileList] = useState<any[]>([]);
    const initialValuesHydratedRef = useRef(false);
    const [internalStep, setInternalStep] = useState(() => {
      const initialDsType =
        initialValues?._dataSource?.type ?? DATA_SOURCE_TYPE.MANUAL_CREATION;
      const maxStep = twoStepOnly
        ? MODELING_STEP
        : allowInstanceSyncEdit
          ? INSTANCE_SYNC_STEP
          : maxStepForDataSourceType(initialDsType);
      return clampStep(initialStep ?? BASIC_STEP, maxStep);
    });
    const isStepControlled = controlledStep !== undefined;
    const currentStep = isStepControlled ? controlledStep : internalStep;

    const updateCurrentStep = (
      nextStep: number | ((prev: number) => number)
    ) => {
      const resolved =
        typeof nextStep === 'function' ? nextStep(currentStep) : nextStep;
      if (isStepControlled) {
        onStepChange?.(resolved);
        return;
      }
      setInternalStep(resolved);
    };
    const isManualCreation =
      dataSource.type === DATA_SOURCE_TYPE.MANUAL_CREATION;
    const isLocalCsv = dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV;
    const isDataResource = dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE;
    const isSimpleModelingSource =
      isManualCreation || isLocalCsv || isDataResource;
    const useTwoStepFlow =
      (twoStepOnly || (!isEdit && isSimpleModelingSource)) &&
      !allowInstanceSyncEdit;
    const formSteps = useTwoStepFlow ? [...CREATE_TWO_STEPS] : undefined;
    /** 编辑态：数据库/表建模只读；本地 CSV / 数据资源允许改表与属性 */
    const modelingReadOnly = isEdit && !isSimpleModelingSource;
    const instanceSyncReadOnly = isEdit && !allowInstanceSyncEdit;
    const [basicInfoValues, setBasicInfoValues] = useState<BasicInfoValues>(
      () => ({
        code: initialValues?.code,
        name: initialValues?.name,
        description: initialValues?.description,
        icon: initialValues?.icon,
        ontologyModelID: initialValues?.ontologyModelID
      })
    );

    const watchedOntologyModelID = Form.useWatch('ontologyModelID', form);
    const ontologyModelIDForId =
      Number(watchedOntologyModelID) || initialValues?.ontologyModelID;

    useAutoOntologyObjectTypeCodeFromName({
      form,
      ontologyModelID: ontologyModelIDForId,
      nameField: 'name',
      codeField: 'code',
      enabled: !isEdit && !initialValues?.code
    });

    useEffect(() => {
      if (initialValues) {
        const isSubsequentHydration = initialValuesHydratedRef.current;
        initialValuesHydratedRef.current = true;

        setBasicInfoValues((prev) => {
          if (isSubsequentHydration && isEdit) {
            return prev;
          }

          return {
            code: isEdit
              ? initialValues.code
              : (initialValues.code ?? prev.code),
            name: isEdit
              ? initialValues.name
              : (initialValues.name ?? prev.name),
            description: isEdit
              ? initialValues.description
              : (initialValues.description ?? prev.description),
            icon: isEdit
              ? initialValues.icon
              : (initialValues.icon ?? prev.icon),
            ontologyModelID:
              initialValues.ontologyModelID ?? prev.ontologyModelID
          };
        });
        const formData = form.getFieldsValue();
        const preservedBasicInfo =
          isSubsequentHydration && isEdit
            ? {
                code: basicInfoValues.code ?? initialValues.code,
                name: basicInfoValues.name ?? initialValues.name,
                description:
                  basicInfoValues.description ?? initialValues.description,
                icon: basicInfoValues.icon ?? initialValues.icon ?? selectedIcon
              }
            : null;

        const isDataResourceModeling =
          initialValues._dataSource?.type === DATA_SOURCE_TYPE.DATA_RESOURCE;
        const isDirectorySyncModeling =
          initialValues._dataSource?.type ===
          DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC;
        const modelingSqlSourcePatch = isDirectorySyncModeling
          ? buildSqlSourceSelectorFormFields(
              'modeling',
              initialValues.sourceDataInfo
                ? {
                    ...initialValues.sourceDataInfo,
                    queryMode:
                      initialValues.sourceDataInfo.queryMode === 'sql'
                        ? 'sql'
                        : 'selected'
                  }
                : {
                    connectorId: initialValues._dataSource?.connectorId,
                    databaseName: initialValues._dataSource?.database,
                    tableName: initialValues._dataSource?.table,
                    queryMode:
                      initialValues._dataSource?.queryMode === 'sql'
                        ? 'sql'
                        : 'selected',
                    sql: initialValues._dataSource?.sql
                  }
            )
          : {};
        const modelingSourceForSync =
          getModelingSourceInfoFromInitial(initialValues);
        const syncSqlSourcePatch =
          allowInstanceSyncEdit && modelingSourceForSync
            ? buildSqlSourceSelectorFormFields('sync', modelingSourceForSync)
            : initialValues.syncSourceDataStrategy?.sourceDataInfo
              ? buildSqlSourceSelectorFormFields(
                  'sync',
                  initialValues.syncSourceDataStrategy.sourceDataInfo
                )
              : {};

        /** 与下方 setSyncSourceDataStrategy 使用同一合并结果，且必须在同一次/最后一次 setFieldsValue 中写入，避免 Arco Form 未吃到分步更新的策略字段 */
        const mergedSyncStrategyForForm =
          mergeSyncStrategyFromInitialValues(initialValues);
        const syncStrategyFormPatch = mergedSyncStrategyForForm
          ? syncStrategyStateToFormValues(mergedSyncStrategyForForm)
          : {};
        const syncSourceTypeFormPatch = {
          syncSourceType:
            mergedSyncStrategyForForm?.instanceSyncSourceType ||
            INSTANCE_SYNC_SOURCE_TYPE.DATABASE,
          syncInstanceCsvFile: mergedSyncStrategyForForm?.instanceCsvFilePath,
          syncMessageQueueConnector:
            mergedSyncStrategyForForm?.messageQueueConnectorId,
          syncMessageQueueTopic: mergedSyncStrategyForForm?.messageQueueTopic,
          syncMessageQueueParseMode:
            mergedSyncStrategyForForm?.messageQueueParseMode,
          syncMessageQueueStructuredParseRule:
            mergedSyncStrategyForForm?.messageQueueStructuredParseRule,
          syncMessageQueueMaxFlattenDepth:
            mergedSyncStrategyForForm?.messageQueueMaxFlattenDepth,
          syncMessageQueueArrayHandleMode:
            mergedSyncStrategyForForm?.messageQueueArrayHandleMode,
          syncMessageQueueAiRulePrompt:
            mergedSyncStrategyForForm?.messageQueueAiRulePrompt,
          syncMessageQueueAiRuleContent:
            mergedSyncStrategyForForm?.messageQueueAiRuleContent,
          syncMessageQueueAiRuleSavedAt:
            mergedSyncStrategyForForm?.messageQueueAiRuleSavedAt,
          syncApiConnector: mergedSyncStrategyForForm?.apiConnectorId,
          syncFileResourceId: mergedSyncStrategyForForm?.fileResourceId,
          syncFileParseRequirement:
            mergedSyncStrategyForForm?.fileParseRequirement ||
            DEFAULT_OBJECT_TYPE_FILE_PARSE_REQUIREMENT
        };

        if (isEdit) {
          form.setFieldsValue({
            ...formData,
            ...DEFAULT_INSTANCE_SYNC_VALUES,
            ...initialValues,
            ...(preservedBasicInfo ?? {}),
            dataSourceType:
              initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV,
            database: initialValues._dataSource?.database,
            table: initialValues._dataSource?.table,
            dataResourceTableId: isDataResourceModeling
              ? initialValues._dataSource?.dataResourceIds ||
                (initialValues._dataSource?.dataResourceId
                  ? [initialValues._dataSource.dataResourceId]
                  : undefined)
              : undefined,
            ...modelingSqlSourcePatch,
            ...syncSqlSourcePatch,
            ...syncStrategyFormPatch,
            ...syncSourceTypeFormPatch
          });
        } else {
          form.setFieldsValue({
            ...formData,
            ...DEFAULT_INSTANCE_SYNC_VALUES,
            ...initialValues,
            dataSourceType:
              formData.dataSourceType || DATA_SOURCE_TYPE.MANUAL_CREATION,
            ...modelingSqlSourcePatch,
            ...syncSqlSourcePatch,
            ...syncStrategyFormPatch,
            ...syncSourceTypeFormPatch
          });
        }

        if (initialValues.icon) {
          setSelectedIcon(initialValues.icon);
        }
        if (initialValues._dataSource) {
          setDataSource({
            ...initialValues._dataSource,
            type:
              initialValues._dataSource.type ||
              (DATA_SOURCE_TYPE.LOCAL_CSV as DataSourceType),
            queryMode: initialValues._dataSource.queryMode || 'selected'
          });
          setModelingSourceDataInfo(
            initialValues.sourceDataInfo || {
              connectorId: initialValues._dataSource.connectorId,
              connectorName: initialValues._dataSource.connectorName,
              connectorSubtype: initialValues._dataSource.connectorSubtype,
              databaseName: initialValues._dataSource.database,
              tableName: initialValues._dataSource.table,
              queryMode: initialValues._dataSource.queryMode || 'selected',
              sql: initialValues._dataSource.sql
            }
          );
          setFileUploaded(!!initialValues._dataSource.file);
        }
        if (initialValues.ontologyPhysicalPropertiesList) {
          const propertyList = initialValues.ontologyPhysicalPropertiesList;
          const usesNewPropertyShape = propertyList.some(
            (field) => field.propertyID !== undefined
          );
          if (usesNewPropertyShape) {
            const objectAttributes = mergeOntologyPhysicalPropertiesListForForm(
              propertyList as OntologyPhysicalPropertiesList[]
            );
            setObjectTypeAttributes(objectAttributes);
            setAttributeFields(
              objectAttributes.map((field) => ({
                name: field.propertyID,
                comment: field.propertyComment,
                columnType: field.propertyType,
                isPrimary: field.isPrimary,
                isUse: 1,
                isStoreAsPublic: field.isStoreAsPublic,
                publicPropertyID: field.publicPropertyID || 0,
                sourceColumnName: field.sourceColumnName,
                sourceColumnComment: field.sourceColumnComment,
                sourceColumnType: field.sourceColumnType,
                ...(field.sourceTableName?.trim()
                  ? { sourceTableName: field.sourceTableName.trim() }
                  : {})
              }))
            );
          } else {
            const mergedFields = mergeOntologyPhysicalPropertiesForForm(
              propertyList as any
            );
            setAttributeFields(mergedFields);
            setObjectTypeAttributes(
              mergedFields.map((field) =>
                legacyFieldToObjectTypeAttribute(field)
              )
            );
          }
        }
        if (mergedSyncStrategyForForm) {
          setSyncSourceDataStrategy(mergedSyncStrategyForForm);
        }
        if (allowInstanceSyncEdit && modelingSourceForSync) {
          applySyncSourceFromModelingInfo(
            form,
            modelingSourceForSync,
            setSyncSourceDataStrategy
          );
        }
        if (initialValues.syncMappingFields) {
          setSyncMappingFields(initialValues.syncMappingFields);
        }
        if (
          initialValues.filePath &&
          initialValues.filePath.trim() &&
          !isDevSchemaFilePath(initialValues.filePath)
        ) {
          const fileName = initialValues.filePath.split('/').pop() || '';
          if (fileName && fileName.trim()) {
            setInitialFileList([
              {
                uid: `initial-object-file-${initialValues.code ?? fileName}`,
                name: fileName
              }
            ]);
          }
          const dataSourceType =
            initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV;
          if (dataSourceType === DATA_SOURCE_TYPE.LOCAL_CSV) {
            setDataSource((prev) => ({
              ...prev,
              type: DATA_SOURCE_TYPE.LOCAL_CSV,
              filePath: initialValues.filePath,
              queryMode: 'selected'
            }));
            setFileUploaded(true);
          }
        }
      } else {
        form.setFieldsValue({
          ...DEFAULT_INSTANCE_SYNC_VALUES,
          dataSourceType: DATA_SOURCE_TYPE.MANUAL_CREATION
        });
        setSyncSourceDataStrategy(DEFAULT_SYNC_SOURCE_DATA_STRATEGY);
      }
    }, [initialValues, form, isEdit, allowInstanceSyncEdit]);

    useEffect(() => {
      if (twoStepOnly && currentStep === INSTANCE_SYNC_STEP) {
        updateCurrentStep(MODELING_STEP);
      }
    }, [twoStepOnly, currentStep]);

    useEffect(() => {
      if (!twoStepOnly) {
        return;
      }
      updateCurrentStep((step) => clampStep(step, MODELING_STEP));
    }, [twoStepOnly, dataSource.type]);

    /** 编辑态（非受控）：切换 currentStep 后刷新详情 */
    const skipStepChangeRefetchRef = useRef(true);
    const previousStepRef = useRef<number | null>(null);
    useEffect(() => {
      if (isStepControlled || !isEdit || !onStepChange) {
        previousStepRef.current = currentStep;
        return;
      }
      if (skipStepChangeRefetchRef.current) {
        skipStepChangeRefetchRef.current = false;
        previousStepRef.current = currentStep;
        return;
      }

      const prevStep = previousStepRef.current;
      previousStepRef.current = currentStep;

      if (prevStep !== null && currentStep < prevStep) {
        return;
      }

      void onStepChange(currentStep);
    }, [currentStep, onStepChange, isEdit, isStepControlled]);

    const handleIconChange = (iconValue: string) => {
      setSelectedIcon(iconValue);
      form.setFieldValue('icon', iconValue);
      setBasicInfoValues((prev) => ({
        ...prev,
        icon: iconValue
      }));
    };

    const syncBasicInfoValues = () => {
      setBasicInfoValues((prev) => ({
        ...prev,
        code: form.getFieldValue('code') ?? prev.code,
        name: form.getFieldValue('name') ?? prev.name,
        description: form.getFieldValue('description') ?? prev.description,
        icon: form.getFieldValue('icon') || selectedIcon || prev.icon,
        ontologyModelID:
          form.getFieldValue('ontologyModelID') ||
          initialValues?.ontologyModelID ||
          prev.ontologyModelID
      }));
    };

    const handleBasicInfoFieldChange = (
      field: keyof BasicInfoValues,
      value: BasicInfoValues[keyof BasicInfoValues]
    ) => {
      setBasicInfoValues((prev) => ({
        ...prev,
        [field]: value
      }));
    };

    const getSubmitValues = () => {
      const formValues = form.getFieldsValue();
      return {
        ...formValues,
        code: basicInfoValues.code ?? formValues.code,
        name: basicInfoValues.name ?? formValues.name,
        description: basicInfoValues.description ?? formValues.description,
        icon: basicInfoValues.icon ?? formValues.icon ?? selectedIcon,
        ontologyModelID:
          basicInfoValues.ontologyModelID ??
          formValues.ontologyModelID ??
          initialValues?.ontologyModelID
      };
    };

    const resolveDataSourceForSubmit =
      async (): Promise<ObjectTypeDataSourceState | null> => {
        if (dataSource.type !== DATA_SOURCE_TYPE.MANUAL_CREATION) {
          return dataSource;
        }

        const values = getSubmitValues();
        try {
          const filePath = await resolveManualObjectTypeSchemaFilePath(
            String(values.code || ''),
            objectTypeAttributes
          );
          if (!filePath) {
            Message.error('生成 Schema 失败，请重试');
            return null;
          }
          const nextDataSource = { ...dataSource, filePath };
          setDataSource(nextDataSource);
          return nextDataSource;
        } catch (error) {
          console.error('手动创建 Schema 上传失败:', error);
          Message.error('生成 Schema 失败，请重试');
          return null;
        }
      };

    const buildSubmitFormData = async (
      enableSyncSourceData: boolean
    ): Promise<ObjectTypeFormData | null> => {
      const submitDataSource = await resolveDataSourceForSubmit();
      if (!submitDataSource) {
        return null;
      }

      return buildObjectTypeFormData({
        values: getSubmitValues(),
        selectedIcon,
        initialOntologyModelID: initialValues?.ontologyModelID,
        dataSource: submitDataSource,
        attributeFields,
        objectTypeAttributes,
        syncSourceDataStrategy,
        syncMappingFields,
        enableSyncSourceData,
        isReUpload
      });
    };

    const validateBasicInfo = async () => {
      try {
        await form.validate(['name', 'code']);
      } catch (error) {
        return false;
      }

      if (isEdit) {
        return true;
      }

      const code = String(form.getFieldValue('code') || '').trim();
      if (!code || !ontologyModelIDForId) {
        return true;
      }

      try {
        const sceneCodes =
          await fetchSceneObjectTypeCodes(ontologyModelIDForId);
        const normalized = code.toLowerCase();
        const isDuplicate = sceneCodes.some(
          (existing) => existing.trim().toLowerCase() === normalized
        );
        if (isDuplicate) {
          const duplicateMessage =
            '该对象类型 id 在当前场景中已存在，请修改后重试';
          form.setFields({
            code: {
              error: { message: duplicateMessage }
            }
          });
          Message.warning(duplicateMessage);
          return false;
        }
      } catch (error) {
        console.warn('[ObjectType] 校验对象类型 id 唯一性失败', error);
        Message.warning('校验对象类型 id 失败，请稍后重试');
        return false;
      }

      return true;
    };

    const validateModeling = async () => {
      const fieldsToValidate: string[] = [
        'dataSourceType',
        'objectTypeAttributes'
      ];
      if (dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV) {
        fieldsToValidate.push('file');
      } else if (dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE) {
        fieldsToValidate.push('dataResourceTableId');
      } else if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
        fieldsToValidate.push('modelingConnector', 'modelingDatabaseTable');
      }

      try {
        await form.validate(fieldsToValidate);
      } catch (error) {
        return false;
      }

      if (
        !dataSource.filePath &&
        dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV
      ) {
        Message.warning('请上传文件');
        return false;
      }

      if (dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE) {
        const selectedCount = dataSource.dataResourceIds?.length || 0;
        if (!dataSource.table && selectedCount === 0) {
          Message.warning('请选择数据资源表');
          return false;
        }
      }

      if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
        if (!dataSource.connectorId) {
          Message.warning('请选择数据源连接');
          return false;
        }
        const isModelingSqlMode = dataSource.queryMode === 'sql';
        if (isModelingSqlMode) {
          if (!String(dataSource.sql ?? '').trim()) {
            Message.warning('请先输入自定义SQL');
            return false;
          }
        } else if (!dataSource.database || !dataSource.table) {
          Message.warning('请选择数据源连接和数据表');
          return false;
        }
      }

      if (objectTypeAttributes.length === 0) {
        Message.warning(
          dataSource.type === DATA_SOURCE_TYPE.MANUAL_CREATION
            ? '请先添加对象类型属性'
            : '请先上传文件或选择数据源'
        );
        return false;
      }

      if (!objectTypeAttributes.some((field) => field.isPrimary === 1)) {
        Message.warning('对象类型属性至少需要一个主键');
        return false;
      }

      const invalidField = objectTypeAttributes.some(
        (field) =>
          !field.propertyID || !field.propertyComment || !field.propertyType
      );
      if (invalidField) {
        Message.warning('请完整填写对象类型属性');
        return false;
      }

      return true;
    };

    const validateInstanceSync = async () => {
      const syncSource = syncSourceDataStrategy.sourceDataInfo;
      const syncSourceType =
        syncSourceDataStrategy.instanceSyncSourceType ||
        INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
      const isDatabaseSyncSource =
        syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.DATABASE;
      const isDatabasePollingMode =
        isDatabaseSyncSource && syncSourceDataStrategy.mode === 'JDBC_POLLING';
      const isSqlPolling =
        isDatabasePollingMode && syncSource.queryMode === 'sql';
      const requiresPollingParams =
        isDatabasePollingMode ||
        (syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE &&
          isApiPollingMode(syncSourceDataStrategy.mode));
      const s = syncSourceDataStrategy;

      if (!s.mode) {
        Message.warning('请选择同步模式');
        return false;
      }
      if (!s.conflictStrategy) {
        const csvRequiresConflict =
          syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD &&
          s.syncScope === 'INCREMENTAL';
        if (
          syncSourceType !== INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD ||
          csvRequiresConflict
        ) {
          Message.warning('请选择冲突策略');
          return false;
        }
      }
      if (!s.syncScope) {
        Message.warning(
          syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
            ? '请选择导入范围'
            : '请选择同步范围'
        );
        return false;
      }
      if (!s.exceptionStrategy) {
        Message.warning('请选择异常策略');
        return false;
      }

      const validateFields = [
        'syncSourceType',
        'syncMappingFields',
        ...(syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.CSV_UPLOAD
          ? ['syncInstanceCsvFile']
          : []),
        ...(syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.MESSAGE_QUEUE
          ? [
              'syncMessageQueueConnector',
              'syncMessageQueueTopic',
              ...buildStreamParseFormValidateFields(syncSourceDataStrategy)
            ]
          : []),
        ...(syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
          ? [
              'syncApiConnector',
              ...buildStreamParseFormValidateFields(syncSourceDataStrategy)
            ]
          : []),
        ...(syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.FILE_PARSE
          ? ['syncFileResourceId', 'syncFileParseRequirement']
          : []),
        ...(isDatabaseSyncSource ? ['syncConnector', 'syncDatabaseTable'] : [])
      ];

      try {
        await form.validate(validateFields);
      } catch (error) {
        return false;
      }

      const isDataResource = dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE;
      if (
        !isInstanceSyncSourceConfigured(syncSourceDataStrategy, {
          isDataResource
        })
      ) {
        Message.warning(INSTANCE_SYNC_SOURCE_UNCONFIGURED_MESSAGE);
        return false;
      }

      if (
        requiresPollingParams &&
        (!syncSourceDataStrategy.jdbcPollingIntervalSeconds ||
          !syncSourceDataStrategy.pollFetchSize)
      ) {
        Message.warning(
          syncSourceType === INSTANCE_SYNC_SOURCE_TYPE.API_INTERFACE
            ? '请完整填写定时拉取参数'
            : '请完整填写轮询参数'
        );
        return false;
      }

      if (
        isDatabasePollingMode &&
        syncScopeRequiresIncrementalPollingFields(syncSourceDataStrategy) &&
        (!syncSourceDataStrategy.jdbcIncrementalTimeField?.trim() ||
          !syncSourceDataStrategy.jdbcCheckpointField?.trim())
      ) {
        Message.warning('请填写增量时间列和断点辅助列');
        return false;
      }

      if (isSqlPolling) {
        const needFullSql =
          syncSourceDataStrategy.syncScope === 'FULL' ||
          syncSourceDataStrategy.syncScope === 'FULL_THEN_INCREMENTAL';
        const needIncrementSql =
          syncSourceDataStrategy.syncScope === 'INCREMENTAL' ||
          syncSourceDataStrategy.syncScope === 'FULL_THEN_INCREMENTAL';

        if (needFullSql && !syncSourceDataStrategy.jdbcSyncSqlFull?.trim()) {
          Message.warning('请输入全量SQL');
          return false;
        }

        if (
          needIncrementSql &&
          !syncSourceDataStrategy.jdbcSyncSqlIncrement?.trim()
        ) {
          Message.warning('请输入增量SQL');
          return false;
        }
      }

      const hasMappedField = syncMappingFields.some(
        (field) => field.sourceColumnName
      );
      const hasPrimaryMapping = syncMappingFields.some(
        (field) => field.isPrimary === 1 && field.sourceColumnName
      );

      if (!hasMappedField) {
        Message.warning('实例同步映射至少需要一个有效映射');
        return false;
      }

      if (!hasPrimaryMapping) {
        Message.warning('对象类型主键需要映射到源表字段');
        return false;
      }

      return true;
    };

    const validateBeforeSubmit = async (validateSyncStep = true) => {
      const basicValid = await validateBasicInfo();
      if (!basicValid) {
        updateCurrentStep(BASIC_STEP);
        return false;
      }

      const modelingValid = await validateModeling();
      if (!modelingValid) {
        updateCurrentStep(MODELING_STEP);
        return false;
      }

      if (validateSyncStep) {
        const syncValid = await validateInstanceSync();
        if (!syncValid) {
          updateCurrentStep(INSTANCE_SYNC_STEP);
          return false;
        }
      }

      return true;
    };

    const syncInstanceSourceFromModeling = () => {
      if (dataSource.type !== DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
        return;
      }
      applySyncSourceFromModelingInfo(
        form,
        modelingSourceDataInfo,
        setSyncSourceDataStrategy
      );
    };

    const handleGenerateSchemaFromBasicInfo = () => {
      if (dataSource.type !== DATA_SOURCE_TYPE.LOCAL_CSV || modelingReadOnly) {
        return;
      }

      if (!isEdit && dataSource.filePath && objectTypeAttributes.length > 0) {
        Message.warning('请先删除已上传的附件后再执行此操作');
        return;
      }

      const values = getSubmitValues();
      const objectTypeName = String(values.name ?? '').trim();
      if (!objectTypeName) {
        Message.warning('请先在基本信息中填写对象类型名称');
        return;
      }

      setPendingGenerateBasicInfo({
        name: objectTypeName,
        description: values.description,
        code: values.code
      });
      setGenerateRequirementModalVisible(true);
    };

    const handleConfirmGenerateSchema = async (requirements: string) => {
      if (!pendingGenerateBasicInfo) {
        return;
      }

      setGeneratingSchema(true);
      try {
        const displayFileName = `${pendingGenerateBasicInfo.code || 'object_type'}_schema.csv`;
        const { definition, source } = await generateObjectTypeCsvTemplate({
          name: pendingGenerateBasicInfo.name,
          description: pendingGenerateBasicInfo.description,
          requirements
        });
        const parsed = await resolveGeneratedObjectTypeParsedSchema(
          definition,
          displayFileName
        );
        applyObjectTypeParsedSchema({
          parsed,
          form,
          setModelingSourceDataInfo,
          setDataSource,
          setObjectTypeAttributes,
          setFileUploaded,
          setInitialFileList,
          displayFileName
        });

        setIsReUpload(true);
        setGenerateRequirementModalVisible(false);
        setPendingGenerateBasicInfo(undefined);

        if (source === 'llm') {
          Message.success('已根据名称、描述与生成要求生成建模模板，可继续编辑');
        } else {
          Message.info('已填充标准模板数据，可继续编辑或重新上传 CSV');
        }
      } catch (error) {
        Message.warning(
          error instanceof Error
            ? error.message
            : '生成建模模板失败，请手动上传 Schema 文件'
        );
      } finally {
        setGeneratingSchema(false);
      }
    };

    const handleNextStep = async () => {
      if (currentStep === BASIC_STEP) {
        if (await validateBasicInfo()) {
          syncBasicInfoValues();
          updateCurrentStep(MODELING_STEP);
        }
        return;
      }

      if (currentStep === MODELING_STEP) {
        if (twoStepOnly) {
          return;
        }
        if (modelingReadOnly) {
          syncInstanceSourceFromModeling();
          updateCurrentStep(INSTANCE_SYNC_STEP);
          return;
        }
        if (await validateModeling()) {
          syncInstanceSourceFromModeling();
          updateCurrentStep(INSTANCE_SYNC_STEP);
        }
      }
    };

    const handlePrevStep = () => {
      updateCurrentStep((step) => Math.max(BASIC_STEP, step - 1));
    };

    const handleSubmit = async () => {
      try {
        const isValid = await validateBeforeSubmit(true);
        if (!isValid) {
          return;
        }

        const formData = await buildSubmitFormData(true);

        if (!formData) {
          return;
        }

        onSubmit(formData);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    const handleEditSaveFromBasicStep = async () => {
      try {
        const basicValid = await validateBasicInfo();
        if (!basicValid) {
          return;
        }

        syncBasicInfoValues();
        const formData = await buildSubmitFormData(
          initialValues?.enableSyncSourceData === true
        );

        if (!formData) {
          return;
        }

        onSubmit(formData);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    const handleEditSaveFromModelingWithoutSync = async () => {
      try {
        const basicValid = await validateBasicInfo();
        if (!basicValid) {
          return;
        }

        syncBasicInfoValues();
        const modelingValid = await validateModeling();
        if (!modelingValid) {
          return;
        }

        const formData = await buildSubmitFormData(
          initialValues?.enableSyncSourceData === true
        );

        if (!formData) {
          return;
        }

        onSubmit(formData);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    const handleEditSaveFromInstanceSync = async () => {
      try {
        const isValid = await validateBeforeSubmit(true);
        if (!isValid) {
          return;
        }

        const formData = await buildSubmitFormData(true);

        if (!formData) {
          return;
        }

        onSubmit(formData);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    const handleSkipInstanceSyncAndSubmit = async () => {
      try {
        const isValid = await validateBeforeSubmit(false);
        if (!isValid) {
          return;
        }

        const formData = await buildSubmitFormData(false);

        if (!formData) {
          return;
        }

        onSubmit(formData);
      } catch (error) {
        console.error('Form validation failed:', error);
      }
    };

    React.useImperativeHandle(ref, () => ({
      submit: isEdit ? handleEditSaveFromBasicStep : handleSubmit
    }));

    const renderBasicInfo = () => (
      <>
        <div className="my-[16px] text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
          基本信息
        </div>

        <FormItem
          label="对象类型名称"
          field="name"
          rules={[
            { required: true, message: '请输入对象类型名称' },
            { maxLength: 50, message: '名称不能超过50个字符' }
          ]}
        >
          <Input
            placeholder="请输入对象类型名称。用于在界面上展示，如：传感器"
            maxLength={50}
            showWordLimit
            allowClear
            onChange={(value) => handleBasicInfoFieldChange('name', value)}
          />
        </FormItem>

        <FormItem
          label="对象类型id"
          field="code"
          rules={[
            { required: true, message: '请输入id' },
            // 编辑且 code 不可改：沿用后端历史编码，不做字母数字格式校验
            ...(isEdit && initialValues?.code
              ? []
              : [objectTypeCodeValidatorRule])
          ]}
          extra={
            <div className="text-[12px] text-[var(--color-text-4)]">
              {OBJECT_TYPE_CODE_EXTRA}
            </div>
          }
        >
          <Input
            placeholder="根据名称自动生成，可修改"
            allowClear
            disabled={!!initialValues?.code}
          />
        </FormItem>

        <FormItem label="描述说明" field="description">
          <TextArea
            placeholder="请输入描述说明，详述该实体的业务边界与逻辑范围"
            autoSize={{ minRows: 3 }}
            maxLength={500}
            showWordLimit
            onChange={(value) =>
              handleBasicInfoFieldChange('description', value)
            }
          />
        </FormItem>

        <FormItem label="图标" field="icon">
          <ObjectTypeIconSelector
            initialValue={selectedIcon}
            onChange={handleIconChange}
            options={OBJECT_TYPE_ICON_OPTIONS}
          />
        </FormItem>
      </>
    );

    const handleDataResourceSelected = (tables: DataResourceTable[]) => {
      const tableComment = tables[0]?.tableComment?.trim();
      const description = buildDataResourceObjectTypeDescriptionFromTables(
        tables
      ).slice(0, 200);
      const patch: {
        name?: string;
        description?: string;
      } = {};

      if (tableComment) {
        patch.name = tableComment;
      }
      if (description) {
        patch.description = description;
      }
      if (!Object.keys(patch).length) {
        return;
      }

      form.setFieldsValue(patch);
      setBasicInfoValues((prev) => ({
        ...prev,
        ...patch
      }));
    };

    const renderModeling = () => (
      <ModelingStep
        form={form}
        initialCode={initialValues?.code}
        dataSource={dataSource}
        setDataSource={setDataSource}
        modelingSourceDataInfo={modelingSourceDataInfo}
        setModelingSourceDataInfo={setModelingSourceDataInfo}
        objectTypeAttributes={objectTypeAttributes}
        setObjectTypeAttributes={setObjectTypeAttributes}
        fieldsLoading={fieldsLoading}
        setFieldsLoading={setFieldsLoading}
        setFileUploaded={setFileUploaded}
        setIsReUpload={setIsReUpload}
        initialFileList={initialFileList}
        setInitialFileList={setInitialFileList}
        styles={styles}
        readOnly={modelingReadOnly}
        onGenerateSchema={handleGenerateSchemaFromBasicInfo}
        generatingSchema={generatingSchema}
        showGenerateSchemaButton={
          !modelingReadOnly && dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV
        }
        onDataResourceSelected={handleDataResourceSelected}
      />
    );

    const renderInstanceSync = () => (
      <InstanceSyncStep
        form={form}
        objectTypeAttributes={objectTypeAttributes}
        syncSourceDataStrategy={syncSourceDataStrategy}
        setSyncSourceDataStrategy={setSyncSourceDataStrategy}
        syncMappingFields={syncMappingFields}
        setSyncMappingFields={setSyncMappingFields}
        fieldsLoading={fieldsLoading}
        setFieldsLoading={setFieldsLoading}
        styles={styles}
        readOnly={instanceSyncReadOnly}
        isDataResource={dataSource.type === DATA_SOURCE_TYPE.DATA_RESOURCE}
      />
    );

    const renderStepContent = () => {
      if (twoStepOnly && currentStep === INSTANCE_SYNC_STEP) {
        return renderModeling();
      }

      if (currentStep === BASIC_STEP) {
        return renderBasicInfo();
      }

      if (currentStep === MODELING_STEP) {
        return renderModeling();
      }

      return renderInstanceSync();
    };

    const renderFooter = () => {
      const isFirstStep = currentStep === BASIC_STEP;
      const isModelingStep = currentStep === MODELING_STEP;
      const isInstanceSyncStep = currentStep === INSTANCE_SYNC_STEP;
      const skipText = isEdit ? '跳过第3步，直接保存' : '跳过第3步，直接创建';
      const submitText = isEdit ? '保存' : '确定';

      if (isEdit) {
        return (
          <div className={styles['object-type-form-footer']}>
            <div className="flex justify-start gap-[8px]">
              {isFirstStep && (
                <>
                  <Button
                    type="primary"
                    onClick={handleEditSaveFromBasicStep}
                    loading={loading}
                  >
                    保存
                  </Button>
                  <Button onClick={handleNextStep} disabled={loading}>
                    下一步
                  </Button>
                </>
              )}

              {isModelingStep && (
                <>
                  {isSimpleModelingSource ? (
                    <>
                      <Button
                        type="primary"
                        onClick={handleEditSaveFromModelingWithoutSync}
                        loading={loading}
                      >
                        保存
                      </Button>
                      <Button onClick={handleNextStep} disabled={loading}>
                        下一步
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="primary"
                      onClick={handleNextStep}
                      disabled={loading}
                    >
                      下一步
                    </Button>
                  )}
                  <Button onClick={handlePrevStep} disabled={loading}>
                    上一步
                  </Button>
                </>
              )}

              {isInstanceSyncStep && (
                <>
                  {allowInstanceSyncEdit && (
                    <Button
                      type="primary"
                      onClick={handleEditSaveFromInstanceSync}
                      loading={loading}
                    >
                      保存
                    </Button>
                  )}
                  <Button onClick={handlePrevStep} disabled={loading}>
                    上一步
                  </Button>
                </>
              )}

              <Button onClick={onCancel} disabled={loading}>
                取消
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className={styles['object-type-form-footer']}>
          <div className="flex justify-start gap-[8px]">
            {isFirstStep && (
              <Button
                type="primary"
                onClick={handleNextStep}
                loading={loading}
                disabled={loading}
              >
                下一步
              </Button>
            )}

            {isModelingStep && (
              <>
                {twoStepOnly || isSimpleModelingSource ? (
                  <Button
                    type="primary"
                    onClick={handleSkipInstanceSyncAndSubmit}
                    loading={loading}
                  >
                    确认创建
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    下一步
                  </Button>
                )}
                <Button onClick={handlePrevStep} disabled={loading}>
                  上一步
                </Button>
                {!twoStepOnly && !isSimpleModelingSource && (
                  <Button
                    onClick={handleSkipInstanceSyncAndSubmit}
                    loading={loading}
                  >
                    {skipText}
                  </Button>
                )}
              </>
            )}

            {isInstanceSyncStep && !twoStepOnly && (
              <>
                <Button type="primary" onClick={handleSubmit} loading={loading}>
                  {submitText}
                </Button>
                <Button onClick={handlePrevStep} disabled={loading}>
                  上一步
                </Button>
                <Button
                  onClick={handleSkipInstanceSyncAndSubmit}
                  loading={loading}
                >
                  {skipText}
                </Button>
              </>
            )}

            <Button onClick={onCancel} disabled={loading}>
              取消
            </Button>
          </div>
        </div>
      );
    };

    return (
      <div
        className={classNames(
          'relative flex min-h-0 flex-col',
          showFooter ? 'h-full flex-1 pb-0' : 'px-[24px] pb-[16px]'
        )}
      >
        <div className={styles['object-type-form-steps-wrap']}>
          <ObjectTypeFormSteps currentStep={currentStep} steps={formSteps} />
        </div>
        <div
          className={classNames(
            styles['object-type-form-scroll'],
            !showFooter && styles['object-type-form-scroll-no-footer']
          )}
        >
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            labelAlign="left"
            className={styles['object-type-form']}
          >
            {renderStepContent()}
          </Form>
        </div>

        {showFooter && renderFooter()}

        <GenerateCsvSchemaRequirementModal
          visible={generateRequirementModalVisible}
          confirmLoading={generatingSchema}
          onCancel={() => {
            setGenerateRequirementModalVisible(false);
            setPendingGenerateBasicInfo(undefined);
          }}
          onConfirm={handleConfirmGenerateSchema}
        />
      </div>
    );
  }
);

ObjectTypeForm.displayName = 'ObjectTypeForm';

export default ObjectTypeForm;
