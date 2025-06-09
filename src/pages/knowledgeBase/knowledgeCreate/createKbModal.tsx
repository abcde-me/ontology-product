import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Message, Modal, Trigger } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import { createKnowledge } from '@/api/knowledgeBase';
import { useHistory } from 'react-router-dom';
import './createKbModal.less';
import AgentIcon from '@/assets/agent-icon.svg';
import TextIcon from '@/assets/kb-text-icon.svg';
import ImgIcon from '@/assets/kb-img-icon.svg';
import TableIcon from '@/assets/kb-table-icon.svg';
import AIIcon from '@/assets/ai.svg';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
};

export const CreateKbModal: React.FC<CommonModalProps> = (props) => {
  const { visible, setVisible } = props;
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [kbType, setKbType] = useState('text');

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
      title="新增知识库"
      visible={visible}
      style={{width: '720px'}}
      className="bold-form-label"
      onCancel={() => {
        setVisible(false);
      }}
      footer={
        <>
          <Button
            type="outline"
            className="primary"
            onClick={() => {
              setVisible(false);
            }}
          >
            取消
          </Button>
          <Button
            loading={loading}
            type="outline"
            className="primary"
            onClick={confirmAction}
          >
            完成创建
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              history.push(
                `/tenant/compute/appforge/knowledgeConfig`
              );
            }}
            type='primary'
          >
            新建并导入
          </Button>
        </>
      }
    >
      <div className="kb-type">
        <div className={`text ${kbType === 'text' ? 'active' : ''}`} onClick={() => setKbType('text')}>
          <TextIcon />
          <span>文本</span>
        </div>
        <div className={`img ${kbType === 'img' ? 'active' : ''}`} onClick={() => setKbType('img')}>
          <ImgIcon />
          <span>图片</span>
        </div>
        <div className={`table ${kbType === 'table' ? 'active' : ''}`} onClick={() => setKbType('table')}>
          <TableIcon />
          <span>表格</span>
        </div>
      </div>
      <Form
        className="create-kb-form mt-[20px]"
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          field="name"
          label="名称"
          rules={[
            { required: true, message: '名称是必填项' },
            {
              match: /^[a-zA-Z\u4e00-\u9fa5][\w\u4e00-\u9fa5-.]{0,49}$/,
              message:
                '支持 1-50 位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头'
            }
          ]}
        >
          <Input placeholder="请输入" maxLength={50} showWordLimit />
        </Form.Item>
        <Form.Item
          field="desc"
          label="描述"
        >
          <Input.TextArea placeholder="请输入" style={{ minHeight: 60 }} maxLength={255} showWordLimit />
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
