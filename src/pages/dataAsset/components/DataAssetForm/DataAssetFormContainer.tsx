import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Steps, Message } from '@arco-design/web-react';
import {
  findDataAssetMapping,
  listDataAssetSource,
  createDataAssetAndMapping
} from '@/api/dataAsset';
import Step1MetadataFields from './Step1MetadataFields';
import Step2FieldMapping from './Step2FieldMapping';
import {
  CreateDataAssetAndMappingReq,
  DataAssetField,
  FindDataAssetMappingItemRes,
  ListDataAssetSourceResItem
} from '@/types/dataAssetApi';

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
  const getDefaultSystemFields = (): MetadataField[] => [
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
      id: `field_system_data_update_time`,
      nameZh: '数据更新时间',
      nameEn: 'data_update_time',
      type: 'datetime',
      default: '',
      required: true,
      allowModify: false,
      system: true,
      isEnumAble: false,
      displaySort: 3
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
      displaySort: 4
    }
  ];

  // 表单数据 - 默认包含四个系统字段
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>(
    getDefaultSystemFields()
  );
  const [dataSources, setDataSources] = useState<
    Record<string, ListDataAssetSourceResItem>
  >({});
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [autoMapping, setAutoMapping] = useState(true);
  const [findDataAssetMappingData, setFindDataAssetMappingData] = useState<
    ListDataAssetSourceResItem[]
  >([]);

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

  // 组件挂载时获取数据资产映射数据
  useEffect(() => {
    fetchDataAssetMapping();
  }, []);

  // 下一步
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 取消
  const handleCancel = () => {
    history.push('/tenant/compute/modaforge/dataAsset/list');
  };

  // 完成
  const handleFinish = async (
    fieldsWithMappings: CreateDataAssetAndMappingReq
  ) => {
    const res = await createDataAssetAndMapping(fieldsWithMappings);

    if (res.status !== 200) {
      Message.error(res.message || '创建数据资产失败');
      return;
    }

    Message.success('创建数据资产成功');
    history.push('/tenant/compute/modaforge/dataAsset/list');
  };

  // 页面标题
  const pageTitle = isEditMode ? '编辑数据资产' : '创建数据资产';
  const step1Title = isEditMode ? '编辑元数据字段' : '设置元数据字段';
  const step2Title = isEditMode ? '编辑字段映射' : '设置字段映射';

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
              <Steps.Step title={step1Title} />
              <Steps.Step title={step2Title} />
            </Steps>
          </div>

          {/* 表单内容 */}
          <div className="w-full">
            {currentStep === 0 && (
              <Step1MetadataFields
                metadataFields={metadataFields}
                setMetadataFields={setMetadataFields}
                dataSources={dataSources}
                setDataSources={setDataSources}
                findDataAssetMappingData={findDataAssetMappingData}
                onCancel={handleCancel}
                onNext={handleNext}
              />
            )}

            {currentStep === 1 && (
              <Step2FieldMapping
                mappings={mappings}
                setMappings={setMappings}
                autoMapping={autoMapping}
                setAutoMapping={setAutoMapping}
                metadataFields={metadataFields}
                dataSources={dataSources}
                findDataAssetMappingData={findDataAssetMappingData}
                onCancel={handleCancel}
                onPrev={handlePrev}
                onFinish={handleFinish}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
