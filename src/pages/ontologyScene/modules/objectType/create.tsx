import React, { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData
} from './components/ObjectTypeForm';
import { createOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { buildCreateObjectTypeRequest } from './components/ObjectTypeFormHooks/useObjectTypeSubmit';
import { IconLeft } from '@arco-design/web-react/icon';

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

      if (response.status === 200 && response.code === '') {
        Message.success('创建成功');
        history.push(
          `/tenant/compute/onto/ontologyScene/detail/${OSId}/objectType/list`
        );
      } else {
        Message.error(response.message || '创建失败，请重试');
      }
    } catch (error) {
      Message.error('创建失败，请重试');
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
    <div className="relative flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
      <div className="flex items-center gap-[16px] border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[32px] text-[var(--color-text-1)]">
        <Button
          icon={<IconLeft />}
          size={'default'}
          type={'default'}
          onClick={goBack}
        />
        创建对象类型
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="overflow-y-auto pb-[65px]">
          <ObjectTypeForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
