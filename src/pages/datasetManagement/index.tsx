import React from 'react';
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
  Checkbox
} from '@arco-design/web-react';
import {
  IconPlus,
  IconEdit,
  IconUpload,
  IconDelete,
  IconDownload,
  IconFilter
} from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import {
  getDatasetList,
  createDataset,
  deleteDataset
} from '@/api/datasetManagement';
import DatasetForm from '@/components/datasetform/AddDatasetForm';
import styles from './index.module.css';
import FormComponent from '@/components/data-catalog-content/components/popups-form';
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
interface Dataset {
  id: number;
  name: string;
  description: string;
  latest_version: string;
  src: number;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  tag_names?: string[];
  src_model: string;
}

const columns = (
  handleGoToDetail,
  handleDelete,
  datasetList: Dataset[],
  handleExport: (record: Dataset) => void
) => [
  {
    title: '名称',
    dataIndex: 'name',
    width: 180,
    render: (name: string, record: Dataset) => (
      <Button
        type="text"
        className={styles.datasetNameLink}
        onClick={() => handleGoToDetail(record.id)}
      >
        {name}
      </Button>
    )
  },
  {
    title: '标签',
    dataIndex: 'tag_names',
    width: 160,
    // filterIcon: <IconFilter />,
    filters: (() => {
      const tagSet = new Set<string>();
      datasetList?.forEach((dataset) => {
        dataset.tag_names?.forEach((tag) => tagSet.add(tag));
      });
      return Array.from(tagSet).map((tag) => ({ text: tag, value: tag }));
    })(),
    onFilter: (value: string, record: Dataset) => {
      return record.tag_names?.includes(value) || false;
    },
    render: (tag_names: string[]) => (
      <Space size="mini">
        {tag_names && tag_names.length > 0 && (
          <Tag className={styles.tagGreen}>
            {tag_names[0].length > 5
              ? `${tag_names[0].substring(0, 5)}...`
              : tag_names[0]}
          </Tag>
        )}
        {tag_names && tag_names.length > 1 && (
          <Tag className={styles.tagGreen}>+{tag_names.length - 1}</Tag>
        )}
      </Space>
    )
  },
  {
    title: '版本',
    dataIndex: 'latest_version',
    width: 100
  },
  {
    title: '描述说明',
    dataIndex: 'description',
    width: 200,
    ellipsis: true
  },
  {
    title: '生成模型',
    dataIndex: 'src_model',
    filterIcon: <IconFilter />,
    width: 150,
    filters: (() => {
      const modelSet = new Set<string>();
      datasetList?.forEach((dataset) => {
        if (dataset.src_model) {
          modelSet.add(dataset.src_model);
        }
      });
      return Array.from(modelSet).map((model) => ({
        text: model,
        value: model
      }));
    })(),
    onFilter: (value: string, record: Dataset) => {
      return record.src_model === value;
    },
    render: (src_model: string) => (
      <Tag className={styles.tagPurple}>{src_model}</Tag>
    )
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    width: 120,
    filterIcon: <IconFilter />,
    filters: (() => {
      const creatorSet = new Set<string>();
      datasetList?.forEach((dataset) => {
        if (dataset.creator_name) {
          creatorSet.add(dataset.creator_name);
        }
      });
      return Array.from(creatorSet).map((creator) => ({
        text: creator,
        value: creator
      }));
    })(),
    onFilter: (value: string, record: Dataset) => {
      return record.creator_name === value;
    }
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 220,
    sorter: (a: Dataset, b: Dataset) => {
      // 直接比较 ISO 8601 格式的时间字符串
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    },
    sortDirections: ['ascend' as const, 'descend' as const],
    render: (created_at: string) => formatDateTime(created_at)
  },
  {
    title: '最近更新',
    dataIndex: 'updated_at',
    width: 220,
    sorter: (a: Dataset, b: Dataset) => {
      // 直接比较 ISO 8601 格式的时间字符串
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return dateA - dateB;
    },
    sortDirections: ['ascend' as const, 'descend' as const],
    render: (updated_at: string) => formatDateTime(updated_at)
  },
  {
    title: '操作',
    dataIndex: 'op',
    width: 148,
    fixed: 'right' as const,
    render: (_: unknown, record: Dataset) => (
      <Space size={8}>
        {/* <Button
          type="text"
          className={`${styles.actionButton} ${styles.export}`}
        >
          编辑
        </Button> */}
        <Button
          type="text"
          className={`${styles.actionButton} ${styles.export}`}
          onClick={() => handleExport(record)}
        >
          导出
        </Button>
        <Button
          type="text"
          className={`${styles.actionButton} ${styles.delete}`}
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>
      </Space>
    )
  }
];

