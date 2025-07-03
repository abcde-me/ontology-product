import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  Tooltip
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
  IconClose
} from '@arco-design/web-react/icon';
import { Breadcrumb } from '@arco-design/web-react';
import {
  getDatasetDetail,
  updateDataset,
  getDatasetContents,
  getDatasetDetailPage,
  editDatasetVersion,
  type DataChangeItem,
  getDatasetVersionList
} from '@/api/datasetManagement';
import EditDatasetForm from '@/components/datasetform/EditDatasetForm';
import './style.css';
import { render } from '@headlessui/react/dist/utils/render';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 测试数据 - 按照API接口字段顺序排列
const csdatasetDetail = {
  id: 0,
  name: '西游三打白骨精',
  tag_names: ['小说情节'],
  description: 'liuxiaoyu-test',
  latest_version: 'v1.10',
  src: 0,
  src_model: 'GPT-4o',
  creator_id: 'user_001',
  creator_name: '张三',
  created_at: '2025-05-05 05:05:05',
  updated_at: '2025-05-05 05:05:05'
};
interface DatasetDetail {
  id: number;
  name: string;
  tag_names: string[];
  description: string;
  latest_version: string;
  src: number;
  src_model: string;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // 可选字段，因为API响应中可能没有这个字段
}

// 内容数据测试数据
const cscontentData = [
  {
    line: 0,
    data: {
      姓名: '张11111111111111111111三张11111111111111111111三张11111111111111111111三张11111111111111111111三',
      年龄: 28,
      性别: '男'
    }
  },
  { line: 1, data: { 姓名: '李四', 年龄: 34, 性别: '女' } },
  { line: 2, data: { 姓名: '王五', 年龄: 22, 性别: '男' } }
];

// 内容数据表格列定义
const cscontentColumns = ['姓名', '年龄', '性别'];

//headers:表头
//handleEditContent:编辑内容
//handleContinue:删除
//editingRowKey:当前编辑行
//editingData:当前编辑数据
//onDataChange:处理编辑数据变化

const generateArcoColumns = (
  headers,
  handleEditContent,
  handleContinue,
  editingRowKey,
  editingData,
  onDataChange,
  handleInlineEditSubmit,
  handleInlineEditCancel
) => {
  const cols = headers.map((header) => ({
    title: header,
    dataIndex: ['data', header],
    key: header,
    minWidth: 150,
    maxWidth: 300,
    render: (value: any, record: any) => {
      if (editingRowKey === record.line) {
        return (
          <Input.TextArea
            value={
              editingData[header] !== undefined
                ? editingData[header]
                : record.data[header]
            }
            onChange={(value) => onDataChange(header, value)}
            style={{ margin: '-5px 0' }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="请输入内容"
          />
        );
      }
      return <div>{record.data[header]}</div>;
    }
  }));

  // 在最后追加一列 "操作"
  cols.push({
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'right',
    render: (_, record) => {
      if (editingRowKey === record.line) {
        // 编辑模式：显示确认和取消按钮
        return (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<IconCheck style={{ color: '#00b42a' }} />}
              onClick={() => handleInlineEditSubmit(record)}
              style={{ color: '#00b42a' }}
              title="确认"
            />
            <Button
              type="text"
              size="small"
              icon={<IconClose style={{ color: '#f53f3f' }} />}
              onClick={handleInlineEditCancel}
              style={{ color: '#f53f3f' }}
              title="取消"
            />
          </Space>
        );
      }

      // 正常模式：显示编辑和删除按钮
      return (
        <Space>
          <Button
            type="text"
            size="small"
            onClick={() => handleEditContent(record.line)}
          >
            编辑
          </Button>
          <Button
            type="text"
            status="danger"
            size="small"
            onClick={() => handleContinue(record.line)}
          >
            删除
          </Button>
        </Space>
      );
    }
  });

  return cols;
};

// 版本历史测试数据
const csversionHistory = [
  {
    version: 'v1.10',
    date: '2025-06-23',
    description: '当前版本',
    status: 'current',
    changes: 15
  },
  {
    version: 'v1.09',
    date: '2025-06-20',
    description: '重新版本',
    status: 'archived',
    changes: 8
  },
  {
    version: 'v1.08',
    date: '2025-06-18',
    description: '优化内容',
    status: 'archived',
    changes: 12
  },
  {
    version: 'v1.07',
    date: '2025-06-15',
    description: '修复问题',
    status: 'archived',
    changes: 5
  }
];

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
const versionColumns = [
  {
    title: '版本号',
    dataIndex: 'version_id',
    render: (version: string) => (
      <Space>
        <Text>{version}</Text>
      </Space>
    )
  },
  {
    title: '修改类型',
    dataIndex: 'type',
    filters: [
      { text: '导入', value: 1 },
      { text: '修改', value: 2 },
      { text: '删除', value: 3 }
    ],
    onFilter: (value: number, record: any) => record.type === value,
    render: (type: number) => {
      const typeMap = {
        1: '导入',
        2: '修改',
        3: '删除'
      };
      return typeMap[type] || '-';
    }
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    render: (time: string) => formatDate(time)
  },
  {
    title: '更变记录',
    dataIndex: 'description'
  }
];

