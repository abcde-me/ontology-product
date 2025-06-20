import React, { useMemo, useState } from "react";
import { Input, Pagination, Table } from '@arco-design/web-react';
import { useHistory } from "react-router";
import { ColumnProps } from "@arco-design/web-react/es/Table";
import TimeFormatting from '@/utils/timeFormatting'
import './index.css'

const InputSearch = Input.Search;

export default function WorkflowTask() {
    const history = useHistory();
    // 初始化搜索框value
    const [searchValue, setSearchValue] = useState('')
    // 初始化作业列表数据
    const [workflowTaskData, setWorkflowTaskData] = useState([
        {
            id: '1',
            job_name: 'Jane Doe',
            time_size: '50分20秒',
            source_path: 'jane.doe@example.com',
            target_path: 'jane.doe@example.com',
            start_time: '1749627834576',
            end_time: '1749627834576',
        },
        {
            id: '2',
            job_name: 'Alisa Ross',
            time_size: '50分20秒',
            source_path: 'alisa.ross@example.com',
            target_path: 'jane.doe@example.com',
            start_time: '1749627876834',
            end_time: '1749627834576',
        },
        {
            id: '3',
            job_name: 'Kevin Sandra',
            time_size: '50分20秒',
            source_path: 'kevin.sandra@example.com',
            target_path: 'jane.doe@example.com',
            start_time: '1749627812365',
            end_time: '1749627834576',
        },
        {
            id: '4',
            job_name: '张三',
            time_size: '50分20秒',
            source_path: 'kevin.sandra@example.com',
            target_path: 'jane.doe@example.com',
            start_time: '174962787645',
            end_time: '1749627834576',
        },
        {
            id: '5',
            job_name: '李四',
            time_size: '50分20秒',
            source_path: 'kevin.sandra@example.com',
            target_path: 'jane.doe@example.com',
            start_time: '1749627860783',
            end_time: '1749627834576',
        },
    ]);
    // 当前的第几页
    const [current, setCurrent] = useState(1);
    // 每页展示数据的数据量
    const [pageSize, setPageSize] = useState(10);

    const handleToTaskDeatil = (id: any) => {
        history.push(`/tenant/compute/modaforge/workflowTaskDetail?id=${id}`);
    }

    // table columns
    const columns: ColumnProps<any>[] = [
        {
            title: '作业ID',
            dataIndex: 'id',
            width: 120,
            render: (_, record) => (
                <span className="operate-text">{record.id}</span>
            )
        }, {
            title: '运行时长',
            dataIndex: 'time_size',
            width: 130,
        }, {
            title: '工作流名称',
            dataIndex: 'job_name',
            width: 130,
            ellipsis: true,
            render: (_, record) => (
                <span className="operate-text" onClick={() => handleToTaskDeatil(record.id)} title={record.job_name}>{record.job_name}</span>
            )
        }, {
            title: '源数据目录',
            dataIndex: 'source_path',
            width: 230,
            ellipsis: true,
            render: (_, record) => (
                <span className="operate-text" title={record.source_path}>{record.source_path}</span>
            )
        }, {
            title: '目标数据目录',
            dataIndex: 'target_path',
            width: 230,
            ellipsis: true,
            render: (_, record) => (
                <span className="operate-text" title={record.target_path}>{record.target_path}</span>
            )
        }, {
            title: '开始时间',
            dataIndex: 'start_time',
            width: 150,
            render: (_, record) => (
                <span>{TimeFormatting(record.start_time)}</span>
            ),
            sorter: (a, b) => a.start_time.length - b.start_time.length
        }, {
            title: '结束时间',
            dataIndex: 'end_time',
            width: 150,
            render: (_, record) => (
                <span>{TimeFormatting(record.end_time)}</span>
            ),
            sorter: (a, b) => a.end_time.length - b.end_time.length
        }
    ]

    // 根据搜索条件过滤作业
    const filterWorkflowTaskData = useMemo(() => {
        return workflowTaskData.filter(item => {
            const query = searchValue.toLowerCase();
            return (
                item.id.toLowerCase().includes(query)
            );
        });
    }, [workflowTaskData, searchValue]);

    return (
        <div className="workflow-task">
            <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>作业</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '15px 0' }}>
                <InputSearch placeholder='输入作业ID搜索' style={{ width: 230 }} value={searchValue} onChange={(value) => {
                    setSearchValue(value)
                }} />
            </div>
            <Table border={false} columns={columns} data={filterWorkflowTaskData} pagination={false} rowKey="id" />
            {/* 分页 */}
            <Pagination
                current={current}
                pageSize={pageSize}
                onPageSizeChange={(pageSize) => {
                    setPageSize(pageSize);
                    setCurrent(1);
                }}
                onChange={(page) => {
                    setCurrent(page);
                }}
                sizeOptions={[2, 5, 10, 20]}
                showTotal
                total={filterWorkflowTaskData.length}
                showJumper
                sizeCanChange
                style={{ justifyContent: 'flex-end', marginTop: '10px' }}
            />
        </div>
    )
}