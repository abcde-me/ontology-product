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
  Typography,
  Modal,
  Tooltip,
  Message
} from '@arco-design/web-react';
import type { OptionInfo } from '@arco-design/web-react/es/Select/interface';

const { Option } = Select;
import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from './AddDatasetForm.module.css';
import './AddDatasetForm.css';
import { getCatalogList, getCatalogPreview } from '@/api/dataCatalog';
import { validateName } from '@/utils/valiate';
import {
  getConnectorList,
  getConnectorFileList,
  getTagList
} from '@/api/datasetManagement';
import { render } from '@headlessui/react/dist/utils/render';
import { labelRect } from 'mermaid/dist/rendering-util/rendering-elements/shapes/labelRect';
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

interface ConnectorFile {
  name: string;
  path: string;
  size: number;
  last_modified: string;
  type: string;
}

interface DatasetFormProps {
  visible: boolean;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const FormItem = Form.Item;

// 转换函数：将新数据格式转换为 Cascader 组件需要的格式
function convertToCascaderOptions(dataSourceData) {
  return dataSourceData.map((catalog) => ({
    // label: (
    //   <Tooltip content={catalog.name}>
    //     <div
    //       style={{
    //         width: '200px',
    //         whiteSpace: 'nowrap',
    //         overflow: 'hidden',
    //         textOverflow: 'ellipsis'
    //       }}
    //     >
    //       {catalog.name}
    //     </div>
    //   </Tooltip>
    // ),
    label: catalog.name,
    value: [catalog.base_dir, catalog.name],
    children:
      catalog.children && catalog.children.volume
        ? catalog.children.volume.map((volume) => ({
            // label: (
            //   <Tooltip content={volume.name}>
            //     <div
            //       style={{
            //         width: '200px',
            //         whiteSpace: 'nowrap',
            //         overflow: 'hidden',
            //         textOverflow: 'ellipsis'
            //       }}
            //     >
            //       {volume.name}
            //     </div>
            //   </Tooltip>
            // ),
            label: volume.name,
            value: [volume.name, volume.id],
            type: 'volume',
            originalData: volume
          }))
        : []
  }));
}

//高亮函数
function highlight(text, keyword) {
  if (!keyword) return text;
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: '#007DFA' }}>
        {text.slice(idx, idx + keyword.length)}
      </span>
      {text.slice(idx + keyword.length)}
    </>
  );
}

