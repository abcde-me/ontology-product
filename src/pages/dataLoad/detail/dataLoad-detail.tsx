import { Breadcrumb } from '@arco-design/web-react'
import { IconArrowLeft, IconEdit } from '@arco-design/web-react/icon';
import React, { useState } from 'react'
import { Router } from 'react-router';
import TableDetail from './table-detail'
import './index.css'
const BreadcrumbItem = Breadcrumb.Item;
const DataLoadDetail = () => {
    const [listDetail, setListDetail] = useState(
        {
            "task_info": {
                "id": 123,
                "name": "daily-image-import",
                "source_type": "HDFS",
                "connector": {
                    "id": 456,
                    "name": "hdfs-prod-01",
                    "type": "HDFS"
                },
                "load_type": "cron",
                "cron_expression": "0 0 3 * * ?",
                "dest_path": "minio/vision-data",
                "status": "running",
                "created_at": "2025-06-16 18:40:36",
                "last_run_time": "2025-06-16 18:40:36",
                "creator": "user123"
            },
            "execution_history": [
                {
                    "execution_id": 7891,
                    "execution_name": "RUN-20250306-001",
                    "status": "succeed",
                    "start_time": "2025-06-16 18:40:36",
                    "end_time": "2025-06-16 18:40:36",
                    "details": {
                        "success_files": 245,
                        "failed_files": 2,
                        "error_message": null
                    }
                },
                {
                    "execution_id": 7890,
                    "execution_name": "RUN-20250306-002",
                    "status": "failed",
                    "start_time": "2025-06-16 18:40:36",
                    "end_time": "2025-06-16 18:40:36",
                    "details": {
                        "success_files": 0,
                        "failed_files": 0,
                        "error_message": "Connection timeout to HDFS server"
                    }
                }
            ]
        }
    )
    return <div>
        <div style={{ margin: '15px 0px', fontSize: '20px', display: 'flex', alignItems: 'center' }}>
            <IconArrowLeft onClick={() => { Router }} />
            <Breadcrumb style={{ marginLeft: '15px', fontSize: '17px' }}>
                <BreadcrumbItem href='/tenant/compute/modaforge/dataLoad'>数据载入</BreadcrumbItem>
                <BreadcrumbItem>新建成功的载入名称</BreadcrumbItem>
            </Breadcrumb>
        </div>
        <div style={{
            backgroundColor: 'white',
            display: 'flex', flexDirection: 'column',
            margin: '10px 20px 10px 0px', borderRadius: '10px',
            height: '500px'
        }}>
            <div className='box'>
                <div style={{ fontSize: '17px', fontWeight: '600' }}>任务信息</div>
                <div style={{ color: 'rgb(0, 125, 250)' }}> <IconEdit /> 编辑</div>
            </div>
            <div className="info-container">
                <div className="info-column">
                    <div className="info-item">
                        <span className="label">载入位置：</span>
                        <span className="value">{listDetail.task_info.dest_path}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">创建人：</span>
                        <span className="value">{listDetail.task_info.creator}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">创建时间：</span>
                        <span className="value">{listDetail.task_info.created_at}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">更新时间：</span>
                        <span className="value">{listDetail.task_info.last_run_time}</span>
                    </div>
                </div>
                <div className="info-column">
                    <div className="info-item">
                        <span className="label">数据源类型：</span>
                        <span className="value">{listDetail.task_info.source_type}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">连接器名称：</span>
                        <span className="value">{listDetail.task_info.connector.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">载入形式：</span>
                        <span className="value">{listDetail.task_info.load_type == 'once' ? '单次载入' : '周期载入'}
                            {listDetail.task_info.load_type == 'cron' && <span className="toggle-enabled">启用</span>}
                        </span>
                    </div>
                    {
                        listDetail.task_info.load_type == 'cron' &&
                        <div className="info-item">
                            <span className="label">周期设置：</span>
                            <span className="value">每天 10:00 运行</span>
                        </div>
                    }

                </div>
            </div>
            <TableDetail />
        </div>
    </div>
}
export default DataLoadDetail