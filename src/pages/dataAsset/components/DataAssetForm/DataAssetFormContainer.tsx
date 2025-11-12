import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Steps, Message } from '@arco-design/web-react';
import {
  findDataAssetMapping,
  listDataAssetSource,
  createDataAssetAndMapping,
  editDataAssetAndMapping
} from '@/api/dataAsset';
import Step1MetadataFields from './Step1MetadataFields';
import Step2FieldMapping from './Step2FieldMapping';
import {
  CreateDataAssetAndMappingReq,
  DataAssetField,
  FindDataAssetMappingItemRes,
  ListDataAssetSourceResItem
} from '@/types/dataAssetApi';
import { RESERVED_FIELD_ENS } from '../../utils/const';

type DisplaySortable = {
  nameEn?: string;
  displaySort?: number;
};

const RESERVED_DISPLAY_SORT_MAP = Array.from(RESERVED_FIELD_ENS).reduce<
  Record<string, number>
>((acc, key, index) => {
  acc[key] = index + 1;
  return acc;
}, {});

function assignReservedDisplaySort<T extends DisplaySortable>(
  fields: T[] | undefined | null
): T[] {
  if (!fields || !Array.isArray(fields)) {
    return [] as T[];
  }

  const decorated = fields.map((field, index) => {
    const reservedSort = field?.nameEn
      ? RESERVED_DISPLAY_SORT_MAP[field.nameEn]
      : undefined;
    const displaySort = reservedSort ?? 0;

    return {
      field,
      index,
      displaySort
    };
  });

  decorated.sort((a, b) => {
    const sortA = a.displaySort ?? 0;
    const sortB = b.displaySort ?? 0;

    if (sortA === sortB) {
      return a.index - b.index;
    }

    if (sortA === 0) {
      return 1;
    }

    if (sortB === 0) {
      return -1;
    }

    return sortA - sortB;
  });

  return decorated.map(({ field, displaySort }) => ({
    ...field,
    displaySort
  })) as T[];
}

interface DataAssetFormContainerProps {
  isEditMode?: boolean;
  id?: string;
}

// 第一步的字段定义
export interface MetadataField extends DataAssetField {
  id: string;
  /** 系统默认字段标记：用于前端禁用编辑/删除等 */
  system?: boolean;
  /** 是否为枚举类型（用于后续列展示配置，非后端创建必需） */
  isEnumAble?: boolean;
  /** 列展示顺序（用于后续列展示配置，非后端创建必需） */
  displaySort?: number;
  mapping?: {
    type: string;
    tableName: string;
    databaseName: string;
    fieldType: string;
    fieldName: string;
  }[];
}

// 第二步的映射定义
export interface FieldMapping {
  id: string;
  sequence: number;
  nameZh: string;
  // 动态的数据来源类型字段（键为接口返回的类型，值为映射值）
  [key: string]: string | number | undefined;
}

