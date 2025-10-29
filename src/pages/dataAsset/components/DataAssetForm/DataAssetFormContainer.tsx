import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Steps, Message } from '@arco-design/web-react';
import { getDataAssetDetail } from '@/api/dataAsset';
import Step1MetadataFields from './Step1MetadataFields';
import Step2FieldMapping from './Step2FieldMapping';
import { DataAssetField } from '@/types/dataAssetApi';

interface DataAssetFormContainerProps {
  isEditMode?: boolean;
  id?: string;
}

// 第一步的字段定义
export interface MetadataField extends DataAssetField {
  id: string;
}

// 第二步的映射定义
export interface FieldMapping {
  id: string;
  sequence: number;
  assetName: string;
  dataset: string;
  volume: string;
  database: string;
  metadataDir: string;
}

// 数据来源类型
export interface DataSource {
  dataset: boolean;
  volume: boolean;
  database: boolean;
  metadataDir: boolean;
}

export default function DataAssetFormContainer({
  isEditMode = false,
  id
}: DataAssetFormContainerProps) {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // 表单数据 - 默认包含一个字段
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([
    {
      id: `field_${Date.now()}`,
      nameZh: '',
      nameEn: '',
      type: undefined,
      default: 'null',
      required: true,
      allowModify: true
    }
  ]);
  const [dataSources, setDataSources] = useState<DataSource>({
    dataset: true,
    volume: false,
    database: false,
    metadataDir: false
  });
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [autoMapping, setAutoMapping] = useState(true);

  // 获取编辑数据
  const fetchEditData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await getDataAssetDetail(id);

      if (res.code === '' && res.status === 200) {
        const data = res.data;

        // 设置元数据字段
        if (data.metadataFields) {
          setMetadataFields(data.metadataFields);
        }

        // 设置数据来源
        if (data.dataSources) {
          setDataSources(data.dataSources);
        }

        // 设置字段映射
        if (data.mappings) {
          setMappings(data.mappings);
        }

        // 设置自动映射
        if (data.autoMapping !== undefined) {
          setAutoMapping(data.autoMapping);
        }
      }
    } catch (error) {
      console.error('获取数据资产详情失败:', error);
      Message.error('获取数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取编辑数据
  useEffect(() => {
    if (isEditMode && id) {
      fetchEditData();
    }
  }, [isEditMode, id]);

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
  const handleFinish = () => {
    // TODO: 调用创建或更新API
    console.log('提交数据:', {
      metadataFields,
      dataSources,
      mappings,
      autoMapping
    });
    // Message.success(isEditMode ? '更新成功' : '创建成功');
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
