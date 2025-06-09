import DefaultToolIcon from '@/assets/default-tool-icon.svg';
import Avatar from '@/components/avater';
import { useAvailableToolsProviders } from '@/utils/swr';
import { Divider, Empty, Space, Switch } from '@arco-design/web-react';
import { IconMinusCircle } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { appConfigStore } from '../model';
import AddTools from './toolDrawer';

function ToolsField() {
  const showToolsDrawer = appConfigStore.showToolsDrawer;
  const tools = appConfigStore.tools;
  const { data: toolProviders } = useAvailableToolsProviders();

  return (
    <>
      {tools.length === 0 ? (
        <div>
          <div className="mb-[24px] pl-[16px] text-[var(--color-text-5)]">
            您可以在此添加自定义工具
          </div>
          <Empty className="appcreate-empty !mb-[21px]" />
        </div>
      ) : (
        tools.map((tool) => {
          const icon = toolProviders?.find(
            (i) => i.id === tool.provider_id
          )?.icon;
          return (
            <div
              key={tool.provider_id + '_' + tool.tool_name}
              className="group mb-[8px] flex h-[38px] items-center rounded-[8px] border border-[var(--color-bg-4)] bg-[var(--color-bg-4)] px-[16px] py-[11px] last:mb-[0px]  hover:cursor-pointer hover:border-[#438dfb] hover:bg-[rgb(var(--primary-2))]"
            >
              <Avatar
                readonly
                value={typeof icon === 'object' ? icon.content : ''}
                defaultIcon={<DefaultToolIcon className="size-[24px]" />}
                size={24}
                className="mr-[8px]"
              />
              <span className="mr-auto">{tool.tool_name}</span>
              <Space>
                <IconMinusCircle
                  onClick={() => appConfigStore.removeTool(tool.tool_name)}
                  className="block text-[16px] hover:text-[rgb(var(--primary-6))]"
                />
                <Divider
                  type="vertical"
                  className="group-hover:border-l-[rgb(var(--primary-6))]"
                />
                <Switch
                  checked={tool.enabled}
                  onChange={() =>
                    appConfigStore.toggleTool(tool.tool_name, tool.provider_id)
                  }
                />
              </Space>
            </div>
          );
        })
      )}
      <AddTools
        visible={showToolsDrawer}
        onClose={() => appConfigStore.toggleToolsDrawer()}
      />
    </>
  );
}
export default observer(ToolsField);