const data: Dataset[] = [
  {
    id: 1,
    name: '数据集1',
    description: '这是一个文本数据集',
    latest_version: 'v1.0.0',
    src: 1,
    creator_id: 'admin001',
    creator_name: '行政',
    created_at: '2025-05-15T10:30:45+08:00',
    updated_at: '2025-06-01T08:15:22+08:00',
    deleted_at: null,
    tag_names: ['文本11111111111111111', '训练'],
    src_model: 'gpt-3.5-turbo'
  },
  {
    id: 2,
    name: '数据集2',
    description: '这是一个图片数据集',
    latest_version: 'v1.0.0',
    src: 0,
    creator_id: 'system',
    creator_name: '行政',
    created_at: '2025-05-10T14:22:33+08:00',
    updated_at: '2025-05-28T16:45:10+08:00',
    deleted_at: null,
    tag_names: ['图片', '分类'],
    src_model: 'vision-model'
  },
  {
    id: 3,
    name: '用户自定义数据集',
    description: '这是一个用户自定义的混合数据集',
    latest_version: 'v1.0.0',
    src: 1,
    creator_id: 'admin001',
    creator_name: '行政',
    created_at: '2025-04-22T09:12:18+08:00',
    updated_at: '2025-05-30T11:33:47+08:00',
    deleted_at: null,
    tag_names: ['混合', '自定义', '测试'],
    src_model: 'claude-3-sonnet'
  }
];

enum searchFieldType {
  name = 'name',
  // tags = 'tags',
  description = 'description'
  // src_model = 'src_model',
  // creator_name = 'creator_name'
}

