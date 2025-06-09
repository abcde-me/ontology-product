import React from 'react';
import { Input, Spin } from '@arco-design/web-react';
import { useAgentEditor } from '../../../AgentProvider/Context';

const OptimizedPrompt = () => {
  const agent = useAgentEditor();
  const { infoStore } = agent;
  const { agentRoleOptimized, roleStatus } = infoStore.useGetState();
  const handleChange = (v: string) => {
    infoStore.setAgentInfoData({ agentRoleOptimized: v });
  };
  return (
    <Spin loading={roleStatus} className="w-full" tip="优化中...">
      <Input.TextArea
        disabled={roleStatus}
        autoSize={{ minRows: 20, maxRows: 30 }}
        placeholder="请输入角色指令"
        value={agentRoleOptimized}
        onChange={handleChange}
        className="w-full"
      />
    </Spin>
  );
};

export default OptimizedPrompt;
