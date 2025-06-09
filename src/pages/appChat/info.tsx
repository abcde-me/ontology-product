import Avatar from '@/components/avater';
import { useAvailableToolsProviders } from '@/utils/swr';
import { Tag } from '@arco-design/web-react';
import React from 'react';
import _ from 'lodash';
import { InstalledApp } from '@/utils/type';
import DefaultToolIcon from '@/assets/default-tool-icon.svg';
import { IconCommon } from '@arco-design/web-react/icon';

export default function Info(props: { installedApp: InstalledApp }) {
  const { installedApp } = props;
  const data = installedApp?.app;
  const { data: providers } = useAvailableToolsProviders();

  return (
    <div className="w-[400px] overflow-auto bg-white p-[20px]">
      <div className="mb-[8px] text-[14px] font-[600] leading-[22px] text-[var(--color-text-1)]">
        应用描述
      </div>
      <div className="mb-[8px]">{data?.site?.description}</div>
      <div className="mb-[8px] text-[14px] font-[600] leading-[22px]  text-[var(--color-text-1)]">
        应用配置
      </div>
      <div className="mb-[8px] font-[600] text-[var(--color-text-1)]">模型</div>
      <div className="mb-[16px] flex h-[36px] items-center rounded-[4px] border border-[var(--color-border-1)] bg-white p-[8px]">
        <div className="mr-[8px] flex size-[20px] items-center justify-center rounded-[4px] bg-[rgb(var(--primary-2))]">
          <IconCommon className="text-[10px] text-[rgb(var(--primary-6))]" />
        </div>
        {data?.model_config?.model?.name}
      </div>

      <div className="mb-[8px] font-[600] text-[var(--color-text-1)]">工具</div>
      <div className="flex flex-wrap">
        {data?.model_config?.agent_mode?.tools?.map((tool) => {
          const provider = providers?.find(
            (provider) => provider.id === tool.provider_id
          );
          return (
            <div
              key={tool.tool_name}
              className="float-left mb-[8px] mr-[8px] inline-flex items-center"
            >
              <Avatar
                className="mr-[10px]"
                readonly
                size={36}
                value={
                  typeof provider?.icon === 'object'
                    ? provider?.icon.content
                    : ''
                }
                defaultIcon={<DefaultToolIcon className="size-[36px]" />}
              />
              <div className="text-[16px] font-[600] leading-[24px] text-[var(--color-text-2)]">
                {tool.provider_name}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mb-[8px] font-[600] text-[var(--color-text-1)]">
        私有资源
      </div>
      <div>
        <Tag color="blue">
          知识库*
          {_.get(
            data,
            'model_config.dataset_configs.datasets.datasets.length',
            0
          )}
        </Tag>
      </div>
    </div>
  );
}
