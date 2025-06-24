import {
  Button,
  Dropdown,
  Empty,
  Grid,
  Link,
  Menu,
  Message,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import {
  IconClockCircle,
  IconMore,
  IconSend,
  IconShareInternal
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import appListStore from './model';
import {
  deleteApp,
  getAppDetail,
  getInstalledAppList,
  publishApp
} from '@/api/app';
import { useInstalledApp } from '@/utils/swr';
import Avatar from '@/components/avater';
import s from './index.module.less';
import cn from 'classnames';
import DefaultAppIcon from '@/assets/default-app-icon.svg';
// TODO: ts错误
// @ts-expect-error
import SearchBar from '@/components/search-bar';
import { Table } from '@ccf2e/arco-material';
import { CreateAppModal } from './createAppModal';

function AppListPage(props) {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [showCreateModel, setShowCreateModal] = useState(false);
  const list = appListStore.list.filter((item) =>
    item.name.match(new RegExp(searchText, 'i'))
  );

  useEffect(() => {
    appListStore.getList();
  }, []);
  const { data: installedApps, error, mutate } = useInstalledApp();

  useEffect(() => {
    if (error) {
      Message.error(error?.message);
    }
  }, [error]);

  const goToEdit = useCallback(
    (app) => {
      history.push(`/tenant/compute/appforge/appConfig?id=${app.id}`);
    },
    [history]
  );
  const doDelete = useCallback((app) => {
    Modal.confirm({
      title: '确认删除应用?',
      content:
        '删除应用将无法撤销。用户将不能访问你的应用，所有 Prompt 编排配置和日志均将一并被删除。',
      async onOk() {
        await deleteApp(app.id);
        appListStore.getList();
      }
    });
  }, []);
  const publish = useCallback(
    async (app) => {
      try {
        appListStore.setLoading(true);
        const res = await getAppDetail({
          id: app.id
        });
        await publishApp({
          id: app.id,
          data: res.model_config
        });
        appListStore.getList();
        mutate();
      } catch (err) {
        console.error(err);
      } finally {
        appListStore.setLoading(false);
      }
    },
    [mutate]
  );

  const experience = useCallback(
    async (app) => {
      try {
        appListStore.setLoading(true);
        const res = await getAppDetail({
          id: app.id
        });
        await publishApp({
          id: app.id,
          data: res.model_config
        });
        const installedApps = await getInstalledAppList().then(
          (res) => res.installed_apps || []
        );
        const installedApp = (installedApps || []).find(
          (item) => item.app.id === app.id
        );
        if (installedApp)
          history.push(
            `/tenant/compute/appforge/appChat?id=${installedApp.id}`
          );
      } catch (err) {
        console.error(err);
      } finally {
        appListStore.setLoading(false);
      }
    },
    [history]
  );

  const [showType, setShowType] = useState('card');
  const columns = useMemo(() => {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        width: 150
      },
      {
        title: '描述',
        dataIndex: 'des',
        render(_, app) {
          return app.site?.description || '';
        },
        width: 300
      },
      {
        title: '时间',
        dataIndex: 'created_at',
        width: 150,
        render(_, app) {
          return new Date(app.created_at * 1000).toLocaleString?.();
        }
      },
      {
        title: '可见性',
        dataIndex: 'visibility',
        width: 150,
        render(_, app) {
          const installedApp = (installedApps || []).find(
            (item) => item.app.id === app.id
          );
          return installedApp ? (
            <Tag color="green">全网可见</Tag>
          ) : (
            <Tag color="blue">自己可见</Tag>
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'oper',
        width: 200,
        render(_, app) {
          return (
            <Space>
              <Link onClick={() => goToEdit(app)}>编辑</Link>
              <Dropdown
                droplist={
                  <Menu>
                    <Menu.Item
                      key="store"
                      onClick={() =>
                        publish(app).then(() => Message.success('分享成功'))
                      }
                    >
                      分享到应用商店
                    </Menu.Item>
                  </Menu>
                }
              >
                <Link>分享</Link>
              </Dropdown>
              <Link
                onClick={() =>
                  publish(app).then(() => Message.success('发布成功'))
                }
              >
                发布
              </Link>
              <Link onClick={() => experience(app)}>体验</Link>
              <Link onClick={() => doDelete(app)}>删除</Link>
            </Space>
          );
        }
      }
    ];
  }, [doDelete, experience, goToEdit, installedApps, publish]);

  return (
    <Spin className="appforge-spin" block loading={appListStore.loading}>
      <div className="h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              应用列表
            </div>
            <Button
              type="primary"
              onClick={() => {
                // history.push(`/tenant/compute/appforge/appCreate`);
                setShowCreateModal(true);
              }}
            >
              新建应用
            </Button>
          </div>
          <SearchBar
            onSearch={(val) => {
              setSearchText(val?.name || '');
              appListStore.getList();
            }}
            onTypeChange={(val) => setShowType(val)}
            searchConfig={[
              {
                key: 'name',
                label: '应用名称',
                type: 'input',
                placeholder: '请输入应用名称以模糊查询'
              }
            ]}
          />

          {list.length === 0 ? (
            <Empty />
          ) : showType === 'card' ? (
            <Grid
              cols={{ xs: 1, sm: 2, xl: 3, xxl: 4 }}
              colGap={16}
              rowGap={16}
            >
              {[...list].map((app) => {
                const installedApp = (installedApps || []).find(
                  (item) => item.app.id === app.id
                );
                return (
                  <Grid.GridItem key={app.id}>
                    <div className="min-h-[160px] cursor-pointer rounded-[4px] border border-[rgb(var(--primary-3))] bg-[linear-gradient(180deg,rgba(226,239,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] p-[16px] hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
                      <div className="mb-[8px] flex items-center">
                        <Avatar
                          readonly
                          size={44}
                          value={app.icon}
                          defaultIcon={
                            <DefaultAppIcon className="size-[44px]" />
                          }
                          className="mr-[8px]"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <Tooltip content={app.name}>
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[600] leading-[22px] text-[var(--color-text-2)]">
                              {app.name}
                            </div>
                          </Tooltip>
                          <div className="flex items-center">
                            <IconClockCircle className="mr-[4px] text-[14px]" />
                            <span>
                              {new Date(
                                app.created_at * 1000
                              ).toLocaleString?.()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto self-start">
                          {installedApp ? (
                            <Tag color="green">全网可见</Tag>
                          ) : (
                            <Tag color="blue">自己可见</Tag>
                          )}
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          history.push(
                            `/tenant/compute/appforge/appConfig?id=${app.id}`
                          );
                        }}
                        className="two-row-ellipse mb-[4px] h-[40px] text-[var(--color-text-5)]"
                      >
                        {app.site?.description || ''}
                      </div>

                      <div className="mt-[10px] flex items-center">
                        <Button
                          size="small"
                          type="outline"
                          className="mr-[8px]  h-[32px] flex-1"
                          onClick={() => experience(app)}
                          icon={<IconSend className="text-[16px]" />}
                        >
                          体验应用
                        </Button>

                        <Button
                          icon={<IconShareInternal className="text-[16px]" />}
                          className="mr-[8px] h-[32px] flex-1"
                          size="small"
                          type="outline"
                          onClick={() =>
                            publish(app).then(() => Message.success('分享成功'))
                          }
                        >
                          分享应用
                        </Button>
                        <Dropdown
                          droplist={
                            <Menu className={cn('w-[88px]', s['menu'])}>
                              <Menu.Item
                                key="edit"
                                onClick={() => {
                                  goToEdit(app);
                                }}
                              >
                                编辑
                              </Menu.Item>
                              <Menu.Item
                                key="delete"
                                onClick={() => {
                                  doDelete(app);
                                }}
                              >
                                删除
                              </Menu.Item>
                              <Menu.Item
                                key="edit"
                                onClick={() => {
                                  publish(app).then(() =>
                                    Message.success('发布成功')
                                  );
                                }}
                              >
                                发布
                              </Menu.Item>
                            </Menu>
                          }
                          position="bl"
                        >
                          <Button
                            className="h-[32px]  flex-none"
                            type="outline"
                            icon={<IconMore />}
                          ></Button>
                        </Dropdown>
                      </div>
                    </div>
                  </Grid.GridItem>
                );
              })}
            </Grid>
          ) : (
            <Table
              columns={columns}
              data={list}
              scroll={{ x: true }}
              rowKey="id"
            />
          )}
        </div>
        {showCreateModel && (
          <CreateAppModal
            visible={showCreateModel}
            setVisible={setShowCreateModal}
          />
        )}
      </div>
    </Spin>
  );
}

export default observer(AppListPage);
