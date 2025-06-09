import { useToolsList } from '@/utils/swr';
import { Collection, Tool } from '@/utils/type';
import {
  Button,
  Divider,
  Empty,
  Space,
  Spin,
  Tooltip
} from '@arco-design/web-react';
import { IconInfoCircle, IconPlus } from '@arco-design/web-react/icon';
import React from 'react';
import cn from 'classnames';
import { appConfigStore } from '../model';

function Tools(props: { tools: Tool[]; provider: Collection }) {
  const { tools, provider } = props;
  const installedTools = appConfigStore.newAppConfig?.agent_mode?.tools || [];
  if (tools.length === 0) return <Empty description="没有可用的工具" />;
  return (
    <div className="">
      <Divider className="my-[16px]" />
      {tools.map((tool) => {
        const installed = installedTools.some(
          (installedTool) => installedTool.tool_name === tool.name
        );
        return (
          <div
            key={tool.name}
            className="mb-[16px] flex items-center justify-between pl-[52px] last:mb-0"
          >
            <div>
              <Space>
                <span className="text-[14px] font-[600]">{tool.name}</span>
                <Tooltip
                  position="right"
                  content={
                    <div
                      className="max-h-[50vh] min-w-[178px] overflow-auto"
                      onScroll={(evt) => evt.stopPropagation()}
                    >
                      {tool.parameters?.map((item) => {
                        return (
                          <div
                            key={item.name}
                            className="mb-[8px] text-[12px] font-[400] last:mb-0"
                          >
                            <Space>
                              <span className="text-[14px] font-[600]">
                                {item.name}
                              </span>
                              <span>{item.type}</span>
                            </Space>
                            <div>
                              {item.human_description?.zh_Hans ||
                                item.human_description?.en_US}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  }
                >
                  <IconInfoCircle className="block text-[16px] text-[var(--color-text-4)]" />
                </Tooltip>
              </Space>
              <div className="text-[var(--color-text-5)]">
                {tool.description?.zh_Hans || tool.description?.en_US}
              </div>
            </div>
            <Button
              icon={installed ? null : <IconPlus />}
              type={installed ? 'primary' : 'secondary'}
              size="mini"
              className="ml-[16px]"
              onClick={() => {
                appConfigStore.addTool(tool, provider);
              }}
              disabled={installed}
            >
              {installed ? '已添加' : '添加工具'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
export function ProviderTools(props: { provider: Collection }) {
  const { provider } = props;
  const { data, isLoading } = useToolsList(provider.name, provider.type);
  return (
    <Spin loading={isLoading} block>
      <Tools tools={data || []} provider={provider} />
    </Spin>
  );
}
