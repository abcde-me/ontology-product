import { Form, Input, Button, Select, Space, Radio, Table, Checkbox } from '@arco-design/web-react';
import React, { useState,useEffect } from 'react';
import {getCatalogList} from '@/api/dataCatalog'
import {getconnectorList,getconnectorFileInformation} from '@/api/datasetManagement'
interface Dataset {
  key?: string;
  name: string;
  tags: string[];
  description: string;
  dataSource: 'volume' | 'connector';
  targetDataSource?: string;
  selectedFiles?: string[];
}

interface DataFile {
  key: string;
  filename: string;
  size: string;
  modifyTime: string;
}

const FormItem = Form.Item;




const cstargetDataSourceOptions = [
  { label: '目标数据源volume1', value: 'volume1' },
  { label: '目标数据源volume2', value: 'volume2' },
  { label: '连接器1', value: 'connector1' },
  { label: '连接器2', value: 'connector2' },
];
const csconnectorList=[
  {
    "id": 101,
    "name": "s3-production-updated",
    "type": "s3",
    "config": {
      "endpoint": "https://s3.amazonaws.com",
      "access_key": "AKIAxxxxxxxx",
      "secret_key": "xxxxxxxx",
      "path": "data-warehouse"
    },
    "creator": "user123",
    "created_at": 1712345678,
    "updated_at": 1712345679,
    "status": "connected"
  }
]

function DatasetForm({ onSubmit, onCancel }){
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<'volume' | 'connector'>('volume');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileSelection, setShowFileSelection] = useState(false);
  const [targetDataSourceOptions, setTargetDataSourceOptions] = useState([]);//目标数据源选项
  const [connectorList, setConnectorList] = useState([]);//连接器列表
  const [connectorFileInformation, setConnectorFileInformation] = useState([]);//连接器文件信息
  // 标签选项
  const tagOptions = [
    { label: '标签1', value: '标签1' },
    { label: '标签2', value: '标签2' },
    { label: '标签3', value: '标签3' },
    { label: '文本', value: '文本' },
    { label: '图片', value: '图片' },
    { label: '音频', value: '音频' },
  ];



  // 模拟文件数据
  const mockFiles: DataFile[] = [
    { key: '1', filename: 'data1.jsonl', size: '2.3 MB', modifyTime: '2025-05-30' },
    { key: '2', filename: 'conversations.jsonl', size: '5.1 MB', modifyTime: '2025-05-28' },
    { key: '3', filename: 'training_set.jsonl', size: '8.7 MB', modifyTime: '2025-05-25' },
  ];

  const getConnectorFileInformationfun = (id:string,type:'jsonl') => {
    getconnectorFileInformation({connector_id:id,type:type}).then(res => {
      console.log(res)
    })
  }//获取连接器文件信息

 useEffect(() => {
  //数据目录卷
  // getCatalogList().then(res => {
  //   console.log(res)
  // })//获取数据来源中数据目录卷中的选项（不可以直接使用，需要处理数据）
  setTargetDataSourceOptions(cstargetDataSourceOptions);//测试数据

  //连接器
  // getconnectorList({scope:1}).then(res => {
  //   console.log(res)
  // })//获取连接器列表,获取的数据需要处理，不处理没办法直接使用
  setConnectorList(csconnectorList);//测试数据
 }, []);




  // 处理数据来源变化
  const handleDataSourceChange = (value: 'volume' | 'connector') => {
    setDataSource(value);
    form.setFieldValue('dataSource', value);
    setShowFileSelection(false);
    setSelectedFiles([]);
  };

  // 处理目标数据源选择
  const handleTargetDataSourceChange = (value: string) => {
    if (dataSource === 'connector') {
      setShowFileSelection(true);
    }
  };

  // 文件选择表格列定义
  const fileColumns = [
    {
      title: '',
      dataIndex: 'select',
      width: 50,
      render: (_: unknown, record: DataFile) => (
        <Checkbox
          checked={selectedFiles.includes(record.key)}
          onChange={(checked) => {
            if (checked) {
              setSelectedFiles([...selectedFiles, record.key]);
            } else {
              setSelectedFiles(selectedFiles.filter(id => id !== record.key));
            }
          }}
        />
      ),
    },
    {
      title: '文件名',
      dataIndex: 'filename',
    },
    {
      title: '大小',
      dataIndex: 'size',
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
    },
  ];

  const handleSubmit = () => {
    form.validate().then((values) => {
      console.log(values);
      const formData: Dataset = {
        ...values,
        dataSource,
        selectedFiles: dataSource === 'connector' ? selectedFiles : undefined,
      };
      // console.log(formData);
      onSubmit(formData);
    }).catch((error) => {
      console.log('表单验证失败:', error);
    });
  };

  return (
    <div>
      <Form
        form={form}
        style={{ width: '100%' }}
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
      >
        <FormItem
          label="名称"
          field="name"
          rules={[{ required: true, message: '请输入数据集名称' }]}
        >
          <Input placeholder="输入数据集名称..." />
        </FormItem>

        <FormItem
          label="描述说明"
          field="description"
          rules={[{ required: true, message: '请输入描述信息' }]}
        >
          <Input.TextArea
            placeholder="这里输入对数据集的描述和说明信息..."
            rows={4}
            maxLength={500}
            showWordLimit
          />
        </FormItem>

        <FormItem
          label="标签"
          field="tags"
          rules={[{ required: true, message: '请选择至少一个标签' }]}
        >
          <Select
            placeholder="请输入或选择标签（用逗号分隔）..."
            mode="multiple"
            options={tagOptions}
            allowCreate
          />
        </FormItem>

        <FormItem
          label="数据来源"
          field="dataSource"
          rules={[{ required: true, message: '请选择数据来源' }]}
        >
          <Radio.Group value={dataSource} onChange={handleDataSourceChange}>
            <Radio value="volume">数据目录卷</Radio>
            <Radio value="connector">连接器</Radio>
          </Radio.Group>
        </FormItem>

        <FormItem
          label="请选择目标数据源/卷"
          field="targetDataSource"
          rules={[{ required: true, message: '请选择目标数据源' }]}
        >
          {dataSource === 'volume' ? (
            <Select
              placeholder="请选择目标数据源..."
              options={[]}
              onChange={handleTargetDataSourceChange}
            />
          ) : <Select
              placeholder="请选择目标数据源/卷"
              options={[]}
          />}
        </FormItem>

        {showFileSelection && (
          <FormItem label="选择数据文件" wrapperCol={{ span: 18, offset: 6 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#999' }}>
                注意：目前允许同时使用的JSON数据格式，请确保您的文件格式正确，请尽最大努力只上传JSON数据文件
              </span>
            </div>
            <Table
              columns={fileColumns}
              data={mockFiles}
              pagination={false}
              size="small"
              style={{ border: '1px solid #e5e5e5' }}
            />
          </FormItem>
        )}

        <FormItem wrapperCol={{ offset: 6, span: 18 }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              完成
            </Button>
          </Space>
        </FormItem>
      </Form>
    </div>
  );
}

export default DatasetForm;
