import React from 'react';
import { Select, Slider, InputNumber, Form } from '@arco-design/web-react';
import { IconRobot, IconQuestionCircle } from '@arco-design/web-react/icon';
import { useAgentEditor } from '../../AgentProvider/Context';
import QuestionSvg from '@/assets/question.svg';
import DeepSeekIcon from '@/assets/deepseek.svg';
import './index.less';
import { useParams } from '@/hooks/useParmas';
import MODEL_ICON_MAP from '../../../constants/iconMap';

const ConfigForm: React.FC<{ form: any }> = ({ form }) => {
  // const agent = useAgent();
  const agent = useAgentEditor();
  const id = useParams('id');

  const { modelName, top_p, temperature, modelList } =
    agent.modelStore.useGetState([
      'modelName',
      'top_p',
      'temperature',
      'modelList'
    ]);
    console.log('modelList', modelList)

  const modelOptions = modelList?.map((item) => {
    const ModelIcon = MODEL_ICON_MAP[item.model_name] || IconRobot;
    return {
      label: (
        <span className="flex items-center gap-2">
          {/* <ModelIcon /> */}
          <img src={item.provider_icon_base64
} />
          {item.model_name}
        </span>
      ),
      value: item.model_name,
      raw: item
    };
  });

  const handleModelConfig = (key: string, value: number) => {
    agent.modelStore.setModelFormData({
      [`${key}`]: value
    });
    agent.infoStore.updateAgentConfigData(id);
  };
  console.log('modelOptions', modelOptions)
  return (
    <div>
      <Form.Item
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        label={<span className="text-xs text-gray-500">选择模型：</span>}
        field="model"
        className="mb-3"
        // extra={<div className="text-[#FB923C]">赠送</div>}
      >
        <Select
          // data-active={'true'}
          options={modelOptions}
          showSearch={false}
          bordered={true}
          className="w-full"
          value={modelName}
          onChange={(v) => {
            const selected = modelList.find((item) => item.model_name === v);
            if (selected) {
              // 字段映射
              const mapped = {
                modelName: selected.model_name,
                provider: selected.provider_name
                // ...如有其它字段，继续映射
              };
              agent.modelStore.setModelFormData(mapped);
              agent.infoStore.updateAgentConfigData(id);
            }
          }}
        />
      </Form.Item>
      <Form.Item
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        label={
          <span className="text-xs text-gray-500">
            Top P：
            <span className="ml-1 cursor-pointer text-gray-400 hover:text-blue-500">
              <QuestionSvg />
            </span>
          </span>
        }
        field="top_p"
        className="mb-3 mr-2"
      >
        <div className="ml-1 flex items-center gap-2">
          <Slider
            style={{ flex: 2, height: 6, minWidth: 0 }}
            min={0}
            max={1}
            step={0.0001}
            showTicks={false}
            value={top_p}
            onChange={(v: number) => handleModelConfig('top_p', v)}
          />
          <InputNumber
            min={0}
            max={1}
            step={0.0001}
            value={top_p}
            // onChange={v => form.setFieldValue('top_p', v)}
            className="w-24"
          />
        </div>
      </Form.Item>
      <Form.Item
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        label={
          <span className="flex items-center whitespace-nowrap text-xs text-gray-500">
            Temperature：
            <span className="ml-1 flex cursor-pointer items-center text-gray-400 hover:text-blue-500">
              <QuestionSvg />
            </span>
          </span>
        }
        field="temperature"
      >
        <div className="ml-1 flex items-center gap-2">
          <Slider
            style={{ flex: 1, height: 9 }}
            min={0}
            max={1}
            step={0.0001}
            showTicks={false}
            value={temperature}
            onChange={(v: number) => handleModelConfig('temperature', v)}
          />
          <InputNumber
            min={0}
            max={1}
            step={0.0001}
            value={temperature}
            className="w-24"
          />
        </div>
      </Form.Item>
    </div>
  );
};

export default ConfigForm;
