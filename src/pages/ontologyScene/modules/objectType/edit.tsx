import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Message, Button, Spin } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData
} from './components/ObjectTypeForm';
import {
  getOntologyObjectTypeDetail,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import { buildUpdateObjectTypeRequest } from './components/ObjectTypeFormHooks/useObjectTypeSubmit';
import { SourceType } from '@/types/objectType';
import { DATA_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';

import { IconLeft } from '@arco-design/web-react/icon';

const DEFAULT_SYNC_SOURCE_DATA_STRATEGY = {
  mode: 'BINLOG_CDC',
  conflictStrategy: 'KEEP_SOURCE',
  syncScope: 'FULL_THEN_INCREMENTAL',
  pollFetchSize: 500,
  parallelism: 1,
  exceptionStrategy: 'STOP_ON_ERROR',
  jdbcPollingIntervalSeconds: 60
};

const getInitialStepFromSearch = (search: string) => {
  const step = new URLSearchParams(search).get('step');
  const parsedStep = step ? Number(step) : NaN;

  if (!Number.isInteger(parsedStep) || parsedStep < 1 || parsedStep > 3) {
    return undefined;
  }

  return parsedStep - 1;
};

export default function OntologySceneObjectTypeEdit() {
  const history = useHistory();
  const location = useLocation();
  const { id: OSId, objectTypeId } = useParams<{
    id: string;
    objectTypeId: string;
  }>();
  const initialStep = getInitialStepFromSearch(location.search);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<Partial<ObjectTypeFormData>>();

  useEffect(() => {
    const loadData = async () => {
      if (!objectTypeId) {
        Message.error('对象类型ID不能为空');
        return;
      }

      setLoading(true);
      try {
        const objectTypeIdNum = parseInt(objectTypeId, 10);
        if (isNaN(objectTypeIdNum)) {
          Message.error('无效的对象类型ID');
          return;
        }

        // 获取对象类型详情
        const detailRes = await getOntologyObjectTypeDetail({
          id: objectTypeIdNum
        });

        if (detailRes.status !== 200 || !detailRes.data) {
          Message.error('获取对象类型详情失败');
          return;
        }

        const objectType = detailRes.data;

        // 根据 sourceType 确定数据源类型
        const dataSourceType =
          objectType.sourceType === SourceType.FILE_UPLOAD
            ? DATA_SOURCE_TYPE.LOCAL_CSV
            : DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC;

        // 转换为表单数据格式
        const formData: Partial<ObjectTypeFormData> = {
          code: objectType.code || '',
          name: objectType.name || '',
          description: objectType.description,
          icon: objectType.icon || '',
          ontologyModelID: objectType.ontologyModelID || 0,
          filePath: objectType.filePath,
          originalDbName: objectType.originalDbName || '',
          originalTableName: objectType.originalTableName || '',
          sourceType: objectType.sourceType,
          ontologyPhysicalPropertiesList:
            objectType.ontologyPhysicalPropertiesList || [],
          sourceDataInfo: objectType.sourceDataInfo
            ? {
                connectorId: objectType.sourceDataInfo.connectorId,
                databaseName: objectType.sourceDataInfo.databaseName,
                tableName: objectType.sourceDataInfo.tableName,
                queryMode:
                  objectType.sourceDataInfo.queryMode === 'sql'
                    ? 'sql'
                    : 'selected',
                sql: objectType.sourceDataInfo.sql
              }
            : undefined,
          enableSyncSourceData: objectType.enableSyncSourceData,
          syncSourceDataStrategy: objectType.syncSourceDataStrategy
            ? {
                sourceDataInfo: {
                  connectorId:
                    objectType.syncSourceDataStrategy.sourceDataInfo
                      ?.connectorId,
                  databaseName:
                    objectType.syncSourceDataStrategy.sourceDataInfo
                      ?.databaseName,
                  tableName:
                    objectType.syncSourceDataStrategy.sourceDataInfo?.tableName,
                  queryMode:
                    objectType.syncSourceDataStrategy.sourceDataInfo
                      ?.queryMode === 'sql'
                      ? 'sql'
                      : 'selected',
                  sql: objectType.syncSourceDataStrategy.sourceDataInfo?.sql
                },
                mode:
                  objectType.syncSourceDataStrategy.mode ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.mode ||
                  '',
                conflictStrategy:
                  objectType.syncSourceDataStrategy.conflictStrategy ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.conflictStrategy ||
                  '',
                syncScope:
                  objectType.syncSourceDataStrategy.syncScope ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.syncScope ||
                  '',
                pollFetchSize:
                  objectType.syncSourceDataStrategy.pollFetchSize ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.pollFetchSize ||
                  0,
                parallelism:
                  objectType.syncSourceDataStrategy.parallelism ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.parallelism ||
                  1,
                exceptionStrategy:
                  objectType.syncSourceDataStrategy.exceptionStrategy ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.exceptionStrategy ||
                  '',
                jdbcCheckpointField:
                  objectType.syncSourceDataStrategy.jdbcCheckpointField,
                jdbcIncrementalTimeField:
                  objectType.syncSourceDataStrategy.jdbcIncrementalTimeField,
                jdbcPollingIntervalSeconds:
                  objectType.syncSourceDataStrategy
                    .jdbcPollingIntervalSeconds ||
                  DEFAULT_SYNC_SOURCE_DATA_STRATEGY.jdbcPollingIntervalSeconds,
                jdbcSyncSqlFull:
                  objectType.syncSourceDataStrategy.jdbcSyncSqlFull,
                jdbcSyncSqlIncrement:
                  objectType.syncSourceDataStrategy.jdbcSyncSqlIncrement
              }
            : undefined,
          _dataSource: {
            type: dataSourceType,
            connectorId: objectType.sourceDataInfo?.connectorId,
            database:
              dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
                ? objectType.sourceDataInfo?.databaseName ||
                  objectType.originalDbName
                : undefined,
            table:
              dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
                ? objectType.sourceDataInfo?.tableName ||
                  objectType.originalTableName
                : undefined,
            queryMode:
              objectType.sourceDataInfo?.queryMode === 'sql'
                ? 'sql'
                : 'selected',
            sql: objectType.sourceDataInfo?.sql
          }
        };

        setInitialValues(formData);
      } catch (error) {
        console.error('加载数据失败:', error);
        Message.error('加载数据失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [objectTypeId]);

  const handleSubmit = async (data: ObjectTypeFormData) => {
    if (!objectTypeId) {
      Message.error('对象类型ID不能为空');
      return;
    }

    const objectTypeIdNum = parseInt(objectTypeId, 10);
    if (isNaN(objectTypeIdNum)) {
      Message.error('无效的对象类型ID');
      return;
    }

    setLoading(true);
    try {
      const res = await updateOntologyObjectType(
        buildUpdateObjectTypeRequest(objectTypeIdNum, data)
      );

      if (res.status !== 200) {
        Message.error(res.message || '更新失败，请重试');
        return;
      }

      Message.success('更新成功');
      history.push(
        `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/list`
      );
    } catch (error) {
      console.error('更新失败:', error);
      Message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/list`
    );
  };

  const goBack = () => {
    history.replace(
      `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/list`
    );
  };

  return (
    <>
      {initialValues ? (
        <div className="relative flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
          <div className="flex items-center gap-[16px] border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[32px] text-[var(--color-text-1)]">
            <Button
              icon={<IconLeft />}
              size={'default'}
              type={'default'}
              onClick={goBack}
            />
            编辑对象类型
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="overflow-y-auto pb-[65px]">
              {initialValues && (
                <ObjectTypeForm
                  isEdit={true}
                  initialValues={initialValues}
                  initialStep={initialStep}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={loading}
                />
              )}
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
