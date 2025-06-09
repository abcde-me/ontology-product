import React from 'react';
import { Input } from '@arco-design/web-react';
import { useParams } from '@/hooks/useParmas';
import { useAgentEditor } from '../../../AgentProvider/Context';

const Prompt = () => {
  const agent = useAgentEditor();
  const { infoStore } = agent;
  const { agentRole } = infoStore.useGetState();

  const id = useParams('id');
  const handleChange = (v: string) => {
    infoStore.setAgentInfoData({ agentRole: v });
    infoStore.updateAgentConfigData(id);
  };
  return (
    <Input.TextArea
      style={{ minHeight: '380px', overflow: 'auto' }}
      // autoSize={{ minRows: 20, maxRows: 30 }}
      placeholder="请输入角色指令"
      value={agentRole}
      onChange={handleChange}
    />
  );
};

export default Prompt;
