import React from 'react';
import { useParams, useHistory, Prompt } from 'react-router-dom';
import styles from './style.module.css';
import NoDataEmpty from '@/components/NoDataEmpty';
import EllipsisPopover from '../ellipsis-popover-com';
import { useLocation } from 'react-router-dom';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Modal,
  Message,
  Tabs,
  Table,
  Input,
  Select,
  Pagination,
  Tooltip,
  Empty
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconEdit,
  IconDelete,
  IconSearch,
  IconPlayArrow,
  IconHistory,
  IconRefresh,
  IconCheck,
  IconClose,
  IconCheckCircleFill,
  IconExclamationCircleFill,
  IconLoading,
  IconInfoCircle
  //  IconRefresh
} from '@arco-design/web-react/icon';

import { Breadcrumb } from '@arco-design/web-react';
import {
  getDatasetDetail,
  updateDataset,
  getDatasetContents,
  getDatasetDetailPage,
  editDatasetVersion,
  type DataChangeItem,
  getDatasetVersionList,
  datasetVersionRebuild
} from '@/api/datasetManagement';
import EditDatasetForm from '@/components/datasetform/EditDatasetForm';
import './style.css';
import { validateName } from '@/utils/valiate';
import noDataElement from '@/components/no-data';
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface DatasetDetail {
  id: number;
  name: string;
  tag_names: string[];
  description: string;
  status: string;
  error_reason: string;
  latest_version: string;
  latest_file_path: string;
  latest_file_name: string;
  src: number;
  src_model: string;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

const countWidth = (count: number) => {
  const viewportWidth = window.innerWidth - 350;
  if (count > 4) {
    return '400px';
  } else {
    return `${viewportWidth / count}px`;
  }
};

//headers:表头
//handleEditContent:编辑内容
//handleContinue:删除
//editingRowKey:当前编辑行
//editingData:当前编辑数据
//onDataChange:处理编辑数据变化
//handleInlineEditSubmit:确认编辑
//handleInlineEditCancel:取消编辑
//idName:唯一标识符字段名
//updateStatus:更新状态
const generateArcoColumns = (
  headers,
  handleEditContent,
  handleContinue,
  editingRowKey,
  editingData,
  onDataChange,
  handleInlineEditSubmit,
  handleInlineEditCancel,
  idName,
  updateStatus
) => {
  // 过滤掉唯一标识符字段，不在页面显示
  const displayHeaders = headers.filter((header) => header !== idName);
  const columnWidth = countWidth(displayHeaders.length);
  const cols = displayHeaders.map((header) => ({
    title: header,
    dataIndex: header,
    key: header,
    ellipsis: true,
    width: columnWidth,
    render: (value: any, record: any) => {
      const cellWidth = columnWidth; // 设置默认宽度
      if (updateStatus && editingRowKey === record[idName]) {
        return (
          <Input.TextArea
            // @ts-expect-error
            borderless={true}
            value={
              editingData[header] !== undefined
                ? editingData[header]
                : record[header]
            }
            onChange={(value) => onDataChange(header, value)}
            // style={{ margin: '-5px 0' }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="请输入内容"
          />
        );
      } else {
        return (
          <div style={{ width: cellWidth }}>
            {/* {header === 'name' ? ( */}
            <EllipsisPopover
              preferTypography
              isEdit={false}
              value={value}
              style={{
                // width:'30%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            />
          </div>
        );
      }
    }
  }));
  // 只有在编辑状态下才显示操作列
  if (updateStatus) {
    cols.push({
      title: '操作',
      key: 'action',
      width: 112,
      fixed: 'right',
      headerClassName: 'custom-table-header-action', // 自定义表头样式
      render: (_, record) => {
        if (editingRowKey === record[idName]) {
          // 编辑模式：显示确认和取消按钮
          return (
            <Space>
              <Button
                type="text"
                size="small"
                icon={<IconCheck style={{ color: '#00b42a', fontSize: 16 }} />}
                onClick={() => handleInlineEditSubmit(record)}
                style={{ color: '#00b42a' }}
                title="确认"
              />
              <Button
                type="text"
                size="small"
                icon={<IconClose style={{ color: '#f53f3f', fontSize: 16 }} />}
                onClick={handleInlineEditCancel}
                style={{ color: '#f53f3f' }}
                title="取消"
              />
            </Space>
          );
        }

        // 正常模式：显示编辑和删除按钮
        const isOtherRowEditing =
          editingRowKey !== null && editingRowKey !== record[idName];

        return (
          // <Space>
          <div>
            <Tooltip content={isOtherRowEditing ? '请完成当前编辑' : ''}>
              <Button
                type="text"
                size="small"
                disabled={isOtherRowEditing}
                onClick={() => handleEditContent(record[idName])}
                style={{
                  color: isOtherRowEditing ? '#c9cdd4' : undefined,
                  cursor: isOtherRowEditing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  padding: '0 0px',
                  marginRight: '16px',
                  marginLeft: '4px'
                }}
              >
                编辑
              </Button>
            </Tooltip>
            <Tooltip content={isOtherRowEditing ? '请完成当前编辑' : ''}>
              <Button
                type="text"
                size="small"
                onClick={() => handleContinue(record[idName])}
                style={{
                  color: isOtherRowEditing ? '#c9cdd4' : undefined,
                  cursor: isOtherRowEditing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  padding: '0 0px',
                  // marginRight: '16px',
                  marginLeft: '4px'
                }}
              >
                删除
              </Button>
            </Tooltip>
          </div>
          // </Space>
        );
      }
    });
  }

  return cols;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 版本历史表格列定义
const versionColumns: any[] = [
  {
    title: '版本号',
    dataIndex: 'version_id',
    width: 260,
    render: (version: string, record: any, index: number) => (
      <Space>
        <Text>{version}</Text>
        {index === 0 && (
          <span
            style={{
              width: '56px',
              height: '18px',
              backgroundColor: '#ECFDF5',
              color: '#10b981',
              borderRadius: '4px',
              fontWeight: 400,
              fontSize: '12px'
              // marginLeft: '8px',
              // display: 'flex',
              // alignItems: 'center',
              // justifyContent: 'center'
            }}
          >
            最新版本
          </span>
        )}
      </Space>
    )
  },
  {
    title: '修改类型',
    dataIndex: 'type',
    width: 226,
    filters: [
      { text: '数据导入', value: 1 },
      { text: '用户手动修改', value: 2 },
      { text: '工作流修改', value: 3 }
    ],
    onFilter: (value: number, record: any) => record.type === value,
    render: (type: number) => {
      const typeMap = {
        1: '数据导入',
        2: '用户手动修改',
        3: '工作流修改'
      };
      return typeMap[type] || '-';
    }
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 226,
    sorter: (a: any, b: any) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeA - timeB;
    },
    sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    showSorterTooltip: true,
    render: (time: string) => formatDate(time)
  },
  {
    title: '更变记录',
    width: 470,
    dataIndex: 'description'
  }
];

// 转换数据类型
function convertKeyType(arr, key, type) {
  return arr.map((item) => {
    const newItem = { ...item };
    if (newItem.hasOwnProperty(key)) {
      if (type === 'string') {
        newItem[key] = String(newItem[key]);
      } else if (type === 'number') {
        // NaN 兼容处理
        const n = Number(newItem[key]);
        newItem[key] = isNaN(n) ? newItem[key] : n;
      } else if (type === 'boolean') {
        // 简单转换
        newItem[key] = Boolean(newItem[key]);
      }
      // 可以扩展更多类型
    }
    return newItem;
  });
}

// 状态配置
const statusConfig = {
  normal: {
    label: '正常',
    icon: (
      <IconCheckCircleFill style={{ color: '#00b42a', fontSize: '14px' }} />
    ),
    color: '#1E293B'
  },
  version_updating: {
    label: '版本更新中',
    icon: <IconLoading style={{ color: '#165dff', fontSize: '14px' }} />,
    color: '#1E293B'
  },
  version_update_failed: {
    label: '版本更新失败',
    icon: (
      <IconExclamationCircleFill
        style={{ color: '#ff7d00', fontSize: '14px' }}
      />
    ),
    color: '#1E293B'
  }
};

// 渲染状态标签
const renderStatusTag = (
  status: string,
  errorReason?: string,
  handleVersionRebuild?: () => void,
  handlerefresh?: () => void
) => {
  const config = statusConfig[status];
  if (!config) return null;

  const statusElement = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {config.icon}
      <span style={{ color: config.color, fontSize: '14px' }}>
        {config.label}
      </span>
    </div>
  );

  // 为失败状态添加工具提示
  const statusWithTooltip =
    status === 'version_update_failed' && errorReason ? (
      <Tooltip content={errorReason}>{statusElement}</Tooltip>
    ) : (
      statusElement
    );

  // 如果是版本更新失败状态，添加重试链接
  if (status === 'version_update_failed') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {statusElement}
        <Tooltip content={errorReason || '发生错误'}>
          <IconInfoCircle
            style={{
              color: '#86909c',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          />
        </Tooltip>
        <Button
          type="text"
          size="small"
          style={{
            color: '#165dff',
            padding: '0 4px',
            fontSize: '14px',
            height: 'auto'
          }}
        >
          <span style={{ color: '#007DFA' }} onClick={handleVersionRebuild}>
            重试
          </span>
        </Button>
      </div>
    );
  }

  if (status === 'version_updating') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {statusElement}
        {/* <Tooltip content={errorReason || '发生错误'}> */}
        <IconRefresh
          style={{
            color: '#007DFA',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        />
        {/* </Tooltip> */}
        <Button
          type="text"
          size="small"
          style={{
            color: '#165dff',
            padding: '0 0px',
            fontSize: '14px',
            height: 'auto'
          }}
        >
          <span style={{ color: '#007DFA' }} onClick={handlerefresh}>
            刷新
          </span>
        </Button>
      </div>
    );
  }

  return statusWithTooltip;
};

const DatasetDetail: React.FC = () => {
  const [datasetDetail, setDatasetDetail] =
    React.useState<DatasetDetail | null>(null); //数据集详情
  const [editModalVisible, setEditModalVisible] = React.useState(false); //编辑弹窗是否显示
  const [activeTab, setActiveTab] = React.useState('content'); //当前选中的tab
  const [contentData, setContentData] = React.useState<any[]>([]); //内容数据
  const [contentDatabackup, setContentDatabackup] = React.useState<any[]>([]); //内容数据备份

  const [searchValue, setSearchValue] = React.useState(''); //搜索框输入值
  const [actualSearchValue, setActualSearchValue] = React.useState(''); // 实际用于搜索的值
  const [currentPage, setCurrentPage] = React.useState(1); //当前页码
  const [pageSize, setPageSize] = React.useState(10); //每页条数
  const [total, setTotal] = React.useState(0); //总条数
  const [contentColumns, setContentColumns] = React.useState<any[]>([]); //列信息
  const [contentColumnslist, setContentColumnslist] = React.useState<any[]>([]); //列数据
  const [idName, setIdName] = React.useState<string>(''); //唯一标识符字段名
  const { id } = useParams<{ id: string }>(); //数据集id
  const history = useHistory();

  // 编辑数据
  const [updateStatus, setUpdateStatus] = React.useState<boolean>(false); //更新状态
  const [editingRowKey, setEditingRowKey] = React.useState<string | null>(null); //当前编辑行
  const [editingData, setEditingData] = React.useState<any>({}); //当前编辑数据
  const [changedRows, setChangedRows] = React.useState<string[]>([]); // 记录修改过的数据
  const [deletedRows, setDeletedRows] = React.useState<string[]>([]); // 记录删除的数据

  //历史数据
  const [versionHistory, setVersionHistory] = React.useState<any[]>([]);
  const rightDescriptionsRef = React.useRef<HTMLDivElement>(null);
  const [divWidth, setDivWidth] = React.useState<number>(0);

  const [isModalVisible, setIsModalVisible] = React.useState(false); // 防止重复弹窗
  const locatio = useLocation();

  React.useEffect(() => {
    //@ts-expect-error
    const unblock = history.block((location) => {
      // 条件：正在编辑且要跳转的路由不同
      if (updateStatus && !isModalVisible) {
        setIsModalVisible(true); // 标记弹窗已显示

        // 调用 Arco Modal.confirm 静态方法
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
              确定退出编辑？
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
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            setUpdateStatus(false);
            setIsModalVisible(false);
            history.push(location.pathname); // 确认后执行跳转
          },
          onCancel: () => {
            setIsModalVisible(false); // 取消后重置状态
          },
          //@ts-expect-error
          onClose: () => {
            setIsModalVisible(false); // 弹窗关闭时重置状态
          }
        });
        return false; // 先阻止默认跳转
      }
      return true; // 允许跳转y
    });

    const handleBeforeUnload = (e) => {
      if (updateStatus) {
        // 状态为 true 时，阻止默认行为并显示确认对话框
        e.preventDefault();
        e.returnValue = ''; // Chrome 需要设置 returnValue
        return '确认要离开吗？未保存的更改可能会丢失。';
      }
      // 状态为 false 时，不返回任何值，允许直接刷新
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unblock();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history, updateStatus, isModalVisible]);

  React.useEffect(() => {
    // 初始获取元素宽度
    const updateWidth = () => {
      if (rightDescriptionsRef.current) {
        console.log(rightDescriptionsRef.current.offsetWidth);
        setDivWidth(rightDescriptionsRef.current.offsetWidth - 100);
      }
    };

    // 初始调用一次
    updateWidth();

    // 监听窗口变化
    window.addEventListener('resize', updateWidth);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // 返回按钮
  const handleBack = () => {
    window.history.back();
  };

  // 跳转到数据集管理页面
  const handleGoToDatasetList = () => {
    history.push('/tenant/compute/modaforge/datasetManagement');
  };

  // 打开编辑弹窗
  const handleEdit = () => {
    if (updateStatus && !isModalVisible) {
      setIsModalVisible(true); // 标记弹窗已显示

      // 调用 Arco Modal.confirm 静态方法
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
            确定退出编辑？
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
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          setUpdateStatus(false);
          setIsModalVisible(false);
          setEditModalVisible(true);
        },
        onCancel: () => {
          setIsModalVisible(false); // 取消后重置状态
        },
        //@ts-expect-error
        onClose: () => {
          setIsModalVisible(false); // 弹窗关闭时重置状态
        }
      });
      return false; // 先阻止默认跳转
    }
    setEditModalVisible(true);
  };

  // 关闭编辑弹窗
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
  };

  // 处理编辑提交
  const handleEditSubmit = (formData: any) => {
    if (!datasetDetail) return;

    // 只传递需要的字段
    const updateData = {
      id: datasetDetail.id.toString(),
      name: formData.name,
      description: formData.description,
      tag_names: formData.tags
    };

    updateDataset(updateData)
      .then((res) => {
        if (!res.code) {
          Message.success('数据集更新成功');
          setEditModalVisible(false);
          // 刷新数据
          getDatasetDetailPage({ id: datasetDetail.id.toString() }).then(
            (detailRes) => {
              if (!detailRes.code) {
                setDatasetDetail(detailRes.data);
              }
            }
          );
        } else {
          Message.error(res.msg || '数据集更新失败');
        }
      })
      .catch((err) => {
        Message.error('数据集更新失败');
      });
  };

  // 编辑内容
  const handleEditContent = (record: any) => {
    if (!updateStatus) return; // 非编辑状态下不允许编辑

    // 如果当前已经在编辑状态，且点击的不是同一行，则不处理（按钮已禁用）
    if (editingRowKey !== null && editingRowKey !== record) {
      return;
    }

    // 直接进入编辑模式
    startEditRow(record);
  };

  // 开始编辑指定行
  const startEditRow = (recordId: any) => {
    setEditingRowKey(recordId);
    // 初始化编辑数据
    const currentRow = contentData.find(
      (item: any) => item[idName] === recordId
    );
    if (currentRow) {
      setEditingData({ ...currentRow });
    }

    // Message.info(`编辑数据`);
  };

  // 删除 - 使用 useCallback 避免闭包问题
  const handleContinue = React.useCallback(
    (recordId: string) => {
      if (!updateStatus) return; // 非编辑状态下不允许删除

      // 如果有行正在编辑中，不允许删除
      if (editingRowKey !== null) {
        Message.warning('请先完成当前编辑');
        return;
      }

      // 使用函数式更新避免闭包问题
      setContentData((currentData) => {
        const newContentData = currentData.filter(
          (item) => item[idName] !== recordId
        );
        return newContentData;
      });

      setDeletedRows((prev) => [...prev, recordId]);
      Message.success(`数据已删除`);
    },
    [updateStatus, editingRowKey, idName]
  );

  // 处理编辑数据变化
  const handleEditDataChange = (field: string, value: any) => {
    if (!updateStatus) return; // 非编辑状态下不允许修改数据

    setEditingData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 确认保存内联编辑
  const handleInlineEditSubmit = (record: any) => {
    if (!updateStatus) return; // 非编辑状态下不允许提交编辑
    // 更新数据

    const originalData = contentDatabackup.find(
      (item: any) => item[idName] === editingRowKey
    );

    // 检查数据是否有变化
    if (originalData && isDataEqual(editingData, originalData)) {
      // 数据没有变化，直接退出编辑状态
      setEditingRowKey(null);
      setEditingData({});
      //       Message.info('数据未修改');
      return;
    }

    const newData = contentData.map((item: any) => {
      if (item[idName] === editingRowKey) {
        return {
          ...editingData // 直接使用编辑的数据替换整个记录
        };
      }
      return item;
    });
    setContentData(newData);

    // 记录修改的数据
    const currentRecordId = editingRowKey!.toString();

    if (!changedRows.includes(currentRecordId)) {
      const newChangedRows = [...changedRows, currentRecordId];
      setChangedRows(newChangedRows);
    }

    // 重置编辑状态
    setEditingRowKey(null);
    setEditingData({});

    Message.success('编辑成功');
  };

  // 取消内联编辑
  const handleInlineEditCancel = () => {
    if (!updateStatus) return; // 非编辑状态下不允许取消编辑

    setEditingRowKey(null);
    setEditingData({});
    Message.info('已取消编辑');
  };

  // 比较两个数据对象是否相同（排除 idName 字段）
  const isDataEqual = (
    updateData: Record<string, unknown>,
    backupData: Record<string, unknown>
  ) => {
    if (!updateData || !backupData) return false;

    // 获取需要比较的字段（排除 idName）
    const fieldsToCompare = Object.keys(updateData).filter(
      (key) => key !== idName
    );

    return fieldsToCompare.every((field) => {
      return updateData[field] === backupData[field];
    });
  };

  // 提交数据修改
  const handleSubmitChanges = () => {
    if (!datasetDetail) return;

    // 构造提交数据
    const submitData: any[] = [];

    // 处理修改的数据
    changedRows.forEach((recordId) => {
      const modifiedRow = contentData.find((item) => {
        return item[idName] === Number(recordId);
      });
      if (modifiedRow) {
        // 找到对应的备份数据
        const backupRow = contentDatabackup.find((item) => {
          return item[idName] == recordId;
        });
        // 如果找到备份数据，比较是否有实际变化
        if (backupRow) {
          if (!isDataEqual(modifiedRow, backupRow)) {
            // 数据有变化，添加到提交列表
            submitData.push({
              change_type: 1, // 修改
              new_data: modifiedRow // 直接提交整行数据
            });
          }
          // 如果数据相同，跳过提交
        } else {
          // 没有找到备份数据，说明是新数据，直接提交
          submitData.push({
            change_type: 1, // 修改
            new_data: modifiedRow
          });
        }
      }
    });

    // 处理删除的数据
    deletedRows.forEach((recordId) => {
      const deletedRow = contentDatabackup.find(
        (item) => item[idName] === recordId
      );
      if (deletedRow) {
        submitData.push({
          change_type: 2, // 删除
          new_data: deletedRow // 提交原始数据用于删除
        });
      }
    });

    const params = {
      id: datasetDetail.id,
      version_id: datasetDetail.latest_version,
      datas: convertKeyType(submitData, 'id', 'number')
    };
    if (params.datas.length === 0) {
      Message.warning('没有需要修改的数据');
      return;
    }
    editDatasetVersion(params)
      .then((res) => {
        if (res.status === 200) {
          Message.success('数据修改成功');
          // 清空修改记录
          setChangedRows([]);
          setDeletedRows([]);
          setEditingRowKey(null);
          setEditingData({});
          setUpdateStatus(false); // 退出编辑状态
          // 重新加载数据 - 刷新内容数据
          fetchDatasetContents();
          fetchDatasetDetail();
        } else {
          Message.error(res.msg || '数据修改失败');
        }
      })
      .catch((err) => {
        Message.error('编辑失败，请稍后重试');
      });
  };

  React.useEffect(() => {
    fetchDatasetDetail(); //根据id获取数据集详情
  }, [id]);

  const fetchDatasetDetail = () => {
    if (id) {
      getDatasetDetailPage({ id: id })
        .then((res) => {
          setDatasetDetail(res.data);
        })
        .catch((err) => {
          console.error('获取数据集详情失败:', err);
          Message.error('加载数据集详情失败');
        });

      getDatasetVersionList({ id: id }).then((res) => {
        setVersionHistory(res.data);
      });
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (currentPage == 1) {
      setActualSearchValue(searchValue);
    } else {
      setCurrentPage(1);
    }
  };

  // 处理清空搜索，李帆标记，
  const handleClearSearch = () => {
    setSearchValue('');
    setActualSearchValue('');
    setCurrentPage(1);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    // 改变每页条数时重置到第一页
    setCurrentPage(1);
  };

  const handlerefresh = () => {
    getDatasetDetailPage({ id: id })
      .then((res) => {
        setDatasetDetail(res.data);
        Message.success('刷新成功');
      })
      .catch((err) => {
        Message.success('刷新失败');
      });
  };
  // 封装获取数据集内容的通用方法
  const fetchDatasetContents = () => {
    if (!datasetDetail || !id) return Promise.resolve();

    const params: any = {
      id: id,
      page: currentPage,
      limit: pageSize,
      keyword: actualSearchValue || undefined,
      version_id: datasetDetail.latest_version
    };

    return getDatasetContents(params)
      .then((res) => {
        if (res.data) {
          setContentData(res.data.list || []);
          setContentColumnslist(res.data.field_names || []);
          setIdName(res.data.id_name || '');
          setTotal(res.data.total || 0);
          setContentDatabackup(res.data.list || []);
        }
      })
      .catch((err) => {
        console.error('获取数据集内容失败:', err);
        Message.error('加载数据失败');
      });
  };

  // 更新表格列配置 - 只在编辑状态变化时执行
  React.useEffect(() => {
    if (contentColumnslist.length > 0 && idName) {
      setContentColumns(
        generateArcoColumns(
          contentColumnslist,
          handleEditContent,
          handleContinue,
          editingRowKey,
          editingData,
          handleEditDataChange,
          handleInlineEditSubmit,
          handleInlineEditCancel,
          idName,
          updateStatus
        )
      );
    }
  }, [contentColumnslist, editingRowKey, editingData, idName, updateStatus]);

  // 初始化数据 - 只在组件挂载和搜索/分页时执行
  React.useEffect(() => {
    // 如果处于编辑状态，不要重新获取数据（避免覆盖本地修改）
    if (updateStatus) {
      return;
    }

    // 查询数据集数据内容
    fetchDatasetContents();
    // 测试数据
    // setContentData(convertKeyType(cscontentData, csidName, 'string'));
    // setContentColumnslist(cscontentColumnslist);
    // setIdName(csidName);
    // setTotal(cstotal);
    // setContentDatabackup(convertKeyType(cscontentData, csidName, 'string'));
  }, [
    actualSearchValue,
    currentPage,
    pageSize,
    datasetDetail,
    id,
    updateStatus
  ]);

  const handleVersionRebuild = () => {
    if (!datasetDetail) return;
    datasetVersionRebuild({
      id: Number(id),
      version_id: datasetDetail.latest_version
    })
      .then((res) => {
        if (res?.status === 200) {
          Message.success('版本重新生成成功');
        } else {
          Message.success(res?.message ?? '版本重新生成失败');
        }
      })
      .catch((err) => {
        console.error('版本重新生成失败:', err);
        Message.error('版本重新生成失败');
      });
  };
  const getwidth = () => {
    if (window.innerWidth) {
      return `${(window.innerWidth - 400) / 2}px`;
    }
    // return `${(window.innerWidth - 400)/2}px`
  };
  return (
    <div className="dataset-detail">
      {/* 面包屑导航区域 */}
      <div className="breadcrumb-wrapper">
        <IconArrowLeft
          style={{ cursor: 'pointer', fontSize: '14px' }}
          onClick={() => {
            handleBack();
          }}
        />
        <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
          <Breadcrumb.Item>
            <span
              style={{ fontWeight: '500', fontSize: '20px' }}
              onClick={handleGoToDatasetList}
            >
              数据集管理
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>数据集详情</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* 数据集详情面板 */}
      <Card className="basic-info-card" bordered={false}>
        {/* 基本信息区域 */}
        {datasetDetail && (
          <>
            {/* 标题区域 */}
            <div className="basic-info-header">
              <Title heading={4}>基本信息</Title>
              <Tooltip
                content={
                  !datasetDetail || datasetDetail.status !== 'normal'
                    ? '当前状态下不能进行编辑'
                    : ''
                }
              >
                <Button
                  // type="primary"
                  disabled={!datasetDetail || datasetDetail.status !== 'normal'}
                  onClick={handleEdit}
                  type="text"
                  icon={<IconEdit />}
                  className="edit-btn"
                >
                  编辑
                </Button>
              </Tooltip>
            </div>

            {/* 内容区域 */}
            <div className="basic-info-content" style={{ marginBottom: 24 }}>
              <div>
                <Descriptions
                  data={[
                    {
                      label: '名称:',
                      value: (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {datasetDetail.name.length > 14 ? (
                            <Tooltip content={datasetDetail.name}>
                              <span>{`${datasetDetail.name.substring(0, 14)}...`}</span>
                            </Tooltip>
                          ) : (
                            <span>{datasetDetail.name}</span>
                          )}
                          {renderStatusTag(
                            datasetDetail.status,
                            datasetDetail.error_reason,
                            handleVersionRebuild,
                            handlerefresh
                          )}
                        </div>
                      )
                    },
                    {
                      label: '标签:',
                      value: datasetDetail.tag_names?.length ? (
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {datasetDetail.tag_names
                            .slice(0, 2)
                            .map((tag, index) => (
                              <Tag
                                key={index}
                                style={{
                                  background: '#E2E8F0',
                                  color: '#0F172A',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  height: '18px',
                                  alignItems: 'center',
                                  padding: '0 4px',
                                  gap: '4px'
                                }}
                              >
                                {tag}
                              </Tag>
                            ))}
                          {datasetDetail.tag_names.length > 2 && (
                            <Tooltip
                              content={
                                <div style={{ maxWidth: '300px' }}>
                                  {datasetDetail.tag_names
                                    .slice(2)
                                    .map((tag, index) => (
                                      <Tag
                                        key={index}
                                        style={{
                                          background: '#E2E8F0',
                                          color: '#0F172A',
                                          borderRadius: '16px',
                                          fontSize: '12px',
                                          height: '18px',
                                          alignItems: 'center',
                                          margin: '2px'
                                        }}
                                      >
                                        {tag}
                                      </Tag>
                                    ))}
                                </div>
                              }
                            >
                              <Tag
                                style={{
                                  background: '#E2E8F0',
                                  color: '#0F172A',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  height: '18px',
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                +{datasetDetail.tag_names.length - 2}
                              </Tag>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        '-'
                      )
                    },
                    {
                      label: '创建人:',
                      value: datasetDetail.creator_name || '-'
                    },
                    {
                      label: '生成模型:',
                      value: datasetDetail.src_model || '-'
                    }
                  ]}
                  column={1}
                  labelStyle={{
                    width: 80,
                    fontWeight: 'normal',
                    color: '#1E293B'
                  }}
                  valueStyle={{
                    color: '#333333',
                    fontWeight: 'normal'
                  }}
                />
              </div>

              <div ref={rightDescriptionsRef}>
                <Descriptions
                  data={[
                    {
                      label: '当前版本:',
                      value: (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>{datasetDetail.latest_version}</span>
                          <span className="version-tag">最新版本</span>
                        </span>
                      )
                    },
                    {
                      label: '创建时间:',
                      value: formatDate(datasetDetail.created_at) || '-'
                    },
                    {
                      label: '更新时间:',
                      value: formatDate(datasetDetail.updated_at) || '-'
                    },
                    {
                      label: '描述说明:',
                      value: (
                        <div
                          style={{
                            gap: '8px',
                            width: getwidth()
                          }}
                        >
                          <EllipsisPopover
                            preferTypography
                            value={datasetDetail.description || '-'}
                            isEdit={false}
                            className="dataset-detail-description"
                          ></EllipsisPopover>
                        </div>
                      )
                    }
                  ]}
                  column={1}
                  labelStyle={{
                    width: 80,
                    fontWeight: 'normal',
                    color: '#1E293B'
                  }}
                  valueStyle={{
                    color: '#333333',
                    fontWeight: 'normal'
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* 数据管理标签页 */}
        <Tabs
          className="custom-tabs"
          activeTab={activeTab}
          onChange={(e) => {
            if (updateStatus && !isModalVisible) {
              setIsModalVisible(true); // 标记弹窗已显示

              // 调用 Arco Modal.confirm 静态方法
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
                    确定退出编辑？
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
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                  setUpdateStatus(false);
                  setIsModalVisible(false);
                  setActiveTab(e);
                },
                onCancel: () => {
                  setIsModalVisible(false); // 取消后重置状态
                },
                //@ts-expect-error
                onClose: () => {
                  setIsModalVisible(false); // 弹窗关闭时重置状态
                }
              });
              return false; // 先阻止默认跳转
            }

            setActiveTab(e);
            // setCurrentPage(1);
          }}
        >
          <TabPane key="content" title="数据内容">
            {/* 搜索系统 */}
            <div
              className="search-section"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
                // marginBottom: 12
              }}
            >
              <Input
                placeholder="输入ID、关键字搜索"
                value={searchValue}
                onChange={setSearchValue}
                onPressEnter={handleSearch}
                onClear={handleClearSearch}
                className={'custom-input'}
                disabled={editingRowKey !== null}
                style={{
                  width: 300,
                  minWidth: 300,
                  maxWidth: 300,
                  flexShrink: 0
                }}
                allowClear
                suffix={<IconSearch style={{ color: '#999' }} />}
              />
              {contentData.length !== 0 && contentColumns.length !== 0 ? (
                <>
                  {updateStatus ? (
                    <Space>
                      <Button
                        style={{
                          fontWeight: '400'
                        }}
                        className={styles.customButton}
                        onClick={() => {
                          // 检查是否有改动
                          const hasChanges =
                            changedRows.length > 0 || deletedRows.length > 0;
                          console.log(changedRows, deletedRows);
                          if (!hasChanges) {
                            // 没有改动，直接取消编辑
                            setEditingRowKey(null);
                            setEditingData({});
                            setChangedRows([]);
                            setDeletedRows([]);
                            setContentData(contentDatabackup);
                            setUpdateStatus(false);
                          } else {
                            // 有改动，弹窗确认
                            Modal.confirm({
                              title: '确定放弃编辑?',
                              content: (
                                <div
                                  style={{
                                    fontSize: '14px',
                                    paddingLeft: '28px'
                                    // lineHeight: '1.5'
                                  }}
                                >
                                  放弃后，当前修改不会保存
                                </div>
                              ),
                              okText: '确定',
                              cancelText: '取消',
                              onOk: () => {
                                // 用户确认放弃编辑
                                setEditingRowKey(null);
                                setEditingData({});
                                setChangedRows([]);
                                setDeletedRows([]);
                                setContentData(contentDatabackup);
                                setUpdateStatus(false);
                              },
                              onCancel: () => {
                                // 用户取消，不做任何操作
                              }
                            });
                          }
                        }}
                      >
                        取消本轮编辑
                      </Button>
                      <Tooltip content={editingRowKey ? '请完成当前编辑' : ''}>
                        <Button
                          style={{ fontWeight: '400' }}
                          className={'update-btn'}
                          type="primary"
                          onClick={handleSubmitChanges}
                          disabled={
                            editingRowKey !== null ||
                            (changedRows.length === 0 &&
                              deletedRows.length === 0)
                          }
                        >
                          保存本轮编辑
                        </Button>
                      </Tooltip>
                    </Space>
                  ) : (
                    <Tooltip
                      content={
                        !datasetDetail || datasetDetail.status !== 'normal'
                          ? '当前状态下不能进行编辑'
                          : ''
                      }
                    >
                      <Button
                        // type="primary"
                        disabled={
                          !datasetDetail || datasetDetail.status !== 'normal'
                        }
                        onClick={() => setUpdateStatus(true)}
                        type="text"
                        icon={<IconEdit />}
                        className="edit-btn"
                      >
                        编辑
                      </Button>
                    </Tooltip>
                  )}
                </>
              ) : null}
            </div>
            {contentData.length !== 0 && contentColumns.length !== 0 ? (
              <>
                {/* 内容数据表格 */}
                {activeTab === 'content' ? (
                  <>
                    <Table
                      columns={contentColumns}
                      data={contentData}
                      noDataElement={noDataElement({ description: '暂无数据' })}
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                      border={false}
                    />
                  </>
                ) : null}

                {/* 分页控件 */}
                <div className="pagination-wrapper">
                  <Pagination
                    disabled={editingRowKey !== null}
                    style={{
                      float: 'right'
                    }}
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={(page) => {
                      setCurrentPage(page);
                    }}
                    onPageSizeChange={handlePageSizeChange}
                    showTotal={(total, range) =>
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`
                    }
                    sizeOptions={[10, 20, 50, 100]}
                    showJumper
                    sizeCanChange={true}
                  />
                </div>
              </>
            ) : (
              noDataElement({ description: '暂无数据' })
            )}
          </TabPane>

          <TabPane key="version" title="版本历史">
            {activeTab === 'version' ? (
              <Table
                columns={versionColumns}
                data={versionHistory}
                pagination={false}
                noDataElement={noDataElement({ description: '暂无数据' })}
                // scroll={{ x: 'max-content' }}
                border={false}
              />
            ) : (
              ''
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑基本信息"
        visible={editModalVisible}
        onCancel={handleCloseEditModal}
        footer={null}
        style={{ width: 640 }}
        autoFocus={false}
        focusLock={true}
      >
        {datasetDetail && (
          <EditDatasetForm
            initialData={{
              key: datasetDetail.id.toString(),
              name: datasetDetail.name,
              description: datasetDetail.description || '',
              version: datasetDetail.latest_version || 'v1.0.0',
              tags: datasetDetail.tag_names || [],
              model: datasetDetail.src_model || '-',
              creator: datasetDetail.creator_name || ''
            }}
            onSubmit={handleEditSubmit}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>
      {/* <Prompt
        when={updateStatus}
        message={(location) => {
          console.log('尝试跳转到:', location.pathname);
          return '表单尚未保存，确定要离开吗？';
        }}
      /> */}
    </div>
  );
};

export default DatasetDetail;
