import {
  Form,
  Input,
  Button,
  Select,
  Space,
  Radio,
  Table,
  Checkbox,
  Cascader,
  Typography
} from '@arco-design/web-react';
import React, { useState, useEffect } from 'react';
import { getCatalogList, getCatalogPreview } from '@/api/dataCatalog';
import {
  getConnectorList,
  getConnectorFileList,
  getTagList
} from '@/api/datasetManagement';
import { render } from '@headlessui/react/dist/utils/render';
const { Text } = Typography;

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

//模拟数据目录卷数据
const cstargetDataSourceOptions = [
  {
    label: '数据目录卷',
    value: 'volumes',
    children: [
      { label: '目标数据源volume1', value: 'volume1' },
      { label: '目标数据源volume2', value: 'volume2' }
    ]
  },
  {
    label: '其他数据源',
    value: 'others',
    children: [
      { label: '连接器1', value: 'connector1' },
      { label: '连接器2', value: 'connector2' }
    ]
  }
];

//模拟连接器列表数据
const csconnectorList = [
  {
    id: 101,
    name: 's3-production-updated',
    type: 's3',
    config: {
      endpoint: 'https://s3.amazonaws.com',
      access_key: 'AKIAxxxxxxxx',
      secret_key: 'xxxxxxxx',
      path: 'data-warehouse'
    },
    creator: 'user123',
    created_at: 1712345678,
    updated_at: 1712345679,
    status: 'connected'
  }
];
//连接器列表转换为select选项 函数
function convertToSelectOptions(connectorList) {
  return connectorList.map((connector) => ({
    label: connector.name,
    value: connector.id
  }));
}

//标签测试数据
const tagOptions = [
  {
    id: 1,
    name: 'nlp'
  },
  {
    id: 2,
    name: 'gan'
  }
];
//标签列表转换为select选项
function convertTotagSelectOptions(data = []) {
  return data.map((item) => ({
    // TODO: ts错误
    // @ts-expect-error
    label: item.name,
    // TODO: ts错误
    // @ts-expect-error
    value: item.name
  }));
}

//模拟连接器文件信息
const csconnectorFileInformation = [
  {
    name: '20230601.jsonl',
    path: '/data/logs/20230601.jsonl',
    size: 524288,
    last_modified: '2025-06-18 09:15:20',
    type: 'jsonl'
  },
  {
    name: '20230602.jsonl',
    path: '/data/logs/20230602.jsonl',
    size: 1572864,
    last_modified: '2025-06-18 09:20:11',
    type: 'jsonl'
  },
  {
    name: '20230603.jsonl',
    path: '/data/logs/20230603.jsonl',
    size: 3145728,
    last_modified: '2025-06-18 09:23:45',
    type: 'jsonl'
  },
  {
    name: '20230604.jsonl',
    path: '/data/logs/20230604.jsonl',
    size: 10485760,
    last_modified: '2025-06-18 09:28:03',
    type: 'jsonl'
  },
  {
    name: '20230605.jsonl',
    path: '/data/logs/20230605.jsonl',
    size: 20971520,
    last_modified: '2025-06-18 09:35:00',
    type: 'jsonl'
  }
];

//连接器文件信息转换为select选项的函数
function transformToSelectOptions(fileList) {
  return fileList.map((file) => ({
    label: `${file.name}`,
    value: file.path,
    data: file
  }));
}

// 模拟选择目录后预览数据
const csmockPreviewData = [
  {
    id: 100,
    instruction: '请解释下面的历史事件',
    content:
      '马克思主义基本原理概论，它的意义和影响。当天终于能够自己做主，能够从世界社会主义运动的目标和理想出发，去考察社会主义革命发展规律。当确认了该主要政治目标，我们具有了真正认识资本主义的基础，为充分认识生产关系的规律奠定了基础。',
    response:
      '马克思主义的了新的立体形意识形态的演进。希望您能像您心中到意像，既可能让你的心了有农艺手续要在这理论的基础上，有力证明传统该不能作出充分的理论论证。正所谓资本主义的形成，总是每次了充实的仪式，选择性的发展演进和完善的了固面貌的塑造。对于事业的不懈追求并不是了爱伤像的'
  },
  {
    id: 200,
    instruction: '请分析以下金融案例的会计处理',
    content:
      '某公司于现金购置了一套新的生产设备，价值500万元。该设备的使用年限为10年，残值为50万元。假设使用直线法进行折旧计算，请你算计算年度折旧费用。另外如果某设备在8年后出售，售价为100万元，请计算处置损益。',
    response:
      '根据题目信息计算折旧和处置损益：1、年度折旧计算：（设备原值-残值）/使用年限=（500-50）/10=45万元/年  2、8年后的累计折旧：45×8=360万元  3、设备账面净值：500-360=140万元  4、处置损益：售价-账面净值=100-140=-40万元（处置损失）  因此，该设备年度折旧费用为45万元，8年后出售产生40万元的处置损失。'
  },
  {
    id: 300,
    instruction: '请详细分析这段文本的文学特征和写作风格',
    content:
      '夜，像是一副巨大的黑色丝绸，轻柔地铺展在大地之上。月亮像一枚银色的钮扣，缀在这片暗夜的幕布上。远山如墨，近树成影，偶尔传来几声鸟叫，打破了这份宁静。一阵微风吹过，树叶沙沙作响，仿佛在诉说着什么秘密。',
    response:
      '这段文本具有以下文学特征：1、修辞手法：运用了比喻（夜如丝绸、月如钮扣）、拟人（树叶诉说秘密）等手法，形象生动  2、感官描写：通过视觉（黑色、银色）、听觉（鸟叫、沙沙声）营造氛围  3、静中有动：以静态描写为主，点缀动态元素（微风、鸟叫）形成对比  4、诗意语言：语言优美、节奏感强，具有较强的画面感和音乐性  5、意境营造：通过自然景物的描绘，营造出宁静优美的夜晚意境，给读者以美的享受。'
  }
];

