import {
  Button,
  Divider,
  Dropdown,
  Radio,
  Select,
  Tooltip
} from '@arco-design/web-react';
import { IconArrowLeft, IconDown } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { appConfigStore } from './appConfig/model';
import AppforgeLogo from '@/assets/appforge-logo.svg';
import Avatar from '@/components/avater';
import DefaultAppIcon from '@/assets/default-app-icon.svg';
import { useInstalledApp } from '@/utils/swr';

function CreateAppHeader() {
  const loc = useLocation();
  const { data: installedApps } = useInstalledApp();

  const installedApp = (installedApps || []).find(
    (item) => item.app.id === appConfigStore.app?.id
  );

  return (
    <div className="relative flex h-[50px] items-center bg-[rgb(var(--primary-6))] px-[10px]">
      <div
        className="group mr-[10px] flex !size-[24px] cursor-pointer items-center justify-center rounded-full bg-white"
        onClick={() => history.back()}
      >
        <IconArrowLeft className="text-[16px] group-hover:text-[rgb(var(--primary-6))]" />
      </div>
      <div className="mr-auto flex ">
        <Avatar
          readonly
          value={appConfigStore.app?.icon}
          size={32}
          defaultIcon={<DefaultAppIcon className="size-[32px]" />}
          className="mr-[8px]"
        />
        <div className="flex h-[32px] flex-col justify-around">
          <Tooltip
            content={
              !loc.pathname.includes('appCreate') &&
              appConfigStore.app?.site.title
            }
          >
            <span className="w-[350px] overflow-hidden text-ellipsis whitespace-nowrap text-white">
              {loc.pathname.includes('appCreate')
                ? '新建应用'
                : appConfigStore.app?.site.title}
            </span>
          </Tooltip>
          <span className="text-[rgb(var(--primary-10))]">
            {loc.pathname.includes('appCreate')
              ? '草稿'
              : installedApp
                ? '已发布'
                : '未发布'}
          </span>
        </div>
      </div>
      <AppforgeLogo className=" absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]" />
      <Button
        type="outline"
        style={{ background: 'white', visibility: 'hidden' }}
        className="mr-[8px]"
      >
        保存草稿
      </Button>
      <Dropdown
        droplist={
          <div className="inline-block rounded-[8px] bg-white p-[16px] text-[var(--color-text-2)] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
            <div>发布到</div>
            <Radio.Group
              className="mb-[7px]"
              direction="vertical"
              options={[
                { label: '自己可见', value: '0' },
                { label: '部门可见', value: '1' },
                { label: '全网可见', value: '2' }
              ]}
            ></Radio.Group>
            <Divider className="mb-[13px] mt-0" />
            <div className="mb-[8px]">应用分类</div>
            <Select
              className="mb-[8px] block w-[168px]"
              defaultValue="default"
              options={[{ label: '默认态', value: 'default' }]}
            />
            <Button
              type="primary"
              onClick={() => appConfigStore.publish()}
              disabled={
                appConfigStore.loading ||
                appConfigStore.creating ||
                !appConfigStore.app
              }
            >
              确定
            </Button>
          </div>
        }
      >
        <Button
          type="outline"
          loading={appConfigStore.publishing}
          style={{ background: 'white', visibility: 'hidden' }}
        >
          发布
          <IconDown className="text-[16px]" />
        </Button>
      </Dropdown>

      <Button
        type="secondary"
        style={{ background: 'white' }}
        onClick={() => appConfigStore.publish()}
        disabled={
          appConfigStore.loading ||
          appConfigStore.creating ||
          !appConfigStore.app
        }
      >
        保存设置
      </Button>
    </div>
  );
}

export default observer(CreateAppHeader);
