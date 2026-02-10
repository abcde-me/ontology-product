import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Message, Button, Spin } from '@arco-design/web-react';
import LinkForm, { LinkFormData, LinkFormRef } from './components/LinkForm';
import { LinkType } from '../../types/link';

export default function OntologySceneLinksEdit() {
  const history = useHistory();
  const { id: OSId, linkId } = useParams<{
    id: string;
    linkId: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<LinkFormData>>();
  const formRef = useRef<LinkFormRef>(null);

  useEffect(() => {
    // TODO: 调用API获取链接详情
    const loadData = async () => {
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 模拟数据
        setInitialValues({
          name: '示例链接',
          id: 'example_link_id',
          linkType: LinkType.ONE_TO_ONE,
          sourceObjectType: 1,
          targetObjectType: 2,
          targetObjectAttribute: 'attr1',
          attributeFields: []
        });
      } catch (error) {
        Message.error('加载数据失败');
      }
    };
    loadData();
  }, [linkId]);

  const handleSubmit = async (data: LinkFormData) => {
    setLoading(true);
    try {
      // TODO: 调用更新API
      console.log('Update link:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Message.success('更新成功');
      history.push(
        `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/list`
      );
    } catch (error) {
      Message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push(
      `/tenant/compute/modaforge/ontologyScene/detail/${OSId}/links/list`
    );
  };

  return (
    <>
      {initialValues ? (
        <div className="flex h-[calc(100vh-56px)] w-full flex-col bg-[#fff]">
          <div className="border-b border-[##EBEEF5] p-[24px] text-[20px] font-[600] leading-[30px] text-[var(--color-text-1)]">
            编辑链接
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="overflow-y-auto">
              <LinkForm
                ref={formRef}
                initialValues={initialValues}
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
      ) : (
        <div className="mt-[200px] flex justify-center">
          <Spin />
        </div>
      )}
    </>
  );
}
