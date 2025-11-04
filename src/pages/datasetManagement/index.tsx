import React, { useRef, useState, useEffect, useMemo } from 'react';
import './index.css';
import {
  Typography,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Message,
  Select,
  Checkbox,
  Tooltip,
  Dropdown,
  Menu,
  Tabs,
  Form
} from '@arco-design/web-react';
import {
  IconPlus,
  IconEdit,
  IconUpload,
  IconDelete,
  IconDownload,
  IconFilter,
  IconEmpty,
  IconLoading,
  IconCloseCircleFill,
  IconCheckCircleFill,
  IconExclamationCircleFill,
  IconInfoCircle,
  IconDown,
  IconUp
} from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import noDataElement from '@/components/no-data';
import {
  getDatasetList,
  createDataset,
  deleteDataset,
  batchDeleteDataset,
  datasetVersionRebuild,
  getTagList
} from '@/api/datasetManagement';
import EllipsisPopover from '../../components/ellipsis-popover-com';
import DatasetForm from '@/components/datasetform/AddDatasetForm';
import NoDataEmpty from '@/components/NoDataEmpty';
import styles from './index.module.scss';
import FormComponent from '@/components/data-catalog-content/components/popups-form';
// 名称显示组件 - 只有在文本被截断时才显示Tooltip
import { PermissionWrapper } from '@/components/PermissionGuard';
import { DATA_MANAGEMENT_PERMISSIONS } from '@/config/permissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import {
  PopupsFormFrom,
  SourceDataItem,
  TargetDataItem
} from '@/components/data-catalog-content/components/popups-form/types';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';
import { color } from 'echarts';
import getFileIcon from '@/components/file-icon';
import { formatFileSize } from '@/utils/format';
import dataTypesIcon from '@/assets/dataset_dataType.png';
import dataRelationIcon from '@/assets/dataset_relation.png';
import dataGuaranteeIcon from '@/assets/dataset_guarantee.png';
import dataSceneIcon from '@/assets/dataset_scene.png';

// 时间格式化函数
const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateTimeString; // 如果格式化失败，返回原字符串
  }
};

// 数据集类型
export interface Dataset {
  latest_size: number;
  id: number;
  name: string;
  description: string;
  latest_version: string;
  error_reason: string;
  src: number;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  tag_names?: string[];
  src_model: string;
  latest_file_path: string;
  perms: string[];
  storage_type: datasetStorageType;
  status:
    | 'creating'
    | 'create_failed'
    | 'normal'
    | 'version_updating'
    | 'version_update_failed';
}

// 状态显示配置
const getStatusConfig = (status: string) => {
  const statusMap = {
    creating: { text: datasetStatusName.creating },
    create_failed: { text: datasetStatusName.create_failed },
    normal: { text: datasetStatusName.normal },
    version_updating: { text: datasetStatusName.version_updating },
    version_update_failed: { text: datasetStatusName.version_update_failed }
  };
  return statusMap[status] || { text: status };
};

// 获取状态icon
const getStatusIcon = (status: string) => {
  return status === datasetStatus.creating ? (
    <IconLoading style={{ color: '#007DFA', margin: '0 5px 0 0' }} />
  ) : status === datasetStatus.create_failed ? (
    <IconCloseCircleFill style={{ color: '#EF4444', margin: '0 5px 0 0' }} />
  ) : status === datasetStatus.normal ? (
    <IconCheckCircleFill style={{ color: '#10B981', margin: '0 5px 0 0' }} />
  ) : status === datasetStatus.version_updating ? (
    <IconLoading style={{ color: '#007DFA', margin: '0 5px 0 0' }} />
  ) : (
    <IconExclamationCircleFill
      style={{ color: '#F97316', margin: '0 5px 0 0' }}
    />
  );
};

const renderEmptyPlaceholder = (value: string | null) => {
  return value === '' || value == null ? '-' : value;
};

