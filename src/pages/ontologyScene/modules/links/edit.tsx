import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button, Spin } from '@arco-design/web-react';
import LinkForm, { LinkFormData, LinkFormRef } from './components/LinkForm';
import {
  getOntologyLinkType,
  updateOntologyLinkType
} from '@/api/ontologySceneLibrary/links';
import { LinkType } from '@/types/graphApi';
import {
  GetOntologyLinkTypeRes,
  UpdateOntologyLinkTypeReq,
  OntologyLinkTypeColumn
} from '@/types/links';
import { LinkType as FormLinkType } from '../../types/link';
import { listOntologyPhysicalProperties } from '@/api/ontologySceneLibrary/graph';
import { ProButton } from '@ceai-front/arco-material';
import { IconLeft } from '@arco-design/web-react/icon';

export default function OntologySceneLinksEdit() {
  const history = useHistory();
  const { id: OSId, linkId } = useParams<{
    id: string;
    linkId: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialValues, setInitialValues] = useState<Partial<LinkFormData>>();
  const formRef = useRef<LinkFormRef>(null);

  // 将 API 的 LinkType 转换为表单的 LinkType
  const getFormLinkType = (apiType?: number): FormLinkType => {
    const typeMap: Record<number, FormLinkType> = {
      [LinkType.ONE_TO_ONE]: FormLinkType.ONE_TO_ONE,
      [LinkType.ONE_TO_MANY]: FormLinkType.ONE_TO_MANY,
      [LinkType.MANY_TO_MANY]: FormLinkType.MANY_TO_MANY
    };
    return typeMap[apiType || LinkType.ONE_TO_ONE] || FormLinkType.ONE_TO_ONE;
  };

  // 将表单的 LinkType 转换为 API 的 LinkType
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
  ): UpdateOntologyLinkTypeReq['sourceDataInfo'] => {
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
  ): UpdateOntologyLinkTypeReq['syncSourceDataStrategy'] => {
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

  useEffect(() => {
    const loadData = async () => {
      if (!linkId) {
        Message.error('缺少链接ID');
        setFetching(false);
        return;
      }

      setFetching(true);
      try {
        const response = await getOntologyLinkType({ id: Number(linkId) });
        if (response.status === 200 && response.code === '' && response.data) {
          const data: GetOntologyLinkTypeRes = response.data;

          // 直接使用接口返回的字段名，转换为表单格式
          const formData: Partial<LinkFormData> = {
            name: data.name,
            id: data.code,
            linkType: getFormLinkType(data.type),
            sourceObjectType: data.sourceObjectTypeID,
            targetObjectType: data.targetObjectTypeID
          };

          // 处理目标对象属性（1:1 和 1:N 类型）
          // 优先使用接口直接返回的目标属性名称（避免只拿到 ID 导致回显/提交不一致）
          if (data.linkTargetColumnName) {
            formData.targetObjectAttribute = data.linkTargetColumnName;
          } else if (data.targetPropertyID) {
            formData.targetObjectAttribute = String(data.targetPropertyID);
          }

          // 处理 N:N 类型的中间表
          if (data.type === LinkType.MANY_TO_MANY) {
            const detailSourceDataInfo =
              data.syncSourceDataStrategy?.sourceDataInfo ||
              data.sourceDataInfo ||
              (data.sourceType === 1
                ? {
                    databaseName: data.linkDBName,
                    tableName: data.linkTableName,
                    queryMode: 'selected'
                  }
                : undefined);
            const intermediateTable: any = {
              type: data.sourceType === 1 ? 'data_lake_sync' : 'local_csv',
              sourceDataInfo: detailSourceDataInfo,
              queryMode:
                detailSourceDataInfo?.queryMode === 'sql' ? 'sql' : 'selected',
              sql: detailSourceDataInfo?.sql
            };

            if (data.sourceType === 1) {
              intermediateTable.database =
                detailSourceDataInfo?.databaseName || data.linkDBName;
              intermediateTable.table =
                detailSourceDataInfo?.tableName || data.linkTableName;
            } else if (data.sourceType === 2) {
              intermediateTable.filePath = data.filePath;
            }

            formData.intermediateTable = intermediateTable;
            if (data.sourceType === 1) {
              formData.syncSourceDataStrategy = {
                sourceDataInfo: {
                  ...detailSourceDataInfo,
                  queryMode:
                    detailSourceDataInfo?.queryMode === 'sql'
                      ? 'sql'
                      : 'selected'
                },
                mode: data.syncSourceDataStrategy?.mode || 'BINLOG_CDC',
                conflictStrategy:
                  data.syncSourceDataStrategy?.conflictStrategy ||
                  'KEEP_SOURCE',
                syncScope:
                  data.syncSourceDataStrategy?.syncScope ||
                  'FULL_THEN_INCREMENTAL',
                pollFetchSize:
                  data.syncSourceDataStrategy?.pollFetchSize || 500,
                fullSyncBatchSize:
                  data.syncSourceDataStrategy?.fullSyncBatchSize ??
                  data.syncSourceDataStrategy?.pollFetchSize ??
                  500,
                parallelism: data.syncSourceDataStrategy?.parallelism || 1,
                exceptionStrategy:
                  data.syncSourceDataStrategy?.exceptionStrategy ||
                  'STOP_ON_ERROR',
                jdbcCheckpointField:
                  data.syncSourceDataStrategy?.jdbcCheckpointField,
                jdbcIncrementalTimeField:
                  data.syncSourceDataStrategy?.jdbcIncrementalTimeField,
                jdbcPollingIntervalSeconds:
                  data.syncSourceDataStrategy?.jdbcPollingIntervalSeconds || 60,
                jdbcSyncSqlFull: data.syncSourceDataStrategy?.jdbcSyncSqlFull,
                jdbcSyncSqlIncrement:
                  data.syncSourceDataStrategy?.jdbcSyncSqlIncrement
              };
            }

            // 处理源属性和目标属性 - 直接使用接口字段名
            if (data.linkSourceColumnName) {
              formData.sourceAttribute = data.linkSourceColumnName;
            }
            if (data.linkTargetColumnName) {
              formData.targetAttribute = data.linkTargetColumnName;
            }

            // 处理属性字段映射 - 直接使用接口字段名
            if (
              data.ontologyLinkTypeColumnList &&
              data.ontologyLinkTypeColumnList.length > 0
            ) {
              formData.attributeFields = data.ontologyLinkTypeColumnList.map(
                (column) => ({
                  tableField: column.name || '',
                  isUse: column.isUse ? 1 : 0,
                  attributeName: column.comment || column.name || '',
                  fieldType: column.columnType || 'STRING',
                  isPrimary: column.isPrimary === 1
                })
              );
            }
          }

          setInitialValues(formData);
        } else {
          Message.error(response.message || '加载数据失败');
        }
      } catch (error: any) {
        console.error('Load link data error:', error);
        Message.error(error?.message || '加载数据失败');
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [linkId]);

  const handleSubmit = async (data: LinkFormData) => {
    setLoading(true);
    try {
      const ontologyModelID = OSId ? Number(OSId) : undefined;
      if (!ontologyModelID) {
        Message.error('缺少本体模型ID');
        return;
      }

      if (!linkId) {
        Message.error('缺少链接ID');
        return;
      }

      // 使用接口定义的类型
      const requestData: UpdateOntologyLinkTypeReq = {
        id: Number(linkId),
        code: data.id,
        name: data.name,
        type: getApiLinkType(data.linkType),
        ontologyModelID,
        sourceObjectTypeID: data.sourceObjectType,
        targetObjectTypeID: data.targetObjectType
      };

      // N:N 仅改名称时 data 由 initialValues 与表单 name 合并，仍走下列分支以生成完整更新请求体
      // 如果是 N:N 类型，需要处理中间表相关字段
      if (
        data.linkType === FormLinkType.MANY_TO_MANY &&
        data.intermediateTable
      ) {
        if (data.intermediateTable.type === 'local_csv') {
          requestData.sourceType = 2; // 文件上传
          requestData.filePath = data.intermediateTable.filePath;
          requestData.isReUpload = data.isReUpload ? 1 : 0;
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
          requestData.isReUpload = 0;
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
              isUse: field.isUse ? 1 : 0,
              linkTypeID: Number(linkId)
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
          requestData.linkTargetColumnName = data.targetObjectAttribute;
          if (data.linkSourceColumnName) {
            requestData.linkSourceColumnName = data.linkSourceColumnName;
          }
        }
      }

      const response = await updateOntologyLinkType(requestData);
      if (response.status === 200 && response.code === '') {
        Message.success('更新成功');
        history.push(
          `/tenant/compute/onto/ontologyScene/detail/${OSId}/links/list`
        );
      } else {
        Message.error(response.message || '更新失败，请重试');
      }
    } catch (error: any) {
      console.error('Update link error:', error);
      Message.error(error?.message || '更新失败，请重试');
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
    <>
      {!fetching && initialValues ? (
        <div className="flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
          <div className="flex items-center gap-[16px] border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[32px] text-[var(--color-text-1)]">
            <Button
              icon={<IconLeft />}
              size={'default'}
              type={'default'}
              onClick={goBack}
            />
            编辑链接
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="overflow-y-auto pb-[65px]">
              <LinkForm
                ref={formRef}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
                showFooter={false}
                restrictManyToManyEditToNameOnly={
                  initialValues?.linkType === FormLinkType.MANY_TO_MANY
                }
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
      ) : (
        <div className="mt-[200px] flex justify-center">
          <Spin />
        </div>
      )}
    </>
  );
}
