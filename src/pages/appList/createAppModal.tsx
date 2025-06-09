import React, { useMemo, useState } from 'react';
import { Form, Input, Message, Modal, Trigger } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import { createKnowledge } from '@/api/knowledgeBase';
import { useHistory } from 'react-router-dom';
import './createAppModal.less';
import AgentIcon from '@/assets/agent-icon.svg';
import WorkflowIcon from '@/assets/workflow-icon.svg';
import AIIcon from '@/assets/ai.svg';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
};

export const CreateAppModal: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible } = props;
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [appType, setAppType] = useState('agent');

  const appNameLabel = useMemo(() => {
    return appType === 'agent' ? '智能体名称' : '工作流名称'
  }, [appType])
  const appDescLabel = useMemo(() => {
    return appType === 'agent' ? '智能体功能介绍' : '工作流功能介绍'
  }, [appType])

  const confirmAction = async () => {
    form
      .validate()
      .then(async () => {
        try {
          setLoading(true);
          const formValue = form.getFields();
          const resp = await createKnowledge(formValue);
          Message.success('创建空间成功');
          setLoading(false);
          history.push(
            `/tenant/compute/appforge/knowledgeDetail?id=${resp.id}`
          );
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
      title="创建应用"
      visible={visible}
      style={{width: '720px'}}
      className="bold-form-label"
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
      <div className="app-type">
        <div className={`agent ${appType === 'agent' ? 'active' : ''}`} onClick={() => setAppType('agent')}>
          <AgentIcon />
          <span>智能体应用</span>
        </div>
        <div className={`workflow ${appType === 'workflow' ? 'active' : ''}`} onClick={() => setAppType('workflow')}>
          <WorkflowIcon />
          <span>工作流应用</span>
        </div>
      </div>
      <Form
        className="create-space-form mt-[20px]"
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          field="name"
          label={appNameLabel}
          rules={[
            { required: true, message: appNameLabel + '是必填项' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,49}$/,
              message:
                '支持 1-50 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
        >
          <Input placeholder={"请输入" + appNameLabel} maxLength={50} showWordLimit />
        </Form.Item>
        <Form.Item
          field="desc"
          label={appDescLabel}
        >
          <Input.TextArea placeholder={"请输入" + appDescLabel} style={{ minHeight: 60 }} maxLength={255} showWordLimit />
        </Form.Item>
        <Form.Item
          field="icon"
          label="图标"
        >
          <Trigger
            position='right'
            style={{ marginLeft: '14px'}}
            trigger='hover'
            popup={() => (
              <div className="create-space-icon-menu">
                <div className="icon-menu-item">
                  <AIIcon className='size=[16px] text-[#334155]'/>
                  <span className='txt'>智能生成图标</span>
                </div>
                <div className="icon-menu-separator" />
                <div className="icon-menu-item">
                  <IconUpload className='size=[16px] text-[#334155]'/>
                  <span
                    className='txt'
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept=".svg,.png,.jpg,.jpeg"
                      input.click();
                      input.onchange = () => {
                        // const modal = Modal.info({
                        //   content: (
                        //     <Space>
                        //       <IconLoading spin />
                        //       <span>数据导入中...</span>
                        //     </Space>
                        //   ),
                        //   title: '提示',
                        // });
                        // importOrder(input.files[0])
                        //   .then((res: any) => {
                        //     if (res.code === 0) {
                        //       Message.success(res.data);
                        //       getTableList();
                        //     } else Message.error(res.message);
                        //   })
                        //   .finally(() => {
                        //     modal.close();
                        //   });
                      };
                    }}
                  >上传图标</span>
                </div>
              </div>
            )}
          >
            <AgentIcon className='size-[96px] cursor-pointer' />
          </Trigger>
        </Form.Item>
      </Form>
    </Modal>
  );
};
