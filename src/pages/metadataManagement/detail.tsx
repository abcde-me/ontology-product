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
  Modal,
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
  listMetadataMilvusData,
  getMetadataIcebergTable,
  getMetadataMinioBucket,
  listMetadataMinioObject,
  getMetadataDorisTable,
  getMetadataMilvusCollection
} from '@/api/metadata';
import { formatFileSize } from '@/utils/format';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';

import styles from './detail.module.scss';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { render } from 'katex';
import PdfRenderer from '../ragDetail/components/scenes/pdf/PdfRenderer';
import { getFileBinaryData } from '@/api/modules/rag';
import TableViewer from '../ragDetail/components/scenes/table/TableViewer';

enum MetadataType {
  Iceberg = 'ICEBERG',
  Doris = 'DORIS',
  Kafka = 'KAFKA',
  MinIO = 'MINIO',
  Milvus = 'MILVUS'
}

interface MinIOBaseData {
  id?: number;
  bucketName?: string;
  objectNum?: string;
  region?: string;
  storageSize?: string;
  versioning?: number;
  policy?: string;
  encryptType?: string;
  createTime?: string;
  updateTime?: string;
  lastTime?: string;
}

const BreadcrumbItem = Breadcrumb.Item;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

export default function MetadataManagementDetail() {
  const history = useHistory();
  const metadataId = Number(useParams('id'));
  const metadataType = useParams('metadataType');
  const canPreviewFileType = [
    'pdf',
    'doc',
    'docx',
    'xlsx',
    'xls',
    'pptx',
    'ppt',
    'markdown'
  ];

  const [fieldData, setFieldData] = useState([]);
  const [partitionData, setPartitionData] = useState([]);
  const [previewInfoColumns, setPreviewInfoColumns] = useState([]);
  const [previewInfoData, setPreviewInfoData] = useState([]);
  const [activeKey, setActiveKey] = useState('baseInfo');
  const [minIOBaseData, setMinIOBaseData] = useState<MinIOBaseData>({});
  const [baseInfoData, setBaseInfoData] = useState<Record<string, string>>({});
  const [fileBinaryData, setFileBinaryData] = useState<ArrayBuffer>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectFileType, setSelectFileType] = useState('');

  // 字段分页
  const [fieldCurrent, setFieldCurrent] = useState(1);
  const [fieldPageSize, setFieldPageSize] = useState(10);
  const [fieldTotal, setFieldTotal] = useState(0);
  const [fieldName, setFieldName] = useState('');
  const [objectKey, setObjectKey] = useState('');
  const [contentType, setContentType] = useState('');
  const [objectPath, setObjectPath] = useState('');
  const [description, setDescription] = useState('');
  const [fieldSearchValues, setFieldSearchValues] = useState({
    filters: {
      fieldName: '',
      description: ''
    }
  });
  const [minIoFieldSearchValues, setMinIoFieldSearchValues] = useState<{
    filters: {
      objectKey?: string;
      contentType?: string;
      objectPath?: string;
    };
    sorter?: {};
  }>();

  // 分区分页
  const [partitionCurrent, setPartitionCurrent] = useState(1);
  const [partitionPageSize, setPartitionPageSize] = useState(10);
  const [partitionTotal, setPartitionTotal] = useState(0);
  const [partitionSearchValues, setPartitionSearchValues] = useState({
    filters: {
      partitionName: ''
    }
  });

  const [changeValue, setChangeValue] = useState<Record<string, any>>({});

  const [fieldSearchForm] = Form.useForm();
  const [partitionSearchForm] = Form.useForm();

  // 整合字段，防止多次触发 getData 函数
  useEffect(() => {
    setChangeValue({
      fieldCurrent: fieldCurrent,
      partitionCurrent: partitionCurrent,
      fieldPageSize: fieldPageSize,
      partitionPageSize: partitionPageSize,
      fieldSearchValues: fieldSearchValues,
      partitionSearchValues: partitionSearchValues
    });
  }, [
    fieldCurrent,
    partitionCurrent,
    fieldPageSize,
    partitionPageSize,
    fieldSearchValues,
    partitionSearchValues
  ]);

  useEffect(() => {
    getData();
  }, [activeKey, changeValue]);

  // 获取分区字段
  const getPartitionKey = (partitionKey: string) => {
    if (!partitionKey) return '-';
    const arr = partitionKey.split(',')?.map((item) => item);
    if (arr.length >= 3) {
      return (
        <div>
          {arr[0]}, {arr[1]} 等{' '}
          <Tooltip content={partitionKey}>
            <span className="text-[#007DFA]">{arr.length}</span>
          </Tooltip>{' '}
          个
        </div>
      );
    } else return partitionKey || '-';
  };

  // 获取预览文件二进制数据
  const handlePreview = async (
    record: Record<string, string>,
    objectPath: string
  ) => {
    setSelectFileType(objectPath);
    const res = await getFileBinaryData({
      bucket_name: record.bucketName,
      path: record.objectPath,
      convert_pdf: !(selectFileType === 'xls' || selectFileType === 'xlsx')
    });
    setFileBinaryData(res);
    setPreviewVisible(true);
  };

  // Iceberg/Doris基本信息数据
  const data = [
    {
      label: '英文名称',
      value: baseInfoData.tableName || '-'
    },
    {
      label: '中文名称',
      value: baseInfoData.datasourceName || '-'
    },
    {
      label: '存储类型',
      value: baseInfoData.tableType || '-'
    },
    {
      label: '元数据文件位置',
      value: <EllipsisPopoverCom value={baseInfoData.storageLocation || '-'} />
    },
    {
      label: '所属数据库',
      value: metadataType || '-'
    },
    {
      label: '分区字段',
      value: getPartitionKey(baseInfoData.partitionKey)
    },
    {
      label: '分区数',
      value: baseInfoData.partitionNum || baseInfoData.replicaNum
    },
    {
      label: '存储大小',
      value: formatFileSize(Number(baseInfoData.storageSize))
    },
    {
      label: '文件数',
      value: baseInfoData.fileNum || baseInfoData.bucketNum
    },
    {
      label: '更新时间',
      value: baseInfoData.updateTime || '-'
    }
  ];
  // Milvus基本信息数据
  const milvusData = [
    {
      label: '集合英文名称',
      value: baseInfoData.collectionName || '-'
    },
    {
      label: '集合中文名称',
      value: baseInfoData.description || '-'
    },
    {
      label: '存储类型',
      value: baseInfoData.tableType || '-'
    },
    {
      label: '所属数据库',
      value: baseInfoData.dbName || '-'
    },
    {
      label: '向量数量',
      value: baseInfoData.approxEntityCount
    },
    {
      label: '分区字段',
      value: getPartitionKey(baseInfoData.partitionKey)
    },
    {
      label: '分区数',
      value: baseInfoData.partitions
    },
    {
      label: '分片数',
      value: baseInfoData.shards
    },
    {
      label: '索引数',
      value: baseInfoData.fileNum || baseInfoData.bucketNum
    },
    {
      label: '元数据采集时间',
      value: baseInfoData.updateTime || '-'
    }
  ];
  // MinIo基本信息数据
  const minIoData = [
    {
      label: '桶名称',
      value: minIOBaseData.bucketName || '-'
    },
    {
      label: '对象数',
      value: minIOBaseData.objectNum || '-'
    },
    {
      label: '存储类型',
      value: 'MinIo'
    },
    {
      label: '所属区域',
      value: minIOBaseData.region || '-'
    },
    {
      label: '存储大小',
      value: minIOBaseData.storageSize || '-'
    },
    {
      label: '版本控制',
      value: minIOBaseData.versioning === 1 ? '启用' : '禁用'
    },
    {
      label: '访问策略',
      value: minIOBaseData.policy || '-'
    },
    {
      label: '加密类型',
      value: minIOBaseData.encryptType || '-'
    },
    {
      label: '创建时间',
      value: minIOBaseData.createTime || '-'
    },
    {
      label: '最新访问时间',
      value: minIOBaseData.lastTime || '-'
    },
    {
      label: '元数据更新时间',
      value: minIOBaseData.updateTime || '-'
    },
    {
      label: '数据更新时间',
      value: '2023-08-01 00:00:00'
    },
    {
      label: '元数据采集时间',
      value: minIOBaseData.createTime || '-'
    }
  ];
  // MinIo对象信息列
  const minIoObjectClumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text, record, index) => index + 1
    },
    {
      title: '对象名称',
      dataIndex: 'objectKey',
      key: 'objectKey',
      width: 200,
      render: (text, record) => {
        const objectPath = record.objectPath.split('.').pop();
        const isCanPreview = canPreviewFileType.includes(objectPath);
        return (
          <EllipsisPopoverCom
            className={isCanPreview ? styles.hoverChange : ''}
            isLink={isCanPreview}
            value={text || '-'}
            preferTypography
            handleLink={() => {
              handlePreview(record, objectPath);
            }}
          />
        );
      }
    },
    {
      title: '对象类型',
      dataIndex: 'contentType',
      key: 'contentType',
      className: styles.objectType,
      width: 180,
      render: (text, record) => <EllipsisPopoverCom value={text || '-'} />
    },
    {
      title: '存储类型',
      dataIndex: 'storageClass',
      key: 'storageClass',
      width: 150,
      filters: [
        {
          text: 'string',
          value: 'string'
        },
        {
          text: 'boolean',
          value: 'boolean'
        },
        {
          text: 'number',
          value: 'number'
        }
      ]
    },
    {
      title: '存储大小',
      dataIndex: 'size',
      key: 'size',
      width: 150,
      render: (text, record) => formatFileSize(Number(text))
    },
    {
      title: '存储路径',
      dataIndex: 'objectPath',
      key: 'objectPath',
      width: 300,
      render: (text, record) => <EllipsisPopoverCom value={text || '-'} />
    },
    {
      title: '元数据更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 220,
      sorter: true
    },
    {
      title: '元数据采集时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 220,
      sorter: true
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
      metadataType === MetadataType.MinIO
        ? setMinIoFieldSearchValues({
            filters: {
              ...values
            }
          })
        : setFieldSearchValues({
            filters: {
              ...values
            }
          });
      setFieldCurrent(1);
    } else if (activeKey === 'partitionInfo') {
      setPartitionSearchValues({
        filters: {
          ...values
        }
      });
      setPartitionCurrent(1);
    }
  };

  const getData = async () => {
    if (metadataType === MetadataType.Iceberg) {
      if (activeKey === 'baseInfo') {
        const res = await getMetadataIcebergTable({
          id: metadataId
        });
        if (res.code === '' && res.status === 200) {
          setBaseInfoData(res.data.data || {});
        } else {
          Message.error(res.message || '获取Iceberg基本信息数据失败');
        }
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
        const res = await getMetadataDorisTable({
          id: metadataId
        });
        if (res.code === '' && res.status === 200) {
          setBaseInfoData(res.data.data || {});
        } else {
          Message.error(res.message || '获取Doris基本信息数据失败');
        }
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
        const res = await getMetadataMilvusCollection({
          id: metadataId
        });
        if (res.code === '' && res.status === 200) {
          setBaseInfoData(res.data.data || {});
        } else {
          Message.error(res.message || '获取Milvus基本信息数据失败');
        }
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
    } else if (metadataType === MetadataType.MinIO) {
      if (activeKey === 'baseInfo') {
        const res = await getMetadataMinioBucket({
          id: metadataId
        });
        if (res.code === '' && res.status === 200) {
          setMinIOBaseData(res.data.data || {});
        } else {
          Message.error(res.message || '获取MinIO桶信息数据失败');
        }
      } else if (activeKey === 'fieldInfo') {
        const params = {
          pageNum: fieldCurrent,
          pageSize: fieldPageSize,
          filters: {
            bucketId: metadataId,
            ...minIoFieldSearchValues?.filters
          },
          sorter: {
            ...minIoFieldSearchValues?.sorter
          }
        };
        const res = await listMetadataMinioObject(params);
        if (res.code === '' && res.status === 200) {
          setFieldData(res.data.data.list || []);
          setFieldTotal(res.data.data.total || 0);
          setFieldCurrent(res.data.data.pageNum || 1);
          setFieldPageSize(res.data.data.pageSize || 10);
        } else {
          Message.error(res.message || '获取MinIO对象信息数据失败');
        }
      }
    }
  };

  const handleBack = () => {
    history.push(
      '/tenant/compute/modaforge/metadataManagement?metadataType=' +
        metadataType
    );
  };

  return (
    <div className={styles.metadataManagementDetail}>
      <div className={styles.headBreadcrumbBox}>
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px' }}
          onClick={handleBack}
        />
        <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
          <BreadcrumbItem
            onClick={handleBack}
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
                    <pre>{baseInfoData.createSql || '-'}</pre>
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
                      onClear={() => {
                        setPartitionSearchValues({
                          filters: {
                            partitionName: ''
                          }
                        });
                        setPartitionCurrent(1);
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
                  rowKey="id"
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
                  rowKey="id"
                />
              </Typography.Paragraph>
            </TabPane>
          </Tabs>
        ) : metadataType === MetadataType.MinIO ? (
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
                  onSubmit={handleSearch}
                >
                  <FormItem label="对象名称" field="objectKey">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setObjectKey(value);
                      }}
                      onClear={() => {
                        setMinIoFieldSearchValues({
                          filters: {
                            objectKey: '',
                            contentType: contentType || '',
                            objectPath: objectPath || ''
                          }
                        });
                        setFieldCurrent(1);
                      }}
                    />
                  </FormItem>
                  <FormItem label="对象类型" field="contentType">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setContentType(value);
                      }}
                      onClear={() => {
                        setMinIoFieldSearchValues({
                          filters: {
                            objectKey: objectKey || '',
                            contentType: '',
                            objectPath: objectPath || ''
                          }
                        });
                        setFieldCurrent(1);
                      }}
                    />
                  </FormItem>
                  <FormItem label="对象存储路径" field="objectPath">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      onChange={(value) => {
                        setObjectPath(value);
                      }}
                      onClear={() => {
                        setMinIoFieldSearchValues({
                          filters: {
                            objectKey: objectKey || '',
                            contentType: contentType || '',
                            objectPath: ''
                          }
                        });
                        setFieldCurrent(1);
                      }}
                    />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={minIoObjectClumns}
                  data={fieldData}
                  border={false}
                  pagination={false}
                  rowKey="id"
                  noDataElement={noDataElement({ description: '暂无数据' })}
                  onChange={(pagination, filters, sorter) => {
                    setMinIoFieldSearchValues({
                      filters: {
                        objectKey: objectKey || '',
                        contentType: contentType || '',
                        objectPath: objectPath || '',
                        ...sorter
                      },
                      sorter: {
                        field: (filters as SorterInfo)?.field || '',
                        order:
                          (filters as SorterInfo)?.direction === 'ascend'
                            ? 'asc'
                            : 'desc'
                      }
                    });
                  }}
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
                  data={milvusData}
                  className={styles.customDescriptions}
                />
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
                        setFieldCurrent(1);
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
                        setFieldCurrent(1);
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
                  rowKey="id"
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
                  rowKey="id"
                />
              </Typography.Paragraph>
            </TabPane>
          </Tabs>
        )}
      </div>
      <Modal
        visible={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
        }}
        title="数据预览"
        footer={null}
        className={styles.previewModal}
      >
        {selectFileType === 'xls' || selectFileType === 'xlsx' ? (
          <TableViewer metadataPreviewData={fileBinaryData} />
        ) : (
          <PdfRenderer pdfData={fileBinaryData} scale={1.3} />
        )}
      </Modal>
    </div>
  );
}
