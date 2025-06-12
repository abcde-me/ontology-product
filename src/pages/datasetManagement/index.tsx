import React from 'react';
import { Typography, Input, Button, Table, Tag, Space, Modal } from '@arco-design/web-react';
import { IconPlus, IconEdit, IconUpload, IconDelete, } from '@arco-design/web-react/icon';
import { getDatasetList } from '@/api/datasetManagement';
import Form from '@/components/datasetform';

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
    // render: (text) => <div style={{ whiteSpace: 'nowrap' }}>{text}</div>,
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
        ></Button>
        <Button
          type="text"
          icon={<IconUpload />}
          disabled={record.isDefault}
        ></Button>
        <Button
          type="text"
          icon={<IconDelete />}
          status={!record.isDefault ? 'danger' : undefined}
          disabled={record.isDefault}
        ></Button>
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

const DatasetManagement: React.FC = () => {
  const [datasetList, setDatasetList] = React.useState<Dataset[]>([]);
  const [search, setSearch] = React.useState<string>('');

  // 新建数据集弹框相关状态与方法
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  const openModal = () => setModalVisible(true);

  const addDataset = ()=>{
    setModalVisible(false);
    console.log('addDataset');
  }


  React.useEffect(() => {
    // getDatasetList().then(res=>{
    //   console.log(res);
    // })
    setDatasetList(data);//测试数据
    // console.log(search);
  }, [search])





  return (
    // <div style={{ padding: '24px', backgroundColor: '#F9FAFB' }}>
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
        <Button type="primary" icon={<IconPlus />} onClick={openModal}>
          新建数据集
        </Button>
      </div>
      <Table
        rowKey="key"
        columns={columns}
        data={datasetList}
        pagination={false}//不显示分页
        border={false}
        scroll={{ y: 400 }}//固定表格纵轴的高度
      />

      {/* 新建数据集弹框 */}
      <Modal
        title={'新建数据集'}
        visible={modalVisible}
        footer={null}
        style={{ width: 'auto' }}
      >
        <Form addDataset={addDataset}></Form>
        
      </Modal>
    </div>
    // </div>
  );
};

export default DatasetManagement; 