import React, { useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import LinkForm, { LinkFormData, LinkFormRef } from './components/LinkForm';
import { createOntologyLinkType } from '@/api/ontologySceneLibrary/links';
import { LinkType } from '@/types/graphApi';
import {
  CreateOntologyLinkTypeReq,
  OntologyLinkTypeColumn
} from '@/types/links';
import { LinkType as FormLinkType } from '../../types/link';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { ProButton } from '@ceai-front/arco-material';
import { IconLeft } from '@arco-design/web-react/icon';

export default function OntologySceneLinksCreate() {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<LinkFormRef>(null);

  // 根据属性ID获取属性名称
  const getAttributeNameById = async (
    attributeId: string,
    objectTypeId: number,
    ontologyModelID: number
  ): Promise<string | undefined> => {
    try {
      const attrId = Number(attributeId);
      if (isNaN(attrId)) {
        return attributeId;
      }

      const response = await listOntologyPhysicalProperties({
        objectTypeIdList: [objectTypeId],
        ontologyModelID,
        pageNo: 1,
        pageSize: 1000,
        isUse: 1
      });

      if (response.status === 200 && response.data?.result) {
        const attribute = response.data.result.find(
          (item) => item.id === attrId
        );
        return attribute?.name || attribute?.tableField || attributeId;
      }
      return attributeId;
    } catch (error) {
      console.error('Get attribute name error:', error);
      return attributeId;
    }
  };

  // 将表单 LinkType 转换为 API LinkType
  const getApiLinkType = (formType: FormLinkType): number => {
    const typeMap: Record<FormLinkType, number> = {
      [FormLinkType.ONE_TO_ONE]: LinkType.ONE_TO_ONE,
      [FormLinkType.ONE_TO_MANY]: LinkType.ONE_TO_MANY,
      [FormLinkType.MANY_TO_MANY]: LinkType.MANY_TO_MANY
    };
    return typeMap[formType] || LinkType.ONE_TO_ONE;
  };

  const buildSourceDataInfo = (
    source?: NonNullable<
      LinkFormData['syncSourceDataStrategy']
    >['sourceDataInfo']
  ): CreateOntologyLinkTypeReq['sourceDataInfo'] => {
    if (!source?.connectorId) return undefined;
    return {
      connectorId: source.connectorId,
      databaseName: source.databaseName,
      tableName: source.tableName,
      queryMode: source.queryMode || 'selected',
      sql: source.sql
    };
  };

  const buildSyncSourceDataStrategy = (
    strategy?: LinkFormData['syncSourceDataStrategy']
  ): CreateOntologyLinkTypeReq['syncSourceDataStrategy'] => {
    if (!strategy) return undefined;
    const sourceDataInfo = buildSourceDataInfo(strategy.sourceDataInfo);
    if (!sourceDataInfo) return undefined;
    return {
      mode: strategy.mode,
      conflictStrategy: strategy.conflictStrategy,
      syncScope: strategy.syncScope,
      pollFetchSize: strategy.pollFetchSize,
      parallelism: strategy.parallelism || 1,
      exceptionStrategy: strategy.exceptionStrategy,
      jdbcCheckpointField: strategy.jdbcCheckpointField,
      jdbcIncrementalTimeField: strategy.jdbcIncrementalTimeField,
      jdbcPollingIntervalSeconds: strategy.jdbcPollingIntervalSeconds,
      jdbcSyncSqlFull: strategy.jdbcSyncSqlFull,
      jdbcSyncSqlIncrement: strategy.jdbcSyncSqlIncrement,
      sourceDataInfo
    };
  };

  const handleSubmit = async (data: LinkFormData) => {
    setLoading(true);
    try {
      const ontologyModelID = OSId ? Number(OSId) : undefined;
      if (!ontologyModelID) {
        Message.error('缺少本体模型ID');
        return;
      }

      // 使用接口定义的类型
      const requestData: CreateOntologyLinkTypeReq = {
        code: data.id,
        name: data.name,
        type: getApiLinkType(data.linkType),
        ontologyModelID,
        sourceObjectTypeID: data.sourceObjectType,
        targetObjectTypeID: data.targetObjectType
      };

      // 如果是 N:N 类型，需要处理中间表相关字段
      if (
        data.linkType === FormLinkType.MANY_TO_MANY &&
        data.intermediateTable
      ) {
        if (data.intermediateTable.type === 'local_csv') {
          requestData.sourceType = 2; // 文件上传
          requestData.filePath = data.intermediateTable.filePath;
        } else if (data.intermediateTable.type === 'data_lake_sync') {
          const sourceDataInfo = buildSourceDataInfo(
            data.syncSourceDataStrategy?.sourceDataInfo ||
              data.intermediateTable.sourceDataInfo
          );
          requestData.sourceType = 1; // 来自iceberg
          requestData.linkDbName =
            sourceDataInfo?.databaseName || data.intermediateTable.database;
          requestData.linkTableName =
            sourceDataInfo?.tableName || data.intermediateTable.table;
          requestData.enableSyncSourceData = true;
          requestData.sourceDataInfo = sourceDataInfo;
          requestData.syncSourceDataStrategy = buildSyncSourceDataStrategy(
            data.syncSourceDataStrategy
          );
        }

        // 处理属性字段映射
        if (data.attributeFields && data.attributeFields.length > 0) {
          requestData.ontologyLinkTypeColumnList = data.attributeFields.map(
            (field): OntologyLinkTypeColumn => ({
              name: field.tableField,
              comment: field.attributeName,
              columnType: field.fieldType,
              isPrimary: field.isPrimary ? 1 : 0,
              isUse: field.isUse ? 1 : 0
              // linkTypeID: field.tableField // 创建时不需要
            })
          );
        }

        // 处理源属性和目标属性
        if (data.sourceAttribute && data.sourceObjectType) {
          requestData.linkSourceColumnName = data.sourceAttribute;
        }
        if (data.targetAttribute && data.targetObjectType) {
          requestData.linkTargetColumnName = data.targetAttribute;
        }
      } else {
        // 1:1 和 1:N 类型，处理目标对象属性
        if (data.linkTargetColumnName) {
          requestData.linkTargetColumnName = data.linkTargetColumnName;
          if (data.linkSourceColumnName) {
            requestData.linkSourceColumnName = data.linkSourceColumnName;
          }
        } else if (data.targetObjectAttribute && data.targetObjectType) {
          if (data.linkSourceColumnName) {
            requestData.linkSourceColumnName = data.linkSourceColumnName;
          }
          const targetAttrName = await getAttributeNameById(
            data.targetObjectAttribute,
            data.targetObjectType,
            ontologyModelID
          );
          if (targetAttrName) {
            requestData.linkTargetColumnName = targetAttrName;
          }
        }
      }

      const response = await createOntologyLinkType(requestData);
      if (response.status === 200 && response.code === '') {
        Message.success('创建成功');
        history.push(
          `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/list`
        );
      } else {
        Message.error(response.message || '创建失败，请重试');
      }
    } catch (error: any) {
      console.error('Create link error:', error);
      Message.error(error?.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/list`
    );
  };

  const goBack = () => {
    history.replace(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/list`
    );
  };

  return (
    <div className="relative flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
      <div className="flex items-center gap-[16px] border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[32px] text-[var(--color-text-1)]">
        <Button
          icon={<IconLeft />}
          size={'default'}
          type={'default'}
          onClick={goBack}
        />
        创建链接
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="overflow-y-auto pb-[65px]">
          <LinkForm
            ref={formRef}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            showFooter={false}
          />
        </div>
        {/* 底部操作按钮 - 使用sticky */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
          <div className="flex justify-start gap-[8px]">
            <Button
              type="primary"
              onClick={() => {
                formRef.current?.submit();
              }}
              loading={loading}
            >
              确定
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