//连接器列表转换为select选项 函数
function convertToSelectOptions(connectorList) {
  return connectorList.map((connector) => ({
    label: (
      <Tooltip content={connector.name}>
        <div
          style={{
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {connector.name}
        </div>
      </Tooltip>
    ),
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
// 格式化日期时间
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

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

//连接器文件信息转换为select选项的函数，咱不使用
function transformToSelectOptions(fileList) {
  return fileList.map((file) => ({
    label: `${file.name}`,
    value: file.path,
    data: file
  }));
}

function formatTableData(columns) {
  return columns.map((col) => ({
    title: col.charAt(0).toUpperCase() + col.slice(1), // 格式化列标题
    dataIndex: col, // 对应 data 中的键
    key: col, // 唯一标识符
    ellipsis: true, // 启用省略号
    width: 200, // 设置默认宽度
    render: (text: any) => {
      // 处理长文本显示
      const textStr = String(text || '');
      const isLongText = textStr.length > 50;

      return (
        <div
          title={textStr}
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.5',
            cursor: isLongText ? 'help' : 'default'
          }}
        >
          {isLongText ? `${textStr.substring(0, 50)}...` : textStr}
        </div>
      );
    }
  }));
}

const DatasetForm = React.forwardRef<
  { resetForm: () => void },
  DatasetFormProps
>((props, ref) => {
  const { visible, onSubmit, onCancel } = props;
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<'volume' | 'connector'>(
    'volume'
  ); //数据来源,判断是数据目录卷还是连接器，volume是数据目录卷，connector是连接器
  const [selectedConnector, setSelectedConnector] = useState<string | null>(
    null
  ); //选择的连接器ID
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); //选择文件
  const [showFileSelection, setShowFileSelection] = useState(false); //文件选择
  const [showDataPreview, setShowDataPreview] = useState(false); //数据预览
  const [targetDataSourceOptions, setTargetDataSourceOptions] = useState([]); //目标数据源选项
  const [connectorList, setConnectorList] = useState([]); //连接器列表
  const [connectorFileInformation, setConnectorFileInformation] = useState<
    ConnectorFile[]
  >([]); //连接器文件信息
  const [previewData, setPreviewData] = useState<[]>([]); //数据目录预览数据
  const [previewColumns, setPreviewColumns] = useState<[]>([]); //数据目录预览表格列（从后端获取）
  //标签列表
  const [tagList, setTagList] = useState<{ label: string; value: string }[]>(
    []
  );
  const [inputValue, setInputValue] = useState('');
  // 标签选项

  useImperativeHandle(ref, () => {
    const resetForm = () => {
      // form.resetFields();
      form.setFieldValue('name', '');
      // form.setFieldValue('targetDataSource', '');
      setDataSource('volume'); //重置数据源
      setSelectedConnector(null); //重置连接器
      setSelectedFiles([]); //重置选择文件
      setConnectorFileInformation([]); //重置连接器文件信息
      setPreviewData([]); //重置预览数据
      setPreviewColumns([]); //重置预览表格列
      // setTargetDataSourceOptions([]); //重置目标数据源选项
    };
    return {
      resetForm
    };
  });

  useEffect(() => {
    // 数据目录卷
    getCatalogList({ root_type: 2 }).then((res) => {
      setTargetDataSourceOptions(
        convertToCascaderOptions(res?.data?.dst ?? [])
      );
    }); //获取数据来源中数据目录卷中的选项（不可以直接使用，需要处理数据）
    // setTargetDataSourceOptions(
    //   convertToCascaderOptions(cstargetDataSourceData)
    // ); //测试数据

    //连接器
    // TODO: ts错误
    // @ts-expect-error
    getConnectorList({ scope: 1 }).then((res) => {
      setConnectorList(convertToSelectOptions(res?.data?.items ?? []));
    });
    // setConnectorList(convertToSelectOptions(csconnectorList));//测试数据

    //标签
    getTagList().then((res) => {
      setTagList(convertTotagSelectOptions(res.data));
    });
    // setTagList(convertTotagSelectOptions(tagOptions)); //测试数据
  }, []);

  // 处理数据来源变化
  const handleDataSourceChange = (value: 'volume' | 'connector') => {
    setDataSource(value);
    form.setFieldValue('dataSource', value);
    setShowFileSelection(false); //不显示文件选择
    setShowDataPreview(false); //不显示数据预览
    setSelectedConnector(null); //清除连接器选择
    setSelectedFiles([]);
    setConnectorFileInformation([]); //清除连接器文件信息
    // TODO：ts错误
    // @ts-expect-error
    setPreviewData(null);
    setPreviewColumns([]); //重置表格列
    // 清除表单字段
    form.setFieldValue('connector', undefined);
    form.setFieldValue('selectedFiles', []);
  };

  // 处理目标数据源选择
  const handleTargetDataSourceChange = (
    value: string | (string | string[])[]
  ) => {
    if (dataSource === 'volume') {
      console.log('选择的值:', value);

      // 判断是一级目录还是二级目录
      if (Array.isArray(value) && Array.isArray(value[0])) {
        // 二级目录选择：value = [[catalog.base_dir, catalog.name], [volume.name, volume.id]]
        const catalogpath = value[0][0];
        const catalogId = value[0][1];
        const selectedItem = value[1]?.[0];
        const path = `${catalogpath}dst/${catalogId}/volume/${selectedItem}`;
        console.log('二级目录路径:', path);
        if (selectedItem == undefined) {
          return;
        }
        getVolumePreviewData(path);
      } else if (Array.isArray(value) && value.length === 2) {
        return;
      }
    }
  };

  // 处理连接器选择
  const handleConnectorChange = (value: string) => {
    console.log('选择的连接器ID:', value);
    setSelectedConnector(value);
    form.setFieldValue('connector', value);
    // 清除之前的文件选择
    setSelectedFiles([]);
    setConnectorFileInformation([]);
    form.setFieldValue('selectedFiles', []);
    // 获取连接器文件信息
    getConnectorFileInformationfun(value, 'jsonl');
  };

  // 模拟连接器文件数据
  const getConnectorFileInformationfun = (id: string, type: 'jsonl') => {
    getConnectorFileList({ connector_id: id, type: type })
      .then((res) => {
        // 判断接口返回状态
        if (res.stat !== 0 && !res.code) {
          // 有业务结果且无错误
          if (res.data && Array.isArray(res.data.files)) {
            setConnectorFileInformation(res.data.files);
          } else {
            setConnectorFileInformation([]);
            console.warn('文件列表为空或格式不正确');
          }
        } else {
          // 无业务结果或接口返回错误
          console.error('获取文件列表失败:', res.msg);
          setConnectorFileInformation([]);
        }
      })
      .catch((error) => {
        console.error('请求文件列表出错:', error);
        setConnectorFileInformation([]);
      });
  }; //查询指定连接器加载成功的文件信息

  // 获取数据目录卷预览数据的方法
  const getVolumePreviewData = (volumeId: string) => {
    // 这里应该调用真实的API
    getCatalogPreview({ path: volumeId }).then((res) => {
      console.log(11111, res);
      if (res.status !== 200) {
        Message.error(res.message);
        setPreviewData([]);
        setPreviewColumns([]);
        return;
      }
      setPreviewData(res.data.list || []); //这里的数据不能直接赋值，需要处理一下
      setPreviewColumns(formatTableData(res.data.field_names)); //设置表格列（从后端返回的列配置）
    });

    // setPreviewData(csmockPreviewData);
    // setPreviewColumns(formatTableData(cspreviewColumns)); //模拟从后端获取的columns配置
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
        onSubmit(formData);
      })
      .catch((error) => {
        console.log('表单验证失败:', error);
      });
  };

  return (
    <div className={styles.datasetForm}>
      <Modal
        title="新建数据集"
        visible={visible}
        footer={null}
        style={{ width: '960px', minHeight: '436px' }}
        onCancel={onCancel}
        maskClosable={false}
        className={styles.modalWrapper}
        // unmountOnExit={true}
      >
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
            rules={[
              { required: true, message: '请输入数据集名称' },
              {
                validator: (value, callback) => {
                  if (!validateName(value)) {
                    callback('数据集名称格式不正确');
                  } else {
                    callback();
                  }
                }
              }
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input
              maxLength={128}
              showWordLimit
              style={{ width: '100%', marginLeft: 10 }}
              placeholder="输入数据集名称..."
            />
          </Form.Item>
          <div className="formSelect">
            <FormItem
              label="标签:"
              field="tags"
              rules={[{ required: false, message: '请选择至少一个标签' }]}
            >
              <Select
                placeholder="请输入或选择标签..."
                mode="multiple"
                options={tagList}
                allowCreate
                style={{ marginLeft: 10 }}
                maxTagCount={{
                  count: 10,
                  render: (invisibleTagCount) => {
                    // 从当前表单值获取完整的标签列表
                    const allTags = form.getFieldValue('tags') || [];
                    const remainingTags = allTags.slice(10);
                    const remainingLabels = remainingTags.join(', ');
                    return (
                      <Tooltip content={`剩余标签: ${remainingLabels}`}>
                        <span>+{invisibleTagCount}</span>
                      </Tooltip>
                    );
                  }
                }}
              />
            </FormItem>
          </div>
          <FormItem
            label="描述说明:"
            field="description"
            rules={[{ required: false, message: '请输入描述信息' }]}
            extra={
              <span
                style={{ fontSize: '12px', color: '#86909c', marginLeft: 10 }}
              >
                指定导出文件的保存路径目录
              </span>
            }
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

          {dataSource === 'volume' && (
            <div
              style={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                padding: '10px 30px 10px 0px',
                marginLeft: 20
              }}
            >
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
                  style={{ marginLeft: 10, marginRight: 20 }}
                  onChange={handleTargetDataSourceChange}
                  expandTrigger="hover"
                  dropdownMenuColumnStyle={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '400px',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}
                />
              </FormItem>
              <div
                style={{
                  marginLeft: 20,
                  marginTop: 8,
                  fontSize: '12px',
                  color: '#86909c'
                }}
              >
                {previewData ? (
                  <span>
                    <span style={{ fontWeight: '500', color: '#000' }}>
                      预览
                    </span>{' '}
                    目前平台仅支持格式为JSON的数据，并且按照KV对的格式进行解析，预览仅限显示前50行数据：
                  </span>
                ) : (
                  <span>
                    <span style={{ fontWeight: '500', color: '#000' }}>
                      预览：
                    </span>
                    请先选择目标数据目录卷/卷
                  </span>
                )}
              </div>
              {previewData ? (
                <div className={styles.previewContainer}>
                  <Table
                    className={styles.previewTable}
                    columns={previewColumns}
                    data={previewData}
                    pagination={false}
                    scroll={{
                      x: Math.max(800, previewColumns.length * 200),
                      y: 300
                    }}
                    size="small"
                    loading={false}
                    placeholder="暂无数据"
                  />
                </div>
              ) : null}
            </div>
          )}

          {dataSource === 'connector' && (
            <div
              style={{
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                padding: '10px 30px 10px 0px',
                marginLeft: 20
              }}
            >
              <FormItem
                label="选择连接器:"
                field="connector"
                rules={[{ required: true, message: '请选择连接器' }]}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                <Select
                  placeholder="请选择连接器"
                  options={connectorList}
                  style={{ marginLeft: 10 }}
                  onChange={handleConnectorChange}
                  value={selectedConnector || undefined}
                />
              </FormItem>

              <FormItem
                label="选择数据文件:"
                field="selectedFiles"
                rules={[{ required: true, message: '请选择至少一个文件' }]}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                extra={
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#86909c',
                      marginLeft: 10
                    }}
                  >
                    目前平台仅支持JSON格式保存的数据集，所以此处仅展示JSON格式的文件
                  </span>
                }
              >
                <Tooltip
                  content={!selectedConnector ? '请先选择连接器' : ''}
                  disabled={!!selectedConnector}
                >
                  <div style={{ marginLeft: 10 }}>
                    <Select
                      placeholder={
                        !selectedConnector
                          ? '请先选择连接器'
                          : '请选择要使用的文件...'
                      }
                      mode="multiple"
                      // options={connectorFileInformation}
                      disabled={!selectedConnector}
                      onChange={(values) => {
                        // labelInValue 为 true 时，values 是对象数组
                        const fileValues = values.map(
                          (v: OptionInfo) => v.value
                        );
                        setSelectedFiles(fileValues);
                        form.setFieldValue('selectedFiles', fileValues);
                      }}
                      value={selectedFiles}
                      style={{ width: '100%' }}
                      labelInValue
                      renderFormat={(option: OptionInfo | null) => {
                        const value =
                          String(option?.value ?? '')
                            .split('/')
                            .pop() || '';
                        return (
                          <Tooltip content={value}>
                            <div
                              style={{
                                display: 'inline-block',
                                maxWidth: 200,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                verticalAlign: 'middle'
                              }}
                            >
                              {value}
                            </div>
                          </Tooltip>
                        );
                      }}
                      maxTagCount={{
                        count: 3,
                        render: (invisibleTagCount) => {
                          // 从当前表单值获取完整的标签列表
                          const allTags =
                            form.getFieldValue('selectedFiles') || [];
                          const remainingTags = allTags.slice(3);
                          const remainingLabels = remainingTags.map((s) =>
                            s.trim().split('/').pop()
                          );
                          return (
                            <Tooltip content={`剩余标签: ${remainingLabels}`}>
                              <span>+{invisibleTagCount}</span>
                            </Tooltip>
                          );
                        }
                      }}
                      filterOption={(inputValue, option) => {
                        const newvalue = option.props.value.split('/').pop();
                        return newvalue.includes(inputValue);
                      }}
                      onSearch={(value) => {
                        setInputValue(value);
                      }}
                    >
                      {connectorFileInformation.map((item, index) => (
                        <Option key={index} value={item.path + '/' + item.name}>
                          <div
                            style={{
                              fontFamily: 'Arial, sans-serif',
                              fontSize: '14px',
                              color: '#4E5969',
                              lineHeight: '1.8',
                              margin: '10px'
                            }}
                          >
                            <div>{highlight(item.name, inputValue)}</div>
                            <div style={{ color: '#86909c' }}>
                              修改时间：{formatDateTime(item.last_modified)}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Tooltip>
              </FormItem>
            </div>
          )}

          <FormItem wrapperCol={{ span: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                marginTop: '24px'
                // paddingTop: '20px',
                // borderTop: '1px solid #f0f0f0'
              }}
            >
              <Button onClick={onCancel}>取消</Button>
              <Button type="primary" onClick={handleSubmit}>
                确定
              </Button>
            </div>
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
});

export default DatasetForm;
