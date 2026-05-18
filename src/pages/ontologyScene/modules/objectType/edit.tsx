import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { mapObjectTypeDetailToFormData } from './mapObjectTypeDetailToFormData';

import { IconLeft } from '@arco-design/web-react/icon';

const getInitialStepFromSearch = (search: string) => {
  const step = new URLSearchParams(search).get('step');
  const parsedStep = step ? Number(step) : NaN;

  if (!Number.isInteger(parsedStep) || parsedStep < 1 || parsedStep > 3) {
    return undefined;
  }

  return parsedStep - 1;
};

/** 实例同步为第 3 步，对应 initialStep === 2 */
const INSTANCE_SYNC_STEP_INDEX = 2;

export default function OntologySceneObjectTypeEdit() {
  const history = useHistory();
  const location = useLocation();
  const { id: OSId, objectTypeId } = useParams<{
    id: string;
    objectTypeId: string;
  }>();
  const initialStep = getInitialStepFromSearch(location.search);
  /** 进入时是否为「配置实例同步」（?step=3），固化后不受页内切步影响 */
  const enteredForInstanceSyncRef = useRef(
    getInitialStepFromSearch(location.search) === INSTANCE_SYNC_STEP_INDEX
  );
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

        setInitialValues(mapObjectTypeDetailToFormData(detailRes.data));
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
      const submitData = enteredForInstanceSyncRef.current
        ? data
        : { ...data, enableSyncSourceData: false };

      const res = await updateOntologyObjectType(
        buildUpdateObjectTypeRequest(objectTypeIdNum, submitData)
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

  /** 分步切换后重新拉取详情，用服务端数据覆盖本地，避免回显与 Form 状态不对 */
  const refetchDetailAfterStepChange = useCallback(
    async (_stepIndex: number) => {
      if (!objectTypeId) return;
      const objectTypeIdNum = parseInt(objectTypeId, 10);
      if (isNaN(objectTypeIdNum)) return;
      try {
        const detailRes = await getOntologyObjectTypeDetail({
          id: objectTypeIdNum
        });
        if (detailRes.status === 200 && detailRes.data) {
          setInitialValues(mapObjectTypeDetailToFormData(detailRes.data));
        }
      } catch (error) {
        console.error('刷新对象类型详情失败', error);
      }
    },
    [objectTypeId]
  );

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
                  onStepChange={refetchDetailAfterStepChange}
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
