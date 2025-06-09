import { useAvailableToolsProviders } from '@/utils/swr';
import {
  Button,
  Drawer,
  Input,
  Message,
  Spin,
  Tag
} from '@arco-design/web-react';
import { IconDown, IconPlus } from '@arco-design/web-react/icon';
import cn from 'classnames';
import React, { useState } from 'react';
import { ProviderTools } from './toolDrawerTools';
import ConfigCredential from './configCredentials';
import {
  removeBuiltInToolCredential,
  updateBuiltInToolCredential
} from '@/api/tools';
import { useHistory } from 'react-router-dom';
import { ShowCreateTool } from '@/pages/toolList/const';
import Avatar from '@/components/avater';
import DefaultToolIcon from '@/assets/default-tool-icon.svg';
export default function AddTools(props: {
  visible: boolean;
  onClose: () => void;
}) {
  const { visible, onClose } = props;

  const {
    isLoading: isLoadingProviders,
    data: providers,
    mutate
  } = useAvailableToolsProviders();

  const [searchName, setSearchName] = useState('');

  const [openedProviders, setOpenedProviders] = useState<string[]>([]);
  const [showConfigCredential, setShowConfigCredential] = useState(false);
  const [authCollection, setAuthCollection] = useState(null);
  const history = useHistory();

  return (
    <>
      <Drawer
        width={520}
        title={<span>添加工具</span>}
        visible={visible}
        onOk={() => {
          onClose();
        }}
        onCancel={() => {
          onClose();
        }}
      >
        <Spin loading={isLoadingProviders} block>
          <div className="mb-[16px] flex">
            <Input.Search
              allowClear
              placeholder="搜索工具名称"
              className="w-[300px]"
              value={searchName}
              onChange={(val) => {
                setSearchName(val);
              }}
            />
            <Button
              type="primary"
              className="ml-auto"
              icon={<IconPlus />}
              onClick={() => {
                localStorage.setItem(ShowCreateTool, 'true');
                history.push('/tenant/compute/appforge/toolList');
              }}
            >
              新建工具
            </Button>
          </div>
          {(providers || [])
            .filter((provider) =>
              (provider.label.zh_Hans || provider.label.en_US).includes(
                searchName
              )
            )
            .map((provider) => {
              return (
                <div
                  key={provider.id}
                  className="mb-[16px] rounded-[4px] border border-[rgb(var(--primary-3))] bg-gradient-to-b from-[rgba(226,239,255,0.2)] to-[rgba(255,255,255,0.2)] p-[16px] hover:cursor-pointer hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.1)]"
                  onClick={() => {
                    if (!provider.is_team_authorization) {
                      setAuthCollection(provider);
                      setShowConfigCredential(true);
                    }
                  }}
                >
                  <div
                    className="mb-[12px] flex"
                    onClick={() => {
                      if (!provider.is_team_authorization) {
                        return;
                      }
                      setOpenedProviders((providers) =>
                        providers.includes(provider.id)
                          ? providers.filter((i) => i !== provider.id)
                          : providers.concat(provider.id)
                      );
                    }}
                  >
                    <Avatar
                      className="mr-[8px]  flex-none"
                      value={
                        typeof provider.icon === 'object'
                          ? provider.icon.content
                          : ''
                      }
                      size={44}
                      readonly
                      defaultIcon={<DefaultToolIcon className="size-[44px]" />}
                    />
                    <div className="flex-auto">
                      <div className="flex items-center">
                        <span className="text-[16px] font-[600] leading-[24px] text-[rgb(var(--primary-5))]">
                          {provider.label.zh_Hans || provider.label.en_US}
                        </span>
                        {!provider.is_team_authorization ? (
                          <Tag className="ml-[8px]">需授权</Tag>
                        ) : null}
                        <IconDown
                          className={cn(
                            'ml-auto',
                            'mr-[8px]',
                            'text-[16px]',
                            openedProviders.includes(provider.id)
                              ? 'rotate-180'
                              : ''
                          )}
                        />
                      </div>
                      <div className="text-[var(--color-text-5)]">
                        <span className="font-[600]">作者: </span>
                        <span>{provider.author}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[var(--color-text-5)]">
                    <span className="font-[600]">描述: </span>
                    {provider.description.zh_Hans || provider.description.en_US}
                  </div>
                  {openedProviders.includes(provider.id) ? (
                    <div className="">
                      <ProviderTools provider={provider} />
                    </div>
                  ) : null}
                </div>
              );
            })}
        </Spin>
      </Drawer>
      {authCollection && (
        <ConfigCredential
          collection={authCollection}
          visible={showConfigCredential}
          onCancel={() => setShowConfigCredential(false)}
          onRemove={async () => {
            await removeBuiltInToolCredential(authCollection.name);
            Message.success('操作成功');
            mutate();
          }}
          onSaved={async (value) => {
            await updateBuiltInToolCredential(authCollection.name, value);
            Message.success('操作成功');
            mutate();
          }}
        />
      )}
    </>
  );
}