// 数据预览表格列定义
const cspreviewColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: 'INSTRUCTION',
    dataIndex: 'instruction',
    width: 250,
    ellipsis: true,
    render: (text: string) => (
      <div
        style={{
          maxHeight: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-all'
        }}
      >
        {text}
      </div>
    )
  },
  {
    title: 'CONTENT',
    dataIndex: 'content',
    width: 300,
    ellipsis: true,
    render: (text: string) => (
      <div
        style={{
          maxHeight: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-all'
        }}
      >
        {text}
      </div>
    )
  },
  {
    title: 'RESPONSE',
    dataIndex: 'response',
    width: 300,
    ellipsis: true,
    render: (text: string) => (
      <div
        style={{
          maxHeight: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-all'
        }}
      >
        {text}
      </div>
    )
  }
];

function DatasetForm({ onSubmit, onCancel }) {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<'volume' | 'connector'>(
    'volume'
  ); //数据来源,判断是数据目录卷还是连接器，volume是数据目录卷，connector是连接器
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); //选择文件
  const [showFileSelection, setShowFileSelection] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false); //数据预览
  const [targetDataSourceOptions, setTargetDataSourceOptions] = useState([]); //目标数据源选项
  const [connectorList, setConnectorList] = useState([]); //连接器列表
  const [connectorFileInformation, setConnectorFileInformation] = useState([]); //连接器文件信息
  const [previewData, setPreviewData] = useState(null); //数据目录预览数据
  const [previewColumns, setPreviewColumns] = useState([]); //数据目录预览表格列（从后端获取）
  //标签列表
  const [tagList, setTagList] = useState([]); //标签列表
  // 标签选项

  useEffect(() => {
    //数据目录卷
    getCatalogList({ integer: 2 }).then((res) => {
      console.log(res);
    }); //获取数据来源中数据目录卷中的选项（不可以直接使用，需要处理数据）
    // TODO: ts错误
    // @ts-expect-error
    setTargetDataSourceOptions(cstargetDataSourceOptions); //测试数据

    //连接器
    getConnectorList({ scope: 2 }).then((res) => {
      setConnectorList(convertToSelectOptions(res.data.items));
    });

    // setConnectorList(convertToSelectOptions(res.data))
    // setConnectorList(convertToSelectOptions(csconnectorList));//测试数据

    //标签
    // getTagList().then(res => {
    //   setTagList(res.data)
    //   console.log(res.data)
    // })
    // TODO: ts错误
    // @ts-expect-error
    setTagList(convertTotagSelectOptions(tagOptions)); //测试数据
  }, []);

  // 处理数据来源变化
  const handleDataSourceChange = (value: 'volume' | 'connector') => {
    setDataSource(value);
    form.setFieldValue('dataSource', value);
    setShowFileSelection(false); //不显示文件选择
    setShowDataPreview(false); //不显示数据预览
    setSelectedFiles([]);
    setPreviewData(null);
    setPreviewColumns([]); //重置表格列
  };

  // 处理目标数据源选择
  const handleTargetDataSourceChange = (
    value: string | (string | string[])[]
  ) => {
    if (dataSource === 'volume') {
      const path = 'dst' + '/' + value[0] + '/' + value[1];
      getVolumePreviewData(path);
    } else if (dataSource === 'connector') {
      console.log('选择的连接器ID:', value);
      getConnectorFileInformationfun(value as string, 'jsonl');
    }
  };

  // 模拟连接器文件数据
  const getConnectorFileInformationfun = (id: string, type: 'jsonl') => {
    //
    // getConnectorFileList({ connector_id: id, type: type }).then(res => {
    //   setConnectorFileInformation(res.data.files)
    // })
    // console.log(11111111111, transformToSelectOptions(csconnectorFileInformation))
    setConnectorFileInformation(
      transformToSelectOptions(csconnectorFileInformation)
    );
  }; //查询指定连接器加载成功的文件信息

  // 获取数据目录卷预览数据的方法
  const getVolumePreviewData = (volumeId: string) => {
    // 这里应该调用真实的API
    // getCatalogPreview({ path: volumeId }).then(res => {
    //   setPreviewData(res.data)//这里的数据不能直接赋值，需要处理一下
    //   setPreviewColumns(res.columns)//设置表格列（从后端返回的列配置）
    // })

    // 暂时使用模拟数据（开发阶段）
    // TODO: ts错误
    // @ts-expect-error
    setPreviewData(csmockPreviewData);
    // TODO: ts错误
    // @ts-expect-error
    setPreviewColumns(cspreviewColumns); //模拟从后端获取的columns配置
  };

  //提交数据
  const handleSubmit = () => {
    form
      .validate()
      .then((values) => {
        const formData: Dataset = {
          ...values,
          dataSource,
          selectedFiles: dataSource === 'connector' ? selectedFiles : undefined, //如果数据源是连接器，则设置选择文件
          targetDataSource:
            dataSource === 'volume' ? values.targetDataSource : values.connector //数据目录卷用targetDataSource，连接器用connector
        };
        console.log('表单数据:', formData);
        onSubmit(formData);
      })
      .catch((error) => {
        console.log('表单验证失败:', error);
      });
  };

  return (
    <div>
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        layout="horizontal"
        labelAlign="right"
      >
        <Form.Item
          label="数据集名称:"
          field="name"
          rules={[{ required: true, message: '请输入数据集名称' }]}
          style={{ marginBottom: 16 }}
        >
          <Input
            maxLength={128}
            showWordLimit
            style={{ width: '100%', marginLeft: 10 }}
            placeholder="输入数据集名称..."
          />
        </Form.Item>

        <FormItem
          label="标签:"
          field="tags"
          rules={[{ required: true, message: '请选择至少一个标签' }]}
        >
          <Select
            placeholder="请输入或选择标签（用逗号分隔）..."
            mode="multiple"
            options={tagList}
            allowCreate
            style={{ marginLeft: 10 }}
          />
        </FormItem>

        <FormItem
          label="描述说明:"
          field="description"
          rules={[{ required: true, message: '请输入描述信息' }]}
        >
          <Input.TextArea
            placeholder="这里输入对数据集的描述和说明信息..."
            rows={1}
            maxLength={500}
            showWordLimit
            style={{ marginLeft: 10 }}
          />
        </FormItem>

        <FormItem
          label="数据来源:"
          field="dataSource"
          rules={[{ required: true, message: '请选择数据来源' }]}
          initialValue="volume"
        >
          <Radio.Group
            value={dataSource}
            onChange={handleDataSourceChange}
            style={{ marginLeft: 10 }}
          >
            <Radio value="volume">数据目录卷</Radio>
            <Radio value="connector">连接器</Radio>
          </Radio.Group>
        </FormItem>

        {
          <div
            style={{
              border: '1px solid black',
              borderRadius: '10px',
              padding: '0 40px 0px 0px'
            }}
          >
            {dataSource === 'volume' ? (
              <>
                <FormItem
                  label="选择目标数据目录卷/卷:"
                  field="targetDataSource"
                  rules={[{ required: true, message: '请选择目标数据目录卷' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                >
                  <Cascader
                    placeholder="请选择"
                    options={targetDataSourceOptions}
                    style={{ marginLeft: 10 }}
                    onChange={handleTargetDataSourceChange}
                    expandTrigger="hover"
                    showSearch
                  />
                </FormItem>
                {previewData ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                      数据预览:
                    </div>
                    <Table
                      columns={previewColumns}
                      data={previewData}
                      pagination={{
                        pageSize: 5,
                        showTotal: true,
                        showJumper: true
                      }}
                      scroll={{ x: 1000 }}
                      stripe
                      border
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <FormItem
                  label="选择连接器:"
                  field="connector"
                  rules={[{ required: true, message: '请选择连接器' }]}
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                >
                  <Select
                    placeholder="请选择"
                    options={connectorList}
                    style={{ marginLeft: 10 }}
                    onChange={handleTargetDataSourceChange}
                  />
                </FormItem>

                {connectorFileInformation.length > 0 && (
                  <FormItem
                    label="选择文件:"
                    field="selectedFiles"
                    rules={[{ required: true, message: '请选择至少一个文件' }]}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                  >
                    <Select
                      placeholder="请选择要使用的文件..."
                      mode="multiple"
                      options={connectorFileInformation}
                      style={{ marginLeft: 10 }}
                      onChange={setSelectedFiles}
                      value={selectedFiles}
                      // renderOption={(option) => (
                      //   <div>
                      //     <div>{option.data.name}</div>
                      //     <small>{option.data.last_modified}</small>
                      //   </div>
                      // )}
                    />
                  </FormItem>
                )}
              </>
            )}
          </div>
        }

        <FormItem wrapperCol={{ offset: 3, span: 21 }}>
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
