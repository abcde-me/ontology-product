import React, { useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData,
  ObjectTypeFormRef
} from './components/ObjectTypeForm';
import { createOntologyObjectType } from '@/api/ontologySceneLibrary/objectType';
import { IconLeft } from '@arco-design/web-react/icon';
import { ProButton } from '@ceai-front/arco-material';

export default function OntologySceneObjectTypeCreate() {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ObjectTypeFormRef>(null);

  const handleSubmit = async (data: ObjectTypeFormData) => {
    setLoading(true);
    try {
      // 调用创建API
      const response = await createOntologyObjectType({
        code: data.code,
        name: data.name,
        description: data.description,
        icon: data.icon,
        ontologyModelID: Number(OSId),
        filePath: data.filePath,
        originalDbName: data.originalDbName,
        originalTableName: data.originalTableName,
        sourceType: data.sourceType,
        ontologyPhysicalPropertiesList: data.ontologyPhysicalPropertiesList
      });

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
            ref={formRef}
            initialValues={{
              ontologyModelID: Number(OSId)
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            showFooter={false}
          />
        </div>
        {/* 底部操作按钮 */}
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
