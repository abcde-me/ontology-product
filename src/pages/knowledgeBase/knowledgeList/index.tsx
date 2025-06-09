import {
  Button,
  Empty,
  Grid,
  Radio,
  Space,
  Tooltip,
  Link,
  Spin,
  Pagination,
  Message,
  Dropdown,
  Menu,
  Switch
} from '@arco-design/web-react';
import {
  IconApps,
  IconClockCircle,
  IconDelete,
  IconMoreVertical,
  IconRefresh,
  IconSettings,
  IconUnorderedList
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { deleteKnowledge, getKnowledgeList } from '@/api/knowledgeBase';
import { SearchBox, Table, confirm } from '@ccf2e/arco-material';
import dayjs from 'dayjs';
import EllipsisPopover from '@/components/EllipsisPopoverCom';
import './index.css';
import { EditDrawer } from '../components/editDrawer';
import { formatNumber } from '@/utils/format';
import Avatar from '@/components/avater';
import DefaultKnowledgeIcon from '@/assets/default-knowledge-icon.svg';
import { CreateKbModal } from '../knowledgeCreate/createKbModal';

function KnowledgeListPage() {
  const history = useHistory();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [type, setType] = React.useState('card');
  const [searchResult, setSearchResult] = React.useState({});
  const [visible, setVisible] = React.useState(false);
  const [showNewModal, setShowNewModal] = React.useState(false);
  const [record, setRecord] = React.useState<any>({});
  const [pagination, setPagination] = React.useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 12,
    sizeOptions: [12, 24, 36, 48, 60],
    current: 1,
    pageSizeChangeResetCurrent: true
  });

  const [query, setQuery] = React.useState<any>({
    page: pagination.current,
    limit: pagination.pageSize
  });

  const searchConfig: any = [
    {
      key: 'name',
      label: '知识库名称',
      type: 'input',
      placeholder: '请输入知识库名称以模糊查询'
    }
  ];

  const columns: any = [
    {
      title: '知识库名称',
      dataIndex: 'name',
      width: 300,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover
              value={record.name}
              isEdit={false}
              preferTypography
            />
          </>
        );
      }
    },
    {
      title: `文件数`,
      dataIndex: 'document_count',
      width: 200,
      render: (col, record) => {
        return <>{record.document_count || '--'}</>;
      }
    },
    {
      title: '知识库大小',
      dataIndex: 'word_count',
      width: 140,
      render: (col, record) => {
        return (
          <>
            {record.word_count
              ? record.word_count > 1000
                ? `${formatNumber((record.word_count / 1000).toFixed(1))}k`
                : record.word_count
              : 0}
          </>
        );
      }
    },
    {
      title: '关联应用',
      dataIndex: 'app_count',
      width: 140,
      render: (col, record) => {
        return <>{record.app_count || '--'}</>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 200,
      render: (col) => !!col && dayjs(col * 1000).format('YYYY-MM-DD  HH:mm:ss')
    },

    {
      title: '描述',
      dataIndex: 'description',
      width: 400,
      ellipsis: true,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover
              value={record.description}
              isEdit={false}
              preferTypography
            />
          </>
        );
      }
    },

    {
      title: '操作',
      dataIndex: 'operation',
      align: 'right',
      fixed: 'right',
      width: 160,
      render: (col, record) => {
        return (
          <Space>
            <Link onClick={() => handleOperat('details', record)}>详情</Link>
            <Link onClick={() => handleOperat('edit', record)}>设置</Link>
            <Link onClick={() => handleOperat('delete', record)}>删除</Link>
          </Space>
        );
      }
    }
  ];

  const handleOperat = async (type, record?) => {
    record && setRecord(record);
    switch (type) {
      case 'delete':
        confirm({
          title: '删除',
          tip: '确认删除知识库?',
          extra: '删除知识库将无法撤销，请谨慎操作！',
          async onOk() {
            try {
              await deleteKnowledge(record.id);
              Message.success('删除知识库成功');
              queryList({ ...query });
            } catch (err) {
              return;
            }
          }
        });
        break;
      case 'details':
        history.push(
          `/tenant/compute/appforge/knowledgeDetail?id=${record.id}`
        );
        break;
      case 'create':
        // history.push('/tenant/compute/appforge/knowledgeCreate');
        setShowNewModal(true);
        break;
      case 'test':
        history.push(`/tenant/compute/appforge/knowledgeTest?id=${record.id}`);
        break;
      case 'edit':
        setVisible(true);
        break;
    }
  };

  // 查询处理
  const onSearch = (val: any) => {
    if (Object.hasOwn(val, 'name')) {
    }

    setPagination({
      ...pagination,
      current: 1
    });
    const param = {
      ...query,
      page: 1
    };
    setQuery({ ...param });
    setSearchResult(val);
  };

  // 切换页码
  const onChangeTable = (pagination, sorter: any, filters, extra) => {
    if (extra.action === 'paginate') {
      const { current, pageSize } = pagination;
      setPagination((page) => ({
        ...page,
        pageSize,
        current: current
      }));
      setQuery({
        ...query,
        page: current,
        limit: pageSize
      });
    }
  };

  const onChangeCard = (pageNumber, pageSize) => {
    setPagination((page) => ({
      ...page,
      pageSize,
      current: pageNumber
    }));
    setQuery({
      ...query,
      page: pageNumber,
      limit: pageSize
    });
  };

  const queryList = async (params) => {
    try {
      setLoading(true);
      const resp = await getKnowledgeList(params);
      const { data = [], total = 0 } = resp;
      setData(data || []);
      setPagination({
        ...pagination,
        total: total || 0
      });
    } catch (err) {
      setData([]);
      setPagination({
        ...pagination,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (item) => {
    return (
      <Grid.GridItem key={item.id}>
        <div
          className="card-content-item"
          onClick={() => handleOperat('details', item)}
        >
          <div className="mb-[8px] flex">
            <Avatar
              readonly
              value=""
              defaultIcon={<DefaultKnowledgeIcon className="size-[44px]" />}
              size={44}
              className="mr-[8px]"
            />
            <div className="flex flex-[1] justify-between">
              <div className="mr-[8px]">
                <EllipsisPopover
                  className="text-[14px] font-[600] leading-[24px] text-[rgb(var(--primary-5))]"
                  value={item.name}
                  isEdit={false}
                  preferTypography
                />
                <div>
                  <span className='kb-type-tag mr-[8px] text'>文本</span>
                  <IconClockCircle className="mr-[4px]" />
                  <span>
                    {item.created_at
                      ? dayjs(item.created_at * 1000).format(
                          'YYYY-MM-DD  HH:mm:ss'
                        )
                      : '--'}
                  </span>
                </div>
              </div>
              {/* <Space>
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOperat('edit', item);
                  }}
                  className="text-[var(--color-text-2)] hover:text-[rgb(var(--link-6))]"
                  icon={<IconSettings />}
                />
                <Link
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOperat('delete', item);
                  }}
                  className="text-[var(--color-text-2)] hover:text-[rgb(var(--link-6))]"
                  icon={<IconDelete />}
                />
              </Space> */}
              <Dropdown
                droplist={
                  <Menu className="w-[96px] menu">
                    <Menu.Item
                      key="enabled"
                      onClick={() => {}}
                    >
                      <span>启用</span>
                      <Switch checked={true} className="ml-[8px]"/>
                    </Menu.Item>
                    <Menu.Item key="edit" onClick={(e) => {e.stopPropagation();handleOperat('edit', item);}}>
                      设置
                    </Menu.Item>
                    <Menu.Item key="test" onClick={(e) => {e.stopPropagation();handleOperat('test', item);}}>
                      召回测试
                    </Menu.Item>
                    <Menu.Item key="delete" onClick={(e) => {e.stopPropagation();handleOperat('delete', item);}}>
                      删除
                    </Menu.Item>
                  </Menu>
                }
                position="bl"
              >
                <Button
                  className="size-[32px] ml-[8px] flex-none more-actions"
                  type="outline"
                  icon={<IconMoreVertical />}
                ></Button>
              </Dropdown>
            </div>
          </div>

          <div className="mb-[8px]">
            <EllipsisPopover
              className="h-[40px] text-[var(--color-text-5)]"
              value={item.description}
              isEdit={false}
              preferTypography
              ellipsis={{ rows: 2 }}
            />
          </div>

          <div className="flex justify-between">
            <div className="card-content-item-content">
              <span className="text-[var(--color-text-4)]">文件数</span>
              <br />
              <span className="test-[14px] font-[600]">
                {item.document_count || 0}
              </span>
            </div>
            <div className="card-content-item-content">
              <span className="text-[var(--color-text-4)]">知识库大小</span>
              <br />
              <span className="test-[14px] font-[600]">
                {item.word_count
                  ? item.word_count > 1000
                    ? `${formatNumber((item.word_count / 1000).toFixed(1))}k`
                    : item.word_count
                  : 0}
              </span>
            </div>
            <div className="card-content-item-content">
              <span className="text-[var(--color-text-4)]">关联应用</span>
              <br />
              <span className="test-[14px] font-[600]">
                {item.app_count || 0}
              </span>
            </div>
          </div>
        </div>
      </Grid.GridItem>
    );
  };

  React.useEffect(() => {
    queryList({ ...query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="h-full py-[20px] pr-[20px]">
      <div className="h-full max-h-[calc(100vh-90px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[20px]">
        <div className="mb-[20px] flex items-center justify-between">
          <div className="text-[18px] font-[500] leading-[28px] text-[var(--color-text-1)]">
            知识库
          </div>
          <Button type="primary" onClick={() => handleOperat('create')}>
            新建知识库
          </Button>
        </div>
        <div className="mb-[20px] flex justify-between">
          <SearchBox
            className="pb-[0px]"
            searchResult={searchResult}
            searchConfig={searchConfig}
            onSearch={onSearch}
          />
          <Space>
            <Radio.Group type="button" defaultValue="card" onChange={setType}>
              <Radio value={'card'}>
                <Tooltip content="卡片视图">
                  <IconApps />
                </Tooltip>
              </Radio>
              <Radio value={'table'}>
                <Tooltip content="列表视图">
                  <IconUnorderedList />
                </Tooltip>
              </Radio>
            </Radio.Group>
            <Button
              type="outline"
              icon={<IconRefresh />}
              onClick={() => queryList({ ...query })}
            />
          </Space>
        </div>

        {type === 'card' && (
          <Spin loading={loading} className="w-full">
            {!!data.length ? (
              <>
                <Grid
                  cols={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                  colGap={16}
                  rowGap={16}
                  className="mb-[20px]"
                >
                  {data.map((item) => {
                    return cardContent(item);
                  })}
                </Grid>
                <Pagination
                  className="float-right"
                  {...pagination}
                  onChange={(pageNumber, pageSize) =>
                    onChangeCard(pageNumber, pageSize)
                  }
                />
              </>
            ) : (
              <Empty />
            )}
          </Spin>
        )}

        {type === 'table' && (
          <Table
            loading={loading}
            scroll={{ x: true }}
            columns={columns}
            rowKey="id"
            data={data}
            pagination={pagination}
            border={false}
            onChange={onChangeTable}
          />
        )}
      </div>
      {visible && (
        <EditDrawer
          record={record}
          visible={visible}
          setVisible={setVisible}
          submit={() => queryList({ ...query })}
        />
      )}
      { showNewModal && <CreateKbModal visible={showNewModal} setVisible={setShowNewModal} />}
    </div>
  );
}

export default observer(KnowledgeListPage);
