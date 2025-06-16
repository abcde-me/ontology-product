import React from 'react';
import { Typography, Input, Button, Table, Tag, Space, Modal, Message } from '@arco-design/web-react';
import { IconPlus, IconEdit, IconUpload, IconDelete, } from '@arco-design/web-react/icon';
import { getDatasetList } from '@/api/datasetManagement';
import DatasetForm from '@/components/datasetform/AddDatasetForm';
import EditDatasetForm from '@/components/datasetform/EditDatasetForm';


// 数据集类型
interface Dataset {
  key: string;
  name: string;
  tags: string[];
  version: string;
  description: string;
  model: string;
  creator: string;
  createTime: string;
  updateTime: string;
  isDefault: boolean;
}

const DatasetManagement: React.FC = () => {

  const [datasetList, setDatasetList] = React.useState<Dataset[]>([]);//数据集列表
  const [search, setSearch] = React.useState<string>('');//搜索

  // Modal相关状态
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [isEdit, setIsEdit] = React.useState<boolean>(false);
  const [currentDataset, setCurrentDataset] = React.useState<Dataset | undefined>(undefined);

  // 打开新建弹窗
  const openCreateModal = () => {
    setIsEdit(false);
    setCurrentDataset(undefined);
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const openEditModal = (record: Dataset) => {

    setIsEdit(true);
    setCurrentDataset(record);
    setModalVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setIsEdit(false);
    setCurrentDataset(undefined);
  };

  // 提交表单数据
  const handleSubmit = (formData: Dataset) => {
    if (isEdit) {
      // 编辑模式
      console.log('编辑数据集:', formData);

      Message.success('数据集修改成功！');
    } else {
      // 新建模式

      console.log('新建数据集:', formData);
      Message.success('数据集创建成功！');
    }
    closeModal();
  };



  // 删除数据集
  const handleDelete = (record: Dataset) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除数据集"${record.name}"吗？此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { status: 'danger' },
      onOk: () => {
        deleteDataset()
        Message.success('数据集删除成功！');
      },
    });
  };

  // 删除数据集的方法
  const deleteDataset = () => {

  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag) => (
            <Tag key={tag} color="green">
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '生成模型',
      dataIndex: 'model',
      render: (model: string) => <Tag color="purple">{model}</Tag>,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '最近更新',
      dataIndex: 'updateTime',
    },
    {
      title: '操作',
      dataIndex: 'op',
      render: (_: unknown, record: Dataset) => (
        <Space>
          <Button
            type="text"
            icon={<IconEdit />}
            disabled={record.isDefault}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            icon={<IconUpload />}
            disabled={record.isDefault}
          >
            上传
          </Button>
          <Button
            type="text"
            icon={<IconDelete />}
            status={!record.isDefault ? 'danger' : undefined}
            disabled={record.isDefault}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const data: Dataset[] = [
    {
      key: '1',
      name: '数据集1',
      tags: ['标签1'],
      version: 'v1.0.0',
      description: '这是一个文本数据集',
      model: 'GPT-4o',
      creator: '行政',
      createTime: '2025年5月15日 10:30:45',
      updateTime: '2025年6月1日 08:15:22',
      isDefault: false,
    },
    {
      key: '2',
      name: '数据集2',
      tags: ['标签1'],
      version: 'v1.0.0',
      description: '这是一个图片数据集',
      model: '克劳德3号作品',
      creator: '行政',
      createTime: '2025年5月10日 14:22:33',
      updateTime: '2025年5月28日 16:45:10',
      isDefault: true,
    },
    {
      key: '3',
      name: '用户自定义数据集',
      tags: ['标签1'],
      version: 'v1.0.0',
      description: '这是一个用户自定义的混合数据集',
      model: '骆驼 3',
      creator: '行政',
      createTime: '2025年4月22日 09:12:18',
      updateTime: '2025年5月30日 11:33:47',
      isDefault: true,
    },
  ];


  React.useEffect(() => {
    // getDatasetList().then(res=>{
    //   console.log(res);
    // })
    setDatasetList(data); // 测试数据
  }, []);

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '4px' }}>
      <Typography.Title heading={4} style={{ marginTop: 0 }}>
        数据集
      </Typography.Title>
      <Typography.Text type="secondary">
        管理模型训练和精调数据集
      </Typography.Text>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        <Input.Search
          allowClear
          placeholder="搜索数据集..."
          style={{ width: '320px' }}
          onChange={(value) => setSearch(value)}
        />
        <Button type="primary" icon={<IconPlus />} onClick={openCreateModal}>
          新建数据集
        </Button>
      </div>

      <Table
        rowKey="key"
        columns={columns}
        data={datasetList}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条数据`,
          sizeCanChange: true,
          showJumper: true,
        }}
        border={false}
        scroll={{ y: 400 }}
      />

      {/* 新建/编辑数据集弹框 */}
      <Modal
        title={isEdit ? '编辑数据集' : '新建数据集'}
        visible={modalVisible}
        footer={null}
        style={{ width: '640px' }}
        onCancel={closeModal}
        maskClosable={false}
      >
        {isEdit ? (
          <EditDatasetForm
            onSubmit={handleSubmit}
            onCancel={closeModal}
            initialData={currentDataset!}
          />
        ) : (
          <DatasetForm
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default DatasetManagement; 