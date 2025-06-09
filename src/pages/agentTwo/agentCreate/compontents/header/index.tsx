import React, { useEffect, useState } from 'react';
import { IconLeft } from '@arco-design/web-react/icon';
import { Button, Popover, Radio } from '@arco-design/web-react';
import AgentDefaultIcon from '@/assets/agent-icon.png';
import { useHistory } from 'react-router-dom';
import { useAgentEditor } from '../AgentProvider/Context';
import UseAgentpublish from '../Agent-publish/index';
function Header(props) {
  const { selectedValue, onSelectedValueChange } = props;
  const history = useHistory();
  const agent = useAgentEditor();
  const RadioGroup = Radio.Group;
  const { infoStore } = agent;
  const { agentName, currentTime } = infoStore.useGetState();

  useEffect(() => {}, []);

  const handleCreateClick = () => {};

  const handleBack = () => {
    history.push(`/tenant/compute/appforge/agentV2`);
  };
  const handleChange = (event) => {
    const newValue = event;
    onSelectedValueChange(newValue);
  };
  return (
    <div className="flex h-14 w-full items-center  border-red-500 p-2 pl-4 pr-4">
      <div className="flex h-full flex-1 items-center">
        <div className="flex h-full items-center">
          <IconLeft className="h-4 w-4 cursor-pointer" onClick={handleBack} />
          <img className="ml-5 h-10 w-10" src={AgentDefaultIcon} />
        </div>
        <div className="ml-3 flex h-full flex-col justify-between">
          <div className="text-[14px] font-[500] leading-[14px] text-[var(--color-text-1)]">
            {agentName}
          </div>
          <div className="rounded-md bg-[#f7f7f9] p-1 pl-2 pr-2 text-[12px] leading-[12px] text-[#151b26]">
            自动保存于 {currentTime}
          </div>
        </div>
      </div>
      <div className="h-[32px] w-[166px]">
        <RadioGroup
          size="small"
          type="button"
          name="lang"
          defaultValue="true"
          value={selectedValue}
          onChange={handleChange}
        >
          <Radio value="true">应用配置</Radio>
          <Radio value="false">干扰调优</Radio>
        </RadioGroup>
      </div>
      <div className="flex h-full flex-1 items-center justify-end">
        <Popover trigger="click" content={<UseAgentpublish />}>
          <Button type="primary" onClick={handleCreateClick}>
            发布
          </Button>
        </Popover>
      </div>
    </div>
  );
}
export default Header;
