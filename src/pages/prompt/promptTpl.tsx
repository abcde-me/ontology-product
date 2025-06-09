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
  IconInfoCircle,
  IconMoreVertical,
  IconSend,
  IconShareInternal
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useInstalledApp } from '@/utils/swr';
import Avatar from '@/components/avater';
import DefaultAppIcon from '@/assets/default-app-icon.svg';
import UpgradepIcon from '@/assets/upgrade.svg';
import SearchBar from '@/components/search-bar';
import { Table } from '@ccf2e/arco-material';
import { DebugDrawer } from './debugDrawer'
import { CreateDrawer } from './createDrawer'

function PromptTplPage(props) {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [searchTplType, setSearchTplType] = useState('system');
  const [showDebugDrawer, setShowDebugDrawer] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [debugItem, setDebugItem] = useState<Record<string, any>>({});
  // const list = appListStore.list.filter((item) =>
  //   item.name.match(new RegExp(searchText, 'i'))
  // );
  const [list, setList] = useState([])

  useEffect(() => {
    // appListStore.getList();
    setList([
      { id: 'xxxxxx', title: '程序员变量助手', content: '大小选项寻寻寻寻大小选项寻寻寻寻大小选项寻寻寻寻大小选项寻寻寻寻大小选项寻寻寻寻大小选项寻寻寻寻大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx2', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx3', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx4', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx5', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx6', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx7', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' },
      { id: 'xxxxxx8', title: '程序员变量助手', content: '大小选项寻寻寻寻', kind: '文本生成', type: 'CRISPE' }
    ])
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
        // await deleteApp(app.id);
        // appListStore.getList();
      }
    });
  }, []);
  const publish = useCallback(
    async (app) => {
      try {
        // appListStore.setLoading(true);
        // const res = await getAppDetail({
        //   id: app.id
        // });
        // await publishApp({
        //   id: app.id,
        //   data: res.model_config
        // });
        // appListStore.getList();
        mutate();
      } catch (err) {
        console.error(err);
      } finally {
        // appListStore.setLoading(false);
      }
    },
    [mutate]
  );

  const experience = useCallback(
    async (app) => {
      try {
        // appListStore.setLoading(true);
        // const res = await getAppDetail({
        //   id: app.id
        // });
        // await publishApp({
        //   id: app.id,
        //   data: res.model_config
        // });
        // const installedApps = await getInstalledAppList().then(
        //   (res) => res.installed_apps || []
        // );
        // const installedApp = (installedApps || []).find(
        //   (item) => item.app.id === app.id
        // );
        // if (installedApp)
        //   history.push(
        //     `/tenant/compute/appforge/appChat?id=${installedApp.id}`
        //   );
      } catch (err) {
        console.error(err);
      } finally {
        // appListStore.setLoading(false);
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
    <>
      <Space className="top-table-search-part">
        <div className='flex tpl-types'>
          <div className={`tpl-type ${searchTplType === 'system' ? 'active' : ''}`} onClick={() => setSearchTplType('system')}>系统模板</div>
          <div className={`tpl-type ${searchTplType === 'custom' ? 'active' : ''}`}  onClick={() => setSearchTplType('custom')}>自定义模板</div>
        </div>
        <SearchBar
          onSearch={(val) => {
            setSearchText(val?.name || '');
          }}
          rightPrefix={<Button type="primary" onClick={() => setShowCreateDrawer(true)}>新增模板</Button>}
          onTypeChange={(val) => setShowType(val)}
          searchConfig={[
            {
              key: 'name',
              label: '模板名称',
              type: 'input',
              placeholder: '请输入模板名称以模糊查询'
            }
          ]}
        />
      </Space>
      <div className="top-table-filter-part">
        <div className='filter-item'>
          <span className='condition-title'>模板类型</span>
          <span className='conditions'>
            <span className='active'>不限</span>
            <span>文本生成</span>
            <span>图文生成</span>
          </span>
        </div>
        <div className='filter-item'>
          <span className='condition-title'>使用场景</span>
          <span className='conditions'>
            <span className='active'>不限</span>
            <span>创意文案</span>
            <span>办公助理</span>
            <span>学习助理</span>
            <span>趣味生活</span>
          </span>
        </div>
      </div>
      <div className='table-part overflow-auto'>
        {list.length === 0 ? (
          <Empty />
        ) : showType === 'card' ? (
          <Grid
            cols={{ xs: 1, sm: 2, xl: 3, xxl: 4 }}
            colGap={16}
            rowGap={16}
          >
            {[...list].map((app) => {
              return (
                <Grid.GridItem key={app.id}>
                  <div className="prompt-card h-[180px] cursor-pointer rounded-[4px] border border-[rgb(var(--primary-3))] bg-[linear-gradient(180deg,rgba(226,239,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] p-[16px] hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))] hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]">
                    <div className="mb-[12px] flex items-center">
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
                        <Tooltip content={app.title}>
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[600] leading-[22px] text-[var(--color-text-2)]">
                            {app.title}
                          </div>
                        </Tooltip>
                        <div className="flex items-center gap-x-[4px]">
                          <Tag color="#D9EAFF" style={{color: '#1E293B'}}>{app.kind}</Tag>
                          <Tag color="#D9EAFF" style={{color: '#1E293B'}}>{app.type}</Tag>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-[8px] mb-[4px">
                      <span className="text-[#6E7B8D] w-[48px]">模板内容</span>
                      <span className="text-[#1E293B] flex-1 one-row-ellipse-box">{app.content || ''}</span>
                    </div>
                    <div className="flex gap-x-[8px]">
                      <span className="text-[#6E7B8D] w-[48px]">模板id</span>
                      <span className="text-[#1E293B] flex-1">{app.id || ''}</span>
                    </div>

                    <div className="mt-[20px] flex items-center">
                      <div className="btn mr-[8px]">
                        <IconInfoCircle className='size-[16px] text-[#007DFA]' />
                        <span>查看详情</span>
                      </div>
                      <div className="btn">
                        <UpgradepIcon className='size-[16px] text-[#007DFA]' />
                        <span>使用Prompt</span>
                      </div>

                      <Dropdown
                        droplist={
                          <Menu className="w-[96px] menu">
                            <Menu.Item
                              key="delete"
                              onClick={() => {
                                doDelete(app);
                              }}
                            >
                              复制模板
                            </Menu.Item>
                            <Menu.Item key="edit" onClick={() => {
                              setDebugItem(app);
                              setShowDebugDrawer(true);
                            }}>
                              Prompt调试
                            </Menu.Item>
                          </Menu>
                        }
                        position="bl"
                      >
                        <Button
                          className="size-[32px] ml-[8px] flex-none"
                          type="outline"
                          icon={<IconMoreVertical />}
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
      { showDebugDrawer && <DebugDrawer visible={showDebugDrawer} setVisible={setShowDebugDrawer} submit={() => {}} /> }
      { showCreateDrawer && <CreateDrawer visible={showCreateDrawer} setVisible={setShowCreateDrawer} submit={() => {}} /> }
    </>
  );
}

export default observer(PromptTplPage);
