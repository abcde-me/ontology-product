import {
  Form,
  Input,
  Button,
  Select,
  Space,
  Radio,
  Table,
  Cascader,
  Modal,
  Tooltip,
  Message,
  Tag,
  Pagination
} from '@arco-design/web-react';
import type { OptionInfo } from '@arco-design/web-react/es/Select/interface';
import EllipsisPopover from '@/components/ellipsis-popover-com';
const { Option } = Select;
import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import styles from './AddDatasetForm.module.scss';
import './AddDatasetForm.scss';
import { getCatalogList, getSourceDataFileList } from '@/api/dataCatalog';
import { validateName } from '@/utils/valiate';
import {
  getConnectorList,
  getConnectorFileList,
  getTagList,
  getTargetDataFileList
} from '@/api/datasetManagement';
import { debounce } from 'lodash-es';
import getFileIcon from '../file-icon';
import { SceneType } from '@/pages/datasetManagement';
import { formatFileSize } from '@/utils/format';

interface Dataset {
  key?: string;
  name: string;
  tags: string[];
  description: string;
  dataSource: 'volume' | 'connector';
  storageType: StorageType;
  targetDataSource?: string;
  selectedFiles?: string[];
}

interface ConnectorFile {
  name: string;
  path: string;
  size: number;
  last_modified: string;
  type: string;
  sub_path: string;
  file_id: string;
}

enum StorageType {
  Jsonl = 'jsonl',
  File = 'file'
}

interface FileItem {
  abs_data_path: string;
  connector_id: number;
  connector_name: string;
  data_path_id: number;
  execution_id: string;
  file_name: string;
  file_size: number;
  file_sub_path: string;
  file_type: string;
  file_uuid: string;
  id: number;
  perms: Array<string>;
  real_abs_data_path: string;
  task_load_start_time: string;
  upload_user: string;
}

interface DatasetFormProps {
  visible: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  sceneOption: SceneType[];
}

const FormItem = Form.Item;

