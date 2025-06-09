import React, { useEffect, useState } from 'react';
import AgentConfig from '../AgentConfig';
import { useAgentEditor } from '../../compontents/AgentProvider/Context';
import AgentDegubber from '../agent-debugger';
import { useParams } from '@/hooks/useParmas';
import { Empty } from '@arco-design/web-react';

import { AgentChat, AgentInfo } from '@/components/chatV2';

function AgentContent(props) {
  const agent = useAgentEditor();
  const appid = useParams('id');

  const { abilityStore, infoStore } = agent;
  const { recommend } = abilityStore.useGetState(['recommend']);
  const { modelConfigId: model_config_id } = infoStore.useGetState([
    'modelConfigId'
  ]);

  const { agentName, agentDesc } = infoStore.useGetState([
    'agentName',
    'agentDesc'
  ]);

  return (
    <div className="flex h-[calc(100%-60px)] min-h-0 w-full bg-white text-[12px]">
      {/* 应用配置 */}
      <div className="flex-grow-[1]">
        <AgentConfig />
      </div>

      {/* 应用调试 */}
      <div className="h-full w-[33%] overflow-hidden border-l-[1px] border-solid border-[#E8E9EB]">
        <div className="shadow-border flex h-full w-full flex-col overflow-hidden">
          <div className="ml-[16px] mt-[14px] pb-2 text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
            预览与调试
          </div>
          {model_config_id ? (
            <AgentChat
              appId={appid}
              modelConfigId={model_config_id}
              recommend={(Array.isArray(recommend) && recommend) || []}
              baseInfo={{ agentName, agentDesc }}
            ></AgentChat>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Empty description="暂无任何配置信息，请配置后再试。"></Empty>
            </div>
          )}
        </div>
        {/* <AgentDegubber /> */}
        {/* <AgentChat /> */}
        {/* <div className="ml-[16px] mt-[14px] pb-2 text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
          预览与调试
        </div> */}
      </div>
    </div>
  );
}
export default AgentContent;
