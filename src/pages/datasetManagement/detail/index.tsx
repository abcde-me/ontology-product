import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Typography, Button, Space } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import { Breadcrumb } from "@arco-design/web-react";
import BreadcrumbCom from '@/components/breadcrumb-com';
import { getDatasetDetail } from '@/api/datasetManagement';
import './style.css';

const { Title } = Typography;

const DatasetDetail: React.FC = () => {
    const [datasetDetail, setDatasetDetail] = React.useState<any>(null);
    const { id } = useParams<{ id: string }>();
    const history = useHistory();


    // 返回按钮
    const handleBack = () => {
        window.history.back(); // 或者用react-router的navigate(-1)
    };

    // 跳转到数据集管理页面
    const handleGoToDatasetList = () => {
        history.push('/tenant/compute/modaforge/datasetManagement');
    };

    React.useEffect(() => {
        // getDatasetDetail(id).then(res => {
        //     console.log(res)
        //     setDatasetDetail(res.data)
        // })
    }, [])

    return (
        <div className="dataset-detail">
            {/* 面包屑导航区域 */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                <Button
                    type="text"
                    icon={<IconLeft />}
                    onClick={handleBack}
                    style={{ marginRight: 8 }}
                />
                <Breadcrumb style={{ fontSize: 18 }}>
                    <Breadcrumb.Item>
                        <span
                            // style={{ cursor: 'pointer', color: '#165dff' }}
                            onClick={handleGoToDatasetList}
                        >
                            数据集管理
                        </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>数据集详情</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* 页面内容区域 */}
            <div className="dataset-content">
                {/* <Title heading={4} style={{ marginBottom: 16 }}>
                    数据集详情
                </Title>
                <p>数据集ID: {id}</p>
                <p>这里可以添加更多的数据集详情内容...</p> */}
            </div>
        </div>
    );
};

export default DatasetDetail; 