export default function DataAssetFormContainer({
  isEditMode = false,
  id
}: DataAssetFormContainerProps) {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // 系统默认字段（表头）
  const getDefaultSystemFields = (): MetadataField[] => {
    if (isEditMode) {
      return [];
    }

    return [
      {
        id: `field_system_data_asset_name`,
        nameZh: '数据资产名称',
        nameEn: 'data_asset_name',
        type: 'string',
        default: '',
        required: true,
        allowModify: false,
        system: true,
        isEnumAble: false,
        displaySort: 1
      },
      {
        id: `field_system_tags`,
        nameZh: '标签',
        nameEn: 'tags',
        type: 'array<varchar(64)>',
        default: '',
        required: true,
        allowModify: false,
        system: true,
        isEnumAble: false,
        displaySort: 2
      },
      {
        id: `field_system_data_source`,
        nameZh: '来源',
        nameEn: 'data_source',
        type: 'string',
        default: '',
        required: true,
        allowModify: false,
        system: true,
        isEnumAble: false,
        displaySort: 3
      },
      {
        id: `field_system_data_update_time`,
        nameZh: '数据更新时间',
        nameEn: 'data_update_time',
        type: 'datetime',
        default: '',
        required: true,
        allowModify: false,
        system: true,
        isEnumAble: false,
        displaySort: 4
      }
    ];
  };

  // 表单数据 - 默认包含四个系统字段
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>(
    getDefaultSystemFields()
  );
  const [dataSources, setDataSources] = useState<
    Record<string, ListDataAssetSourceResItem>
  >({});
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [autoMapping, setAutoMapping] = useState(() => !isEditMode);
  const [findDataAssetMappingData, setFindDataAssetMappingData] = useState<
    ListDataAssetSourceResItem[]
  >([]);

  // const updateMetadataFields = useCallback<
  //   React.Dispatch<React.SetStateAction<MetadataField[]>>
  // >(
  //   (updater) => {
  //     setMetadataFields((prev) => {
  //       const next =
  //         typeof updater === 'function'
  //           ? (updater as (prevState: MetadataField[]) => MetadataField[])(
  //             prev
  //           )
  //           : updater;
  //       return assignReservedDisplaySort(next);
  //     });
  //   },
  //   [setMetadataFields]
  // );

  const normalizeDataSources = (
    sources: Record<string, ListDataAssetSourceResItem> = {},
    available: Record<string, ListDataAssetSourceResItem> = {}
  ): Record<string, ListDataAssetSourceResItem> => {
    const result: Record<string, ListDataAssetSourceResItem> = {};
    Object.keys(sources).forEach((key) => {
      if (available[key]) {
        result[key] = available[key];
      }
    });
    return result;
  };

  const getDataSourceKey = (item: Partial<ListDataAssetSourceResItem>) =>
    `${item.type ?? ''}::${item.databaseName ?? ''}::${item.tableName ?? ''}`;

  const availableDataSources = useMemo(() => {
    if (!findDataAssetMappingData || findDataAssetMappingData.length === 0) {
      return {};
    }
    const result: Record<string, ListDataAssetSourceResItem> = {};
    findDataAssetMappingData.forEach((item) => {
      const key = getDataSourceKey(item);
      if (key) {
        result[key] = item;
      }
    });
    return result;
  }, [findDataAssetMappingData]);

  const normalizedDataSources = useMemo(
    () => normalizeDataSources(dataSources, availableDataSources),
    [dataSources, availableDataSources]
  );

  // 获取数据资产映射数据
  const fetchDataAssetMapping = async () => {
    try {
      setLoading(true);
      const res = await listDataAssetSource();

      if (res.status !== 200) {
        return;
      }

      setFindDataAssetMappingData(res.data || []);
    } catch (error) {
      Message.error('获取数据来源列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const initDataAssetMapping = async () => {
    setAutoMapping(false);
    const res = await findDataAssetMapping();
    if (res.status !== 200 || !Array.isArray(res.data)) {
      return;
    }

    setMetadataFields(
      res?.data?.map((item) => ({
        id: item.nameEn,
        nameZh: item.nameZh,
        nameEn: item.nameEn,
        type: item.type,
        default: item.default,
        required: item.required,
        allowModify: item.allowModify,
        displaySort: RESERVED_DISPLAY_SORT_MAP[item.nameEn] ?? 0,
        mapping: item.mapping
      })) || []
    );

    const dataSourcesMap = {};
    res.data?.forEach((item) => {
      if (!item.mapping?.length) {
        return;
      }

      item.mapping?.forEach((subItem) => {
        const key = getDataSourceKey(subItem);

        if (dataSourcesMap[key]) {
          return;
        }

        dataSourcesMap[key] = {
          type: subItem.type,
          // name: subItem.feildName,
          tableName: subItem.tableName,
          databaseName: subItem.databaseName,
          fields: [
            {
              name: subItem.fieldName,
              type: subItem.fieldType
            }
          ]
        };
      });
    });
    setDataSources(dataSourcesMap);
  };

  // 组件挂载时获取数据资产映射数据
  useEffect(() => {
    fetchDataAssetMapping();

    if (isEditMode) {
      setAutoMapping(false);
      initDataAssetMapping();
    }
  }, []);

  // 下一步
  const handleNext = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  // 上一步
  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  // 取消
  const handleCancel = useCallback(() => {
    history.push('/tenant/compute/modaforge/dataAsset/list');
  }, [history]);

  // 完成
  const handleFinish = useCallback(
    async (fieldsWithMappings: CreateDataAssetAndMappingReq) => {
      const res = await (
        isEditMode ? editDataAssetAndMapping : createDataAssetAndMapping
      )(fieldsWithMappings);

      if (res.status !== 200) {
        Message.error(res.message || '创建数据资产失败');
        return;
      }

      Message.success('创建数据资产成功');
      history.push('/tenant/compute/modaforge/dataAsset/list');
    },
    [history, isEditMode]
  );

  // 页面标题
  const pageTitle = isEditMode ? '编辑数据资产' : '创建数据资产';
  const step1Title = isEditMode ? '编辑元数据字段' : '设置元数据字段';
  const step2Title = isEditMode ? '编辑字段映射' : '设置字段映射';

  const steps = useMemo(
    () => [
      {
        key: 'metadata',
        element: (
          <Step1MetadataFields
            metadataFields={metadataFields}
            setMetadataFields={setMetadataFields}
            dataSources={normalizedDataSources}
            setDataSources={setDataSources}
            findDataAssetMappingData={findDataAssetMappingData}
            onCancel={handleCancel}
            onNext={handleNext}
          />
        )
      },
      {
        key: 'mapping',
        element: (
          <Step2FieldMapping
            mappings={mappings}
            setMappings={setMappings}
            autoMapping={autoMapping}
            setAutoMapping={setAutoMapping}
            metadataFields={metadataFields}
            dataSources={normalizedDataSources}
            findDataAssetMappingData={findDataAssetMappingData}
            onCancel={handleCancel}
            onPrev={handlePrev}
            onFinish={handleFinish}
          />
        )
      }
    ],
    [
      metadataFields,
      dataSources,
      findDataAssetMappingData,
      mappings,
      autoMapping,
      handleCancel,
      handleNext,
      handlePrev,
      handleFinish
      // updateMetadataFields
    ]
  );

  return (
    <>
      {/* 标题 */}
      <div className="mb-[8px] mt-[16px] h-[32px] w-full leading-[32px]">
        <p className="text-xl font-bold">{pageTitle}</p>
      </div>
      <div className="h-[calc(100%-32px-24px-20px)] w-full pr-5">
        <div className="box-border h-full w-full overflow-y-auto rounded-2xl bg-white pl-[24px] pr-6 pt-[24px]">
          {/* 步骤指示器 */}
          <div className="mb-6">
            <Steps
              current={currentStep}
              style={{ maxWidth: 440, margin: '0 auto' }}
            >
              <Steps.Step key="step1" title={step1Title} />
              <Steps.Step key="step2" title={step2Title} />
            </Steps>
          </div>

          {/* 表单内容 */}
          <div className="w-full">
            {steps.map((step, index) => (
              <div
                key={step.key}
                style={{ display: currentStep === index ? 'block' : 'none' }}
              >
                {step.element}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
