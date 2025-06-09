import { collectionDetail, deleteTool } from '@/api/tools';
import Avatar from '@/components/avater';
import { Collection, CollectionType } from '@/utils/type';
import {
  Button,
  Grid,
  Link,
  Message,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import { IconDelete, IconSettings } from '@arco-design/web-react/icon';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ShowCreateTool } from './const';
import CreateDrawer from './drawer';
import DefaultToolIcon from '@/assets/default-tool-icon.svg';
import SearchBar from '@/components/search-bar';
import { Table } from '@ccf2e/arco-material';
import { useToolsProviders } from '@/utils/swr';

export default function ToolList(props: {
  isStore?: boolean;
  list: Collection[];
  loading: boolean;
  refresh: () => void;
}) {
  const { isStore, list, loading, refresh } = props;
  const history = useHistory();
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data: publicPlugins } = useToolsProviders();

  const [searchText, setSearchText] = useState('');
  const customTools = (list || []).filter((item) =>
    (item.label.zh_Hans || item.label.en_US)
      .toLocaleLowerCase()
      .includes(searchText.toLocaleLowerCase())
  );
  const [curCol, setCurCol] = useState(null);

  useEffect(() => {
    if (localStorage.getItem(ShowCreateTool) === 'true') {
      setShowDrawer(true);
      localStorage.setItem(ShowCreateTool, 'false');
    }
  }, []);

  const showSetting = useCallback((item: Collection) => {
    setLoadingDetail(true);
    collectionDetail(item.name)
      .then((res) => {
        setCurCol(res);
        setShowDrawer(true);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  }, []);
  const doDelete = useCallback(
    (item: Collection) => {
      Modal.confirm({
        title: '删除工具',
        content:
          '确定删除工具' + (item.label.zh_Hans || item.label.en_US) + '吗？',
        onOk() {
          return deleteTool(item.name).then(() => {
            Message.success('操作成功');
            refresh();
          });
        }
      });
    },
    [refresh]
  );

  const [showDrawer, setShowDrawer] = useState(false);
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
        render(_, item) {
          return item.description.zh_Hans || item.description.en_US;
        },
        width: 300
      },
      {
        title: '作者',
        dataIndex: 'author',
        width: 150
      },
      {
        title: '可见性',
        dataIndex: 'visibility',
        width: 150,
        render(_, data) {
          const isPublic = (publicPlugins || []).some(
            (item) => item.name === data.name
          );
          return (
            <Tag color={isPublic ? 'green' : 'blue'}>
              {isPublic ? '全网可见' : '自己可见'}
            </Tag>
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'oper',
        width: 150,
        render(_, item) {
          return (
            <Space>
              <Link onClick={() => showSetting(item)}>设置</Link>
              <Link onClick={() => doDelete(item)}>删除</Link>
            </Space>
          );
        }
      }
    ];
  }, [doDelete, publicPlugins, showSetting]);

  return (
    <Spin className="appforge-spin" loading={loading || loadingDetail} block>
      <div className="relative h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[20px] flex items-center">
            <span className="mr-auto text-[20px] leading-[32px] text-[var(--color-text-1)]">
              插件列表
            </span>
            <Button
              type="primary"
              onClick={() => {
                setCurCol(null);
                setShowDrawer(true);
              }}
            >
              新建插件
            </Button>
          </div>
          <SearchBar
            onSearch={(val) => {
              setSearchText(val?.name || '');
              refresh();
            }}
            onTypeChange={(val) => setShowType(val)}
            searchConfig={[
              {
                key: 'name',
                label: '插件名称',
                type: 'input',
                placeholder: '请输入插件名称以模糊查询'
              }
            ]}
          />
          {showType === 'card' ? (
            <Grid
              cols={{ xs: 1, sm: 2, xl: 3, xxl: 4 }}
              colGap={16}
              rowGap={16}
            >
              {(customTools || []).map((item) => {
                const isPublic = (publicPlugins || []).some(
                  (i) => i.name === item.name
                );
                return (
                  <Grid.GridItem key={item.name}>
                    <div
                      key={item.name}
                      className="rounded-[4px] border border-[rgb(var(--primary-3))] bg-gradient-to-b from-[rgba(226,239,255,0.2)] to-[rgba(255,255,255,0.2)] p-[16px] hover:cursor-pointer hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.1)]"
                      onClick={() => {
                        if (item.type === CollectionType.custom)
                          history.push(
                            '/tenant/compute/appforge/toolDetail?name=' +
                              item.name +
                              '&type=' +
                              item.type
                          );
                        else
                          history.push(
                            '/tenant/compute/appforge/toolStoreDetail?provider=' +
                              item.name
                          );
                      }}
                    >
                      <div className="mb-[12px] flex">
                        <Avatar
                          readonly
                          size={44}
                          value={
                            typeof item.icon === 'object'
                              ? item.icon.content
                              : ''
                          }
                          className="mr-[8px]"
                          defaultIcon={
                            <DefaultToolIcon className="size-[44px]" />
                          }
                        />
                        <div className="flex-auto overflow-hidden">
                          <div className="flex items-center">
                            <Tooltip
                              content={item.label.zh_Hans || item.label.en_US}
                            >
                              <div className="mr-[8px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-[600] leading-[24px] text-[rgb(var(--primary-5))]">
                                {item.label.zh_Hans || item.label.en_US}
                              </div>
                            </Tooltip>
                            {isStore ? null : (
                              <IconSettings
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  showSetting(item);
                                }}
                                className="appforge-icon-clickable ml-auto mr-[8px] flex-none"
                              />
                            )}
                            {isStore ? null : (
                              <IconDelete
                                className="appforge-icon-clickable  flex-none"
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  doDelete(item);
                                }}
                              />
                            )}
                          </div>
                          <div className="text-[var(--color-text-5)]">
                            <span className="font-[600]">作者: </span>
                            <span>{item.author}</span>
                          </div>
                        </div>
                      </div>

                      <div className=" two-row-ellipse h-[40px] text-[var(--color-text-5)]">
                        {item.description.zh_Hans || item.description.en_US}
                      </div>
                      {isStore ? null : (
                        <div className="mt-[10px]">
                          <Tag color={isPublic ? 'green' : 'blue'}>
                            {isPublic ? '全网可见' : '自己可见'}
                          </Tag>
                        </div>
                      )}
                    </div>
                  </Grid.GridItem>
                );
              })}
            </Grid>
          ) : (
            <Table
              columns={columns}
              data={customTools || []}
              scroll={{ x: true }}
              rowKey="name"
            />
          )}
        </div>
        <CreateDrawer
          collection={curCol}
          visible={showDrawer}
          onCancel={() => setShowDrawer(false)}
          onSuccess={() => {
            setShowDrawer(false);
            refresh();
          }}
        />
      </div>
    </Spin>
  );
}
