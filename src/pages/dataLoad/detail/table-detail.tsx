import { Button, Input, Message, Modal, Pagination, Table } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import React, { useEffect, useState } from 'react'
import './index.css'
import { Link } from 'react-router-dom';
const InputSearch = Input.Search;


const TableDetail = (props) => {
    const columns = [
        {
            title: '运行ID',
            dataIndex: 'execution_name',
            width: 300
        },
        {
            title: '状态',
            width: 150,
            render: ((_, item) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: item.status == 'succeed' ? 'green' : item.status == 'failed' ? 'red' : item.status == 'running' ? 'rgb(0, 125, 250)' : 'rgb(148, 163, 184)'
                    }}></div>
                    <div style={{ marginLeft: '7px' }}>
                        {item.status == 'succeed' && '运行成功'}
                        {item.status == 'failed' && '运行失败'}
                        {item.status == 'running' && '运行中'}
                        {item.status == 'stopped' && '运行停止'}
                    </div>
                    {item.status == 'running' &&
                        <span style={{ color: 'rgb(0, 125, 250)', marginLeft: '7px', cursor: 'pointer' }}
                            onClick={() => { stopTaskHan(item.execution_id) }}>停止</span>}
                </div>
            )),
            filters: [
                {
                    text: '成功',
                    value: 'succeed'
                },
                {
                    text: '失败',
                    value: 'failed'
                },
                {
                    text: '运行中',
                    value: 'running'
                },
            ],
            onFilter: (value, row) => row.status == value,
        },
        {
            title: '载入结果',
            render: ((_, item) => (
                <div style={{ display: 'flex' }}>
                    <div style={{ color: 'green' }}>{`成功：${item.details.success_files.toLocaleString()}`}</div>
                    <div style={{ color: 'red', marginLeft: '10px' }}>{`失败：${item.details.failed_files.toLocaleString()}`}</div>
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
                <span style={{ color: 'rgb(0, 125, 250)', cursor: 'pointer' }}>
                    <Link to='/tenant/compute/modaforge/access/detail'>详情</Link>
                </span>
            ))
        },
    ];
    const [data, setData] = useState([
        {
            id: '7891',
            execution_name: 'RUN-20250306-001',
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
    // 分页的数据
    // 当前页码
    const [current, setCurrent] = useState(1)
    // 每页几条
    const [pageSize, setPageSize] = useState(10)

    // 改变数据的逻辑
    const handlePageChange = (page) => {
        setCurrent(page);
    };
    // 模态框的值
    const [visible, setVisible] = useState(false)
    // 停止单个运行任务

    // 存放id
    const [taskId, setTaskId] = useState(0)
    const stopTaskHan = (id) => {
        setVisible(true)
        // 请求后端接口
        setTaskId(id);
    }
    // 模态框点击确认的按钮
    const modalOk = () => {
        // 请求接口
        // props.tHan()
        props.judgmentTaskHan()
        Message.success('操作成功,停止运行')
        setVisible(false)
    }
    // 模态框点击取消
    const modalNo = () => {
        setVisible(false)
    }

    useEffect(() => {
        setData(props.data)
    }, [])
    return <div>
        <div style={{ margin: '15px 0px 15px 20px', fontSize: '17px', fontWeight: '600' }}>
            运行历史
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0px 15px' }}>
            <InputSearch placeholder='搜索运行ID' style={{ width: 230 }} />
            <Button type='primary' icon={<IconPlus />} disabled={props.runningStatus !== -1 ? true : false}>
                新建运行
            </Button>
        </div>
        <div style={{ margin: '15px 0px 15px 15px', display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
            <Table columns={columns} data={data} border={false} pagination={false} style={{ width: '100%', padding: '0px 30px 0px 0px' }}
                rowKey='execution_id'
            />
            <Pagination
                sizeOptions={[1, 5, 10, 20]}
                showTotal
                total={data.length}
                showJumper
                sizeCanChange
                style={{ margin: '20px 30px' }}
                onChange={handlePageChange}
            />
            <Modal
                visible={visible}
                onOk={modalOk}
                onCancel={modalNo}
                autoFocus={false}
                focusLock={true}
                closable={false}
            >

                <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', margin: '15px' }}>
                    <div style={{
                        width: '20px', height: "20px", borderRadius: '50%', display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgb(255, 125, 0)',
                        marginRight: '10px',
                        color: 'white'
                    }}>!</div>
                    <div style={{ fontSize: '15px' }}>停止运行</div>
                </div>
                <div style={{ padding: '0px 30px 0px 40px' }}>该操作会停止当前数据载入运行任务，停止后将无法恢复运行，是否要继续当前操作?</div>
            </Modal>

        </div>
    </div>
}
export default TableDetail  