const DatasetDetail: React.FC = () => {
  const [datasetDetail, setDatasetDetail] =
    React.useState<DatasetDetail | null>(null);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('content');
  const [contentData, setContentData] = React.useState<any[]>([]); //内容数据

  const [contentDatabackup, setContentDatabackup] = React.useState<any[]>([]); //内容数据备份
  const [searchValue, setSearchValue] = React.useState(''); //搜索框输入值
  const [actualSearchValue, setActualSearchValue] = React.useState(''); // 实际用于搜索的值
  const [currentPage, setCurrentPage] = React.useState(1); //当前页码
  const [pageSize] = React.useState(10); //每页条数
  const [total, setTotal] = React.useState(0); //总条数
  const [contentColumns, setContentColumns] = React.useState<any[]>([]); //列信息
  const [contentColumnslist, setContentColumnslist] = React.useState<any[]>([]); //列数据
  const { id } = useParams<{ id: string }>(); //数据集id
  const history = useHistory();

  // 编辑数据
  const [editingRowKey, setEditingRowKey] = React.useState<string | null>(null); //当前编辑行
  const [editingData, setEditingData] = React.useState<any>({}); //当前编辑数据
  const [changedRows, setChangedRows] = React.useState<string[]>([]); // 记录修改过的行
  const [deletedRows, setDeletedRows] = React.useState<number[]>([]); // 记录删除的行号
  const [confirmModalVisible, setConfirmModalVisible] = React.useState(false); //确认弹窗
  const [pendingEditRow, setPendingEditRow] = React.useState<any>(null); // 待编辑的行（用于确认切换）

  //历史数据
  const [versionHistory, setVersionHistory] = React.useState<any[]>([]);

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
    setEditModalVisible(true);
  };

  // 关闭编辑弹窗
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
  };

  // 处理编辑提交
  const handleEditSubmit = (formData: any) => {
    console.log('编辑数据集:', formData);

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
        console.log(res);
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
    console.log('编辑内容:', record);

    // 如果当前已经在编辑状态，且点击的不是同一行
    if (editingRowKey !== null && editingRowKey !== record) {
      // 显示确认弹框
      setPendingEditRow(record); //待编辑的行
      setConfirmModalVisible(true); //确认弹框
      return;
    }

    // 直接进入编辑模式
    startEditRow(record);
  };

  // 开始编辑指定行
  const startEditRow = (record: any) => {
    setEditingRowKey(record);
    console.log(contentData);
    // 初始化编辑数据
    const currentRow = contentData.find((item: any) => item.line === record);
    if (currentRow) {
      setEditingData({ ...currentRow.data });
    }

    Message.info(`编辑第${record}条内容`);
  };

  // 确认放弃当前编辑并切换到新行
  const handleConfirmSwitchEdit = () => {
    if (pendingEditRow !== null) {
      // 重置当前编辑状态
      setEditingRowKey(null);
      setEditingData({});

      // 开始编辑新行
      startEditRow(pendingEditRow);
    }

    // 关闭弹框
    setConfirmModalVisible(false);
    setPendingEditRow(null);
  };

  // 取消切换编辑
  const handleCancelSwitchEdit = () => {
    setConfirmModalVisible(false);
    setPendingEditRow(null);
  };

  // 删除
  const handleContinue = (lineNumber: number) => {
    Modal.confirm({
      title: '确认删除文件吗？',
      content: '删除后，文件不可恢复',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: {
        type: 'primary',
        style: { backgroundColor: '#1677ff', borderColor: '#1677ff' }
      },
      cancelButtonProps: {
        type: 'outline',
        style: { color: '#1677ff', borderColor: '#1677ff' }
      },
      style: {
        textAlign: 'right'
      },
      onOk: () => {
        const newContentData = contentData.filter(
          (item) => item.line !== lineNumber
        );
        setContentData(newContentData);

        // 将删除的行号添加到数组中
        setDeletedRows((prev) => [...prev, lineNumber]);

        Message.success(`第 ${lineNumber} 行已删除`);
        console.log('已删除的行:', [...deletedRows, lineNumber]);
      }
    });
  };

  // 处理编辑数据变化
  const handleEditDataChange = (field: string, value: any) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 确认保存内联编辑
  const handleInlineEditSubmit = (record: any) => {
    // console.log(contentData)
    // 更新数据
    const newData = contentData.map((item: any) => {
      if (item.line === editingRowKey) {
        return {
          ...item,
          data: {
            ...item.data, // 保留原有的所有字段
            ...editingData // 用编辑的数据覆盖修改的字段
          }
        };
      }
      return item;
    });
    setContentData(newData);

    // 记录修改的行
    if (!changedRows.includes(editingRowKey!.toString())) {
      setChangedRows([...changedRows, editingRowKey!.toString()]);
    }

    // 重置编辑状态
    setEditingRowKey(null);
    setEditingData({});

    Message.success('数据修改成功');
    console.log('已修改的行:', [...changedRows, editingRowKey]);
  };

  // 取消内联编辑
  const handleInlineEditCancel = () => {
    setEditingRowKey(null);
    setEditingData({});
    Message.info('已取消编辑');
  };

  // 提交数据修改
  const handleSubmitChanges = () => {
    if (!datasetDetail) return;
    // 构造提交数据
    const submitData: DataChangeItem[] = [];

    // 处理修改的行
    changedRows.forEach((lineStr) => {
      const line = parseInt(lineStr);
      const modifiedRow = contentData.find((item) => item.line === line);
      if (modifiedRow) {
        submitData.push({
          line: line,
          change_type: 1, // 修改
          new_data: modifiedRow.data
        });
      }
    });

    // 处理删除的行
    deletedRows.forEach((line) => {
      submitData.push({
        line: line,
        change_type: 2, // 删除
        new_data: {}
      });
    });

    const params = {
      id: datasetDetail.id.toString(),
      version_id: datasetDetail.latest_version,
      datas: submitData
    };

    console.log('提交数据修改:', params);

    editDatasetVersion(params)
      .then((res) => {
        Message.success('数据修改成功');
        // 清空修改记录
        setChangedRows([]);
        setDeletedRows([]);
        setEditingRowKey(null);
        setEditingData({});
        // 重新加载数据 - 刷新内容数据
        const refreshParams = {
          id: id,
          page: currentPage,
          page_size: pageSize,
          search: actualSearchValue
        };
        getDatasetContents(refreshParams)
          .then((res) => {
            if (res.data && res.data.list && res.data.list.length > 0) {
              setContentData(res.data.list || []);
              setContentColumnslist(res.data.field_names || []);
              setTotal(res.data.total || 0);
              setContentDatabackup(res.data.list || []);
            }
          })
          .catch((err) => {
            console.error('刷新数据失败:', err);
          });
      })
      .catch((err) => {
        console.error('数据修改失败:', err);
        Message.error('数据修改失败');
      });
  };

  React.useEffect(() => {
    if (id) {
      getDatasetDetailPage({ id: id })
        .then((res) => {
          console.log(res);
          setDatasetDetail(res.data);
        })
        .catch((err) => {
          console.error('获取数据集详情失败:', err);
          Message.error('加载数据集详情失败');
        });

      getDatasetVersionList({ id: id }).then((res) => {
        console.log('历史数据', res);
        setVersionHistory(res.data);
      });
      // 测试数据
      // setVersionHistory(csversionHistory);
    }
  }, [id]);

  // 处理搜索
  const handleSearch = () => {
    setActualSearchValue(searchValue);
    // 搜索时重置到第一页
    setCurrentPage(1);
  };

  // 处理清空搜索，李帆标记，暂时不用后面要用
  const handleClearSearch = () => {
    setSearchValue('');
    setActualSearchValue('');
    setCurrentPage(1);
  };

  // 更新表格列配置 - 只在编辑状态变化时执行
  React.useEffect(() => {
    if (contentColumnslist.length > 0) {
      setContentColumns(
        generateArcoColumns(
          contentColumnslist,
          handleEditContent,
          handleContinue,
          editingRowKey,
          editingData,
          handleEditDataChange,
          handleInlineEditSubmit,
          handleInlineEditCancel
        )
      );
    }
  }, [contentColumnslist, editingRowKey, editingData]);

  // 初始化数据 - 只在组件挂载和搜索/分页时执行
  React.useEffect(() => {
    // 查询数据集数据内容
    if (datasetDetail && id) {
      const params = {
        version_id: datasetDetail.latest_version,
        id: id,
        page: currentPage,
        page_size: pageSize,
        search: actualSearchValue || undefined
      };

      getDatasetContents(params)
        .then((res) => {
          console.log('获取数据集内容响应:', res.data);
          if (res.data) {
            setContentData(res.data.list || []);
            setContentColumnslist(res.data.field_names || []);
            setTotal(res.data.total || 0);
            setContentDatabackup(res.data.list || []);
          }
        })
        .catch((err) => {
          console.error('获取数据集内容失败:', err);
          Message.error('加载数据失败');
        });
    }
  }, [actualSearchValue, currentPage, pageSize, datasetDetail, id]);

  return (
    <div className="dataset-detail">
      {/* 面包屑导航区域 */}
      <div className="breadcrumb-wrapper">
        <Button
          type="text"
          icon={<IconArrowLeft style={{ color: '#000' }} />}
          onClick={handleBack}
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

      {/* 数据集详情面板 */}
      <Card className="basic-info-card" bordered={false}>
        {/* 基本信息区域 */}
        {datasetDetail && (
          <>
            {/* 标题区域 */}
            <div className="basic-info-header">
              <Title heading={4}>基本信息</Title>
              <Button
                type="text"
                icon={<IconEdit />}
                onClick={handleEdit}
                className="edit-btn"
              >
                编辑
              </Button>
            </div>

            {/* 内容区域 */}
            <div className="basic-info-content" style={{ marginBottom: 24 }}>
              <div>
                <Descriptions
                  data={[
                    { label: '名称:', value: datasetDetail.name },
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
                          {datasetDetail.tag_names.map((tag, index) => (
                            <Tag
                              key={index}
                              style={{
                                background: '#E2E8F0',
                                color: '#0F172A',
                                // padding: '3px 8px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                // border: '1px solid #e5eaff',
                                height: '18px',
                                // display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )
                    },
                    { label: '创建人:', value: datasetDetail.creator_name },
                    { label: '生成模型:', value: datasetDetail.src_model }
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

              <div>
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
                      value: formatDate(datasetDetail.created_at)
                    },
                    {
                      label: '更新时间:',
                      value: formatDate(datasetDetail.updated_at)
                    },
                    {
                      label: '描述说明:',
                      value: datasetDetail.description || '-'
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
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane key="content" title="内容数据">
            {/* 搜索系统 */}
            <div
              className="search-section"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Input
                placeholder="输入ID、关键字搜索"
                value={searchValue}
                onChange={setSearchValue}
                onPressEnter={handleSearch}
                style={{ width: 300 }}
                allowClear
                suffix={<IconSearch style={{ color: '#999' }} />}
              />
              {/* 只有在有修改内容或正在编辑时才显示按钮 */}
              {(changedRows.length > 0 ||
                editingRowKey !== null ||
                deletedRows.length > 0) && (
                <Space>
                  <Button
                    onClick={() => {
                      Modal.confirm({
                        title: '确认取消',
                        content:
                          '确定要取消所有修改吗？此操作将清空所有修改和删除的内容，无法撤销。',
                        okText: '确认取消',
                        cancelText: '继续编辑',
                        onOk: () => {
                          // 清空所有修改和删除记录
                          setDeletedRows([]);
                          setChangedRows([]);
                          setEditingRowKey(null);
                          setEditingData({});

                          // 恢复原始数据
                          console.log(contentDatabackup);
                          setContentData(contentDatabackup);

                          Message.success('已取消所有修改并恢复数据');
                        }
                      });
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSubmitChanges}
                    disabled={
                      changedRows.length === 0 && deletedRows.length === 0
                    }
                  >
                    确定
                  </Button>
                </Space>
              )}
            </div>

            {/* 内容数据表格 */}
            {activeTab === 'content' ? (
              <>
                <Table
                  columns={contentColumns}
                  data={contentData}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                  border
                />
              </>
            ) : null}

            {/* 分页控件 */}
            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={(page) => {
                  console.log('页码变更:', page);
                  setCurrentPage(page);
                }}
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`
                }
                showJumper
                sizeCanChange={false}
              />
            </div>
          </TabPane>

          <TabPane key="version" title="版本历史">
            {activeTab === 'version' ? (
              <Table
                columns={versionColumns}
                data={versionHistory}
                pagination={false}
                scroll={{ x: 'max-content' }}
                border
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
        // onCancel={handleCloseEditModal}
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
              model: datasetDetail.src_model || 'GPT-4o',
              creator: datasetDetail.creator_name || ''
            }}
            onSubmit={handleEditSubmit}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>

      {/* 切换编辑确认弹窗 */}
      <Modal
        title="切换编辑"
        visible={confirmModalVisible}
        onOk={handleConfirmSwitchEdit}
        onCancel={handleCancelSwitchEdit}
        okText="确认切换"
        cancelText="继续当前编辑"
        okButtonProps={{ status: 'warning' }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
        >
          <IconEdit style={{ color: '#ff7d00', marginRight: 8 }} />
          {/* <span>您当前正在编辑第 {editingRowKey} 行数据</span> */}
        </div>
        <p>切换到新的编辑行将放弃当前的修改内容，确定要继续吗？</p>
      </Modal>
    </div>
  );
};

export default DatasetDetail;
