import React, { useState } from 'react';
import { IconArrowLeft, IconCopy } from '@arco-design/web-react/icon';
import {
  Breadcrumb,
  Button,
  Descriptions,
  Form,
  FormInstance,
  Input,
  Table,
  Tabs,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { useParams } from '@/utils/url';
import noDataElement from '@/components/no-data';

import styles from './detail.module.scss';

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

export default function MetadataManagementDetail() {
  const history = useHistory();
  const metadataId = useParams('id');
  const metadataType = useParams('metadataType');

  const [fieldData, setFieldData] = useState([
    {
      fieldName: 'BM_SS_ZYBM',
      fieldNameCn: '资源编目信息表（BM_SS_ZYBM）',
      fieldType: '3C market',
      isNullable: false,
      fieldOrder: 1
    },
    {
      fieldName: 'BM_SS_ZYBM_NAME',
      fieldNameCn: '资源编目信息表名称（BM_SS_ZYBM_NAME）',
      fieldType: '3C market',
      isNullable: false,
      fieldOrder: 2
    }
  ]);
  const [partitionData, setPartitionData] = useState([
    {
      partitionName: 'date',
      partitionType: 'date',
      partitionOrder: 1
    },
    {
      partitionName: 'region',
      partitionType: 'string',
      partitionOrder: 2
    }
  ]);
  const [previewInfoData, setPreviewInfoData] = useState([]);

  const fieldSearchForm = React.useRef<FormInstance>(null);
  const partitionSearchForm = React.useRef<FormInstance>(null);
  // Iceberg/Doris基本信息数据
  const data = [
    {
      label: '英文名称',
      value: 'BM_SS_ZYBM'
    },
    {
      label: '中文名称',
      value: '资源编目信息表（BM_SS_ZYBM）'
    },
    {
      label: '存储类型',
      value: '3C market'
    },
    {
      label: '元数据文件位置',
      value: 'Users\YourName\my_web_app\package.json'
    },
    {
      label: '所属数据库',
      value: '3C market'
    },
    {
      label: '分区字段',
      value: (
        <div>
          date, region 等{' '}
          <Tooltip content="date，region，name">
            <span className="text-[#007DFA]">{3}</span>
          </Tooltip>{' '}
          个
        </div>
      )
    },
    {
      label: '分区数',
      value: '15'
    },
    {
      label: '存储大小',
      value: '45TB'
    },
    {
      label: '文件数',
      value: '16'
    },
    {
      label: '更新时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '最新访问时间',
      value: '2023-08-01 00:00:00'
    }
  ];
  // MinIo基本信息数据
  const minIoData = [
    {
      label: '桶名称',
      value: 'BM_SS_ZYBM'
    },
    {
      label: '对象数',
      value: '16'
    },
    {
      label: '存储类型',
      value: 'MinIo'
    },
    {
      label: '所属区域',
      value: 'Users\YourName\my_web_app\package.json'
    },
    {
      label: '存储大小',
      value: '3C market'
    },
    {
      label: '版本控制',
      value: '启用'
    },
    {
      label: '访问策略',
      value: '45TB'
    },
    {
      label: '加密类型',
      value: '16'
    },
    {
      label: '创建时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '最新访问时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '元数据更新时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '数据更新时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '元数据采集时间',
      value: '2023-08-01 00:00:00'
    }
  ];

  // 字段信息列
  const fieldColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1
    },
    {
      title: '字段英文名称',
      dataIndex: 'fieldName',
      key: 'fieldName'
    },
    {
      title: '字段中文名称',
      dataIndex: 'fieldNameCn',
      key: 'fieldNameCn'
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      key: 'fieldType'
    },
    {
      title: '是否为空',
      dataIndex: 'isNullable',
      key: 'isNullable',
      render: (text, record) => (text ? '是' : '否')
    },
    {
      title: '字段序号',
      dataIndex: 'fieldOrder',
      key: 'fieldOrder'
    }
  ];
  // 分区信息列
  const partitionColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1
    },
    {
      title: '分区名称',
      dataIndex: 'partitionName',
      key: 'partitionName'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true
    },
    {
      title: '存储大小',
      dataIndex: 'partitionSize',
      key: 'partitionSize'
    },
    {
      title: '存储路径',
      dataIndex: 'partitionPath',
      key: 'partitionPath'
    }
  ];
  // 数据预览列(接口返回)
  const previewInfoColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1
    },
    {
      title: 'name（姓名）',
      dataIndex: 'fieldName',
      key: 'fieldName'
    },
    {
      title: 'position（职位）',
      dataIndex: 'fieldNameCn',
      key: 'fieldNameCn'
    },
    {
      title: 'company（公司）',
      dataIndex: 'fieldType',
      key: 'fieldType'
    }
  ];

  return (
    <div className={styles.metadataManagementDetail}>
      <div className={styles.headBreadcrumbBox}>
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px' }}
          onClick={() => history.goBack()}
        />
        <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
          <BreadcrumbItem
            onClick={() =>
              history.push('/tenant/compute/modaforge/metadataManagement')
            }
            className={styles.breadcrumbText}
          >
            元数据管理
          </BreadcrumbItem>
          <BreadcrumbItem>{metadataId}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className={styles.contentBox}>
        {metadataType === 'Iceberg' || metadataType === 'Doris' ? (
          <Tabs defaultActiveTab="baseInfo">
            <TabPane key="baseInfo" title="基本信息">
              <Typography.Paragraph>
                <Descriptions
                  colon=" :"
                  column={2}
                  title="基本信息"
                  data={data}
                  className={styles.customDescriptions}
                />
                <div>
                  <div className="mt-3 flex items-center justify-between">
                    <h1 className={styles.title}>表DDL (建表SQL)</h1>
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
                </div>
                <div className="mt-3">
                  <h1 className={styles.title}>元数据文件内容 (JSON格式)</h1>
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
                </div>
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="fieldInfo" title="字段信息">
              <Typography.Paragraph>
                <Form
                  ref={fieldSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                >
                  <FormItem label="字段英文名称" field="fieldName">
                    <Input.Search />
                  </FormItem>
                  <FormItem label="字段中文名称" field="fieldName_zh">
                    <Input.Search />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={fieldColumns}
                  data={fieldData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="partitionInfo" title="分区信息">
              <Typography.Paragraph>
                <Form
                  ref={partitionSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                >
                  <FormItem label="分区名称" field="partitionName">
                    <Input.Search />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={partitionColumns}
                  data={partitionData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="previewInfo" title="数据预览">
              <Typography.Paragraph>
                <Table
                  className="mt-2"
                  columns={previewInfoColumns}
                  data={previewInfoData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
          </Tabs>
        ) : metadataType === 'MinIO' ? (
          <Tabs defaultActiveTab="baseInfo">
            <TabPane key="baseInfo" title="基本信息">
              <Typography.Paragraph>
                <Descriptions
                  colon=" :"
                  column={2}
                  title="基本信息"
                  data={minIoData}
                  className={styles.customDescriptions}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="fieldInfo" title="对象信息">
              <Typography.Paragraph>
                <Form
                  ref={fieldSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                >
                  <FormItem label="对象名称" field="fieldName">
                    <Input.Search />
                  </FormItem>
                  <FormItem label="对象类型" field="fieldName_zh">
                    <Input.Search />
                  </FormItem>
                  <FormItem label="对象存储路径" field="objectPath">
                    <Input.Search />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={fieldColumns}
                  data={fieldData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="partitionInfo" title="版本信息">
              <Typography.Paragraph>
                <Table
                  className="mt-2"
                  columns={partitionColumns}
                  data={partitionData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
          </Tabs>
        ) : (
          <Tabs defaultActiveTab="baseInfo">
            <TabPane key="baseInfo" title="基本信息">
              <Typography.Paragraph>
                <Descriptions
                  colon=" :"
                  column={2}
                  title="基本信息"
                  data={data}
                  className={styles.customDescriptions}
                />
                <div>
                  <div className="mt-3 flex items-center justify-between">
                    <h1 className={styles.title}>表DDL (建表SQL)</h1>
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
                </div>
                <div className="mt-3">
                  <h1 className={styles.title}>元数据文件内容 (JSON格式)</h1>
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
                </div>
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="fieldInfo" title="字段信息">
              <Typography.Paragraph>
                <Form
                  ref={fieldSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                >
                  <FormItem label="字段英文名称" field="fieldName">
                    <Input.Search />
                  </FormItem>
                  <FormItem label="字段中文名称" field="fieldName_zh">
                    <Input.Search />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={fieldColumns}
                  data={fieldData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="partitionInfo" title="分区信息">
              <Typography.Paragraph>
                <Form
                  ref={partitionSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                >
                  <FormItem label="分区名称" field="partitionName">
                    <Input.Search />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={partitionColumns}
                  data={partitionData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="previewInfo" title="数据预览">
              <Typography.Paragraph>
                <Table
                  className="mt-2"
                  columns={previewInfoColumns}
                  data={previewInfoData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="versionInfo" title="版本信息">
              <Typography.Paragraph>
                <Table
                  className="mt-2"
                  columns={previewInfoColumns}
                  data={previewInfoData}
                  border={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
              </Typography.Paragraph>
            </TabPane>
          </Tabs>
        )}
      </div>
    </div>
  );
}
