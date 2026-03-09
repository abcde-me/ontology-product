import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button, Spin } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData,
  ObjectTypeFormRef
} from './components/ObjectTypeForm';
import {
  getOntologyObjectTypeDetail,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import { SourceType } from '@/types/objectType';
import { DATA_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';

export default function OntologySceneObjectTypeEdit() {
  const history = useHistory();
  const { id: OSId, objectTypeId } = useParams<{
    id: string;
    objectTypeId: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<Partial<ObjectTypeFormData>>();
  const formRef = useRef<ObjectTypeFormRef>(null);

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
          _dataSource: {
            type: dataSourceType,
            database:
              dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
                ? objectType.originalDbName
                : undefined,
            table:
              dataSourceType === DATA_SOURCE_TYPE.DATA_DIRECTORY_SYNC
                ? objectType.originalTableName
                : undefined
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
      // 构建更新请求参数
      const updateParams = {
        id: objectTypeIdNum,
        code: data.code,
        name: data.name,
        description: data.description,
        icon: data.icon,
        ontologyModelID: data.ontologyModelID,
        filePath: data.filePath,
        originalDbName: data.originalDbName,
        originalTableName: data.originalTableName,
        sourceType: data.sourceType,
        ontologyPhysicalPropertiesList: data.ontologyPhysicalPropertiesList,
        isReUpload: data.isReUpload ? 1 : 0
      };

      const res = await updateOntologyObjectType(updateParams);

      if (res.status !== 200) {
        Message.error(res.message || '更新失败，请重试');
        return;
      }

      Message.success('更新成功');
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/list`
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
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/list`
    );
  };

  return (
    <>
      {initialValues ? (
        <div className="flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
          <div className="border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[30px] text-[var(--color-text-1)]">
            编辑对象类型
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="overflow-y-auto">
              {initialValues && (
                <ObjectTypeForm
                  ref={formRef}
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={loading}
                  showFooter={false}
                />
              )}
            </div>
            {/* 底部操作按钮 - 使用sticky */}
            <div className="sticky bottom-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
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
