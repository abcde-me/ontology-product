import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Message } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './ObjectTypeForm.module.scss';
import {
  DATA_SOURCE_TYPE,
  DataSourceType,
  OBJECT_TYPE_ICON_OPTIONS
} from '@/pages/ontologyScene/common/constants';
import ObjectTypeIconSelector from './ObjectTypeIconSelector';
import ModelingStep from './ObjectTypeFormSteps/ModelingStep';
import InstanceSyncStep from './ObjectTypeFormSteps/InstanceSyncStep';
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
import {
  legacyFieldToObjectTypeAttribute,
  mergeOntologyPhysicalPropertiesForForm
} from './ObjectTypeFormUtils/attributeFields';
import { buildObjectTypeFormData } from './ObjectTypeFormHooks/useObjectTypeSubmit';

export type { ObjectTypeFormData } from './ObjectTypeFormUtils/types';

const FormItem = Form.Item;
const { TextArea } = Input;

const BASIC_STEP = 0;
const MODELING_STEP = 1;
const INSTANCE_SYNC_STEP = 2;

const clampStep = (step: number, maxStep: number) =>
  Math.min(maxStep, Math.max(BASIC_STEP, step));

const maxStepForDataSourceType = (type: DataSourceType | undefined) =>
  type === DATA_SOURCE_TYPE.LOCAL_CSV ? MODELING_STEP : INSTANCE_SYNC_STEP;

const CSV_FORM_STEPS = ['基本信息', '对象类型建模'] as const;

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
  const rawId = info.connectorId;
  const numeric = rawId === undefined || rawId === null ? NaN : Number(rawId);
  const connectorId = Number.isFinite(numeric) ? numeric : undefined;
  return {
    [`${prefix}Connector`]: connectorId,
    [`${prefix}QueryMode`]: queryMode,
    [`${prefix}DatabaseTable`]:
      queryMode === 'selected' && info.databaseName && info.tableName
        ? [info.databaseName, info.tableName]
        : undefined,
    [`${prefix}Sql`]: info.sql
  };
}

