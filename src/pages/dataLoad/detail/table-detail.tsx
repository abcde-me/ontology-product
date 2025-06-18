import { Button, Input, Table } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import React, { useState } from 'react'
import './index.css'
const InputSearch = Input.Search;
const columns = [
    {
        title: '运行ID',
        dataIndex: 'name',
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: 100
    },
    {
        title: '载入结果',
        render: ((_, item) => (
            <div style={{ display: 'flex' }}>
                <div style={{ color: 'green' }}>{`成功：${item.details.success_files}`}</div>
                <div style={{ color: 'red', marginLeft: '10px' }}>{`失败：${item.details.failed_files}`}</div>
            </div>
        ))
    },
    {
        title: '开始时间',
        dataIndex: 'start_time',
    },
    {
        title: '结束时间',
        dataIndex: 'end_time',
    },
    {
        title: '操作',
        render: ((_, tiem) => (
            <span style={{ color: 'rgb(0, 125, 250)', cursor: 'pointer' }}>详情</span>
        ))
    },
];

const TableDetail = () => {
    const [data, setData] = useState([
        {
            id: '7891',
            name: 'RUN-20250306-001',
            status: 'succeed',
            start_time: '2025-06-16 18:40:36',
            end_time: '2025-06-16 18:40:36',
            details: {
                success_files: 245,
                failed_files: 2,
                error_message: null
            }

        }
    ])
    return <div>
        <div style={{ margin: '15px 0px 15px 20px', fontSize: '17px', fontWeight: '600' }}>
            运行历史
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0px 15px' }}>
            <InputSearch placeholder='搜索运行ID' style={{ width: 230 }} />
            <Button type='primary' icon={<IconPlus />} >
                新建运行
            </Button>
        </div>
        <div style={{ margin: '15px 0px 15px 15px' }}>
            <Table columns={columns} data={data} border={false} />
        </div>
    </div>
}
export default TableDetail  