// 转换函数：将新数据格式转换为 Cascader 组件需要的格式
function convertToCascaderOptions(dataSourceData) {
  return dataSourceData.map((catalog) => ({
    label: catalog.name,
    // label: catalog.name,
    value: [catalog.base_dir, catalog.name],
    disabled: !catalog?.children?.volume,
    children:
      catalog.children && catalog.children.volume
        ? catalog.children.volume.map((volume) => ({
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

function itemPathDisplay(item) {
  // 如果 sub_path 为空，显示短横线
  if (item === '') return <span>-</span>;

  // 如果长度小于等于 5，显示完整内容，否则截取前五个字符加省略号
  const displayPath =
    item.length <= 5 ? item.sub_path : `${item.substring(0, 5)}...`;

  return <span style={{ color: '#334155' }}>{displayPath}</span>;
}

//连接器列表转换为select选项 函数
function convertToSelectOptions(connectorList) {
  return connectorList.map((connector) => ({
    label: (
      // <Tooltip content={connector.name}>
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
      // </Tooltip>
    ),
    value: connector.id
  }));
}

// 格式化日期时间
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    <span>
      {date.getFullYear()}-{pad(date.getMonth() + 1)}-{pad(date.getDate())}{' '}
      {pad(date.getHours())}:{pad(date.getMinutes())}:{pad(date.getSeconds())}
    </span>
  );
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

function formatTableData(columns) {
  const columnCount = columns.length;
  // 根据列数量决定列宽：少于4列时均分，否则固定260px
  const columnWidth = columnCount < 4 ? undefined : 260;

  return columns.map((col) => ({
    title: col.charAt(0).toUpperCase() + col.slice(1), // 格式化列标题
    dataIndex: col, // 对应 data 中的键
    key: col, // 唯一标识符
    ellipsis: true, // 启用省略号
    width: columnWidth, // 动态设置宽度
    render: (text: any) => {
      // 处理长文本显示
      const textStr = String(text || '');

      return (
        <EllipsisPopover value={textStr} isEdit={false} preferTypography />
      );
    }
  }));
}

const DatasetForm = React.forwardRef<
  { resetForm: () => void },
  DatasetFormProps
>((props, ref) => {
  const { visible, onSubmit, onCancel, sceneOption } = props;
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<'volume' | 'connector'>(
    'volume'
  ); //数据来源,判断是数据目录卷还是连接器，volume是数据目录卷，connector是连接器
  const [storageType, setStorageType] = useState<StorageType>(StorageType.File);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(
    null
  ); //选择的连接器ID
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); //选择文件
  const [targetDataSourceOptions, setTargetDataSourceOptions] = useState([]); //目标数据源选项
  const [connectorList, setConnectorList] = useState([]); //连接器列表
  const [connectorFileInformation, setConnectorFileInformation] = useState<
    ConnectorFile[]
  >([]); //连接器文件信息
  const [previewData, setPreviewData] = useState(null); //数据目录预览数据
  const [isPreviewFile, setIsPreviewFile] = useState(false); //数据目录文件预览数据
  const [previewFileData, setPreviewFileData] = useState<FileItem[] | null>(
    null
  ); //数据目录文件预览数据
  const [previewColumns, setPreviewColumns] = useState<[]>([]); //数据目录预览表格列（从后端获取）
  //标签列表
  const [tagList, setTagList] = useState<{ label: string; value: string }[]>(
    []
  );
  const [inputValue, setInputValue] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [targetData, setTargetData] = useState<string | (string | string[])[]>(
    []
  );
  const [filesType, setFilesType] = useState<StorageType>(StorageType.File);
  // 选择的文件ID
  const [fileIds, setFileIds] = useState<string[]>([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 使用 useRef 来标记是否是首次渲染
  const isInitialMount = useRef(true);

  useImperativeHandle(ref, () => {
    const resetForm = () => {
      form.resetFields();
      form.setFieldValue('name', '');
      // form.setFieldValue('targetDataSource', '');
      setDataSource('volume'); //重置数据源
      setStorageType(StorageType.File); //重置数据集类型
      setSelectedConnector(null); //重置连接器
      setSelectedFiles([]); //重置选择文件
      setConnectorFileInformation([]); //重置连接器文件信息
      setPreviewData(null); //重置预览数据
      setPreviewColumns([]); //重置预览表格列
      setFileIds([]);
      setIsPreviewFile(false);
      setPreviewFileData(null);
      form.setFieldValue('dataSource', 'volume');
      form.setFieldValue('storageType', StorageType.File);
      // form.setFieldValue('tag', undefined);
      // setTargetDataSourceOptions([]); //重置目标数据源选项
    };
    const setcreateTagDisabled = () => {};
    return {
      resetForm,
      setcreateTagDisabled
    };
  });

  useEffect(() => {
    return () => {
      observer.disconnect();
    };
  }, []);

  // 创建 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(() => {
    const items = document.querySelectorAll('.arco-cascader-list-item');
    const input = document.querySelectorAll('.arco-cascader-view');
    items.forEach((item) => item.removeAttribute('title'));
    input.forEach((item) => item.removeAttribute('title'));
  });

  // 开始监听整个文档
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  useEffect(() => {
    // 数据目录卷
    getCatalogList({}).then((res) => {
      setTargetDataSourceOptions(
        convertToCascaderOptions(res?.data?.src ?? [])
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
    form.setFieldValue('targetDataSource', undefined);
    setDataSource(value);
    form.setFieldValue('dataSource', value);
    setSelectedConnector(null); //清除连接器选择
    setSelectedFiles([]);
    setConnectorFileInformation([]); //清除连接器文件信息
    setPreviewData(null);
    setIsPreviewFile(false);
    setPreviewFileData(null); //重置文件预览数据
    setPreviewColumns([]); //重置表格列
    // 清除表单字段
    form.setFieldValue('connector', undefined);
    form.setFieldValue('selectedFiles', []);
  };

  // 处理数据集类型变化
  const handleStorageTypeChange = (value: StorageType) => {
    form.setFieldValue('targetDataSource', undefined);
    setStorageType(value);
    form.setFieldValue('storageType', value);
    setSelectedConnector(null); //清除连接器选择
    setSelectedFiles([]);
    setConnectorFileInformation([]); //清除连接器文件信息
    setPreviewData(null);
    setIsPreviewFile(false);
    setPreviewFileData(null); //重置文件预览数据
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
      setCurrent(1);
      setTargetData(value);

      // 判断是一级目录还是二级目录
      if (Array.isArray(value) && Array.isArray(value[0])) {
        // 二级目录选择：value = [[catalog.base_dir, catalog.name], [volume.name, volume.id]]

        const selectedItem = value?.[1]?.[0];
        if (selectedItem == undefined) {
          setPreviewColumns([]);
          Message.warning('请选择二级目录！');
          return;
        }
        // getVolumePreviewData(path);
        getVolumePreviewData(
          value?.[1]?.[1],
          value?.[0]?.[0] === '/'
            ? '/dst/' + value?.[0]?.[1] + '/volume/' + value?.[1]?.[0]
            : value?.[0]?.[0] +
                '/dst/' +
                value?.[0]?.[1] +
                '/volume/' +
                value?.[1]?.[0]
        );
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
    getConnectorFileInformationfun(
      value,
      storageType === StorageType.File ? '' : 'jsonl'
    );
  };

  // 模拟连接器文件数据
  const getConnectorFileInformationfun = (id: string, type?: string) => {
    getConnectorFileList({ id, type })
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

  const stringifyFirstLevelValues = (obj) => {
    return obj.map((item) => {
      const newobj = {};
      for (const key in item) {
        try {
          if (typeof item[key] !== 'string') {
            newobj[key] = JSON.stringify(item[key]);
            continue;
          } else {
            newobj[key] = item[key];
          }
        } catch {
          newobj[key] = '';
        }
      }
      return newobj;
    });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // 仅在 current 或 pageSize 变化时执行
    getVolumePreviewData(
      targetData?.[1]?.[1],
      targetData?.[0]?.[0] === '/'
        ? '/dst/' + targetData?.[0]?.[1] + '/volume/' + targetData?.[1]?.[0]
        : targetData?.[0]?.[0] +
            '/dst/' +
            targetData?.[0]?.[1] +
            '/volume/' +
            targetData?.[1]?.[0]
    );
  }, [current, pageSize]);

  // 获取数据目录卷预览数据的方法
  const getVolumePreviewData = (volumeId: string, file_path: string) => {
    setTableLoading(true);
    // 这里应该调用真实的API
    // if (storageType === StorageType.Jsonl) {
    //   getCatalogPreview({ path_id: volumeId })
    //     .then((res) => {
    //       if (res.status !== 200) {
    //         Message.error(res.message);
    //         setPreviewData(null);
    //         setPreviewColumns([]);
    //         return;
    //       }
    //       setPreviewData(stringifyFirstLevelValues(res.data.list || []));
    //       setPreviewColumns(formatTableData(res.data.field_names)); //设置表格列（从后端返回的列配置）
    //     })
    //     .finally(() => {
    //       setTableLoading(false);
    //     });
    // } else if (storageType === StorageType.File) {
    const params = {
      data_path_id: Number(volumeId),
      file_name: '',
      page: current,
      page_size: pageSize,
      file_type: [],
      start: '',
      end: ''
    };
    getSourceDataFileList(params).then((res) => {
      if (res.data && res.code === '') {
        setIsPreviewFile(true);
        setPreviewFileData(res.data.items || []);
        setTotal(res.data.total);
      } else {
        Message.error(res.message);
        setIsPreviewFile(false);
      }
    });
    // }

    // setPreviewData(csmockPreviewData);
    // setPreviewColumns(formatTableData(cspreviewColumns)); //模拟从后端获取的columns配置
  };

  const mapselectFiles = (files: any[]) => {
    return files.map((item) => {
      return Number(item.split('/').shift());
    });
  };
  //提交数据
  const handleSubmit = debounce(() => {
    form
      .validate()
      .then(async (values) => {
        console.log('表单验证成功:', values);
        const formData: Dataset = {
          ...values,
          dataSource,
          selectedFiles:
            dataSource === 'connector'
              ? mapselectFiles(selectedFiles)
              : undefined, //如果数据源是连接器，则设置选择文件
          targetDataSource:
            dataSource === 'volume'
              ? values.targetDataSource
              : values.connector, //数据目录卷用targetDataSource，连接器用connector
          path_file_ids: fileIds,
          data_type: filesType
        };
        // setIscreateTagDisabled(true);

        setCanSubmit(false);
        await onSubmit(formData);

        setCanSubmit(true);
      })
      .catch((error) => {
        console.log('表单验证失败:', error);
      })
      .finally(() => {
        setCanSubmit(true);
      });
  }, 500);

  const fileColumns = [
    {
      title: '文件ID',
      dataIndex: 'id',
      width: 80
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      ellipsis: true,
      width: 300,
      render: (_, record) => (
        <EllipsisPopover
          value={record.file_name || '-'}
          isEdit={false}
          preferTypography
        />
      )
    },
    {
      title: '文件类型',
      dataIndex: 'type', // 使用动态获取的文件类型筛选器
      width: 134,
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {getFileIcon(record.file_type)}
          <span>{record.file_type}</span>
        </div>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'file_size', // 使用动态获取的文件类型筛选器
      width: 134,
      render: (_, record) => (
        <span>{formatFileSize(record.file_size) || '-'}</span>
      )
    }
  ];

  return (
    <Modal
      title="新建数据集"
      visible={visible}
      footer={null}
      style={{ width: '600px' }}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setFileIds([]);
        setPreviewFileData(null);
      }}
      maskClosable={false}
      className={styles.modalWrapper}
      // unmountOnExit={true}
    >
      <div
        style={
          {
            // maxHeight: '600px',
            // overflowY: 'auto',
            // paddingRight: '8px'
          }
        }
      >
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
          labelAlign="right"
          colon={true}
        >
          <Form.Item
            label="数据集名称"
            field="name"
            rules={[
              {
                required: true,
                validator: (value, callback) => {
                  if (value === '' || value === undefined) {
                    return callback('请输入数据集名称');
                  }

                  if (!validateName(value).isValid) {
                    return callback(
                      validateName(value).errorMessage ?? '数据集名称格式不正确'
                    );
                  } else {
                    return callback();
                  }
                }
              }
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input
              maxLength={255}
              showWordLimit
              // style={{ width: '100%', marginLeft: 10 }}
              placeholder="输入数据集名称"
            />
          </Form.Item>
          <div className="formSelect">
            <FormItem
              label="标签"
              field="tags"
              rules={[{ required: false, message: '请选择至少一个标签' }]}
            >
              <Select
                placeholder="请输入或选择标签"
                mode="multiple"
                options={tagList}
                className={styles.dropdownSelect}
                dropdownMenuClassName={styles.dropdownMenuSelect}
                allowCreate
                // style={{ marginLeft: 10 }}
                maxTagCount={{
                  count: 10,
                  render: (invisibleTagCount) => {
                    // 从当前表单值获取完整的标签列表
                    const allTags = form.getFieldValue('tags') || [];
                    const remainingTags = allTags.slice(10);
                    // const remainingLabels = remainingTags.join(', ');
                    return (
                      <Tooltip
                        content={remainingTags.map((item, i) => {
                          return (
                            <Tag
                              key={i}
                              style={{
                                height: '24px',
                                background: '#E7ECF0',
                                color: '#0F172A',
                                borderRadius: '2px',
                                fontSize: '12px',
                                // height: '18px',
                                alignItems: 'center',
                                margin: '0 2px'
                              }}
                            >
                              {item}
                            </Tag>
                          );
                        })}
                      >
                        <span>+{invisibleTagCount}</span>
                      </Tooltip>
                    );
                  }
                }}
              />
            </FormItem>
          </div>
          <FormItem
            label="描述说明"
            field="description"
            rules={[{ required: false, message: '请输入描述信息' }]}
            // extra={
            //   <span
            //     style={{ fontSize: '12px', color: '#86909c'}}
            //   >
            //     指定导出文件的保存路径目录
            //   </span>
            // }
          >
            <Input.TextArea
              placeholder="这里输入对数据集的描述和说明信息"
              rows={1}
              maxLength={500}
              showWordLimit
              // style={{ marginLeft: 10 }}
            />
          </FormItem>
          {/* <FormItem
            label="数据来源"
            field="dataSource"
            rules={[{ required: true, message: '请选择数据来源' }]}
            initialValue="volume"
          >
            <Radio.Group
              value={dataSource}
              onChange={handleDataSourceChange}
            // style={{ marginLeft: 10 }}
            >
              <Radio value="volume">数据目录卷</Radio>
              <Radio value="connector">连接器</Radio>
            </Radio.Group>
          </FormItem> */}
          <FormItem
            label="数据来源"
            field="targetDataSource"
            rules={[{ required: true, message: '请选择目标数据来源' }]}
          >
            <Cascader
              placeholder="请选择"
              renderFormat={(labels) => {
                const value = `${labels.join(' / ')}`;
                return (
                  <div>
                    <EllipsisPopover value={value}></EllipsisPopover>
                  </div>
                );
              }}
              options={targetDataSourceOptions}
              onChange={handleTargetDataSourceChange}
              expandTrigger="hover"
              showSearch={{
                retainInputValue: true
              }}
              renderOption={(node) => {
                return (
                  <div>
                    <EllipsisPopover value={node.label} />
                  </div>
                );
              }}
              dropdownMenuColumnStyle={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '400px',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}
              dropdownMenuClassName="showData"
            />
          </FormItem>
          {/* <FormItem
            label="格式类型"
            field="storageType"
            rules={[{ required: true, message: '请选择格式类型' }]}
            initialValue="file"
            extra={
              storageType === StorageType.File
                ? '文件格式：支持各种文件类型，如图片、音频、视频等'
                : storageType === StorageType.Jsonl
                  ? 'JSONL格式：每行一个JSON对象，适用于结构化数据存储'
                  : '数据库表格式：表格形式的数据，支持SQL查询和数据分析'
            }
          >
            <Radio.Group value={storageType} onChange={handleStorageTypeChange}>
              <Radio value={StorageType.File}>文件</Radio>
              <Radio value={StorageType.Jsonl}>jsonl</Radio>
            </Radio.Group>
          </FormItem> */}
          <FormItem
            label="场景分类"
            field="sceneType"
            rules={[{ required: true, message: '请选择场景分类' }]}
          >
            <Select
              placeholder="请选择场景分类"
              renderFormat={(option) => {
                return option?.child?.props?.children?.props?.children[0]?.props
                  ?.children;
              }}
            >
              {sceneOption.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  <div className={`${styles.sceneWrapper} 'flex flex-col'`}>
                    <div className="mt-[7px] text-[14px] leading-[22px]">
                      {item.name}
                    </div>
                    <EllipsisPopover
                      className="mt-[-14px] text-[14px] leading-[22px] text-[#6E7B8D]"
                      value={item.description}
                    />
                  </div>
                </Select.Option>
              ))}
            </Select>
          </FormItem>

          {dataSource === 'volume' && (
            <div
              style={{
                border: '#CBD5E1 1px solid',
                borderRadius: '4px',
                padding: '16px',
                gap: '16px',
                marginLeft: 28,
                overflow: 'hidden'
                // display: 'flex',
                // flexDirection: 'column'
              }}
            >
              <div
                style={{
                  // marginLeft: 20,
                  marginTop: 0,
                  fontSize: '12px',
                  color: '#86909c',
                  marginBottom: 8
                }}
              >
                {previewData || previewFileData ? (
                  <span style={{ fontSize: '14px' }}>
                    <span style={{ fontWeight: '500', color: '#000' }}>
                      预览
                    </span>{' '}
                    {storageType === StorageType.File
                      ? '文件格式数据集暂不支持数据预览，仅显示选中的文件列表：'
                      : '目前平台仅支持格式为JSON的数据，并且按照KV对的格式进行解析，预览仅限显示前50行数据：'}
                  </span>
                ) : (
                  <span style={{ fontSize: '14px' }}>
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
                    // style={{border:null}}
                    border={false}
                    className={styles.previewTable}
                    columns={previewColumns}
                    data={previewData}
                    pagination={false}
                    scroll={{
                      x: Math.max(800, previewColumns.length * 200),
                      y: 250
                    }}
                    size="small"
                    loading={tableLoading}
                    placeholder="暂无数据"
                  />
                </div>
              ) : null}
              {isPreviewFile && previewFileData ? (
                <>
                  <Table
                    rowKey="id"
                    columns={fileColumns}
                    data={previewFileData}
                    pagination={false}
                    rowSelection={{
                      type: 'checkbox',
                      selectedRowKeys: fileIds,
                      onChange: (selectedRowKeys, selectedRows: FileItem[]) => {
                        const isNotJsonl = selectedRows.some(
                          (item) => item.file_type !== 'JSONL'
                        );
                        setFilesType(
                          isNotJsonl ? StorageType.File : StorageType.Jsonl
                        );
                        const newFileIds = [
                          ...new Set([...fileIds, ...selectedRowKeys])
                        ];
                        setFileIds(newFileIds as string[]);
                      }
                    }}
                  />
                  {previewFileData && previewFileData.length > 0 && (
                    <Pagination
                      current={current}
                      pageSize={pageSize}
                      onPageSizeChange={(pageSize) => {
                        setPageSize(pageSize);
                        setCurrent(1);
                      }}
                      onChange={(page) => {
                        setCurrent(page);
                      }}
                      sizeOptions={[10, 20, 50, 100]}
                      showTotal
                      total={total}
                      showJumper
                      sizeCanChange
                      style={{ justifyContent: 'flex-end', marginTop: '10px' }}
                    />
                  )}
                </>
              ) : null}
            </div>
          )}

          {dataSource === 'connector' && (
            <div
              style={{
                border: '#CBD5E1 1px solid',
                borderRadius: '4px',
                padding: '16px',
                gap: '16px',
                marginLeft: 28,
                overflow: 'hidden'
              }}
            >
              <FormItem
                label="选择连接器"
                field="connector"
                rules={[{ required: true, message: '请选择连接器' }]}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                <Select
                  placeholder="请选择连接器"
                  options={connectorList}
                  // style={{ marginLeft: 10 }}
                  onChange={handleConnectorChange}
                  value={selectedConnector || undefined}
                />
              </FormItem>

              <FormItem
                label="选择数据文件"
                field="selectedFiles"
                rules={[{ required: true, message: '请选择至少一个文件' }]}
                labelCol={{ span: 4 }}
                className="form-item-select-files"
                wrapperCol={{ span: 20 }}
                extra={
                  storageType === StorageType.File ? (
                    ''
                  ) : (
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#86909c'
                      }}
                    >
                      目前平台仅支持JSON格式保存的数据集，所以此处仅展示JSON格式的文件
                    </span>
                  )
                }
              >
                <Tooltip
                  content={!selectedConnector ? '请先选择连接器' : ''}
                  disabled={!!selectedConnector}
                >
                  <div>
                    <Select
                      placeholder={
                        !selectedConnector
                          ? '请先选择连接器'
                          : '请选择要使用的文件'
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
                          const remainingLabels = remainingTags.map((s, i) => {
                            return (
                              <Tag
                                key={i}
                                style={{
                                  background: '#E7ECF0',
                                  color: '#0F172A',
                                  // borderRadius: '16px',
                                  fontSize: '12px',
                                  // height: '18px',
                                  alignItems: 'center',
                                  margin: '0 2px'
                                }}
                              >
                                <Tooltip content={s.trim().split('/').pop()}>
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
                                    {s.trim().split('/').pop()}
                                  </div>
                                </Tooltip>
                              </Tag>
                            );
                          });
                          return (
                            <Tooltip
                              style={{ width: 'auto' }}
                              content={<Space wrap>{remainingLabels}</Space>}
                            >
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
                        <Option
                          key={index}
                          value={item.file_id + '/' + item.name}
                        >
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
                            <div style={{ color: '#6E7B8D', fontSize: '14px' }}>
                              <Space size={12}>
                                <span>
                                  所属文件：{itemPathDisplay(item.sub_path)}
                                </span>
                                <span>
                                  修改时间：{formatDateTime(item.last_modified)}
                                </span>
                              </Space>
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
              <Button
                onClick={() => {
                  onCancel();
                  form.resetFields();
                  setFileIds([]);
                  setPreviewFileData(null);
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={!canSubmit}
                onClick={handleSubmit}
              >
                确定
              </Button>
            </div>
          </FormItem>
        </Form>
      </div>
    </Modal>
  );
});

export default DatasetForm;
