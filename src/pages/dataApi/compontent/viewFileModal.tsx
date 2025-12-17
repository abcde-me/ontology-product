import {
  Checkbox,
  Descriptions,
  Modal,
  Table,
  Tabs
} from '@arco-design/web-react';
import React, { useState } from 'react';
import noDataElement from '@/components/no-data';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import styles from './viewFileModal.module.scss';

const TabPane = Tabs.TabPane;

export default function ViewFileModal({ visible, onCancel, id }) {
  const [dataApiData, setDataApiData] = useState([]);

  // 查看文档基本信息数据
  const viewFileBaseInfoData = [
    {
      label: 'API名称',
      value: <EllipsisPopoverCom value="BM_SS_ZY" />
    },
    {
      label: '路径',
      value: (
        <EllipsisPopoverCom value="BM_SS_ZYBMBM_SS_ZYBMBM_SS_ZYBM	BM_SS_ZYBM	BM_SS_ZYBM	BM_SS_ZYBM	BM_SS_ZYBM" />
      )
    },
    {
      label: '请求方式',
      value: 'POST'
    },
    {
      label: '缓存方式',
      value: '关闭缓存'
    },
    {
      label: '缓存过期时长',
      value: '10s'
    }
  ];

  // 查看文档输入参数表列
  const inputParamsColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (text, record, index) => `${index + 1}`
    },
    {
      title: '参数英文名称',
      dataIndex: 'englishName',
      width: 200
    },
    {
      title: '参数中文名称',
      dataIndex: 'chineseName',
      width: 200
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 100
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      width: 150
    },
    {
      title: '数组',
      dataIndex: 'isArray',
      width: 80,
      render: (text, record) => <Checkbox checked={text} disabled />
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      width: 80,
      render: (text, record) => <Checkbox checked={text} disabled />
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200
    }
  ];

  // 查看文档输出参数表列
  const outputParamsColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (text, record, index) => `${index + 1}`
    },
    {
      title: '参数英文名称',
      dataIndex: 'englishName',
      width: 200
    },
    {
      title: '参数中文名称',
      dataIndex: 'chineseName',
      width: 200
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200
    }
  ];

  return (
    <Modal
      className={styles.viewFileModal}
      visible={visible}
      title="API使用文档"
      onCancel={onCancel}
      focusLock={false}
    >
      <>
        <Tabs defaultActiveTab="baseInfo">
          <TabPane key="baseInfo" title="基础信息" />
          <TabPane key="inputParams" title="输入参数" />
          <TabPane key="outputParams" title="输出参数" />
          <TabPane key="requestExample" title="请求示例" />
          <TabPane key="outputExample" title="输出示例" />
          <TabPane key="statusCodes" title="状态码" />
        </Tabs>
        <div className={styles.viewFileContent}>
          <Descriptions
            colon=" :"
            layout="horizontal"
            title="基础信息"
            data={viewFileBaseInfoData}
            column={2}
          />
          <h1 className="mb-4 mt-3 text-sm font-medium">输入参数</h1>
          <Table
            border={false}
            columns={inputParamsColumns}
            data={dataApiData}
            pagination={false}
            noDataElement={noDataElement({ description: '暂无数据' })}
            rowKey="key"
          />
          <h1 className="mb-4 mt-3 text-sm font-medium">输出参数</h1>
          <Table
            border={false}
            columns={outputParamsColumns}
            data={dataApiData}
            pagination={false}
            noDataElement={noDataElement({ description: '暂无数据' })}
            rowKey="key"
          />
        </div>
      </>
    </Modal>
  );
}
