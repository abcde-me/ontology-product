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
  Message
} from '@arco-design/web-react';
import {
  IconApps,
  IconClockCircle,
  IconDelete,
  IconRefresh,
  IconSettings,
  IconUnorderedList,
  IconArrowLeft,
  IconCheckCircle
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { SearchBox, Table, confirm } from '@ccf2e/arco-material';
import dayjs from 'dayjs';
import EllipsisPopover from '@/components/EllipsisPopoverCom';
import { EditDrawer } from './drawer';
import Avatar from '@/components/avater';
import DefaultKnowledgeIcon from '@/assets/default-knowledge-icon.svg';

import './index.css';
import { action } from 'mobx';

function DataSouceListPage() {
  const history = useHistory();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [type, setType] = React.useState('table');
  const [actionType, setActionType] = React.useState('');
  const [searchResult, setSearchResult] = React.useState({});
  const [visible, setVisible] = React.useState(false);
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
      label: '数据源名称',
      type: 'input',
      placeholder: '请输入名称以模糊查询'
    }
  ];

  const columns: any = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      width: 200,
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
      title: `数据源类型`,
      dataIndex: 'type',
      width: 170,
      render: (col, record) => {
        return <>{record.type || '--'}</>;
      }
    },
    {
      title: '接入状态',
      dataIndex: 'status',
      width: 170,
      render: (col, record) => {
        return (
          <span className='flex align-middle'>
            <IconCheckCircle className='size-[16px] text-[#10B981]'/>
            <span className='ml-[4px]'>导入完成</span>
          </span>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'desc',
      width: 170,
      ellipsis: true,
      render: (col, record) => <EllipsisPopover
        value={record.desc}
        isEdit={false}
        preferTypography
      />
    },
    {
      title: '创建人',
      dataIndex: 'created_preson',
      width: 170,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 170,
      render: (col) => !!col && dayjs(col * 1000).format('YYYY-MM-DD  HH:mm:ss')
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
          tip: '确认删除数据源?',
          extra: '删除数据源将无法撤销，请谨慎操作！',
          async onOk() {
            try {
              // await deleteKnowledge(record.id);
              Message.success('删除数据源成功');
              queryList({ ...query });
            } catch (err) {
              return;
            }
          }
        });
        break;
      case 'details':
        setActionType('details');
        setVisible(true);
        break;
      case 'create':
        setActionType('create');
        setVisible(true);
        break;
      case 'edit':
        setActionType('edit');
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

  // const onChangeCard = (pageNumber, pageSize) => {
  //   setPagination((page) => ({
  //     ...page,
  //     pageSize,
  //     current: pageNumber
  //   }));
  //   setQuery({
  //     ...query,
  //     page: pageNumber,
  //     limit: pageSize
  //   });
  // };

  const queryList = async (params) => {
    try {
      setLoading(true);
      // const resp = await getKnowledgeList(params);
      const resp = {
        data: [
          { id: 1, name: 'xxxxx', type: 'OSS', desc: '测试测试', created_at: '2023-09-25 17:04:33', status: 'success' },
          { id: 2, name: '11xxxxx', type: 'MYSQL', desc: '测试测试', created_at: '2023-09-25 17:04:33', status: 'success' },
          { id: 3, name: '22xxxxx', type: 'OSS', desc: '测试测试', created_at: '2023-09-25 17:04:33', status: 'success' },
          { id: 4, name: '33xxxxx', type: 'MYSQL', desc: '测试测试', created_at: '2023-09-25 17:04:33', status: 'success' },
          { id: 5, name: '44xxxxx', type: 'OSS', desc: '测试测试', created_at: '2023-09-25 17:04:33', status: 'success' },
        ],
        total: 100,
      }
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

  // const cardContent = (item) => {
  //   return (
  //     <Grid.GridItem key={item.id}>
  //       <div
  //         className="card-content-item"
  //         onClick={() => handleOperat('details', item)}
  //       >
  //         <div className="mb-[8px] flex">
  //           <Avatar
  //             readonly
  //             value=""
  //             defaultIcon={<DefaultKnowledgeIcon className="size-[44px]" />}
  //             size={44}
  //             className="mr-[8px]"
  //           />
  //           <div className="flex flex-[1] justify-between">
  //             <div className="mr-[8px]">
  //               <EllipsisPopover
  //                 className="text-[14px] font-[600] leading-[24px] text-[rgb(var(--primary-5))]"
  //                 value={item.name}
  //                 isEdit={false}
  //                 preferTypography
  //               />
  //               <div>
  //                 <IconClockCircle className="mr-[4px]" />
  //                 <span>
  //                   {item.created_at
  //                     ? dayjs(item.created_at * 1000).format(
  //                         'YYYY-MM-DD  HH:mm:ss'
  //                       )
  //                     : '--'}
  //                 </span>
  //               </div>
  //             </div>
  //             <Space>
  //               <Link
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   handleOperat('edit', item);
  //                 }}
  //                 className="text-[var(--color-text-2)] hover:text-[rgb(var(--link-6))]"
  //                 icon={<IconSettings />}
  //               />
  //               <Link
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   handleOperat('delete', item);
  //                 }}
  //                 className="text-[var(--color-text-2)] hover:text-[rgb(var(--link-6))]"
  //                 icon={<IconDelete />}
  //               />
  //             </Space>
  //           </div>
  //         </div>

  //         <div className="mb-[8px]">
  //           <EllipsisPopover
  //             className="h-[40px] text-[var(--color-text-5)]"
  //             value={item.description}
  //             isEdit={false}
  //             preferTypography
  //             ellipsis={{ rows: 2 }}
  //           />
  //         </div>

  //         <div className="flex justify-between">
  //           <div className="card-content-item-content">
  //             <span className="text-[var(--color-text-4)]">文件数</span>
  //             <br />
  //             <span className="test-[14px] font-[600]">
  //               {item.document_count || 0}
  //             </span>
  //           </div>
  //           <div className="card-content-item-content">
  //             <span className="text-[var(--color-text-4)]">知识库大小</span>
  //             <br />
  //             <span className="test-[14px] font-[600]">
  //               {item.word_count
  //                 ? item.word_count > 1000
  //                   ? `${formatNumber((item.word_count / 1000).toFixed(1))}k`
  //                   : item.word_count
  //                 : 0}
  //             </span>
  //           </div>
  //           <div className="card-content-item-content">
  //             <span className="text-[var(--color-text-4)]">关联应用</span>
  //             <br />
  //             <span className="test-[14px] font-[600]">
  //               {item.app_count || 0}
  //             </span>
  //           </div>
  //         </div>
  //       </div>
  //     </Grid.GridItem>
  //   );
  // };

  React.useEffect(() => {
    queryList({ ...query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="h-full py-[20px] pr-[20px]">
      <div className="h-full max-h-[calc(100vh-90px)] overflow-auto rounded-[12px] bg-white px-[24px] py-[20px]">
        <div className="mb-[20px] flex items-center">
          <div
            className='size-[24px] flex items-center justify-center mr-[8px] cursor-pointer shadow-lg rounded-full'
            onClick={() => history.goBack()}
          >
            <IconArrowLeft className='size-[16px] text-[#1E293B]'/>
          </div>
          <div className="text-[18px] font-[500] leading-[28px] text-[var(--color-text-1)]">
            数据源管理
          </div>
        </div>
        <div className="mb-[20px] flex justify-between">
          <SearchBox
            className="pb-[0px]"
            searchResult={searchResult}
            searchConfig={searchConfig}
            onSearch={onSearch}
          />
          <Space>
            <Button type="primary" onClick={() => handleOperat('create')}>
              添加数据源
            </Button>
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

        {/* {type === 'card' && (
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
        )} */}

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
          actionType={actionType}
          submit={() => queryList({ ...query })}
        />
      )}
    </div>
  );
}

export default observer(DataSouceListPage);
