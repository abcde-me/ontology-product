import React, { useEffect, useRef, useState } from 'react';
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
  Spin,
  Table,
  Tabs,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { useParams } from '@/utils/url';
import { NoDataCard } from '@ceai-front/arco-material';
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
import {
  ColumnProps,
  SorterInfo
} from '@arco-design/web-react/es/Table/interface';
import PdfRenderer from '../ragDetail/components/scenes/pdf/PdfRenderer';
import { getFileBinaryData } from '@/api/modules/rag';
import TableViewer from '../ragDetail/components/scenes/table/TableViewer';
import copy from 'copy-to-clipboard';

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
  objectsCount?: number;
  region?: string;
  objectsSize?: number;
  versioning?: number;
  policy?: string;
  encryptType?: string;
  createTime?: string;
  creationDate?: string;
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
    'markdown',
    'md'
  ];

  const [fieldData, setFieldData] = useState([]);
  const [partitionData, setPartitionData] = useState([]);
  const [previewInfoColumns, setPreviewInfoColumns] = useState([]);
  const [previewInfoData, setPreviewInfoData] = useState([]);
  const [activeKey, setActiveKey] = useState('baseInfo');
  const [minIOBaseData, setMinIOBaseData] = useState<MinIOBaseData>({});
  const [baseInfoData, setBaseInfoData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fileBinaryData, setFileBinaryData] = useState<ArrayBuffer>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
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
    },
    sorter: {}
  });

  // 创建挂载标识：标记是否为组件首次挂载
  const isFirstMount = useRef(true);

  const [fieldSearchForm] = Form.useForm();
  const [partitionSearchForm] = Form.useForm();

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (fieldCurrent !== 1) {
      setFieldCurrent(1);
    } else if (partitionCurrent !== 1) {
      setPartitionCurrent(1);
    } else {
      getData();
    }
  }, [minIoFieldSearchValues, fieldSearchValues, partitionSearchValues]);

  useEffect(() => {
    getData();
  }, [
    activeKey,
    fieldCurrent,
    partitionCurrent,
    fieldPageSize,
    partitionPageSize
  ]);

  // 获取分区字段
  const getPartitionKey = (partitionKey: string) => {
    if (!partitionKey) return '-';
    const result: string[] = [];
    let currentSegment = '';
    let bracketLevel = 0;

    // 遍历字符串切割逻辑
    for (const char of partitionKey) {
      if (char === '(') {
        bracketLevel++;
        currentSegment += char;
      } else if (char === ')') {
        bracketLevel = Math.max(0, bracketLevel - 1);
        currentSegment += char;
      } else if (char === ',' && bracketLevel === 0) {
        const trimmedSegment = currentSegment.trim();
        if (trimmedSegment) {
          result.push(trimmedSegment);
        }
        currentSegment = '';
      } else {
        currentSegment += char;
      }
    }

    // 处理最后一个片段
    const lastTrimmedSegment = currentSegment.trim();
    if (lastTrimmedSegment) {
      result.push(lastTrimmedSegment);
    }
    if (result.length >= 3) {
      return (
        <div>
          {result[0]}, {result[1]} 等{' '}
          <Tooltip content={partitionKey}>
            <span className="text-[#007DFA]">{result.length}</span>
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
    setPreviewVisible(true);
    setPreviewLoading(true);
    setSelectFileType(objectPath);
    const res = await getFileBinaryData({
      bucket_name: record.bucketName,
      path: record.objectPath.split('/').slice(1).join('/'),
      convert_pdf: !(selectFileType === 'xls' || selectFileType === 'xlsx')
    });
    setFileBinaryData(res);
    setPreviewLoading(false);
  };

  const getPolicy = (policy: string) => {
    const pattern = /\{\s*[^}]+\s*\}/;
    const isPolicyValid = pattern.test(policy);
    return isPolicyValid ? (
      <EllipsisPopoverCom value={policy} preferTypography />
    ) : (
      '私有'
    );
  };

  // Iceberg基本信息数据
  const data = [
    {
      label: '英文名称',
      value: baseInfoData.tableName || '-'
    },
    {
      label: '中文名称',
      value: baseInfoData.description || '-'
    },
    {
      label: '存储类型',
      value: baseInfoData.tableType || '-'
    },
    {
      label: '元数据文件位置',
      value: (
        <EllipsisPopoverCom
          value={baseInfoData.storageLocation || '-'}
          preferTypography
        />
      )
    },
    {
      label: '所属数据库',
      value: baseInfoData.databaseName || metadataType || '-'
    },
    {
      label: '分区字段',
      value: getPartitionKey(baseInfoData.partitionKey)
    },
    {
      label: '分区数',
      value: Number(baseInfoData.partitionNum || 0)
    },
    {
      label: '存储大小',
      value: formatFileSize(Number(baseInfoData.storageSize))
    },
    {
      label: '文件数',
      value: Number(baseInfoData.fileNum || 0)
    },
    {
      label: '更新时间',
      value: baseInfoData.updateTime || '-'
    }
  ];
  // Doris基本信息数据
  const dorisData = [
    {
      label: '英文名称',
      value: baseInfoData.tableName || '-'
    },
    {
      label: '中文名称',
      value: baseInfoData.description || '-'
    },
    {
      label: '表类型',
      value: baseInfoData.tableType || '-'
    },
    {
      label: '所属数据库',
      value: baseInfoData.databaseName || metadataType || '-'
    },
    {
      label: '分桶字段',
      value: getPartitionKey(baseInfoData.distributionColumns)
    },
    {
      label: '分区数',
      value: Number(baseInfoData.partitionNum || 0)
    },
    {
      label: '桶数',
      value: Number(baseInfoData.bucketNum || 0)
    },
    {
      label: '副本数',
      value: Number(baseInfoData.replicaNum || 0)
    },
    {
      label: '更新时间',
      value: baseInfoData.tableUpdateTime || '-'
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
      label: '所属数据库',
      value: baseInfoData.dbName || '-'
    },
    {
      label: '向量数量',
      value: Number(baseInfoData.approxEntityCount || 0)
    },
    {
      label: '分区数',
      value: Number(baseInfoData.partitions || 0)
    },
    {
      label: '分片数',
      value: Number(baseInfoData.shards || 0)
    },
    {
      label: '创建时间',
      value: baseInfoData.createTime || '-'
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
      value: Number(minIOBaseData.objectsCount || 0)
    },
    {
      label: '存储大小',
      value: formatFileSize(Number(minIOBaseData.objectsSize || 0))
    },
    {
      label: '版本控制',
      value: minIOBaseData.versioning === 1 ? '启用' : '禁用'
    },
    {
      label: '访问策略',
      value: getPolicy(minIOBaseData.policy || '-')
    },
    {
      label: '加密类型',
      value: minIOBaseData.encryptType || '-'
    },
    {
      label: '创建时间',
      value: minIOBaseData.creationDate || '-'
    }
  ];
  // MinIo对象信息列
  const minIoObjectClumns: ColumnProps[] = [
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
        return <EllipsisPopoverCom value={text || '-'} preferTypography />;
      }
    },
    {
      title: '对象类型',
      dataIndex: 'contentType',
      key: 'contentType',
      className: styles.objectType,
      width: 180,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '存储类型',
      dataIndex: 'storageClass',
      key: 'storageClass',
      width: 150
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
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
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
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (text, record) => (
        <Button
          type="text"
          disabled={
            !canPreviewFileType.includes(record.objectPath.split('.').pop())
          }
          onClick={() => {
            const objectPath = record.objectPath.split('.').pop();
            handlePreview(record, objectPath);
          }}
        >
          预览
        </Button>
      )
    }
  ];
  // 字段信息列
  const fieldColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text, record, index) => index + 1
    },
    {
      title: '字段英文名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 200,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '字段中文名称',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 200,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '是否为空',
      dataIndex: 'isNull',
      key: 'isNull',
      width: 200,
      render: (text, record) => (text === 'YES' ? '是' : '否')
    }
  ];
  // milvus字段信息列
  const milvusFieldColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (text, record, index) => index + 1
    },
    {
      title: '字段英文名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 200,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '字段中文名称',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      key: 'fieldType',
      width: 200,
      render: (text, record) => (
        <EllipsisPopoverCom value={text || '-'} preferTypography />
      )
    },
    {
      title: '是否主键',
      dataIndex: 'isPrimaryKey',
      key: 'isPrimaryKey',
      width: 150,
      render: (text, record) => (text === 1 ? '是' : '否')
    },
    {
      title: '是否向量',
      dataIndex: 'isVector',
      key: 'isVector',
      width: 150,
      render: (text, record) => (text === 1 ? '是' : '否')
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
      render: (text, record) => (
        <EllipsisPopoverCom value={text} preferTypography />
      )
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
      render: (text, record) => (
        <EllipsisPopoverCom value={text} preferTypography />
      )
    }
  ];
  // Doris分区信息列
  const dorisPartitionColumns = [
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
      render: (text, record) => (
        <EllipsisPopoverCom value={text} preferTypography />
      )
    },
    {
      title: '存储大小',
      dataIndex: 'dataSize',
      key: 'dataSize',
      width: 200
    },
    {
      title: '行数统计',
      dataIndex: 'rowCount',
      key: 'rowCount',
      width: 200
    },
    {
      title: '存储介质',
      dataIndex: 'storageMedium',
      key: 'storageMedium',
      width: 200
    }
  ];
  // milvus分区信息列
  const milvusPartitionColumns = [
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
      render: (text, record) => (
        <EllipsisPopoverCom value={text} preferTypography />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      sorter: true
    },
    {
      title: '向量数量',
      dataIndex: 'rowCount',
      key: 'rowCount',
      width: 100
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
    } else if (activeKey === 'partitionInfo') {
      setPartitionSearchValues((prev) => ({
        ...prev,
        filters: {
          ...values
        }
      }));
    }
  };

  const getData = async () => {
    setLoading(true);
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
            dataIndex: item.nameEn,
            width: 300
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
            dataIndex: item.nameEn,
            width: 300
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
          },
          sort:
            Object.keys(partitionSearchValues?.sorter || {}).length > 0
              ? [{ ...partitionSearchValues?.sorter }]
              : []
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
            dataIndex: item.nameEn,
            width: 300,
            render: (text, record) => (
              <EllipsisPopoverCom value={text} preferTypography />
            )
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
          sort: minIoFieldSearchValues?.sorter
            ? [{ ...minIoFieldSearchValues?.sorter }]
            : []
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
    setLoading(false);
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
          <BreadcrumbItem>
            {baseInfoData.tableName ||
              minIOBaseData.bucketName ||
              baseInfoData.collectionName ||
              '-'}
          </BreadcrumbItem>
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
                  data={
                    metadataType === MetadataType.Iceberg ? data : dorisData
                  }
                  className={styles.customDescriptions}
                />
                <div>
                  <div className="mt-3 flex items-center justify-between">
                    <h1 className={styles.title}>表DDL (建表SQL)</h1>
                    <Button
                      type="outline"
                      icon={<IconCopy />}
                      className={styles.copyButton}
                      onClick={() => {
                        const isSuccess = copy(baseInfoData.createSql ?? '');
                        if (isSuccess) {
                          Message.success('内容复制成功');
                        } else {
                          Message.error('内容复制失败');
                        }
                      }}
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
                      placeholder="输入字段英文名称"
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
                      placeholder="输入字段中文名称"
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
                  noDataElement={<NoDataCard title="暂无数据" />}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: true }}
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
                      placeholder="输入分区名称"
                      onClear={() => {
                        setPartitionSearchValues((prev) => ({
                          ...prev,
                          filters: {
                            partitionName: ''
                          }
                        }));
                      }}
                    />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={
                    metadataType === MetadataType.Doris
                      ? dorisPartitionColumns
                      : partitionColumns
                  }
                  data={partitionData}
                  border={false}
                  pagination={false}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: true }}
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
                {loading ? (
                  <Spin className="flex h-[calc(100vh-300px)] flex-col items-center justify-center" />
                ) : (
                  <Table
                    className="mt-2"
                    columns={previewInfoColumns}
                    data={previewInfoData}
                    border={false}
                    pagination={false}
                    noDataElement={<NoDataCard title="暂无数据" />}
                    rowKey="id"
                    scroll={{ x: true }}
                  />
                )}
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
                      placeholder="输入对象名称"
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
                      }}
                    />
                  </FormItem>
                  <FormItem label="对象类型" field="contentType">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      placeholder="输入对象类型"
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
                      }}
                    />
                  </FormItem>
                  <FormItem label="对象存储路径" field="objectPath">
                    <Input.Search
                      onSearch={fieldSearchForm.submit}
                      allowClear
                      placeholder="输入对象存储路径"
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
                  noDataElement={<NoDataCard title="暂无数据" />}
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
                  scroll={{ x: true }}
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
                      placeholder="输入字段英文名称"
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
                      placeholder="输入字段中文名称"
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
                  noDataElement={<NoDataCard title="暂无数据" />}
                  rowKey="id"
                  scroll={{ x: true }}
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
                      placeholder="输入分区名称"
                      onClear={() => {
                        setPartitionSearchValues((prev) => ({
                          ...prev,
                          filters: {
                            partitionName: ''
                          }
                        }));
                      }}
                    />
                  </FormItem>
                </Form>
                <Table
                  className="mt-2"
                  columns={milvusPartitionColumns}
                  data={partitionData}
                  border={false}
                  noDataElement={<NoDataCard title="暂无数据" />}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: true }}
                  onChange={(pagination, sorter, filters, extra) => {
                    const sort = sorter as SorterInfo;
                    setPartitionSearchValues((prev) => ({
                      ...prev,
                      sorter: {
                        field: sort.field,
                        order:
                          sort.direction === 'ascend'
                            ? 'asc'
                            : sort.direction === 'descend'
                              ? 'desc'
                              : ''
                      }
                    }));
                  }}
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
                  noDataElement={<NoDataCard title="暂无数据" />}
                  rowKey="id"
                  scroll={{ x: true }}
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
        {previewLoading ? (
          <Spin
            className="flex h-full flex-col items-center justify-center"
            tip="文档加载中..."
          />
        ) : selectFileType === 'xls' || selectFileType === 'xlsx' ? (
          <TableViewer metadataPreviewData={fileBinaryData} />
        ) : (
          <PdfRenderer pdfData={fileBinaryData} scale={1.3} />
        )}
      </Modal>
    </div>
  );
}
