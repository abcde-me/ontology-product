import React, { useEffect, useState } from 'react';
import { IconArrowLeft, IconCopy } from '@arco-design/web-react/icon';
import {
  Breadcrumb,
  Button,
  Descriptions,
  Form,
  FormInstance,
  Input,
  Message,
  Pagination,
  Table,
  Tabs,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { useParams } from '@/utils/url';
import noDataElement from '@/components/no-data';
import {
  listMetadataIcebergData,
  listMetadataIcebergField,
  listMetadataIcebergPartition,
  listMetadataDorisField,
  listMetadataDorisPartition,
  listMetadataDorisData,
  listMetadataMilvusField,
  listMetadataMilvusPartition,
  listMetadataMilvusData
} from '@/api/metadata';
import { formatFileSize } from '@/utils/format';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';

import styles from './detail.module.scss';

enum MetadataType {
  Iceberg = 'ICEBERG',
  Doris = 'DORIS',
  Kafka = 'KAFKA',
  MinIO = 'MINIO',
  Milvus = 'MILVUS'
}

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

export default function MetadataManagementDetail() {
  const history = useHistory();
  const metadataId = Number(useParams('id'));
  const metadataType = useParams('metadataType');

  const [fieldData, setFieldData] = useState([]);
  const [partitionData, setPartitionData] = useState([]);
  const [previewInfoColumns, setPreviewInfoColumns] = useState([]);
  const [previewInfoData, setPreviewInfoData] = useState([]);
  const [activeKey, setActiveKey] = useState('baseInfo');

  // 字段分页
  const [fieldCurrent, setFieldCurrent] = useState(1);
  const [fieldPageSize, setFieldPageSize] = useState(10);
  const [fieldTotal, setFieldTotal] = useState(0);
  const [fieldName, setFieldName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldSearchValues, setFieldSearchValues] = useState({
    filters: {
      fieldName: '',
      description: ''
    }
  });

  // 分区分页
  const [partitionCurrent, setPartitionCurrent] = useState(1);
  const [partitionPageSize, setPartitionPageSize] = useState(10);
  const [partitionTotal, setPartitionTotal] = useState(0);
  const [partition, setPartition] = useState('');
  const [partitionSearchValues, setPartitionSearchValues] = useState({
    filters: {
      partition: ''
    }
  });

  const [fieldSearchForm] = Form.useForm();
  const [partitionSearchForm] = Form.useForm();

  useEffect(() => {
    getData();
  }, [
    activeKey,
    fieldCurrent,
    fieldPageSize,
    fieldSearchValues,
    partitionCurrent,
    partitionPageSize,
    partitionSearchValues
  ]);

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
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '字段类型',
      dataIndex: 'dataType',
      key: 'dataType'
    },
    {
      title: '是否为空',
      dataIndex: 'isKey',
      key: 'isKey',
      render: (text, record) => (text === 'YES' ? '是' : '否')
    },
    {
      title: '字段序号',
      dataIndex: 'id',
      key: 'id'
    }
  ];
  // milvus字段信息列
  const milvusFieldColumns = [
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
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      key: 'fieldType'
    },
    {
      title: '是否主键',
      dataIndex: 'isPrimaryKey',
      key: 'isPrimaryKey',
      render: (text, record) => (text === 1 ? '是' : '否')
    },
    {
      title: '是否向量',
      dataIndex: 'dimension',
      key: 'dimension',
      render: (text, record) => (text ? '是' : '否')
    }
  ];
  // 分区信息列
  const partitionColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text, record, index) => index + 1
    },
    {
      title: '分区名称',
      dataIndex: 'partitionName',
      key: 'partitionName',
      width: 500,
      render: (text, record) => <EllipsisPopoverCom value={text} />
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 300,
      sorter: true
    },
    {
      title: '存储大小',
      dataIndex: 'dataSize',
      key: 'dataSize',
      width: 200,
      render: (text, record) => formatFileSize(text)
    },
    {
      title: '存储路径',
      dataIndex: 'filePath',
      key: 'filePath',
      width: 500,
      render: (text, record) => <EllipsisPopoverCom value={text} />
    }
  ];
  // milvus分区信息列
  const milvusPartitionColumns = [
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
      title: '向量数量',
      dataIndex: 'rowCount',
      key: 'rowCount'
    }
  ];

  // 处理tab切换
  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  // 处理字段搜索
  const handleSearch = (values) => {
    if (activeKey === 'fieldInfo') {
      setFieldSearchValues({
        filters: {
          ...values
        }
      });
    } else if (activeKey === 'partitionInfo') {
      setPartitionSearchValues({
        filters: {
          ...values
        }
      });
    }
  };

  const getData = async () => {
    if (metadataType === MetadataType.Iceberg) {
      if (activeKey === 'baseInfo') {
        return data;
      } else if (activeKey === 'fieldInfo') {
        const params = {
          pageNum: fieldCurrent,
          pageSize: fieldPageSize,
          filters: {
            tableId: metadataId,
            ...fieldSearchValues.filters
          }
        };
        const res = await listMetadataIcebergField(params);
        if (res.code === '' && res.status === 200) {
          setFieldData(res.data.data.list || []);
          setFieldTotal(res.data.data.total || 0);
          setFieldCurrent(res.data.data.pageNum || 1);
          setFieldPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取Iceberg字段信息数据失败');
        }
      } else if (activeKey === 'partitionInfo') {
        const params = {
          pageNum: partitionCurrent,
          pageSize: partitionPageSize,
          filters: {
            tableId: metadataId,
            ...partitionSearchValues.filters
          }
        };
        const res = await listMetadataIcebergPartition(params);
        if (res.code === '' && res.status === 200) {
          setPartitionData(res.data.data.list || []);
          setPartitionTotal(res.data.data.total || 0);
          setPartitionCurrent(res.data.data.pageNum || 1);
          setPartitionPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取Iceberg分区信息数据失败');
        }
      } else if (activeKey === 'previewInfo') {
        const params = {
          tableId: metadataId
        };
        const res = await listMetadataIcebergData(params);
        if (res.code === '' && res.status === 200) {
          const newPreviewInfoColumns = res.data.data.title.map((item) => ({
            title: `${item.nameEn}（${item.nameZh}）`,
            dataIndex: item.nameEn
          }));
          setPreviewInfoColumns(newPreviewInfoColumns);
          setPreviewInfoData(res.data.data.tableData || []);
        } else {
          Message.error(res.message || '获取Iceberg预览数据失败');
        }
      }
    } else if (metadataType === MetadataType.Doris) {
      if (activeKey === 'baseInfo') {
        return data;
      } else if (activeKey === 'fieldInfo') {
        const params = {
          pageNum: fieldCurrent,
          pageSize: fieldPageSize,
          filters: {
            tableId: metadataId,
            ...fieldSearchValues.filters
          }
        };
        const res = await listMetadataDorisField(params);
        if (res.code === '' && res.status === 200) {
          setFieldData(res.data.data.list || []);
          setFieldTotal(res.data.data.total || 0);
          setFieldCurrent(res.data.data.pageNum || 1);
          setFieldPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取Doris字段信息数据失败');
        }
      } else if (activeKey === 'partitionInfo') {
        const params = {
          pageNum: partitionCurrent,
          pageSize: partitionPageSize,
          filters: {
            tableId: metadataId,
            ...partitionSearchValues.filters
          }
        };
        const res = await listMetadataDorisPartition(params);
        if (res.code === '' && res.status === 200) {
          setPartitionData(res.data.data.list || []);
          setPartitionTotal(res.data.data.total || 0);
          setPartitionCurrent(res.data.data.pageNum || 1);
          setPartitionPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取Doris分区信息数据失败');
        }
      } else if (activeKey === 'previewInfo') {
        const params = {
          tableId: metadataId
        };
        const res = await listMetadataDorisData(params);
        if (res.code === '' && res.status === 200) {
          const newPreviewInfoColumns = res.data.data.title.map((item) => ({
            title: `${item.nameEn}（${item.nameZh}）`,
            dataIndex: item.nameEn
          }));
          setPreviewInfoColumns(newPreviewInfoColumns);
          setPreviewInfoData(res.data.data.tableData || []);
        } else {
          Message.error(res.message || '获取Doris预览数据失败');
        }
      }
    } else if (metadataType === MetadataType.Milvus) {
      if (activeKey === 'baseInfo') {
        return data;
      } else if (activeKey === 'fieldInfo') {
        const params = {
          pageNum: fieldCurrent,
          pageSize: fieldPageSize,
          filters: {
            collectionId: metadataId,
            ...fieldSearchValues.filters
          }
        };
        const res = await listMetadataMilvusField(params);
        if (res.code === '' && res.status === 200) {
          setFieldData(res.data.data.list || []);
          setFieldTotal(res.data.data.total || 0);
          setFieldCurrent(res.data.data.pageNum || 1);
          setFieldPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取Milvus字段信息数据失败');
        }
      } else if (activeKey === 'partitionInfo') {
        const params = {
          pageNum: partitionCurrent,
          pageSize: partitionPageSize,
          filters: {
            collectionId: metadataId,
            ...partitionSearchValues.filters
          }
        };
        const res = await listMetadataMilvusPartition(params);
        if (res.code === '' && res.status === 200) {
          setPartitionData(res.data.data.list || []);
          setPartitionTotal(res.data.data.total || 0);
          setPartitionCurrent(res.data.data.pageNum || 1);
          setPartitionPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取Milvus分区信息数据失败');
        }
      } else if (activeKey === 'previewInfo') {
        const params = {
          collectionId: metadataId
        };
        const res = await listMetadataMilvusData(params);
        if (res.code === '' && res.status === 200) {
          const newPreviewInfoColumns = res.data.data.title.map((item) => ({
            title: `${item.nameEn}（${item.nameZh}）`,
            dataIndex: item.nameEn
          }));
          setPreviewInfoColumns(newPreviewInfoColumns);
          setPreviewInfoData(res.data.data.tableData || []);
        } else {
          Message.error(res.message || '获取Milvus预览数据失败');
        }
      }
    }
  };

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
        {metadataType === MetadataType.Iceberg ||
        metadataType === MetadataType.Doris ? (
          <Tabs
            defaultActiveTab="baseInfo"
            onChange={(key) => handleTabChange(key)}
          >
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
                  form={fieldSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                  onSubmit={handleSearch}
                >
                  <FormItem label="字段英文名称" field="fieldName">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setFieldName(value);
                      }}
                      onClear={() => {
                        setFieldSearchValues({
                          filters: {
                            fieldName: '',
                            description: description || ''
                          }
                        });
                      }}
                    />
                  </FormItem>
                  <FormItem label="字段中文名称" field="description">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setDescription(value);
                      }}
                      onClear={() => {
                        setFieldSearchValues({
                          filters: {
                            fieldName: fieldName || '',
                            description: ''
                          }
                        });
                      }}
                    />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={
                    metadataType === MetadataType.Iceberg
                      ? fieldColumns.filter(
                          (item) =>
                            item.dataIndex !== 'isKey' &&
                            item.dataIndex !== 'id'
                        )
                      : fieldColumns
                  }
                  data={fieldData}
                  border={false}
                  pagination={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                  rowKey="id"
                />
                {/* 分页 */}
                {fieldData && fieldData.length > 0 && (
                  <Pagination
                    current={fieldCurrent}
                    pageSize={fieldPageSize}
                    onPageSizeChange={(pageSize) => {
                      setFieldPageSize(pageSize);
                      setFieldCurrent(1);
                    }}
                    onChange={(page) => {
                      setFieldCurrent(page);
                    }}
                    sizeOptions={[10, 20, 50, 100]}
                    showTotal
                    total={fieldTotal}
                    showJumper
                    sizeCanChange
                    style={{ justifyContent: 'flex-end', marginTop: '10px' }}
                  />
                )}
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="partitionInfo" title="分区信息">
              <Typography.Paragraph>
                <Form
                  form={partitionSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                  onSubmit={handleSearch}
                >
                  <FormItem label="分区名称" field="partitionName">
                    <Input.Search
                      onSearch={partitionSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setPartition(value);
                      }}
                      onClear={() => {
                        setPartitionSearchValues({
                          filters: {
                            partition: ''
                          }
                        });
                      }}
                    />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={partitionColumns}
                  data={partitionData}
                  border={false}
                  pagination={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
                {/* 分页 */}
                {partitionData && partitionData.length > 0 && (
                  <Pagination
                    current={partitionCurrent}
                    pageSize={partitionPageSize}
                    onPageSizeChange={(pageSize) => {
                      setPartitionPageSize(pageSize);
                      setPartitionCurrent(1);
                    }}
                    onChange={(page) => {
                      setPartitionCurrent(page);
                    }}
                    sizeOptions={[10, 20, 50, 100]}
                    showTotal
                    total={partitionTotal}
                    showJumper
                    sizeCanChange
                    style={{ justifyContent: 'flex-end', marginTop: '10px' }}
                  />
                )}
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
        ) : metadataType === MetadataType.MinIO ? (
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
                  form={fieldSearchForm}
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
          </Tabs>
        ) : (
          <Tabs
            defaultActiveTab="baseInfo"
            onChange={(key) => handleTabChange(key)}
          >
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
                  form={fieldSearchForm}
                  layout="inline"
                  colon=":"
                  labelCol={{ span: 3 }}
                  onSubmit={handleSearch}
                >
                  <FormItem label="字段英文名称" field="fieldName">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setFieldName(value);
                      }}
                      onClear={() => {
                        setFieldSearchValues({
                          filters: {
                            fieldName: '',
                            description: description || ''
                          }
                        });
                      }}
                    />
                  </FormItem>
                  <FormItem label="字段中文名称" field="description">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setDescription(value);
                      }}
                      onClear={() => {
                        setFieldSearchValues({
                          filters: {
                            fieldName: fieldName || '',
                            description: ''
                          }
                        });
                      }}
                    />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={milvusFieldColumns}
                  data={fieldData}
                  border={false}
                  pagination={false}
                  noDataElement={noDataElement({ description: '暂无数据' })}
                />
                {/* 分页 */}
                {fieldData && fieldData.length > 0 && (
                  <Pagination
                    current={fieldCurrent}
                    pageSize={fieldPageSize}
                    onPageSizeChange={(pageSize) => {
                      setFieldPageSize(pageSize);
                      setFieldCurrent(1);
                    }}
                    onChange={(page) => {
                      setFieldCurrent(page);
                    }}
                    sizeOptions={[10, 20, 50, 100]}
                    showTotal
                    total={fieldTotal}
                    showJumper
                    sizeCanChange
                    style={{ justifyContent: 'flex-end', marginTop: '10px' }}
                  />
                )}
              </Typography.Paragraph>
            </TabPane>
            <TabPane key="partitionInfo" title="分区信息">
              <Typography.Paragraph>
                <Form
                  form={partitionSearchForm}
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
                  columns={milvusPartitionColumns}
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
        )}
      </div>
    </div>
  );
}