const columns = (
  handleGoToDetail,
  handleDelete,
  datasetList: Dataset[],
  handleExport: (record: Dataset) => void,
  tagList: { id: number; name: string }[],
  selectedTagFilters: string[],
  selectedStorageTypeFilters: string[], //存储格式过滤
  selectedStatusFilters: string[], //状态过滤
  sortField: string,
  sortOrder: string,
  handleTableChange: (pagination: any, sorter: any, filters: any) => void,
  handleRetry: (id: string | number, version_id: string) => void,
  selectedScenarioFilters?: string[], //场景分类过滤
  selectedSourceFilters?: string[] //来源过滤
) => [
  {
    title: '数据集名称',
    dataIndex: 'name',
    width: 200,
    className: 'dataset-management-hover-change workflow-name',
    rowClassName: 'dataset-management-hover-change',
    render: (name: string, record: Dataset) => {
      if (!name) return '-';
      return (
        <EllipsisPopover
          className={
            record.status === datasetStatus.normal ||
            record.status === datasetStatus.version_updating ||
            record.status === datasetStatus.version_update_failed
              ? 'dataset-hover'
              : ''
          }
          value={renderEmptyPlaceholder(record.name)}
          isEdit={false}
          isLink
          handleLink={() => {
            record.status === datasetStatus.normal ||
            record.status === datasetStatus.version_updating ||
            record.status === datasetStatus.version_update_failed
              ? handleGoToDetail(record.id)
              : '';
          }}
        />
        // <div
        //   onClick={() => handleGoToDetail(record.id)}
        //   style={{ cursor: 'pointer' }}
        // >
        //   <EllipsisPopover
        //     value={record.name}
        //     isEdit={false}
        //     preferTypography={true}
        //     className="custom-typography-text"
        //     ellipsis={{
        //       rows: 2,
        //       expandable: false,
        //       showTooltip: {
        //         type: 'popover',
        //         props: {
        //           position: 'tl',
        //           style: { maxHeight: '400px', overflow: 'auto' }
        //         }
        //       }
        //     }}
        //   />
        // </div>
      );
    }
  },
  {
    title: '场景分类',
    dataIndex: 'scenario_type',
    width: 120,
    filters: tagList.map((tag) => ({ text: tag.name, value: tag.name })),
    filteredValue: selectedScenarioFilters,
    filterMultiple: true,
    render: (src_model: string) => {
      if (!src_model) return '-';
      return src_model;
    }
  },
  {
    title: '数据集标签',
    dataIndex: 'tag_names',
    width: 150,
    filters: tagList.map((tag) => ({ text: tag.name, value: tag.name })),
    filteredValue: selectedTagFilters,
    filterMultiple: true,
    render: (tag_names: string[]) => {
      if (!tag_names || tag_names.length === 0) return '-';
      return (
        <Space size="mini">
          {tag_names && tag_names.length > 0 && tag_names[0] && (
            <Tag className={styles.tagGreen}>
              {tag_names[0].length > 5 ? (
                <Tooltip content={tag_names[0]}>
                  {tag_names[0].substring(0, 5)}...
                </Tooltip>
              ) : (
                tag_names[0] || '-'
              )}
            </Tag>
          )}
          {tag_names && tag_names.length > 1 && (
            <Tooltip
              content={tag_names.map((tag, index) => (
                <Tag
                  key={index}
                  className={styles.tagGreen}
                  style={{
                    // background: '#E2E8F0',
                    // color: '#0F172A',
                    margin: '2px 2px'
                    // borderRadius: '16px',
                    // fontSize: '12px',
                    // height: '18px',
                    // alignItems: 'center'
                  }}
                >
                  {tag}
                </Tag>
              ))}
            >
              <Tag className={styles.tagGreen}>+{tag_names.length - 1}</Tag>
            </Tooltip>
          )}
        </Space>
      );
    }
  },
  // {
  //   title: '版本',
  //   dataIndex: 'latest_version',
  //   width: 195,
  //   render: (latest_version: string) => {
  //     if (!latest_version) {
  //       return '-';
  //     }
  //     return (
  //       <div>
  //         {/* <Tooltip content={latest_version}> */}
  //         <div
  //           style={{
  //             whiteSpace: 'nowrap'
  //           }}
  //         >
  //           {latest_version}
  //         </div>
  //         {/* </Tooltip> */}
  //       </div>
  //     );
  //   }
  // },
  {
    title: '格式类型',
    dataIndex: 'storage_type',
    width: 120,
    filterIcon: <IconFilter />,
    filters: [
      { text: 'jsonl', value: datasetStorageType.jsonl },
      { text: '文件', value: datasetStorageType.file },
      { text: '数据库表', value: datasetStorageType.table }
    ],
    filteredValue: selectedStorageTypeFilters,
    filterMultiple: true,
    render: (status: string, record: Dataset) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{getFileIcon(record.storage_type ?? '-')}</div>
          <span className="ml-[4px]">
            {record.storage_type === datasetStorageType.table
              ? '数据库表'
              : record.storage_type === datasetStorageType.file
                ? '文件'
                : (record.storage_type ?? '-')}
          </span>
        </div>
      );
    }
  },
  {
    title: '来源',
    dataIndex: 'source',
    width: 120,
    filterIcon: <IconFilter />,
    filters: [
      { text: '标注', value: 1 },
      { text: '工作流', value: 2 }
    ],
    filteredValue: selectedSourceFilters,
    filterMultiple: true
  },
  {
    title: '文件大小',
    dataIndex: 'latest_size',
    width: 120,
    render: (_, record: Dataset) => formatFileSize(record.latest_size || 0)
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 180,
    filterIcon: <IconFilter />,
    filters: [
      { text: '创建中', value: datasetStatus.creating },
      { text: '创建失败', value: datasetStatus.create_failed },
      { text: '正常', value: datasetStatus.normal },
      { text: '版本更新中', value: datasetStatus.version_updating },
      { text: '版本更新失败', value: datasetStatus.version_update_failed }
    ],
    filteredValue: selectedStatusFilters,
    filterMultiple: true,
    render: (status: string, record: Dataset) => {
      const perms = record.perms;
      const statusConfig = getStatusConfig(status);
      if (!status) return '-';
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* {status && getStatusIcon(status)} */}
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor:
                status === 'normal'
                  ? '#10B981'
                  : status === 'create_failed' ||
                      status === 'version_update_failed'
                    ? '#EF4444'
                    : status === 'version_updating' || status === 'creating'
                      ? '#007DFA'
                      : '#CBD5E1',
              borderRadius: '50%',
              marginRight: '5px'
            }}
          ></div>
          <span>{statusConfig.text}</span>
          {status === datasetStatus.version_update_failed ||
          status === datasetStatus.create_failed ? (
            <Tooltip mini content={record.error_reason || ''}>
              <IconInfoCircle style={{ margin: '0 0 0 5px' }} />
            </Tooltip>
          ) : null}

          {status === datasetStatus.version_update_failed ? (
            <PermissionWrapper
              permission={DATA_MANAGEMENT_PERMISSIONS.CAN_UPDATE_VERSION_RETRY}
            >
              <span
                className={styles.retryText}
                onClick={() => handleRetry(record.id, record.latest_version)}
              >
                重试
              </span>
            </PermissionWrapper>
          ) : null}
        </div>
      );
    }
  },
  {
    title: '描述说明',
    dataIndex: 'description',
    width: 260,
    render: (description: string) => {
      if (!description) return '-';
      return (
        // <div
        //   style={{
        //     display: '-webkit-box',
        //     WebkitBoxOrient: 'vertical',
        //     WebkitLineClamp: 2,
        //     overflow: 'hidden',
        //     textOverflow: 'ellipsis',
        //     wordBreak: 'break-all'
        //   }}
        // >
        //   <Tooltip content={description}>{description}</Tooltip>
        // </div>
        <EllipsisPopover
          value={description}
          preferTypography={true}
          ellipsis={{
            rows: 1,
            showTooltip: {
              hover: true,
              click: false,
              props: {
                style: {
                  maxWidth: 600,
                  maxHeight: 400,
                  overflow: 'auto'
                }
              }
            }
          }}
        ></EllipsisPopover>
      );
    }
  },
  // {
  //   title: '生成模型',
  //   dataIndex: 'src_model',
  //   filterIcon: <IconFilter />,
  //   width: 130,
  //   filters: (() => {
  //     const modelSet = new Set<string>();
  //     datasetList?.forEach((dataset) => {
  //       if (dataset.src_model) {
  //         modelSet.add(dataset.src_model);
  //       }
  //     });
  //     return Array.from(modelSet).map((model) => ({
  //       text: model,
  //       value: model
  //     }));
  //   })(),
  //   onFilter: (value: string, record: Dataset) => {
  //     return record.src_model === value;
  //   },
  //   render: (src_model: string) => {
  //     if (!src_model) return '-';
  //     return (
  //       // <Tag
  //       //   className={styles.tagPurple}
  //       //   style={{
  //       //     display: '-webkit-box',
  //       //     WebkitBoxOrient: 'vertical',
  //       //     WebkitLineClamp: 2,
  //       //     overflow: 'hidden',
  //       //     textOverflow: 'ellipsis',
  //       //     wordBreak: 'break-all'
  //       //   }}
  //       // >
  //       //   <Tooltip content={src_model}>{src_model}</Tooltip>
  //       // </Tag>
  //       <EllipsisPopover value={src_model}></EllipsisPopover>
  //     );
  //   }
  // },
  {
    title: '数据目录',
    dataIndex: 'directory',
    width: 200,
    render: (directory: string) => {
      if (!directory) return '-';
      return <EllipsisPopover value={directory}></EllipsisPopover>;
    }
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    width: 100,
    filterIcon: <IconFilter />,
    render: (creator_name: string) => {
      if (!creator_name) return '-';
      return <EllipsisPopover value={creator_name}></EllipsisPopover>;
    }
    // filters: (() => {
    //   const creatorSet = new Set<string>();
    //   datasetList?.forEach((dataset) => {
    //     if (dataset.creator_name) {
    //       creatorSet.add(dataset.creator_name);
    //     }
    //   });
    //   return Array.from(creatorSet).map((creator) => ({
    //     text: creator,
    //     value: creator
    //   }));
    // })(),
    // onFilter: (value: string, record: Dataset) => {
    //   return record.creator_name === value;
    // }
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180,
    sorter: true, // 启用排序功能，但不提供排序函数
    sortOrder:
      sortField === 'created_at'
        ? sortOrder === 'asc'
          ? ('ascend' as const)
          : sortOrder === 'desc'
            ? ('descend' as const)
            : undefined
        : undefined,
    sortDirections: ['ascend' as const, 'descend' as const],
    render: (created_at: string) => formatDateTime(created_at)
  },
  {
    title: '最近更新',
    dataIndex: 'updated_at',
    width: 180,
    sorter: true, // 启用排序功能，但不提供排序函数
    sortOrder:
      sortField === 'updated_at'
        ? sortOrder === 'asc'
          ? ('ascend' as const)
          : sortOrder === 'desc'
            ? ('descend' as const)
            : undefined
        : undefined,
    sortDirections: ['ascend' as const, 'descend' as const],
    render: (updated_at: string) => formatDateTime(updated_at)
  },
  {
    title: '操作',
    dataIndex: 'op',
    width: 200,
    fixed: 'right' as const,
    render: (_: unknown, record: Dataset) => {
      const perms = record.perms;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* <Button
              type="text"
              className={`${styles.actionButton} ${styles.export}`}
            >
              编辑
            </Button> */}
          <Button type="text">详情</Button>
          <Button type="text">移动</Button>

          <Dropdown
            droplist={
              <Menu>
                {record.storage_type !== datasetStorageType.table && (
                  <Menu.Item key="export">
                    <PermissionWrapper
                      permission={DATA_MANAGEMENT_PERMISSIONS.CAN_SEARCH}
                    >
                      <Button
                        type="text"
                        className={`${styles.actionButton} ${record.status === datasetStatus.normal ? styles.export : styles.disabled}`}
                        onClick={() => handleExport(record)}
                        disabled={record.status !== datasetStatus.normal}
                        style={{
                          padding: '0 8px 0 5px',
                          height: '100%',
                          borderTop: 'none',
                          borderBottom: 'none'
                        }}
                      >
                        导出
                      </Button>
                    </PermissionWrapper>
                  </Menu.Item>
                )}
                <Menu.Item key="delete">
                  <PermissionWrapper
                    permission={DATA_MANAGEMENT_PERMISSIONS.CAN_DELETE}
                  >
                    <Button
                      type="text"
                      className={`${styles.actionButton} ${styles.delete}`}
                      onClick={() => handleDelete(record)}
                      style={{
                        padding: '0 8px 0 5px',
                        height: '100%',
                        borderTop: 'none',
                        borderBottom: 'none'
                      }}
                    >
                      删除
                    </Button>
                  </PermissionWrapper>
                </Menu.Item>
              </Menu>
            }
            trigger="click"
            position="bl"
          >
            <Button type="text">
              更多 <IconDown />
            </Button>
          </Dropdown>
        </div>
      );
    }
  }
];

