import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Button, Message, Spin } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import ObjectTypeForm, {
  ObjectTypeFormData
} from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeForm';
import {
  getOntologyObjectTypeDetail,
  syncObjectTypeTask,
  updateOntologyObjectType
} from '@/api/ontologySceneLibrary/objectType';
import { buildUpdateObjectTypeRequest } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormHooks/useObjectTypeSubmit';
import { mapObjectTypeDetailToFormData } from '@/pages/ontologyScene/modules/objectType/mapObjectTypeDetailToFormData';
import { DATA_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { invalidateObjectTypeQueryCache } from '@/pages/exploreAnalysis/ontologyQuery/services/objectTypeQuery';
import { ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH } from '../constants';
import formStyles from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeForm.module.scss';

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

export default function OntologyElementsObjectTypeEdit() {
  const history = useHistory();
  const location = useLocation();
  const { objectTypeId } = useParams<{ objectTypeId: string }>();
  const initialStep = getInitialStepFromSearch(location.search);
  const allowInstanceSyncEdit =
    getInitialStepFromSearch(location.search) === INSTANCE_SYNC_STEP_INDEX;
  const enteredForInstanceSyncRef = useRef(allowInstanceSyncEdit);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [initialValues, setInitialValues] =
    useState<Partial<ObjectTypeFormData>>();
  const [formStep, setFormStep] = useState(() => initialStep ?? 0);
  const formStepRef = useRef(formStep);

  useEffect(() => {
    const loadData = async () => {
      if (!objectTypeId) {
        Message.error('对象类型ID不能为空');
        setPageLoading(false);
        return;
      }

      const objectTypeIdNum = parseInt(objectTypeId, 10);
      if (Number.isNaN(objectTypeIdNum)) {
        Message.error('无效的对象类型ID');
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      try {
        const detailRes = await getOntologyObjectTypeDetail({
          id: objectTypeIdNum
        });

        if (detailRes.status !== 200 || !detailRes.data) {
          Message.error('获取对象类型详情失败');
          return;
        }

        setInitialValues(mapObjectTypeDetailToFormData(detailRes.data));
      } catch (error) {
        console.error('加载对象类型详情失败:', error);
        Message.error('加载对象类型详情失败');
      } finally {
        setPageLoading(false);
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
    if (Number.isNaN(objectTypeIdNum)) {
      Message.error('无效的对象类型ID');
      return;
    }

    setLoading(true);
    try {
      const isModelingOnlySource =
        data._dataSource?.type === DATA_SOURCE_TYPE.LOCAL_CSV ||
        data._dataSource?.type === DATA_SOURCE_TYPE.DATA_RESOURCE;
      const submitData =
        enteredForInstanceSyncRef.current || isModelingOnlySource
          ? data
          : { ...data, enableSyncSourceData: false };

      const res = await updateOntologyObjectType(
        buildUpdateObjectTypeRequest(objectTypeIdNum, submitData)
      );

      if (res.status !== 200) {
        Message.error(res.message || '更新失败，请重试');
        return;
      }

      if (submitData.enableSyncSourceData) {
        const syncRes = await syncObjectTypeTask({ id: objectTypeIdNum });
        if (!isOntologyApiSuccess(syncRes)) {
          Message.warning(
            syncRes.message ||
              '同步配置已保存，但触发实例同步任务失败，请在列表中重试'
          );
        } else {
          Message.success('更新成功，已触发实例同步');
        }
      } else {
        Message.success('更新成功');
      }

      invalidateObjectTypeQueryCache();
      history.push(ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH);
    } catch (error) {
      console.error('更新失败:', error);
      Message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    history.replace(ONTOLOGY_ELEMENTS_OBJECT_TYPE_LIST_PATH);
  };

  const refetchDetailAfterStepChange = useCallback(
    async (_stepIndex: number) => {
      if (!objectTypeId) {
        return;
      }

      const objectTypeIdNum = parseInt(objectTypeId, 10);
      if (Number.isNaN(objectTypeIdNum)) {
        return;
      }

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

  const handleFormStepChange = useCallback(
    async (nextStep: number) => {
      const prevStep = formStepRef.current;
      formStepRef.current = nextStep;
      setFormStep(nextStep);
      if (nextStep < prevStep) {
        return;
      }
      await refetchDetailAfterStepChange(nextStep);
    },
    [refetchDetailAfterStepChange]
  );

  if (pageLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-white">
        <Spin tip="加载对象类型..." />
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full flex-col items-center justify-center gap-3 bg-white">
        <div className="text-[var(--color-text-2)]">未找到对象类型</div>
        <Button type="primary" onClick={goBack}>
          返回列表
        </Button>
      </div>
    );
  }

  const isModelingOnlySource =
    initialValues._dataSource?.type === DATA_SOURCE_TYPE.LOCAL_CSV ||
    initialValues._dataSource?.type === DATA_SOURCE_TYPE.DATA_RESOURCE;
  const twoStepOnly =
    isModelingOnlySource && !enteredForInstanceSyncRef.current;

  return (
    <div className="relative flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden bg-white">
      <div className={formStyles['object-type-form-page-header']}>
        <Button
          icon={<IconLeft />}
          size="small"
          type="default"
          onClick={goBack}
        />
        {allowInstanceSyncEdit ? '实例同步' : '编辑对象类型'}
      </div>

      <div className={formStyles['object-type-form-shell']}>
        <ObjectTypeForm
          isEdit
          initialValues={initialValues}
          initialStep={initialStep}
          step={formStep}
          allowInstanceSyncEdit={allowInstanceSyncEdit}
          onSubmit={handleSubmit}
          onCancel={goBack}
          onStepChange={handleFormStepChange}
          loading={loading}
          twoStepOnly={twoStepOnly}
        />
      </div>
    </div>
  );
}
