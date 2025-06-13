import { Button, Input, Message, Pagination, Popconfirm, Table } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import timeFormattig from '@/components/conversion-time/timeFormatting';
import React, { useMemo, useState } from 'react';
import Styles from './index.module.css'
const InputSearch = Input.Search;
export default function DataLoad() {
  const columns = [
    {
      title: '载入任务名称',
      dataIndex: 'name',
      width: 300,
      ellipsis: true,
    },
    {
      title: '载入形式',
      dataIndex: 'zairutype',
      width: 150,
      filters: [
        {
          text: '单次载入',
          value: 'd'
        },
        {
          text: '周期载入',
          value: 'z'
        }
      ],
      onFilter: (value, row) => row.zairutype == value,
      render: ((_, item) => (
        <div>{item.zairutype == 'd' ? '单次载入' : '周期载入'}</div>
      ))
    },
    {
      title: '最近运行状态',
      dataIndex: 'state',
      width: 170,
      render: ((_, item) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '5px', height: '5px',
            background: item.state == '运行失败' ? 'red' : item.state == '运行成功' ? 'green' : item.state == '运行中' ? 'rgb(0, 125, 250)' : 'rgb(148, 163, 184)',
            borderRadius: '50%'
          }}></div>
          <div style={{ marginLeft: '6px' }}>{item.state}</div>
        </div>
      )),
      filters: [
        {
          text: '运行成功',
          value: '运行成功'
        },
        {
          text: '运行失败',
          value: '运行失败'
        },
        {
          text: '运行中',
          value: '运行中'
        },
        {
          text: '运行停止',
          value: '运行停止'
        }
      ],
      onFilter: (value, row) => row.state == value,

    },
    {
      title: '数据源类型',
      dataIndex: 'source_type',
      width: 170,
      render: ((_, item) => (
        <span>{item.source_type == 's3' ? '对象存储' : 'HDFS'}</span>
      )),
      filters: [
        {
          text: 'HDFS',
          value: 'hdfs'
        },
        {
          text: '对象存储',
          value: 's3'
        }
      ],
      onFilter: (value, row) => row.source_type == value,
    },
    {
      title: '连接器名称',
      dataIndex: 'conname',
      width: 230
    },
    {
      title: '载入位置',
      dataIndex: 'path',
      width: 200,
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 240,
      render: ((_, item) => (
        <span>{timeFormattig(item.created_at)}</span>
      ))
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 240,
      render: ((_, item) => (
        <span>{timeFormattig(item.updated_at)}</span>
      ))
    },
    {
      title: '操作',
      fixed: 'right',
      width: 130,
      render: ((_, item) => (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
          <span className={Styles.hoverStyle}>详情</span>
          <Popconfirm
            focusLock
            title="删除该连接器"
            content="删除该连接器后，也会终止正在运行的数据载入任务(包括单次载入和周期性载入任务)，是否要继续操作?"
            onOk={() => {
              deleteHan(item.id);
              Message.success({
                content: '删除成功'
              });
            }}
            onCancel={() => {
              Message.error({
                content: '删除失败，请重试'
              });
            }}
          >
            <span className={Styles.hoverStyle}>删除</span>
          </Popconfirm>

        </div>
      )
      )
    },
  ] as any;
  const data = [
    {
      id: '1',
      name: '中科院大数据库任务1',
      zairutype: 'd',
      state: '运行失败',
      source_type: 's3',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '2',
      name: '中科院大数据库任务2',
      zairutype: 'z',
      state: '运行成功',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '3',
      name: '中科院大数据库任务3',
      zairutype: 'z',
      state: '运行中',
      source_type: 's3',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '4',
      name: '中科院大数据库任务4',
      zairutype: 'd',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '5',
      name: '中科院大数据库任务5',
      zairutype: 'z',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '6',
      name: '中科院大数据库任务6',
      zairutype: 'd',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '7',
      name: '中科院大数据库任务7',
      zairutype: 'z',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '8',
      name: '中科院大数据库任务8',
      zairutype: 'd',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '9',
      name: '中科院大数据库任务9',
      zairutype: 'd',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
    {
      id: '10',
      name: '中科院大数据库任务10',
      zairutype: 'd',
      state: '运行停止',
      source_type: 'hdfs',
      conname: '连接器名称',
      path: '/232482347287/hshfusdhf/4234',
      created_at: '1749627860785',
      updated_at: '1749627860785'
    },
  ];
  // 当前的第几页
  const [current, SetCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, SetPageSize] = useState(10);
  // 改变数据的逻辑
  const handlePageChange = (page) => {
    SetCurrent(page);
  };
  const [searchValue, setSearchValue] = useState('')
  // 根据搜索条件过滤连接器
  const filteredConnectors = useMemo(() => {
    return data.filter(connector => {
      const query = searchValue.toLowerCase();
      return (
        connector.name.toLowerCase().includes(query)
      );
    });
  }, [data, searchValue]);


  const currentPageData = useMemo(() => {
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredConnectors.slice(startIndex, endIndex);
  }, [current, pageSize, filteredConnectors]);

  // 点击删除的逻辑
  const deleteHan = (id) => {
    console.log('删除了'+id);
    
  }
  return <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', margin: '10px 20px 10px 0px', borderRadius: '10px', height: '94%' }}>
    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '20px 0px 15px 20px' }}>数据载入</h1>
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0px 20px' }}>
      <InputSearch placeholder='输入关键词搜索' style={{ width: 230 }} onChange={(value) => {
        setSearchValue(value)
      }} />
      <Button type='primary' icon={<IconPlus />} onClick={() => {
        // childAddAndSetModalHan(null)
      }} >
        创建数据载入任务
      </Button>
    </div>
    <Table columns={columns} data={currentPageData} style={{ padding: '10px 20px' }}
      pagination={false}
      rowKey="id"
      border={false}
      scroll={{
        x: 1500,
      }}
    />
    <div className={Styles.arcoPagination}>
      <Pagination
        current={current}
        pageSize={pageSize}
        onPageSizeChange={(pageSize) => {
          SetPageSize(pageSize);
          SetCurrent(1);
        }}
        onChange={handlePageChange}
        sizeOptions={[1, 2, 5, 10]}
        showTotal
        total={filteredConnectors.length}
        showJumper
        sizeCanChange
        style={{ marginBottom: '20px' }}
      />
    </div>

  </div>;
}
