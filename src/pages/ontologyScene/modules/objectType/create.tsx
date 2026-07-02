import React, { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData
} from './components/ObjectTypeForm';
import { createOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { buildCreateObjectTypeRequest } from './components/ObjectTypeFormHooks/useObjectTypeSubmit';
import { IconLeft } from '@arco-design/web-react/icon';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { isDevBypassEnabled } from '@/utils/devFallback';
import formStyles from './components/ObjectTypeForm.module.scss';

export default function OntologySceneObjectTypeCreate() {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const ontologyModelID = Number(OSId);
  const initialValues = useMemo(
    () => ({
      ontologyModelID
    }),
    [ontologyModelID]
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ObjectTypeFormData) => {
    setLoading(true);
    try {
      const response = await createOntologyObjectType(
        buildCreateObjectTypeRequest({
          ...data,
          ontologyModelID
        })
      );

      if (isOntologyApiSuccess(response)) {
        Message.success(
          isDevBypassEnabled() ? '创建成功（已保存到本地开发缓存）' : '创建成功'
        );
        history.push(
          `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/list`
        );
      } else {
        Message.error(response.message || '创建失败，请重试');
      }
    } catch (error) {
      const message =
        typeof error === 'string' && error.trim() ? error : '创建失败，请重试';
      Message.error(message);
      console.error('创建对象类型失败:', error);
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
    <div className="relative flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden bg-[#fff]">
      <div className={formStyles['object-type-form-page-header']}>
        <Button
          icon={<IconLeft />}
          size="small"
          type="default"
          onClick={goBack}
        />
        创建对象类型
      </div>

      <div className={formStyles['object-type-form-shell']}>
        <ObjectTypeForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          twoStepOnly
        />
      </div>
    </div>
  );
}
