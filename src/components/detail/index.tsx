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

//headers:表头
//handleEditContent:编辑内容
//handleContinue:删除
//editingRowKey:当前编辑行
//editingData:当前编辑数据
//onDataChange:处理编辑数据变化
//idName:唯一标识符字段名
const generateArcoColumns = (
  headers,
  handleEditContent,
  handleContinue,
  editingRowKey,
  editingData,
  onDataChange,
  handleInlineEditSubmit,
  handleInlineEditCancel,
  idName
) => {
  const cols = headers.map((header) => ({
    title: header,
    dataIndex: header,
    key: header,
    minWidth: 150,
    maxWidth: 300,
    render: (value: any, record: any) => {
      if (editingRowKey === record[idName]) {
        return (
          <Input.TextArea
            value={
              editingData[header] !== undefined
                ? editingData[header]
                : record[header]
            }
            onChange={(value) => onDataChange(header, value)}
            style={{ margin: '-5px 0' }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="请输入内容"
          />
        );
      }
      return <div>{record[header]}</div>;
    }
  }));

  // 在最后追加一列 "操作"
  cols.push({
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'right',
    render: (_, record) => {
      if (editingRowKey === record[idName]) {
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
      const isOtherRowEditing =
        editingRowKey !== null && editingRowKey !== record[idName];

      return (
        <Space>
          <Tooltip content={isOtherRowEditing ? '请完成当前编辑' : ''}>
            <Button
              type="text"
              size="small"
              disabled={isOtherRowEditing}
              onClick={() => handleEditContent(record[idName])}
              style={{
                color: isOtherRowEditing ? '#c9cdd4' : undefined,
                cursor: isOtherRowEditing ? 'not-allowed' : 'pointer'
              }}
            >
              编辑
            </Button>
          </Tooltip>
          <Tooltip content={isOtherRowEditing ? '请完成当前编辑' : ''}>
            <Button
              type="text"
              // status="danger"
              size="small"
              onClick={() => handleContinue(record[idName])}
              style={{
                color: isOtherRowEditing ? '#c9cdd4' : undefined,
                cursor: isOtherRowEditing ? 'not-allowed' : 'pointer'
              }}
            >
              删除
            </Button>
          </Tooltip>
        </Space>
      );
    }
  });

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
const versionColumns = [
  {
    title: '版本号',
    dataIndex: 'version_id',
    width: 260,
    render: (version: string) => (
      <Space>
        <Text>{version}</Text>
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
    render: (time: string) => formatDate(time)
  },
  {
    title: '更变记录',
    width: 470,
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
  const [idName, setIdName] = React.useState<string>(''); //唯一标识符字段名
  const { id } = useParams<{ id: string }>(); //数据集id
  const history = useHistory();

  // 编辑数据
  const [editingRowKey, setEditingRowKey] = React.useState<string | null>(null); //当前编辑行
  const [editingData, setEditingData] = React.useState<any>({}); //当前编辑数据
  const [changedRows, setChangedRows] = React.useState<string[]>([]); // 记录修改过的数据
  const [deletedRows, setDeletedRows] = React.useState<string[]>([]); // 记录删除的数据

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
    console.log(contentData);
    // 初始化编辑数据
    const currentRow = contentData.find(
      (item: any) => item[idName] === recordId
    );
    if (currentRow) {
      setEditingData({ ...currentRow });
    }

    Message.info(`编辑数据`);
  };

  // 删除
  const handleContinue = (recordId: string) => {
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
          (item) => item[idName] !== recordId
        );
        setContentData(newContentData);

        // 将删除的数据ID添加到数组中
        setDeletedRows((prev) => [...prev, recordId]);

        Message.success(`数据已删除`);
        console.log('已删除的数据:', [...deletedRows, recordId]);
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
      if (item[idName] === editingRowKey) {
        return {
          ...editingData // 直接使用编辑的数据替换整个记录
        };
      }
      return item;
    });
    setContentData(newData);

    // 记录修改的数据
    if (!changedRows.includes(editingRowKey!.toString())) {
      setChangedRows([...changedRows, editingRowKey!.toString()]);
    }

    // 重置编辑状态
    setEditingRowKey(null);
    setEditingData({});

    Message.success('数据修改成功');
    console.log('已修改的数据:', [...changedRows, editingRowKey]);
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
    const submitData: any[] = [];

    // 处理修改的数据
    changedRows.forEach((recordId) => {
      const modifiedRow = contentData.find((item) => item[idName] === recordId);
      if (modifiedRow) {
        submitData.push({
          change_type: 1, // 修改
          new_data: modifiedRow // 直接提交整行数据
        });
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
            if (res.data) {
              setContentData(res.data.list || []);
              setContentColumnslist(res.data.field_names || []);
              setIdName(res.data.id_name || '');
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
          idName
        )
      );
    }
  }, [contentColumnslist, editingRowKey, editingData, idName]);

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
            setIdName(res.data.id_name || '');
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
        <Tabs
          activeTab={activeTab}
          onChange={(e) => {
            console.log(e);
            setActiveTab(e);
            // setCurrentPage(1);
          }}
        >
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
                    取消本轮编辑
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSubmitChanges}
                    disabled={
                      changedRows.length === 0 && deletedRows.length === 0
                    }
                  >
                    保存本轮编辑
                  </Button>
                </Space>
              )}
            </div>
            {contentData.length !== 0 && contentColumns.length !== 0 ? (
              <>
                {/* 内容数据表格 */}
                {activeTab === 'content' ? (
                  <>
                    <Table
                      columns={contentColumns}
                      data={contentData}
                      noDataElement={
                        <Empty description="这里空空如也，快去添加数据吧！" />
                      }
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
              </>
            ) : (
              <Empty description="这里空空如也，快去添加数据吧！" />
            )}
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
    </div>
  );
};

export default DatasetDetail;
