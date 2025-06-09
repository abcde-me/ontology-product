import { Collapse, Divider, Message, Spin } from '@arco-design/web-react';
import React, { useEffect } from 'react';

import { useBuiltInToolsList } from '@/utils/swr';
import { useParams } from '@/utils/url';
import Avatar from '@/components/avater';
import DefaultToolIcon from '@/assets/default-tool-icon.svg';
import { Table } from '@ccf2e/arco-material';
import s from './index.module.less';
import { IconRight } from '@arco-design/web-react/icon';

const CollapseItem = Collapse.Item;

export default function PluginInfo() {
  const provider = useParams('provider');
  const { data, isLoading, error } = useBuiltInToolsList(provider);

  useEffect(() => {
    if (error) {
      Message.error(error?.message);
    }
  }, [error]);

  return (
    <Spin className="appforge-spin" loading={isLoading} block>
      <div className="relative h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[25px] flex items-center">
            <Avatar
              className="mr-[12px]"
              readonly
              size={32}
              value=""
              defaultIcon={<DefaultToolIcon className="size-[32px]" />}
            />
            <span className="mr-auto text-[20px] leading-[32px] text-[var(--color-text-1)]">
              {/* {collection?.label.zh_Hans || collection?.label.en_US} */}
            </span>
          </div>
          <div className="mb-[26px] text-[14px] leading-[22px] text-[var(--color-text-1)]">
            插件信息
          </div>
          <div className="mb-[21px]"></div>
          <div className="mb-[9px] ml-[52px] font-[600]">插件工具</div>
          <Divider className="m-0" />
          <Collapse
            expandIcon={<IconRight />}
            bordered={false}
            className={s['plugin-detail-tool']}
          >
            {(data || []).map((tool) => {
              return (
                <CollapseItem
                  key={tool.provider_id}
                  header={
                    <div className="flex">
                      <div className="mr-[12px] w-[200px] flex-none overflow-hidden text-ellipsis whitespace-nowrap">
                        {tool.name}
                      </div>
                      <div className="flex-auto  overflow-hidden text-ellipsis whitespace-nowrap">
                        {tool.description?.zh_Hans}
                      </div>
                    </div>
                  }
                  name={tool.provider_id}
                >
                  <Table
                    columns={[
                      {
                        title: '参数名',
                        dataIndex: 'name',
                        width: 252
                      },
                      {
                        title: '参数类型',
                        dataIndex: 'type',
                        width: 200
                      },
                      {
                        title: '描述',
                        dataIndex: 'des'
                      }
                    ]}
                    pagination={false}
                    data={tool.parameters?.map((param) => ({
                      name: param.name,
                      type: param.type,
                      des:
                        param.human_description?.zh_Hans ||
                        param.human_description?.en_US
                    }))}
                  />
                </CollapseItem>
              );
            })}
          </Collapse>
        </div>
      </div>
    </Spin>
  );
}
