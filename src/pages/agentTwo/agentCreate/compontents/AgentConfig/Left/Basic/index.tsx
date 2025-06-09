import React from 'react';
import { Input, Button } from '@arco-design/web-react';
import AgentIcon from '@/assets/agent.svg';
import AIGenerateIcon from '@/assets/autoGenerate.svg';
import { useParams } from '@/hooks/useParmas';
import { useAgentEditor } from '../../../AgentProvider/Context';

const Basic: React.FC = () => {
  const id = useParams('id');
  console.log('id', id);
  const agent = useAgentEditor();
  const { infoStore } = agent;
  const { agentName, agentDesc } = infoStore.useGetState([
    'agentName',
    'agentDesc'
  ]);

  const handleInfoChange = (key: string, value: string) => {
    infoStore.setAgentInfoData({
      [key]: value
    });
    infoStore.updateAgentInfoData(id);
  };

  // TODO: 切换icon
  const handleSwitchIcon = () => {
    console.log('switch icon');
  };

  return (
    <div className="flex w-full">
      {/* 左侧icon和按钮 */}
      <div className="mr-4 flex flex-col items-center">
        <AgentIcon className="mb-2 h-[80px] w-[80px]" />
        <Button
          size="mini"
          onClick={handleSwitchIcon}
          className="flex h-[24px] items-center"
        >
          <AIGenerateIcon />
          AI生成
        </Button>
      </div>
      {/* 右侧输入区 */}
      <div className="flex flex-1 flex-col">
        <Input
          placeholder="请输入名称"
          value={agentName}
          onChange={(v) => handleInfoChange('agentName', v)}
          className="mb-2"
          maxLength={50}
          showWordLimit
        />
        <Input.TextArea
          showWordLimit
          placeholder="请输入描述"
          value={agentDesc}
          onChange={(v) => handleInfoChange('agentDesc', v)}
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={100}
        />
      </div>
    </div>
  );
};

export default Basic;
