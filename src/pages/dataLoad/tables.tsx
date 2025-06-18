import { Table } from '@arco-design/web-react'
import React, { useEffect, useState } from 'react'

const Tables = (props) => {
    const columns = [
        {
            title: '载入任务名称',
            dataIndex: 'name',
            width: 300,
            ellipsis: true,
        },
        {
            title: '载入形式',
            dataIndex: 'load_type',
            width: 150,
            filters: [
                {
                    text: '单次载入',
                    value: 'once'
                },
                {
                    text: '周期载入',
                    value: 'cron'
                }
            ],
            onFilter: (value, row) => row.zairutype == value,
            render: ((_, item) => (
                <div>{item.zairutype == 'once' ? '单次载入' : '周期载入'}</div>
            ))
        },
        {

            title: '最近运行状态',
            dataIndex: 'status',
            width: 170,
            render: ((_, item) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '5px', height: '5px',
                        background: item.status == 'failed' ? 'red' : item.status == 'succeed' ? 'green' : item.status == 'running' ? 'rgb(0, 125, 250)' : 'rgb(148, 163, 184)',
                        borderRadius: '50%'
                    }}></div>
                    <div style={{ marginLeft: '6px' }}>
                        {item.status == 'succeed' && '运行成功'}
                        {item.status == 'failed' && '运行失败'}
                        {item.status == 'running' && '运行中'}
                        {item.status == 'stopped' && '运行停止'}
                    </div>
                </div>
            )),
            filters: [
                {
                    text: '运行成功',
                    value: 'succeed'
                },
                {
                    text: '运行失败',
                    value: 'failed'
                },
                {
                    text: '运行中',
                    value: 'running'
                },
                {
                    text: '运行停止',
                    value: 'stopped'
                }
            ],
            onFilter: (value, row) => row.status == value,

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
            dataIndex: 'connector_name',
            width: 230
        },
        {
            title: '载入位置',
            dataIndex: 'dest_path',
            width: 200,
            ellipsis: true
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            width: 240,
            render: ((_, item) => (
                <span>{item.created_at}</span>
            ))
        },
        {
            title: '更新时间',
            dataIndex: 'last_run_time',
            width: 240,
            render: ((_, item) => (
                <span>{item.last_run_time}</span>
            ))
        },
        {
            title: '操作',
            fixed: 'right',
            width: 130,
            render: ((_, item) => (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
                    {/* 需要什么操作按钮父级传什么操作按钮 */}
                    {props.myDiv}
                </div>
            )
            )
        },
    ] as any;
    const [data, setData] = useState([
        {
            id: '1',
            name: '中科院大数据库任务1',
            load_type: 'once', //once单次载入 cron周期载入
            status: 'running',
            source_type: 's3',
            connector_name: '连接器名称',
            dest_path: '/232482347287/hshfusdhf/4234',
            created_at: '1749627860785',
            last_run_time: '1749627860785',
            creator: '张三',
            enable: true,
            connector_id: '456'
        },
        {
            id: '1',
            name: '中科院大数据库任务1',
            load_type: 'once', //once单次载入 cron周期载入
            status: 'succeed',
            source_type: 's3',
            connector_name: '连接器名称',
            dest_path: '/232482347287/hshfusdhf/4234',
            created_at: '1749627860785',
            last_run_time: '1749627860785',
            creator: '张三',
            enable: true,
            connector_id: '456'
        },
        {
            id: '1',
            name: '中科院大数据库任务1',
            load_type: 'once', //once单次载入 cron周期载入
            status: 'failed',
            source_type: 's3',
            connector_name: '连接器名称',
            dest_path: '/232482347287/hshfusdhf/4234',
            created_at: '1749627860785',
            last_run_time: '1749627860785',
            creator: '张三',
            enable: true,
            connector_id: '456'
        },
        {
            id: '1',
            name: '中科院大数据库任务1',
            load_type: 'once', //once单次载入 cron周期载入
            status: 'stopped',
            source_type: 's3',
            connector_name: '连接器名称',
            dest_path: '/232482347287/hshfusdhf/4234',
            created_at: '1749627860785',
            last_run_time: '1749627860785',
            creator: '张三',
            enable: true,
            connector_id: '456'
        },
    ])
    useEffect(() => {
        // 传递过来的数据
        setData(props.data)
    }, [])
    return <Table
        columns={columns}
        data={data}
        style={{ padding: '10px 20px' }}
        rowKey="id" border={false}
        scroll={{
            x: 1500,
        }} />
}
export default Tables