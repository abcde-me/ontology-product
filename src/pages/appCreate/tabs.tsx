import { Select, Tabs } from '@arco-design/web-react';
import {
  IconCalendar,
  IconClockCircle,
  IconUser
} from '@arco-design/web-react/icon';
import React, { ReactNode, useState } from 'react';
import './tabs.css';
import { observer } from 'mobx-react-lite';
import { appConfigStore } from './appConfig/model';
import { useLLMs } from '@/utils/swr';
import { ModelStatusEnum } from '@/utils/type';

const TabPane = Tabs.TabPane;

function ConfigTabs(props: { appconfig: ReactNode }) {
  const items = [
    {
      title: '应用编排',
      key: 'appconfig',
      icon: <IconCalendar style={{ marginRight: 6 }} />
    },
    {
      title: '应用分析',
      key: 'appanalyse',
      icon: <IconClockCircle style={{ marginRight: 6 }} />
    },
    {
      title: '访问API',
      key: 'appapi',
      icon: <IconUser style={{ marginRight: 6 }} />
    },
    {
      title: '日志与标注',
      key: 'applog',
      icon: <IconCalendar style={{ marginRight: 6 }} />
    }
  ];
  const { data, isLoading, error } = useLLMs();
  const { model } = appConfigStore.modelParams;
  const [activeKey, setAcitveKey] = useState('appconfig');
  return (
    <div className="flex h-full flex-col overflow-auto p-[24px_24px_24px_0]">
      <Tabs
        activeTab={activeKey}
        onChange={(val) => setAcitveKey(val)}
        className="appcreate-tabs mb-[16px] flex-none rounded-[8px] bg-white"
        extra={
          <Select
            className="ml-auto mr-[16px] w-[372px]"
            loading={isLoading}
            showSearch
            value={model}
            onChange={(val) => {
              const res = val.split('~~~');
              appConfigStore.setModelProvider(res[0], res[1]);
            }}
          >
            {(data || []).map((group) => {
              const optGroup = (
                <Select.OptGroup
                  label={group.label.zh_Hans || group.label.en_US}
                  key={group.provider}
                >
                  {(group.models || []).map((model) => (
                    <Select.Option
                      key={group.provider + '-' + model.model}
                      value={group.provider + '~~~' + model.model}
                      disabled={model.status === ModelStatusEnum.noConfigure}
                    >
                      <div className="flex items-center">
                        <span className="mr-[5px]">
                          {model.label.zh_Hans || group.label.en_US}
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              );

              return optGroup;
            })}
          </Select>
        }
      >
        {items.map((item, index) => {
          return (
            <TabPane
              key={item.key}
              title={
                <span style={{ display: index > 0 ? 'none' : '' }}>
                  {item.icon}
                  {item.title}
                </span>
              }
            ></TabPane>
          );
        })}
      </Tabs>
      {props[activeKey]}
    </div>
  );
}

export default observer(ConfigTabs);
