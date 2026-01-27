import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button, Spin } from '@arco-design/web-react';
import ObjectTypeForm, {
  ObjectTypeFormData,
  ObjectTypeFormRef
} from './components/ObjectTypeForm';

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
    // TODO: 调用API获取对象类型详情
    const loadData = async () => {
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 模拟数据
        setInitialValues({
          name: '示例对象类型',
          id: 'example_id',
          description: '这是一个示例描述',
          dataSource: {
            type: 'local_csv',
            file: null
          },
          attributeFields: []
        });
      } catch (error) {
        Message.error('加载数据失败');
      }
    };
    loadData();
  }, [objectTypeId]);

  const handleSubmit = async (data: ObjectTypeFormData) => {
    setLoading(true);
    try {
      // TODO: 调用更新API
      console.log('Update object type:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Message.success('更新成功');
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/objectType/list`
      );
    } catch (error) {
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
            <div className="ticky bottom-0 z-10 border-t border-[#E5E6EB] bg-white px-6 py-4">
              <div className="flex justify-start gap-[8px]">
                <Button onClick={handleCancel} disabled={loading}>
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    formRef.current?.submit();
                  }}
                  loading={loading}
                >
                  确定
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
