import {
  Button,
  Checkbox,
  Descriptions,
  Modal,
  Table,
  Tabs
} from '@arco-design/web-react';
import React, { useCallback, useState } from 'react';
import noDataElement from '@/components/no-data';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import { IconCopy } from '@arco-design/web-react/icon';
import { useScrollTo } from '@/hooks/useScrollTo';
import styles from './viewFileModal.module.scss';

const TabPane = Tabs.TabPane;

export default function ViewFileModal({ visible, onCancel, id }) {
  const [dataApiData, setDataApiData] = useState([]);
  // 查看文档输入参数分页
  const [inputParamsCurrentPage, setInputParamsCurrentPage] = useState(1);
  const [inputParamsTotal, setInputParamsTotal] = useState(0);
  const [inputParamsPageSize, setInputParamsPageSize] = useState(10);
  // 查看文档输出参数分页
  const [outputParamsCurrentPage, setOutputParamsCurrentPage] = useState(1);
  const [outputParamsTotal, setOutputParamsTotal] = useState(0);
  const [outputParamsPageSize, setOutputParamsPageSize] = useState(10);
  // 定位到指定元素
  const scrollTo = useScrollTo();

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

  // 查看文档状态码表列
  const statusCodesColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (text, record, index) => `${index + 1}`
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      width: 100
    },
    {
      title: '码值英文说明',
      dataIndex: 'statusCodeEnglish',
      width: 300
    },
    {
      title: '码值说明',
      dataIndex: 'description',
      width: 200
    }
  ];

  // 查看文档输入参数分页变化
  const handleInputParamsPageChange = (page) => {
    setInputParamsCurrentPage(page);
  };

  // 查看文档输入参数分页大小变化
  const handleInputParamsPageSizeChange = (size) => {
    setInputParamsPageSize(size);
  };

  // 查看文档输出参数分页变化
  const handleOutputParamsPageChange = (page) => {
    setOutputParamsCurrentPage(page);
  };

  // 查看文档输出参数分页大小变化
  const handleOutputParamsPageSizeChange = (size) => {
    setOutputParamsPageSize(size);
  };

  return (
    <Modal
      className={styles.viewFileModal}
      visible={visible}
      title="API使用文档"
      onCancel={onCancel}
      focusLock={false}
    >
      <>
        <Tabs
          defaultActiveTab="baseInfo"
          onChange={(key) => {
            scrollTo(`#${key}`, { smooth: true, align: 'start' });
          }}
        >
          <TabPane key="baseInfo" title="基础信息" />
          <TabPane key="inputParams" title="输入参数" />
          <TabPane key="outputParams" title="输出参数" />
          <TabPane key="requestExample" title="请求示例" />
          <TabPane key="outputExample" title="输出示例" />
          <TabPane key="statusCodes" title="状态码" />
        </Tabs>
        <div className={styles.viewFileContent}>
          <div id="baseInfo">
            <Descriptions
              colon=" :"
              layout="horizontal"
              title="基础信息"
              data={viewFileBaseInfoData}
              column={2}
            />
          </div>
          <h1 id="inputParams" className="mb-4 mt-3 text-sm font-medium">
            输入参数
          </h1>
          <Table
            border={false}
            columns={inputParamsColumns}
            data={dataApiData}
            pagination={{
              current: inputParamsCurrentPage,
              total: inputParamsTotal,
              pageSize: inputParamsPageSize,
              showTotal: (inputParamsTotal, range) =>
                `共${inputParamsTotal} 条`,
              sizeCanChange: true,
              showJumper: true,
              pageSizeChangeResetCurrent: true,
              onChange: handleInputParamsPageChange,
              onPageSizeChange: handleInputParamsPageSizeChange,
              sizeOptions: [10, 20, 50, 100]
            }}
            noDataElement={noDataElement({ description: '暂无数据' })}
            rowKey="key"
          />
          <h1 id="outputParams" className="mb-4 mt-3 text-sm font-medium">
            输出参数
          </h1>
          <Table
            border={false}
            columns={outputParamsColumns}
            data={dataApiData}
            pagination={{
              current: inputParamsCurrentPage,
              total: outputParamsTotal,
              pageSize: outputParamsPageSize,
              showTotal: (outputParamsTotal, range) =>
                `共${outputParamsTotal} 条`,
              sizeCanChange: true,
              showJumper: true,
              pageSizeChangeResetCurrent: true,
              onChange: handleOutputParamsPageChange,
              onPageSizeChange: handleOutputParamsPageSizeChange,
              sizeOptions: [10, 20, 50, 100]
            }}
            noDataElement={noDataElement({ description: '暂无数据' })}
            rowKey="key"
          />
          <div
            id="requestExample"
            className="mb-4 mt-3 flex items-center justify-between"
          >
            <h1 className="mt-[1px] text-sm font-medium">请求示例(JSON)</h1>
            <Button
              type="outline"
              icon={<IconCopy />}
              className={styles.copyButton}
            >
              复制代码
            </Button>
          </div>
          <div className={styles.tableContent}>
            {`{
                    "book": {
                      "title": "示例图书",
                      "author": "张三",
                      "publishedYear": 2023,
                      "isAvailable": true,
                      "genres": ["小说", "科幻", "冒险"],
                      "publisher": {
                        "name": "示例出版社",
                        "location": "北京"
                      }
                    }
                  }`}
          </div>
          <h1 id="outputExample" className="mb-4 mt-3 text-sm font-medium">
            输出示例(JSON)
          </h1>
          <div className={styles.tableContent}>
            {`{
                    "book": {
                      "title": "示例图书",
                      "author": "张三",
                      "publishedYear": 2023,
                      "isAvailable": true,
                      "genres": ["小说", "科幻", "冒险"],
                      "publisher": {
                        "name": "示例出版社",
                        "location": "北京"
                      }
                    }
                  }`}
          </div>
          <h1 id="statusCodes" className="mb-4 mt-3 text-sm font-medium">
            状态码
          </h1>
          <Table
            border={false}
            columns={statusCodesColumns}
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
