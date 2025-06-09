import React from 'react';
import { Modal, Button } from '@arco-design/web-react';
import { useAgentEditor } from '../../../AgentProvider/Context';
import OptimizedPrompt from './OptimizedPrompt';

const ModalPrompt = () => {
  const agent = useAgentEditor();
  const { infoStore } = agent;
  const { roleStatus, agentRoleOptimized } = infoStore.getState();
  return (
    <Modal
      title="优化提示词"
      visible={roleStatus}
      footer={
        <>
          <Button
            disabled={roleStatus}
            type="primary"
            onClick={() => {
              infoStore.setRoleStatus(false);
            }}
          >
            取消
          </Button>
          <Button
            disabled={roleStatus}
            type="primary"
            onClick={() => {
              infoStore.setRoleStatus(false);
              infoStore.setAgentInfoData({ agentRole: agentRoleOptimized });
            }}
          >
            使用提示词
          </Button>
        </>
      }
    >
      <OptimizedPrompt />
    </Modal>
  );
};

export default ModalPrompt;
