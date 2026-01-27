import React, { useState, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData,
  ObjectTypeFormRef
} from './components/ObjectTypeForm';

export default function OntologySceneObjectTypeCreate() {
  const history = useHistory();
  const { id: OSId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ObjectTypeFormRef>(null);

  const handleSubmit = async (data: ObjectTypeFormData) => {
    setLoading(true);
    try {
      // TODO: 调用创建API
      console.log('Create object type:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Message.success('创建成功');
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/list`
      );
    } catch (error) {
      Message.error('创建失败，请重试');
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
    <div className="flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
      <div className="border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[30px] text-[var(--color-text-1)]">
        创建对象类型
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="overflow-y-auto">
          <ObjectTypeForm
            ref={formRef}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            showFooter={false}
          />
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
  );
}