const DatasetManagement: React.FC = () => {
  const history = useHistory();

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
  const [selectedRows, setSelectedRows] = React.useState<Dataset[]>([]); //选择行数据

  // Modal相关状态
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  //导出弹窗相关
  const [downloadData, setDownloadData] = React.useState<Dataset | null>(null);
  const [visible, setVisible] = React.useState(false); // 导出弹框控制
  // 搜索字段选项
  const searchOptions = [
    { label: '名称', value: 'name' },
    // { label: '标签', value: 'tags' },
    { label: '描述说明', value: 'description' }
    // { label: '生成模型', value: 'src_model' },
    // { label: '创建人', value: 'creator_name' }
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: Dataset[]) => {
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
  const handleSubmit = (formData: any) => {
    console.log('新建数据集:', formData);
    const submitData = {
      name: formData.name,
      description: formData.description,
      tag_names: formData.tags || [],
      src: formData.dataSource === 'volume' ? 1 : 2, // 1-目标数据目录，2-连接器
      src_extra:
        formData.dataSource === 'volume'
          ? {
              path:
                // formData.targetDataSource[0][0] +
                '/dst' +
                '/' +
                formData.targetDataSource[0][1] +
                '/volume/' +
                formData.targetDataSource[1][0],
              path_id: formData.targetDataSource[1][1]
            }
          : {
              connector_id: parseInt(formData.targetDataSource) || 0,
              connector_files: formData.selectedFiles || []
            }
    };

    console.log('提交数据:', submitData);
    createDataset(submitData)
      .then((res) => {
        if (res.status === 200) {
          Message.success('数据集创建成功！');
          // 刷新数据列表
          getDatasetList({
            page: currentPage,
            limit: pageSize,
            search: search,
            search_field: searchField
          }).then((res) => {
            setDatasetList(res.data.list);
            setTotal(res.data.total);
          });
          closeModal();
        } else {
          Message.error(res.message || '数据集创建失败！');
        }
      })
      .catch((err) => {
        Message.error('数据集创建失败！');
      });
  };

  // 删除数据集的方法
  const deleteDatasetRecord = (record: Dataset) => {
    deleteDataset(record)
      .then((res) => {
        getDatasetList({
          page: currentPage,
          limit: pageSize,
          search: search,
          search_field: searchField
        }).then((res) => {
          setDatasetList(res.data.list);
          setTotal(res.data.total);
        });
        Message.success('删除成功');
      })
      .catch((err) => {
        Message.error('数据集删除失败！');
      });
  };

  // 删除数据集
  const handleDelete = (record: Dataset) => {
    Modal.confirm({
      title: '确认删除文件吗？',
      // 内容
      content: '删除后，文件不可恢复',
      // 按钮文字
      okText: '确定',
      cancelText: '取消',
      // 类型设为 warning，会自动使用橙色感叹号图标
      okButtonProps: { status: 'danger' },
      // 居中显示
      // centered: true,
      onOk: () => {
        deleteDatasetRecord(record);
      }
    });
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

  // 执行搜索函数
  const handleSearch = () => {
    setCurrentPage(1); // 重置到第一页
    getDatasetList({
      page: 1,
      limit: pageSize,
      search: search,
      search_field: searchField
    }).then((res) => {
      setDatasetList(res.data.list);
      setTotal(res.data.total);
      console.log(res);
    });
    // setDatasetList(data); // 测试数据
    // setTotal(1000); // 设置总条数
  };

  // 获取数据集列表,当页码或者每页条数变化时，重新获取数据
  React.useEffect(() => {
    getDatasetList({
      page: currentPage,
      limit: pageSize,
      search: search,
      search_field: searchField
    }).then((res) => {
      console.log('李帆测试', res.data.list);
      setDatasetList(res.data.list);
      setTotal(res.data.total);
    });
    // setDatasetList(data); // 测试数据
    // setTotal(1000); // 设置总条数
  }, [currentPage, pageSize]);

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要删除的数据集');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个数据集吗？此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { status: 'danger' },
      onOk: () => {
        console.log('批量删除:', selectedRows);
        Message.success(`成功删除 ${selectedRowKeys.length} 个数据集！`);
        setSelectedRowKeys([]);
        setSelectedRows([]);
      }
    });
  };

  // 导出数据集
  const handleExport = (record: Dataset) => {
    console.log('导出数据集:', record);
    // TODO: ts错误
    // @ts-expect-error
    setDownloadData(record);
    setVisible(true);
  };
  // 批量导出
  const handleBatchExport = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要导出的数据集');
      return;
    }

    console.log('批量导出:', selectedRows);
    Message.success(`开始导出 ${selectedRowKeys.length} 个数据集...`);
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 20px 10px 0px',
        borderRadius: '10px',
        padding: '20px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: '20px'
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
          数据集管理
        </h1>
        <div
          style={{
            color: '#334155',
            margin: '0px'
          }}
        >
          管理用于模型精调和训练的数据集
        </div>
      </div>
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
            onPressEnter={handleSearch}
            onSearch={handleSearch}
          />
        </Input.Group>
        <div className={styles.actionButtons}>
          {/* <Button
            icon={<IconDelete />}
            className={styles.batchDeleteBtn}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
          <Button
            icon={<IconDownload />}
            className={styles.batchExportBtn}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchExport}
          >
            批量导出
          </Button> */}
          <Button type="primary" icon={<IconPlus />} onClick={openCreateModal}>
            新建数据集
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        className={styles.datasetTable}
        columns={columns(
          handleGoToDetail,
          handleDelete,
          datasetList,
          handleExport
        )}
        data={datasetList}
        rowSelection={rowSelection}
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
        scroll={{ x: 1200 }}
      />

      {/* 新建数据集弹框 */}
      <DatasetForm
        visible={modalVisible}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
      {/* 导出数据集弹窗 */}
      <FormComponent
        exportdataset={downloadData}
        onCancel={() => setVisible(false)}
        visible={visible}
        exportdatas={selectedRows}
      />
    </div>
  );
};

export default DatasetManagement;