interface ObjectTypeFormProps {
  initialValues?: Partial<ObjectTypeFormData>;
  onSubmit: (data: ObjectTypeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  showFooter?: boolean;
  isEdit?: boolean;
  initialStep?: number;
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
      initialStep
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [selectedIcon, setSelectedIcon] = useState<string>(
      initialValues?.icon || ''
    );
    const [dataSource, setDataSource] = useState<ObjectTypeDataSourceState>({
      type: DATA_SOURCE_TYPE.LOCAL_CSV,
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
        DEFAULT_SYNC_SOURCE_DATA_STRATEGY
      );
    const [syncMappingFields, setSyncMappingFields] = useState<
      InstanceSyncMappingField[]
    >([]);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [, setFileUploaded] = useState(false);
    const [isReUpload, setIsReUpload] = useState(false);
    const [initialFileList, setInitialFileList] = useState<any[]>([]);
    const [currentStep, setCurrentStep] = useState(() => {
      const initialDsType =
        initialValues?._dataSource?.type ?? DATA_SOURCE_TYPE.LOCAL_CSV;
      return clampStep(
        initialStep ?? BASIC_STEP,
        maxStepForDataSourceType(initialDsType)
      );
    });
    const secondaryStepsReadOnly = isEdit;
    const isLocalCsv = dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV;
    const [basicInfoValues, setBasicInfoValues] = useState<BasicInfoValues>(
      () => ({
        code: initialValues?.code,
        name: initialValues?.name,
        description: initialValues?.description,
        icon: initialValues?.icon,
        ontologyModelID: initialValues?.ontologyModelID
      })
    );

    useEffect(() => {
      form.setFieldsValue(DEFAULT_INSTANCE_SYNC_VALUES);

      if (initialValues) {
        setBasicInfoValues((prev) => ({
          code: isEdit ? initialValues.code : (initialValues.code ?? prev.code),
          name: isEdit ? initialValues.name : (initialValues.name ?? prev.name),
          description: isEdit
            ? initialValues.description
            : (initialValues.description ?? prev.description),
          icon: isEdit ? initialValues.icon : (initialValues.icon ?? prev.icon),
          ontologyModelID: initialValues.ontologyModelID ?? prev.ontologyModelID
        }));
        const formData = form.getFieldsValue();

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
        const syncSqlSourcePatch = initialValues.syncSourceDataStrategy
          ?.sourceDataInfo
          ? buildSqlSourceSelectorFormFields(
              'sync',
              initialValues.syncSourceDataStrategy.sourceDataInfo
            )
          : {};

        if (isEdit) {
          form.setFieldsValue({
            ...formData,
            ...DEFAULT_INSTANCE_SYNC_VALUES,
            ...initialValues,
            dataSourceType:
              initialValues._dataSource?.type || DATA_SOURCE_TYPE.LOCAL_CSV,
            database: initialValues._dataSource?.database,
            table: initialValues._dataSource?.table,
            ...modelingSqlSourcePatch,
            ...syncSqlSourcePatch
          });
        } else {
          form.setFieldsValue({
            ...formData,
            ...DEFAULT_INSTANCE_SYNC_VALUES,
            ...initialValues,
            dataSourceType:
              formData.dataSourceType || DATA_SOURCE_TYPE.LOCAL_CSV,
            ...modelingSqlSourcePatch,
            ...syncSqlSourcePatch
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
            const objectAttributes = propertyList.map((field) =>
              legacyFieldToObjectTypeAttribute(field)
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
        if (initialValues.syncSourceDataStrategy) {
          const initialSyncSourceDataInfo =
            initialValues.syncSourceDataStrategy.sourceDataInfo;
          setSyncSourceDataStrategy({
            ...DEFAULT_SYNC_SOURCE_DATA_STRATEGY,
            ...initialValues.syncSourceDataStrategy,
            sourceDataInfo: {
              ...initialSyncSourceDataInfo,
              queryMode:
                initialSyncSourceDataInfo?.queryMode === 'sql'
                  ? 'sql'
                  : 'selected'
            }
          });
        }
        if (initialValues.syncMappingFields) {
          setSyncMappingFields(initialValues.syncMappingFields);
        }
        if (initialValues.filePath && initialValues.filePath.trim()) {
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
          dataSourceType: DATA_SOURCE_TYPE.LOCAL_CSV
        });
        setSyncSourceDataStrategy(DEFAULT_SYNC_SOURCE_DATA_STRATEGY);
      }
    }, [initialValues, form, isEdit]);

    useEffect(() => {
      if (
        dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV &&
        currentStep === INSTANCE_SYNC_STEP
      ) {
        setCurrentStep(MODELING_STEP);
      }
    }, [dataSource.type, currentStep]);

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
        code: form.getFieldValue('code'),
        name: form.getFieldValue('name'),
        description: form.getFieldValue('description'),
        icon: form.getFieldValue('icon') || selectedIcon,
        ontologyModelID:
          form.getFieldValue('ontologyModelID') ||
          initialValues?.ontologyModelID
      }));
    };

    const getSubmitValues = () => {
      const formValues = form.getFieldsValue();
      return {
        ...formValues,
        code: formValues.code ?? basicInfoValues.code,
        name: formValues.name ?? basicInfoValues.name,
        description: formValues.description ?? basicInfoValues.description,
        icon: formValues.icon ?? basicInfoValues.icon,
        ontologyModelID:
          formValues.ontologyModelID ??
          basicInfoValues.ontologyModelID ??
          initialValues?.ontologyModelID
      };
    };

    const validateBasicInfo = async () => {
      try {
        await form.validate(['name', 'code']);
        return true;
      } catch (error) {
        return false;
      }
    };

    const validateModeling = async () => {
      try {
        await form.validate([
          'dataSourceType',
          'file',
          'modelingConnector',
          'modelingDatabaseTable',
          'objectTypeAttributes'
        ]);
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

      if (dataSource.type === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC) {
        if (!dataSource.connectorId) {
          Message.warning('请选择数据源链接');
          return false;
        }
        const isModelingSqlMode = dataSource.queryMode === 'sql';
        if (isModelingSqlMode) {
          if (!String(dataSource.sql ?? '').trim()) {
            Message.warning('请先输入自定义SQL');
            return false;
          }
        } else if (!dataSource.database || !dataSource.table) {
          Message.warning('请选择数据源链接和数据表');
          return false;
        }
      }

      if (objectTypeAttributes.length === 0) {
        Message.warning('请先上传文件或选择数据源');
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
      const isPollingMode = syncSourceDataStrategy.mode === 'JDBC_POLLING';
      const isSqlPolling = isPollingMode && syncSource.queryMode === 'sql';
      const validateFields = [
        'syncMode',
        'conflictStrategy',
        'syncScope',
        'exceptionStrategy',
        'syncConnector',
        'syncDatabaseTable',
        'syncMappingFields'
      ];

      if (isPollingMode) {
        validateFields.push(
          'jdbcPollingIntervalSeconds',
          'pollFetchSize',
          'jdbcIncrementalTimeField',
          'jdbcCheckpointField'
        );
      }

      try {
        await form.validate(validateFields);
      } catch (error) {
        return false;
      }

      if (
        !syncSource.connectorId ||
        (syncSource.queryMode !== 'sql' &&
          (!syncSource.databaseName || !syncSource.tableName))
      ) {
        Message.warning('请选择实例同步数据源');
        return false;
      }

      if (
        isPollingMode &&
        (!syncSourceDataStrategy.jdbcPollingIntervalSeconds ||
          !syncSourceDataStrategy.pollFetchSize ||
          !syncSourceDataStrategy.jdbcIncrementalTimeField?.trim() ||
          !syncSourceDataStrategy.jdbcCheckpointField?.trim())
      ) {
        Message.warning('请完整填写轮询参数');
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
        setCurrentStep(BASIC_STEP);
        return false;
      }

      const modelingValid = await validateModeling();
      if (!modelingValid) {
        setCurrentStep(MODELING_STEP);
        return false;
      }

      if (validateSyncStep) {
        const syncValid = await validateInstanceSync();
        if (!syncValid) {
          setCurrentStep(INSTANCE_SYNC_STEP);
          return false;
        }
      }

      return true;
    };

    const syncInstanceSourceFromModeling = () => {
      if (
        dataSource.type !== DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC ||
        (modelingSourceDataInfo.queryMode || 'selected') !== 'selected' ||
        !modelingSourceDataInfo.connectorId ||
        !modelingSourceDataInfo.databaseName ||
        !modelingSourceDataInfo.tableName
      ) {
        return;
      }

      setSyncSourceDataStrategy((prev) => ({
        ...prev,
        sourceDataInfo: {
          connectorId: modelingSourceDataInfo.connectorId,
          connectorName: modelingSourceDataInfo.connectorName,
          connectorSubtype: modelingSourceDataInfo.connectorSubtype,
          databaseName: modelingSourceDataInfo.databaseName,
          tableName: modelingSourceDataInfo.tableName,
          projectID: modelingSourceDataInfo.projectID,
          queryMode: 'selected'
        }
      }));
      form.setFieldsValue({
        syncConnector: modelingSourceDataInfo.connectorId,
        syncQueryMode: 'selected',
        syncDatabaseTable: [
          modelingSourceDataInfo.databaseName,
          modelingSourceDataInfo.tableName
        ]
      });
    };

    const handleNextStep = async () => {
      if (currentStep === BASIC_STEP) {
        if (await validateBasicInfo()) {
          syncBasicInfoValues();
          setCurrentStep(MODELING_STEP);
        }
        return;
      }

      if (currentStep === MODELING_STEP) {
        if (dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV) {
          return;
        }
        if (secondaryStepsReadOnly) {
          setCurrentStep(INSTANCE_SYNC_STEP);
          return;
        }
        if (await validateModeling()) {
          syncInstanceSourceFromModeling();
          setCurrentStep(INSTANCE_SYNC_STEP);
        }
      }
    };

    const handlePrevStep = () => {
      setCurrentStep((step) => Math.max(BASIC_STEP, step - 1));
    };

    const handleSubmit = async () => {
      try {
        const isValid = await validateBeforeSubmit(true);
        if (!isValid) {
          return;
        }

        const values = getSubmitValues();
        const formData = buildObjectTypeFormData({
          values,
          selectedIcon,
          initialOntologyModelID: initialValues?.ontologyModelID,
          dataSource,
          attributeFields,
          objectTypeAttributes,
          syncSourceDataStrategy,
          syncMappingFields,
          enableSyncSourceData: true,
          isReUpload
        });

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
        const values = getSubmitValues();
        const formData = buildObjectTypeFormData({
          values,
          selectedIcon,
          initialOntologyModelID: initialValues?.ontologyModelID,
          dataSource,
          attributeFields,
          objectTypeAttributes,
          syncSourceDataStrategy,
          syncMappingFields,
          enableSyncSourceData: initialValues?.enableSyncSourceData === true,
          isReUpload
        });

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

        const values = getSubmitValues();
        const formData = buildObjectTypeFormData({
          values,
          selectedIcon,
          initialOntologyModelID: initialValues?.ontologyModelID,
          dataSource,
          attributeFields,
          objectTypeAttributes,
          syncSourceDataStrategy,
          syncMappingFields,
          enableSyncSourceData: initialValues?.enableSyncSourceData === true,
          isReUpload
        });

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

        const values = getSubmitValues();
        const formData = buildObjectTypeFormData({
          values,
          selectedIcon,
          initialOntologyModelID: initialValues?.ontologyModelID,
          dataSource,
          attributeFields,
          objectTypeAttributes,
          syncSourceDataStrategy,
          syncMappingFields,
          enableSyncSourceData: false,
          isReUpload
        });

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
          />
        </FormItem>

        <FormItem
          label="对象类型id"
          field="code"
          rules={[
            { required: true, message: '请输入id' },
            {
              validator: (value, callback) => {
                if (!value) {
                  callback();
                  return;
                }
                if (!/^[a-zA-Z]/.test(value)) {
                  callback('首字符必须为英文字母');
                  return;
                }
                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                  callback('仅允许英文字母与数字(不允许下划线及特殊符号)');
                  return;
                }
                callback();
              }
            }
          ]}
          extra={
            <div className="text-[12px] text-[var(--color-text-4)]">
              首字符必须为英文字母;仅允许英文字母与数字(不允许下划线及特殊符号)
            </div>
          }
        >
          <Input
            placeholder="请输入id。用于 API 调用，全局唯一"
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
        readOnly={secondaryStepsReadOnly}
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
        readOnly={secondaryStepsReadOnly}
      />
    );

    const renderStepContent = () => {
      if (
        dataSource.type === DATA_SOURCE_TYPE.LOCAL_CSV &&
        currentStep === INSTANCE_SYNC_STEP
      ) {
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
          <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
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
                  {isLocalCsv ? (
                    <Button
                      type="primary"
                      onClick={handleEditSaveFromModelingWithoutSync}
                      loading={loading}
                    >
                      保存
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
                </>
              )}

              {isInstanceSyncStep && (
                <Button onClick={handlePrevStep} disabled={loading}>
                  上一步
                </Button>
              )}

              <Button onClick={onCancel} disabled={loading}>
                取消
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
          <div className="flex justify-start gap-[8px]">
            {isFirstStep && (
              <Button
                type="primary"
                onClick={handleNextStep}
                disabled={loading}
              >
                下一步
              </Button>
            )}

            {isModelingStep && (
              <>
                {isLocalCsv ? (
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
                {!isLocalCsv && (
                  <Button
                    onClick={handleSkipInstanceSyncAndSubmit}
                    loading={loading}
                  >
                    {skipText}
                  </Button>
                )}
              </>
            )}

            {isInstanceSyncStep && (
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
          'flex flex-col px-[24px] pb-[16px]',
          showFooter ? 'flex-1 pb-24' : ''
        )}
      >
        <ObjectTypeFormSteps
          currentStep={currentStep}
          steps={isLocalCsv ? [...CSV_FORM_STEPS] : undefined}
        />
        <div className={showFooter ? 'flex-1' : ''}>
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
      </div>
    );
  }
);

ObjectTypeForm.displayName = 'ObjectTypeForm';

export default ObjectTypeForm;
