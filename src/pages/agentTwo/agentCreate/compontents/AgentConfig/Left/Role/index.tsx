import React, { useRef } from 'react';
import { Input, Popconfirm, Modal } from '@arco-design/web-react';
import { confirm } from '@ccf2e/arco-material';
import { useAgentEditor } from '../../../AgentProvider/Context';
import Prompt from './Prompt';
import { useParams } from '@/hooks/useParmas';
import TemplateIcon from '@/assets/template.svg';
import AiIcon from '@/assets/autoGenerate.svg';
import ModalPrompt from './ModalPrompt';

const Role = () => {
  const agent = useAgentEditor();
  const { infoStore } = agent;
  const id = useParams('id');
  const { agentRole, roleStatus } = infoStore.useGetState([
    'agentRoleOptimized',
    'roleStatus'
  ]);

  const handleTemplate = () => {
    infoStore.replaceTemplate();
  };

  const handleOptimize = async () => {
    const data = await infoStore.fetchData({ showLoading: false });
    const valueRef = { current: data.agentRoleOptimized || '' };

    // 受控编辑器组件
    function Editor() {
      const [value, setValue] = React.useState(valueRef.current);
      // 每次输入都更新 ref
      React.useEffect(() => {
        valueRef.current = value;
      }, [value]);
      return (
        <Input.TextArea
          disabled={roleStatus}
          autoSize={{ minRows: 20, maxRows: 30 }}
          placeholder="请输入角色指令"
          value={value}
          onChange={setValue}
        />
      );
    }

    confirm({
      title: '优化提示词',
      subContent: <Editor />,
      tipIcon: '',
      okText: '使用提示词',
      onOk: () => {
        infoStore.setAgentInfoData({ agentRole: valueRef.current });
        infoStore.updateAgentConfigData(id);
      }
    });
  };

  return (
    <div>
      <div className="mb-2 flex">
        <div className="text-sm font-medium text-[#151B26]">角色指令</div>
        <div className="ml-auto flex">
          <AiIcon />
          <div
            className="ml-1 cursor-pointer text-[#007DFA]"
            onClick={handleOptimize}
          >
            优化
          </div>
          <Popconfirm title="确定替换已有提示词吗？" onOk={handleTemplate}>
            <div className="ml-2 flex cursor-pointer items-center">
              <TemplateIcon />
              <div className="ml-1 cursor-pointer text-[#007DFA]">模版</div>
            </div>
          </Popconfirm>
        </div>
      </div>
      <Prompt />
      <ModalPrompt />
    </div>
  );
};

export default Role;
