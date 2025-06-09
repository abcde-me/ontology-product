import React, { useEffect } from 'react';
import { Select, Form } from '@arco-design/web-react';
import DeepSeekIcon from '@/assets/deepseek.svg';
import ConfigForm from './ConfigForm';
import { useAgentEditor } from '../../AgentProvider/Context';
import MODEL_ICON_MAP from '../../../constants/iconMap';

const Header = () => {
  const [form] = Form.useForm();
  const agent = useAgentEditor();
  const { modelStore } = agent;
  const { modelName } = agent.modelStore.useGetState(['modelName']);
  const ModelIcon = MODEL_ICON_MAP[modelName] || DeepSeekIcon; // 默认使用 DeepSeekIcon
  const initialValues = {
    model: modelName,
    top_p: 0.0001,
    temperature: 0.0001
  };
  useEffect(() => {
    modelStore.fetchData('llm');
  }, []);
  console.log('modelName', modelName)
  return (
    <div className="flex h-[52px] w-full items-center justify-between border-b border-gray-100 bg-white">
      <div className="ml-4 text-lg font-semibold">编排</div>
      <div className="mr-4">
        <Select
          bordered={false}
          triggerProps={{
            autoAlignPopupWidth: false,
            autoAlignPopupMinWidth: true,
            position: 'br',
            popupStyle: { width: 400 }
          }}
          value={modelName}
          renderFormat={() => (
            <div className="flex items-center">
              <ModelIcon />
              <span className="ml-1">{modelName}</span>
            </div>
          )}
          dropdownRender={() => (
            <div className="px-4 py-3">
              <Form form={form} initialValues={initialValues}>
                <ConfigForm form={form} />
              </Form>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Header;
