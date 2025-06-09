import ModelIcon from '@/components/model-icon';
import { useLLMs } from '@/utils/swr';
import { ModelStatusEnum } from '@/utils/type';
import {
  Button,
  Divider,
  Dropdown,
  Message,
  Select
} from '@arco-design/web-react';
import { IconDown, IconQuestionCircle } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { appConfigStore } from './appConfig/model';
import ParameterItem from './parameter-item';

const LLMSelector = observer(function LLMSelector() {
  const { data, isLoading, error } = useLLMs();
  useEffect(() => {
    if (error) {
      Message.error(error?.message);
    }
  }, [error]);

  const { model, params } = appConfigStore.modelParams;
  const { parameterRulesLoading, parameterRules } = appConfigStore;

  return (
    <div className="h-screen w-[626px] overflow-auto rounded-[8px] bg-white p-[16px]">
      <div className="flex items-center">
        <span className="mr-[13px] font-[600] leading-[18px] text-[var(--color-text-1)]">
          模型选择
        </span>
        <IconQuestionCircle className="text-[16px]" />
        <Select
          className="ml-auto w-[372px]"
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
                      <ModelIcon
                        className={`
                  mr-[5px] h-4 w-4 shrink-0
                  ${model.status !== ModelStatusEnum.active && 'opacity-60'}
                `}
                        provider={group}
                        modelName={model.model}
                      />
                      <span className="mr-[5px]">
                        {model.label.zh_Hans || group.label.en_US}
                      </span>
                      {model.status === ModelStatusEnum.noConfigure ? (
                        <Button className="ml-auto" size="mini" type="outline">
                          添加
                        </Button>
                      ) : null}
                    </div>
                  </Select.Option>
                ))}
              </Select.OptGroup>
            );

            return optGroup;
          })}
        </Select>
      </div>
      <Divider className="my-[16px]" />
      <div className="mb-[12px] font-[600] leading-[18px] text-[var(--color-text-1)]">
        模型参数
      </div>
      {!parameterRulesLoading &&
        !!parameterRules.length &&
        [...parameterRules].map((parameter) => {
          return (
            <ParameterItem
              key={`${model}-${parameter.name}`}
              className="mb-4"
              parameterRule={parameter}
              value={params.get(parameter.name)}
              onChange={(v) => {
                appConfigStore.setModelParam(parameter.name, v);
              }}
              onSwitch={(checked, assignValue) => {
                if (!checked) {
                  appConfigStore.deleteModelParam(parameter.name);
                } else {
                  appConfigStore.setModelParam(parameter.name, assignValue);
                }
              }}
            />
          );
        })}
    </div>
  );
});

function LLMSelectorDropdown() {
  const model = appConfigStore.modelParams.model;
  return (
    <Dropdown droplist={<LLMSelector />} trigger="click" position="br">
      <Button
        type="outline"
        className="mr-[16px] flex w-[230px] items-center justify-between"
      >
        {model}
        <IconDown className="text-[16px]" />
      </Button>
    </Dropdown>
  );
}

export default observer(LLMSelectorDropdown);
