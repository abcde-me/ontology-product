import React, { useMemo, useState } from 'react';
import { Form, Input, Message, Modal, Trigger } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import { createKnowledge } from '@/api/knowledgeBase';
import { useHistory } from 'react-router-dom';
import './create-app-modal.less';
import AgentIcon from '@/assets/agent-icon.svg';
import WorkflowIcon from '@/pages/workflowConfig/styles/images/op-icons/workflow.svg';
import AIIcon from '@/assets/ai.svg';
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
import { upload } from '@/pages/workflowConfig/service/base';
import { PrefixV2 } from '@/api/endpoints';
import { updateApp } from '@/api/appsV2';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
};

export const CreateAppModal: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible } = props;
  const history = useHistory();
  const [form] = Form.useForm();
  const icon = Form.useWatch('icon', form);
  const [loading, setLoading] = useState(false);
  const [appType, setAppType] = useState('workflow');
  const appDetail = useAppStore((s) => s.appDetail);
  const setAppDetail = useAppStore((s) => s.setAppDetail);

  const appNameLabel = useMemo(() => {
    return appType === 'agent' ? '智能体名称' : '工作流名称';
  }, [appType]);
  const appDescLabel = useMemo(() => {
    return appType === 'agent' ? '智能体功能介绍' : '工作流描述';
  }, [appType]);

  const confirmAction = () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          await updateApp({
            ...formValue,
            id: appDetail?.id,
            mode: 'workflow',
            icon_type: formValue.icon ? 'image' : ''
          });
          // TODO: ts错误
          // @ts-expect-error
          setAppDetail({ ...appDetail, ...formValue });
          Message.success('修改成功');
          setLoading(false);
          setVisible(false);
        } catch (err) {
          return;
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <Modal
      title="编辑基本信息"
      visible={visible}
      style={{ width: '720px' }}
      okButtonProps={{
        loading: loading
      }}
      onCancel={() => {
        setVisible(false);
      }}
      onOk={() => {
        confirmAction();
      }}
    >
      <Form
        className="create-space-form"
        form={form}
        autoComplete="off"
        colon
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{
          name: appDetail?.name,
          description: appDetail?.description,
          icon: appDetail?.icon
        }}
      >
        <Form.Item
          field="name"
          label={appNameLabel}
          className="name-input"
          rules={[
            { required: true, message: appNameLabel + '是必填项' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,49}$/,
              message:
                '支持 1-50 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
          extra="支持 1-50 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头"
        >
          <Input
            placeholder={'请输入' + appNameLabel}
            maxLength={50}
            showWordLimit
          />
        </Form.Item>
        <Form.Item field="description" label={appDescLabel}>
          <Input.TextArea
            placeholder={'请输入' + appDescLabel}
            style={{ minHeight: 60 }}
            maxLength={255}
            showWordLimit
          />
        </Form.Item>
        <Form.Item field="icon" label="图标">
          <Trigger
            position="right"
            style={{ marginLeft: '14px' }}
            trigger="hover"
            popup={() => (
              <div className="create-space-icon-menu">
                {/* <div className="icon-menu-item">
                  <AIIcon className='size-[40px] text-[#334155]'/>
                  <span className='txt'>智能生成图标</span>
                </div>
                <div className="icon-menu-separator" /> */}
                <div className="icon-menu-item">
                  <IconUpload className="size=[16px] text-[#334155]" />
                  <span
                    className="txt"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.svg,.png,.jpg,.jpeg';
                      input.click();
                      input.onchange = () => {
                        const formData = new FormData();
                        // TODO: ts错误
                        // @ts-expect-error
                        formData.append('file', input.files[0]);
                        upload({
                          xhr: new XMLHttpRequest(),
                          data: formData
                        })
                          .then((res: any) => {
                            const result = res.data || res;
                            form.setFieldValue('icon', result.id);
                          })
                          .catch(() => {
                            Message.error('上传失败');
                          });
                      };
                    }}
                  >
                    上传图标
                  </span>
                </div>
              </div>
            )}
          >
            {icon ? (
              <img
                src={`${PrefixV2}/files/browser/${icon}`}
                className="size-[40px] cursor-pointer"
              />
            ) : (
              <WorkflowIcon className="size-[40px] cursor-pointer" />
            )}
          </Trigger>
        </Form.Item>
      </Form>
    </Modal>
  );
};
