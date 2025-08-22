import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Typography, Tag, Form, Tabs, Radio, Popover } from '@arco-design/web-react';
import { useParams } from 'react-router';
import { DataSourceModal } from './detailModal';
import { formatDateTime } from './common';

const { Title } = Typography;

// 添加props接口定义
interface BobConfigurationProps {
    type: string;
    ref: React.RefObject<any>;
}
const TabsStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 20,
};
// 接收getJobTableContent方法作为props
export default function BasicConfiguration({ type }: BobConfigurationProps) {
    const [form] = Form.useForm();
    const FormItem = Form.Item;
    const TabPane = Tabs.TabPane;
    const RadioGroup = Radio.Group;

    const [selectedRadio, setSelectedRadio] = useState('');
    // 数据集 - 选中数据内容
    const [selectedData, setSelectedData]: any = useState([]);
    const [isShowErrorInfo, setIsShowErrorInfo] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isShowDataErrorInfo, setIsShowDataErrorInfo] = useState(false)


    // table -- 

    return (
        
    )
}



