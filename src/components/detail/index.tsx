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
  getDatasetContents
} from '@/api/datasetManagement';
import EditDatasetForm from '@/components/datasetform/EditDatasetForm';
import './style.css';
import { render } from '@headlessui/react/dist/utils/render';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 测试数据
const csdatasetDetail = {
  id: 0,
  name: '西游三打白骨精',
  description: 'liuxiaoyu-test',
  latest_version: 'v1.10',
  src: 0,
  creator_id: 'user_001',
  creator_name: '张三',
  created_at: '2025-05-05 05:05:05',
  updated_at: '2025-05-05 05:05:05',
  deleted_at: null,
  tags: ['小说情节'],
  model: 'GPT-4o'
};

// 内容数据测试数据
const cscontentData = [
  { line: 0, data: { 姓名: '张三', 年龄: 28, 性别: '男' } },
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
    dataIndex: header,
    key: header,
    render: (value: any, record: any) => {
      if (editingRowKey == record.line) {
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
    // width: 150,
    // align: 'center',
    // ellipsis: true,
  }));

  // 在最后追加一列 "操作"
  cols.push({
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'right',
    render: (_, record) => {
      if (editingRowKey == record.line) {
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
const versionHistory = [
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

// 版本历史表格列定义
const versionColumns = [
  {
    title: '版本号',
    dataIndex: 'version',

    render: (version: string, record: any) => (
      <Space>
        <Text
          style={{
            fontWeight: record.status === 'current' ? 'bold' : 'normal'
          }}
        >
          {version}
        </Text>
        {record.status === 'current' && (
          <span className="version-current-tag">当前版本</span>
        )}
      </Space>
    )
  },
  {
    title: '日期',
    dataIndex: 'date'
  },
  {
    title: '描述',
    dataIndex: 'description'
  },
  {
    title: '更改数量',
    dataIndex: 'changes',
    render: (changes: number) => `${changes} 项更改`
  }
];

const DatasetDetail: React.FC = () => {
  const [datasetDetail, setDatasetDetail] = React.useState<any>(null);
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
  const { id } = useParams<{ id: string }>(); //数据集id
  const history = useHistory();

  // 编辑数据
  const [editingRowKey, setEditingRowKey] = React.useState<string | null>(null); //当前编辑行
  const [editingData, setEditingData] = React.useState<any>({}); //当前编辑数据
  const [changedRows, setChangedRows] = React.useState<string[]>([]); // 记录修改过的行
  const [deletedRows, setDeletedRows] = React.useState<number[]>([]); // 记录删除的行号
  const [confirmModalVisible, setConfirmModalVisible] = React.useState(false); //确认弹窗
  const [pendingEditRow, setPendingEditRow] = React.useState<any>(null); // 待编辑的行（用于确认切换）

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

    updateDataset(formData)
      .then((res) => {
        console.log(res);
        Message.success('数据集更新成功');
        setEditModalVisible(false);
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
      title: '确认删除',
      content: `确定要删除第 ${lineNumber} 行数据吗？`,
      okText: '确认删除',
      cancelText: '取消',
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

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  React.useEffect(() => {
    // 测试数据
    setDatasetDetail(csdatasetDetail);
    // 初始化总数
    setTotal(cscontentData.length);
  }, []);

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

  // 初始化数据 - 只在组件挂载和搜索/分页时执行
  React.useEffect(() => {
    // 查询数据集数据内容
    if (datasetDetail && id) {
      const params = {
        dataset_id: id,
        page: currentPage,
        page_size: pageSize,
        search: actualSearchValue || undefined
      };

      getDatasetContents(params)
        .then((res) => {
          // 根据接口文档处理返回数据
          if (res.data && res.data.length > 0) {
            const responseData = res.data[0]; // API返回的data是数组，取第一个元素
            setContentData(responseData.list || []);
            setTotal(responseData.total || 0);
            setContentDatabackup(responseData.list || []);
            // 动态生成列配置（如果有field_names）
            if (
              responseData.field_names &&
              responseData.field_names.length > 0
            ) {
              // 这里可以根据实际字段名动态生成列
              // setContentColumns(generateArcoColumns(...))
            }
          }
        })
        .catch((err) => {
          console.error('获取数据集内容失败:', err);
          Message.error('加载数据失败');
          // 如果请求失败，使用测试数据
          setContentData(cscontentData);
          setContentDatabackup(cscontentData);
          setTotal(cscontentData.length);
        });
    } else {
      // 测试数据 - 只在需要重新加载数据时设置
      setContentData(cscontentData);
      setTotal(cscontentData.length);
    }
  }, [actualSearchValue, currentPage, pageSize, datasetDetail, id]);

  // 更新表格列配置 - 只在编辑状态变化时执行
  React.useEffect(() => {
    setContentColumns(
      generateArcoColumns(
        cscontentColumns,
        handleEditContent,
        handleContinue,
        editingRowKey,
        editingData,
        handleEditDataChange,
        handleInlineEditSubmit,
        handleInlineEditCancel
      )
    );
  }, [editingRowKey, editingData, contentData]);

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
                    { label: '名称', value: datasetDetail.name },
                    {
                      label: '标签',
                      value: datasetDetail.tags?.join('、') || '-'
                    },
                    { label: '创建人', value: datasetDetail.creator_name },
                    { label: '生成模型', value: datasetDetail.model }
                  ]}
                  column={1}
                  labelStyle={{
                    width: 80,
                    fontWeight: 'normal',
                    color: '#666666'
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
                      label: '当前版本',
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
                      label: '创建时间',
                      value: formatDate(datasetDetail.created_at)
                    },
                    {
                      label: '更新时间',
                      value: formatDate(datasetDetail.updated_at)
                    },
                    {
                      label: '描述说明',
                      value: datasetDetail.description || '-'
                    }
                  ]}
                  column={1}
                  labelStyle={{
                    width: 80,
                    fontWeight: 'normal',
                    color: '#666666'
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
                          setContentData(contentDatabackup);

                          Message.success('已取消所有修改并恢复数据');
                        }
                      });
                    }}
                  >
                    取消
                  </Button>
                  <Button type="primary">确定</Button>
                </Space>
              )}
            </div>

            {/* 内容数据表格 */}
            {activeTab === 'content' ? (
              <Table
                columns={contentColumns}
                data={contentData}
                pagination={false}
                scroll={{ x: 'max-content' }}
                border
              />
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
        onCancel={handleCloseEditModal}
        footer={null}
        style={{ width: 640, height: 354 }}
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
              tags: datasetDetail.tags || [],
              model: datasetDetail.model || 'GPT-4o',
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