export enum searchFieldType {
  name = 'name',
  // tags = 'tags',
  description = 'description'
  // src_model = 'src_model',
  // creator_name = 'creator_name'
}

// 枚举数据集状态
export enum datasetStatusName {
  creating = '创建中',
  create_failed = '创建失败',
  normal = '正常',
  version_updating = '版本生成中',
  version_update_failed = '版本生成失败'
}

// 枚举数据集状态名称
export enum datasetStorageType {
  jsonl = 'jsonl',
  file = 'file',
  table = 'table'
}

// 枚举数据集状态名称
export enum datasetStatus {
  creating = 'creating',
  create_failed = 'create_failed',
  normal = 'normal',
  version_updating = 'version_updating',
  version_update_failed = 'version_update_failed'
}

const DatasetManagement: React.FC = () => {
  const history = useHistory();
  const TabPane = Tabs.TabPane;
  const [sceneTypeForm] = Form.useForm();
  const [tagList, setTagList] = React.useState<{ id: number; name: string }[]>(
    []
  ); //标签列表
  const [datasetList, setDatasetList] = React.useState<Dataset[]>([]); //数据集列表
  const [search, setSearch] = React.useState<string>(''); //搜索
  const [searchField, setSearchField] = React.useState<searchFieldType>(
    searchFieldType.name
  ); //搜索字段

  // 分页相关状态
  const [currentPage, setCurrentPage] = React.useState<number>(1); //当前页码
  const [pageSize, setPageSize] = React.useState<number>(10); //每页条数
  const [total, setTotal] = React.useState<number>(0); //总条数

  // 选择相关状态
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]); //选择行
  const [selectedRows, setSelectedRows] = React.useState<Array<Dataset>>([]); //选择行数据

  // 标签过滤相关状态
  const [selectedTagFilters, setSelectedTagFilters] = React.useState<string[]>(
    []
  ); //选中的标签过滤

  // 存储格式过滤相关状态
  const [selectedStorageTypeFilters, setSelectedStorageTypeFilters] =
    React.useState<string[]>([]); //选中的存储格式过滤

  // 状态过滤相关状态
  const [selectedStatusFilters, setSelectedStatusFilters] = React.useState<
    string[]
  >([]); //选中的状态过滤

  // 排序相关状态
  const [sortField, setSortField] = React.useState<string>(''); // 排序字段：created_at 或 updated_at
  const [sortOrder, setSortOrder] = React.useState<string>(''); // 排序方向：asc 或 desc
  // 描述是否展开
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(true);
  const [tabData, setTabData] = React.useState<string[]>([]);
  const [addSceneTypeVisible, setAddSceneTypeVisible] =
    React.useState<boolean>(false);

  const childRef = useRef<{
    resetForm: () => void;
    setcreateTagDisabled: () => void;
  } | null>(null);

  // 监听排序状态变化
  React.useEffect(() => {
    console.log('排序状态已更新:', { sortField, sortOrder });
  }, [sortField, sortOrder]);

  // Modal相关状态
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  //导出弹窗相关
  const [downloadData, setDownloadData] = React.useState<Dataset | null>(null);
  const [visible, setVisible] = React.useState(false); // 导出弹框控制

  // 搜索字段选项
  const searchOptions = [
    { label: '名称', value: 'name' },
    { label: '描述说明', value: 'description' }
  ];

  // 数据集市header
  const datasetMarketHeaderData = [
    {
      title: '丰富的数据类型',
      desc: '支持模型微调数据集、CV标注数据集、RAG知识库等多种数据类型',
      icon: dataTypesIcon
    },
    {
      title: '数据血缘追溯',
      desc: '完整记录数据加工全链路，确保数据质量可追溯、可审计',
      icon: dataRelationIcon
    },
    {
      title: '高质量数据保障',
      desc: '支持模型自动质检与人工质检相结合，确保数据集高质量输出',
      icon: dataGuaranteeIcon
    },
    {
      title: '广泛的应用场景',
      desc: '应用于大模型微调、AI模型训练、商业智能分析等场景',
      icon: dataSceneIcon
    }
  ];

  // 数据集tab数据
  const datasetTabData = [
    {
      title: '全部',
      key: '1',
      count: 180
    },
    {
      title: '模型训练与微调数据集',
      key: '2',
      count: 100
    },
    {
      title: 'RAG知识库',
      key: '3',
      count: 20
    },
    {
      title: '数据分析',
      key: '4',
      count: 20
    },
    {
      title: '其他',
      key: '5',
      count: 40
    }
  ];

  // 新增场景类型提交
  const handleAddSceneTypeSubmit = (values: any) => {
    console.log('新增场景类型:', values);
    setAddSceneTypeVisible(false);
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: Array<Dataset>) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: any) => {
      console.log('onSelectAll:', selected, selectedRows);
    }
  };

  // 打开新建弹窗
  const openCreateModal = () => {
    setModalVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
  };

  // 跳转到详情页
  const handleGoToDetail = (datasetId: number) => {
    history.push(
      `/tenant/compute/modaforge/datasetManagement/detail/${datasetId}`
    );
  };

  // 提交表单数据,新建数据集
  const handleSubmit = async (formData: any) => {
    // console.log('新建数据集:', String(formData.targetDataSource[0][0]));
    // let formattedPath;
    // let fullPath;
    // if (formData.dataSource === 'volume') {
    //   const basePath = String(formData?.targetDataSource?.[0]?.[0] ?? '');
    //   formattedPath =
    //     basePath.length > 1 && basePath.endsWith('/')
    //       ? `${basePath}/`
    //       : basePath;
    //   fullPath = `${formattedPath}dst/${formData?.targetDataSource?.[0]?.[1]}/volume/${formData?.targetDataSource?.[1]?.[0] ?? ''}`;
    // }
    const submitData = {
      name: formData.name,
      description: formData.description,
      tag_names: formData.tags || [],
      storage_type: formData.storageType,
      src: formData.dataSource === 'volume' ? 1 : 2, // 1-目标数据目录，2-连接器
      src_extra:
        formData.dataSource === 'volume'
          ? {
              // path: fullPath,
              path_id: formData.targetDataSource?.[1]?.[1] ?? '',
              path_file_ids: formData.path_file_ids || []
            }
          : {
              connector_id: parseInt(formData?.targetDataSource) || 0,
              connector_file_ids: formData?.selectedFiles || []
            }
    };

    console.log('提交数据:', submitData);

    try {
      const createDatasetRes = await createDataset(submitData);

      if (createDatasetRes.status !== 200) {
        Message.error(createDatasetRes.message || '数据集创建失败！');
        childRef.current?.setcreateTagDisabled();
        return;
      }

      // 刷新数据列表
      fetchDatasetList();
      closeModal();

      //获取标签
      const tagListRes = await getTagList();

      try {
        if (tagListRes.data && Array.isArray(tagListRes.data)) {
          setTagList(tagListRes.data);
        } else {
          console.error('标签列表数据格式错误:', tagListRes);
          setTagList([]);
        }
      } catch {
        setTagList([]);
        Message.error('获取标签列表失败');
      }

      childRef.current?.resetForm();
      childRef.current?.setcreateTagDisabled();
      Message.success('数据集创建成功！');
    } catch {
      childRef.current?.setcreateTagDisabled();
      Message.error('数据集创建失败！');
    }
  };

  // 删除数据集的方法
  const deleteDatasetRecord = (record: Dataset) => {
    deleteDataset({ id: record?.id })
      .then((res) => {
        fetchDatasetList();
        Message.success('删除成功');
      })
      .catch((err) => {
        Message.error('删除失败，请稍候重试');
      });
  };

  // 删除数据集
  const handleDelete = (record: Dataset) => {
    Modal.confirm({
      title: (
        <span
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            height: 24,
            display: 'inline-block'
          }}
        >
          确认删除文件吗？
        </span>
      ),
      // 内容
      content: (
        <div
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            marginTop: '10px',
            color: '#1D2129',
            height: 22,
            display: 'inline-block',
            marginLeft: '28px' // 左移一点
          }}
        >
          删除后，数据集不可恢复
        </div>
      ),
      // 按钮文字
      okText: '确定',
      cancelText: '取消',
      // okButtonProps: { status: 'danger' },
      onOk: () => {
        deleteDatasetRecord(record);
      }
    });
  };

  // 重试
  const handleRetry = async (id: number | string, version_id: string) => {
    const params = {
      id: Number(id),
      version_id
    };
    const res = await datasetVersionRebuild(params);
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '重试成功'
      });
      // 重新获取数据列表
      fetchDatasetList();
    } else {
      Message.error({
        content: res.message || '重试失败，请稍后重试'
      });
    }
  };

  // 分页处理函数
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('跳转到第', page, '页');
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    // setCurrentPage(1); // 重置到第一页
    console.log('每页显示', size, '条数据');
  };

  // 添加一个独立的搜索状态
  const [actualSearch, setActualSearch] = React.useState('');
  const [actualSearchField, setActualSearchField] = React.useState(
    searchFieldType.name
  );

  // 修改 handleSearch 函数
  const handleSearch = () => {
    setCurrentPage(1);
    setActualSearch(search); // 设置实际搜索词
    setActualSearchField(searchField); // 设置实际搜索字段
  };

  // 封装获取数据集列表的通用函数
  const fetchDatasetList = React.useCallback(async () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
      search: actualSearch,
      search_field: actualSearchField
    };

    // 添加标签过滤参数
    if (selectedTagFilters.length > 0) {
      params.tag_names = selectedTagFilters;
    }
    console.log('selectedStorageTypeFilters', selectedStorageTypeFilters);

    // 添加存储格式过滤参数
    if (selectedStorageTypeFilters.length > 0) {
      params.storage_type = selectedStorageTypeFilters;
    }

    // 添加状态过滤参数
    if (selectedStatusFilters.length > 0) {
      params.status = selectedStatusFilters;
    }

    // 添加排序参数
    if (sortField) {
      params.sort_field = sortField;
    }
    if (sortOrder) {
      params.sort_order = sortOrder;
    }

    console.log('发送API请求，参数:', params);

    try {
      const res = await getDatasetList(params);
      setDatasetList(res.data?.list || []);
      setTotal(res.data?.total || 0);
      return res;
    } catch (err) {
      console.error('获取数据失败:', err);
      setDatasetList([]);
      setTotal(0);
      throw err;
    }
  }, [
    currentPage,
    pageSize,
    actualSearch,
    actualSearchField,
    selectedTagFilters,
    selectedStatusFilters,
    selectedStorageTypeFilters,
    sortField,
    sortOrder
  ]);

  // 处理表格变化（包括过滤器变化）
  const handleTableChange = (pagination: any, sorter: any, filters: any) => {
    // 处理标签过滤
    if (filters.tag_names && filters.tag_names !== selectedTagFilters) {
      setSelectedTagFilters(filters.tag_names);
      setCurrentPage(1); // 重置到第一页
    }
    // 处理存储格式过滤
    if (
      filters.storage_type &&
      filters.storage_type !== selectedStorageTypeFilters
    ) {
      setSelectedStorageTypeFilters(filters.storage_type);
      setCurrentPage(1); // 重置到第一页
    }
    // 处理状态过滤
    if (filters.status && filters.status !== selectedStatusFilters) {
      setSelectedStatusFilters(filters.status);
      setCurrentPage(1); // 重置到第一页
    }

    if (filters.tag_names === undefined) {
      setSelectedTagFilters([]);
      setCurrentPage(1);
    }

    // 处理存储格式过滤
    if (filters.storage_type === undefined) {
      setSelectedStorageTypeFilters([]);
      setCurrentPage(1);
    }

    if (filters.status === undefined) {
      setSelectedStatusFilters([]);
      setCurrentPage(1);
    }

    if (sorter && sorter.field) {
      const newSortField = sorter.field;
      const newSortOrder =
        sorter.direction === 'ascend'
          ? 'asc'
          : sorter.direction === 'descend'
            ? 'desc'
            : '';

      if (newSortField !== sortField || newSortOrder !== sortOrder) {
        setSortField(newSortField);
        setSortOrder(newSortOrder);
        setCurrentPage(1); // 重置到第一页
      }
    } else {
      // 清除排序
      if (sortField || sortOrder) {
        setSortField('');
        setSortOrder('');
        setCurrentPage(1); // 重置到第一页
      }
    }
  };

  // 获取数据集列表,当页码或者每页条数变化时，重新获取数据
  React.useEffect(() => {
    fetchDatasetList();
  }, [fetchDatasetList]);

  React.useEffect(() => {
    getTagList()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setTagList(res.data);
        } else {
          console.error('标签列表数据格式错误:', res);
          setTagList([]);
        }
      })
      .catch((err) => {
        console.error('获取标签列表失败:', err);
        setTagList([]);
        Message.error('获取标签列表失败');
      });
  }, []);

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要删除的数据集');
      return;
    }

    Modal.confirm({
      title: (
        <span
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            height: 24,
            display: 'inline-block'
          }}
        >
          确认删除
        </span>
      ),
      content: (
        <div
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            marginTop: '10px',
            color: '#1D2129',
            height: 22,
            display: 'inline-block',
            marginLeft: '28px' // 左移一点
          }}
        >
          退出后，当前修改不会保存
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      // okButtonProps: { status: 'danger' },
      onOk: () => {
        console.log('批量删除:', selectedRows);
        batchDeleteDataset({
          ids: selectedRowKeys.map((key) => Number(key))
        })
          .then((res) => {
            console.log('批量删除结果:', res);
            if (res.status === 200) {
              Message.success(`成功删除 ${selectedRowKeys.length} 个数据集！`);
              setSelectedRowKeys([]);
              setSelectedRows([]);
              fetchDatasetList();
            } else {
              Message.error('批量删除失败！');
            }
          })
          .catch((err) => {
            Message.error('批量删除失败！');
          });
      }
    });
  };

  // 导出数据集
  const handleExport = (record: Dataset) => {
    console.log('导出数据集:', record);
    setDownloadData(record);
    setVisible(true);
  };
  // 批量导出
  const handleBatchExport = () => {
    // if (selectedRowKeys.length === 0) {
    //   Message.warning('请先选择要导出的数据集');
    //   return;
    // }
    // 过滤掉storage_type为table的数据集
    const filteredRows = selectedRows.filter(
      (row) => row.storage_type !== datasetStorageType.table
    );
    const filteredRowKeys = filteredRows.map((row) => row.id);

    // 更新选中状态，移除不能导出的数据集
    setSelectedRows(filteredRows);
    setSelectedRowKeys(filteredRowKeys);

    setDownloadData(null);
    setVisible(true);
    console.log('批量导出(已过滤table类型):', filteredRows);

    // 如果过滤后有数据被移除，给用户提示
    const removedCount = selectedRows.length - filteredRows.length;
    if (removedCount > 0) {
      Message.info(`已自动过滤 ${removedCount} 个数据库表类型的数据集`);
    }
  };
  //清除选中状态函数
  const handClear = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };
  // 批量导出，未选择或只选中数据库表类型时禁用
  const batchExportDisabled = useMemo(
    () =>
      selectedRows.filter(
        (row: Dataset) => row.storage_type !== datasetStorageType.table
      ).length === 0,
    [selectedRows]
  );

  return (
    <div
      className={styles.datasetManagementContainer}
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        padding: '24px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '20px',
          zIndex: 1
        }}
      >
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '0px 15px 0px 0px',
            color: '#0F172A'
          }}
        >
          数据集市
        </h1>
        <div
          style={{
            color: '#334155',
            margin: '0px',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>
            从数据接入到智能应用，构建企业级高质量数据集，支持模型训练、知识库构建与数据分析
          </span>
          <Dropdown trigger="click" position="br">
            <Button type="text" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? '收起' : '展开'}
              {isCollapsed ? <IconUp /> : <IconDown />}
            </Button>
          </Dropdown>
        </div>
      </div>
      {isCollapsed && (
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid #FFF',
            background: 'rgba(255, 255, 255, 0.48)',
            boxShadow: '0 0 3.5px 0 rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'row',
            marginBottom: '20px',
            zIndex: 1
          }}
        >
          {datasetMarketHeaderData.map((item, index) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '16px 20px',
                gap: '20px'
              }}
              key={index}
            >
              <div>
                <h1
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px'
                  }}
                >
                  {item.title}
                </h1>
                <span style={{ fontSize: '12px', lineHeight: '18px' }}>
                  {item.desc}
                </span>
              </div>
              <img
                style={{ width: '80px', height: '80px' }}
                src={item.icon}
                alt={item.title}
              />
            </div>
          ))}
        </div>
      )}
      <Tabs
        editable
        defaultActiveTab="1"
        style={{ zIndex: 1 }}
        type="card"
        onAddTab={() => setAddSceneTypeVisible(true)}
      >
        {datasetTabData.map((item, index) => (
          <TabPane key={item.key} title={item.title} closable={false}>
            <Typography.Paragraph>{item.count}</Typography.Paragraph>
          </TabPane>
        ))}
      </Tabs>
      <div className={styles.searchToolbar}>
        <Input.Group compact>
          <Select
            style={{ width: 100, height: 32 }}
            value={searchField}
            onChange={(value) => setSearchField(value)}
            options={searchOptions}
          />
          <Input.Search
            allowClear
            placeholder="输入关键字搜索"
            style={{ width: 160, height: 32 }}
            value={search}
            onChange={(value) => setSearch(value)}
            onClear={() => {
              setSearch('');
              setCurrentPage(1);
              setActualSearch('');
            }}
            // onChange={(value) => {
            //   setSearch(value);
            //   // 当清空搜索框时（点击叉号），立即触发搜索
            //   if (value === '') {
            //     setCurrentPage(1);
            //     setActualSearch('');
            //     setActualSearchField(searchField);
            //   }
            // }}
            onPressEnter={handleSearch}
            onSearch={handleSearch}
          />
        </Input.Group>
        <div className={styles.actionButtons}>
          <PermissionWrapper
            permission={DATA_MANAGEMENT_PERMISSIONS.CAN_DELETE_BATCH}
          >
            <Tooltip
              content={selectedRowKeys.length === 0 ? '请选择文件' : ''}
              disabled={selectedRowKeys.length > 0}
              style={{ fontSize: '14px' }}
            >
              <Button
                icon={<IconDelete />}
                className={styles.batchDeleteBtn}
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchDelete}
                type="secondary"
              >
                批量删除
              </Button>
            </Tooltip>
          </PermissionWrapper>
          <PermissionWrapper
            permission={DATA_MANAGEMENT_PERMISSIONS.CAN_SEARCH_BATCH}
          >
            <Tooltip
              content={selectedRowKeys.length === 0 ? '请选择文件' : ''}
              disabled={selectedRowKeys.length > 0}
            >
              <Button
                icon={<IconDownload />}
                className={styles.batchExportBtn}
                disabled={batchExportDisabled}
                onClick={handleBatchExport}
              >
                批量导出
              </Button>
            </Tooltip>
          </PermissionWrapper>
          <PermissionWrapper
            permission={DATA_MANAGEMENT_PERMISSIONS.CAN_CREATE}
          >
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={openCreateModal}
            >
              新建数据集
            </Button>
          </PermissionWrapper>
        </div>
      </div>

      <Table
        rowKey="id"
        className={styles.datasetTable}
        // rowHeight="47px"
        columns={columns(
          handleGoToDetail,
          handleDelete,
          datasetList,
          handleExport,
          tagList,
          selectedTagFilters,
          selectedStorageTypeFilters,
          selectedStatusFilters,
          sortField,
          sortOrder,
          handleTableChange,
          handleRetry
        )}
        data={datasetList}
        rowSelection={rowSelection}
        noDataElement={noDataElement({ description: '暂无数据' })}
        pagination={{
          current: currentPage,
          total: total,
          pageSize: pageSize,
          showTotal: (total, range) => `共${total}条`,
          sizeCanChange: true,
          showJumper: true,
          pageSizeChangeResetCurrent: true,
          onChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          sizeOptions: [10, 20, 50, 100]
        }}
        border={false}
        virtualized
        scroll={{
          x: 1200,
          y: 500
        }}
        onChange={handleTableChange}
      />

      {/* 新建数据集弹框 */}
      <DatasetForm
        visible={modalVisible}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        ref={childRef}
      />
      {/* 导出数据集弹窗 */}
      <FormComponent
        from={PopupsFormFrom.DatasetManagement}
        exportdataset={downloadData}
        onCancel={() => setVisible(false)}
        visible={visible}
        exportdatas={
          selectedRows as Array<SourceDataItem & TargetDataItem & Dataset>
        }
        handlClear={handClear}
      />

      {/* 新增场景类型弹窗 */}
      <Modal
        visible={addSceneTypeVisible}
        onOk={() => sceneTypeForm.submit()}
        onCancel={() => setAddSceneTypeVisible(false)}
        title="新增场景类型"
      >
        <Form form={sceneTypeForm} onSubmit={handleAddSceneTypeSubmit}>
          <Form.Item
            label="场景分类名称："
            field="sceneTypeName"
            rules={[{ required: true, message: '请输入场景类型名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item label="场景分类标签：" field="sceneTypeTag">
            <Select placeholder="请选择标签" />
          </Form.Item>
          <Form.Item label="描述说明：" field="sceneTypeDesc">
            <Input.TextArea placeholder="可以描述数据集的用途、特点或其他相关信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DatasetManagement;
