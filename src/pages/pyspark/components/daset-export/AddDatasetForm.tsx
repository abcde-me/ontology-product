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
  Message,
  Tag,
  Pagination
} from '@arco-design/web-react';
import type { OptionInfo } from '@arco-design/web-react/es/Select/interface';
import EllipsisPopover from '@/components/ellipsis-popover-com';
const { Option } = Select;
import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import styles from './AddDatasetForm.module.css';
import './AddDatasetForm.css';
import { getCatalogList, getCatalogPreview } from '@/api/dataCatalog';
import { validateName } from '@/utils/valiate';
import {
  getConnectorList,
  getConnectorFileList,
  getTagList,
  getTargetDataFileList
} from '@/api/datasetManagement';
import { debounce } from 'lodash-es';
import getFileIcon from '@/components/file-icon';
import { getExportFile, getExportJsonl } from '@/api/pyspark';
import { GetExportFile } from '@/types/pythonApi';
import { formatFileSize, formatTime } from '@/utils/format';
import timeFormattig from '@/utils/timeFormatting';
const { Text } = Typography;

interface Dataset {
  key?: string;
  name: string;
  tag_names: string[];
  description: string;
  dataSource: 'volume' | 'connector';
  storageType: StorageType;
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
  sub_path: string;
  file_id: string;
}

enum StorageType {
  Jsonl = 'jsonl',
  File = 'file',
  DataBaseTable = 'dataBaseTable'
}

interface DatasetFormProps {
  pysparkId: number;
  execid: string;
  visible: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
}

const FormItem = Form.Item;

// 转换函数：将新数据格式转换为 Cascader 组件需要的格式
function convertToCascaderOptions(dataSourceData) {
  return dataSourceData.map((catalog) => ({
    label: <EllipsisPopover value={catalog.name}></EllipsisPopover>,
    // label: catalog.name,
    value: [catalog.base_dir, catalog.name],
    children:
      catalog.children && catalog.children.volume
        ? catalog.children.volume.map((volume) => ({
            label: <EllipsisPopover value={volume.name}></EllipsisPopover>,
            // label: volume.name,
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

//连接器文件信息转换为select选项的函数，咱不使用
function transformToSelectOptions(fileList) {
  return fileList.map((file) => ({
    label: `${file.name}`,
    value: file.path,
    data: file
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
  const { visible, onSubmit, onCancel, pysparkId, execid } = props;
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<'volume' | 'connector'>(
    'volume'
  ); //数据来源,判断是数据目录卷还是连接器，volume是数据目录卷，connector是连接器
  const [storageType, setStorageType] = useState<StorageType>(StorageType.File);
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
  const [previewData, setPreviewData] = useState(null); //数据目录预览数据
  const [isPreviewFile, setIsPreviewFile] = useState(false); //数据目录文件预览数据
  const [previewFileData, setPreviewFileData] = useState<
    GetExportFile[] | null
  >(null); //数据目录文件预览数据
  const [previewColumns, setPreviewColumns] = useState<[]>([]); //数据目录预览表格列（从后端获取）
  //标签列表
  const [tagList, setTagList] = useState<{ label: string; value: string }[]>(
    []
  );
  //是否禁用新建标签·
  const [iscreateTagDisabled, setIscreateTagDisabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [targetData, setTargetData] = useState<string | (string | string[])[]>(
    []
  );
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
      setIsPreviewFile(false);
      setPreviewFileData(null);
      form.setFieldValue('dataSource', 'volume');
      form.setFieldValue('storageType', StorageType.File);
      setIscreateTagDisabled(false);
      // form.setFieldValue('tag', undefined);
      // setTargetDataSourceOptions([]); //重置目标数据源选项
    };
    const setcreateTagDisabled = () => {
      setIscreateTagDisabled(false);
    };
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
    form.setFieldValue('targetDataSource', undefined);
    setDataSource(value);
    form.setFieldValue('dataSource', value);
    setShowFileSelection(false); //不显示文件选择
    setShowDataPreview(false); //不显示数据预览
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
    setShowFileSelection(false); //不显示文件选择
    setShowDataPreview(false); //不显示数据预览
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
  // const handleTargetDataSourceChange = (
  //   value: string | (string | string[])[]
  // ) => {
  //   if (dataSource === 'volume') {
  //     console.log('选择的值:', value);
  //     setTargetData(value);

  //     // 判断是一级目录还是二级目录
  //     if (Array.isArray(value) && Array.isArray(value[0])) {
  //       // 二级目录选择：value = [[catalog.base_dir, catalog.name], [volume.name, volume.id]]

  //       // const catalogpath = value?.[0]?.[0];
  //       // const catalogId = value?.[0]?.[1];
  //       const selectedItem = value?.[1]?.[0];
  //       // const basePath = String(catalogpath?.[0]?.[0]??'');
  //       // const formattedPath =
  //       //   basePath.length > 1 && basePath.endsWith('/')
  //       //     ? `${basePath}/`
  //       //     : basePath;
  //       // const path = `${formattedPath}dst/${catalogId}/volume/${selectedItem}`;
  //       if (selectedItem == undefined) {
  //         setPreviewColumns([]);
  //         Message.warning('请选择二级目录！');
  //         return;
  //       }
  //       // getVolumePreviewData(path);
  //       getVolumePreviewData(
  //         value?.[1]?.[1],
  //         '/dst/' + value?.[0]?.[1] + '/volume/' + value?.[1]?.[0]
  //       );
  //     } else if (Array.isArray(value) && value.length === 2) {
  //       return;
  //     }
  //   }
  // };

  // 处理连接器选择
  // const handleConnectorChange = (value: string) => {
  //   console.log('选择的连接器ID:', value);
  //   setSelectedConnector(value);
  //   form.setFieldValue('connector', value);
  //   // 清除之前的文件选择
  //   setSelectedFiles([]);
  //   setConnectorFileInformation([]);
  //   form.setFieldValue('selectedFiles', []);
  //   // 获取连接器文件信息
  //   getConnectorFileInformationfun(
  //     value,
  //     storageType === StorageType.File ||
  //       storageType === StorageType.DataBaseTable
  //       ? ''
  //       : 'jsonl'
  //   );
  // };

  // 模拟连接器文件数据
  // const getConnectorFileInformationfun = (id: string, type?: string) => {
  //   getConnectorFileList({ connector_id: id, type: type })
  //     .then((res) => {
  //       // 判断接口返回状态
  //       if (res.stat !== 0 && !res.code) {
  //         // 有业务结果且无错误
  //         if (res.data && Array.isArray(res.data.files)) {
  //           setConnectorFileInformation(res.data.files);
  //         } else {
  //           setConnectorFileInformation([]);
  //           console.warn('文件列表为空或格式不正确');
  //         }
  //       } else {
  //         // 无业务结果或接口返回错误
  //         console.error('获取文件列表失败:', res.msg);
  //         setConnectorFileInformation([]);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('请求文件列表出错:', error);
  //       setConnectorFileInformation([]);
  //     });
  // }; //查询指定连接器加载成功的文件信息

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
    // 仅在 current 或 pageSize 变化时执行
    getVolumePreviewData();
  }, [storageType]);

  // 获取数据目录卷预览数据的方法
  const getVolumePreviewData = () => {
    setTableLoading(true);
    // 这里应该调用真实的API
    if (storageType === StorageType.Jsonl) {
      getExportJsonl({
        pyspark_id: pysparkId,
        pyspark_exec_id: execid
      })
        .then((res) => {
          if (res.status !== 200) {
            Message.error(res.message);
            setPreviewData(null);
            setPreviewColumns([]);
            return;
          }
          setPreviewData(stringifyFirstLevelValues(res.data.list || []));
          setPreviewColumns(formatTableData(res.data.field_names)); //设置表格列（从后端返回的列配置）
        })
        .finally(() => {
          setTableLoading(false);
        });
    } else if (storageType === StorageType.File) {
      getExportFile({
        pyspark_id: pysparkId,
        pyspark_exec_id: execid
      }).then((res) => {
        if (res.status !== 200) {
          Message.error(res.message);
          setIsPreviewFile(false);
          return;
        }
        setIsPreviewFile(true);
        setPreviewFileData(res?.data ?? []);
      });
    }

    // setPreviewData(csmockPreviewData);
    // setPreviewColumns(formatTableData(cspreviewColumns)); //模拟从后端获取的columns配置
  };

  const mapselectFiles = (files: any[]) => {
    console.log('files', files);
    return files.map((item) => item.file_name);
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
          selectedFiles,
          targetDataSource:
            dataSource === 'volume'
              ? values.targetDataSource
              : values.connector, //数据目录卷用targetDataSource，连接器用connector
          path_file_ids: fileIds
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
    // {
    //   title: '文件ID',
    //   dataIndex: 'id',
    //   width: 80
    // },
    {
      title: '文件名',
      dataIndex: 'file_name',
      ellipsis: true,
      width: 300,
      render: (_, record) => (
        <EllipsisPopover
          value={record?.file_name || '-'}
          isEdit={false}
          preferTypography
        />
      )
    },
    {
      title: '文件类型',
      dataIndex: 'file_type', // 使用动态获取的文件类型筛选器
      width: 134,
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {getFileIcon(record?.file_type)}
          <span>{record?.file_type}</span>
        </div>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'file_size', // 使用动态获取的文件类型筛选器
      width: 134,
      render: (_, record) => (
        <span>{formatFileSize(record?.file_size) || '-'}</span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'file_modify_time', // 使用动态获取的文件类型筛选器
      width: 200,
      render: (_, record) => (
        <span>
          {timeFormattig(new Date(record?.file_modify_time).getTime()) || '-'}
        </span>
      )
    }
  ];

  return (
    <Modal
      title="导出数据集"
      visible={visible}
      footer={null}
      style={{ width: '960px' }}
      onCancel={onCancel}
      maskClosable={false}
      unmountOnExit={true}
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
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
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
              maxLength={128}
              showWordLimit
              // style={{ width: '100%', marginLeft: 10 }}
              placeholder="输入数据集名称"
            />
          </Form.Item>
          <div className="formSelect">
            <FormItem
              label="标签"
              field="tag_names"
              rules={[{ required: false, message: '请选择至少一个标签' }]}
            >
              <Select
                placeholder="请输入或选择标签"
                mode="multiple"
                options={tagList}
                dropdownMenuClassName={styles.dropdownMenuSelect}
                allowCreate
                // style={{ marginLeft: 10 }}
                maxTagCount={{
                  count: 10,
                  render: (invisibleTagCount) => {
                    // 从当前表单值获取完整的标签列表
                    const allTags = form.getFieldValue('tag_names') || [];
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
            label="数据集类型"
            field="storageType"
            rules={[{ required: true, message: '请选择数据集类型' }]}
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
              {/* <Radio value={StorageType.DataBaseTable}>数据库表</Radio> */}
            </Radio.Group>
          </FormItem>

          {/* {dataSource === 'volume' && ( */}
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
            {/* <FormItem
              label="选择目标数据目录/卷"
              field="targetDataSource"
              rules={[{ required: true, message: '请选择目标数据目录卷' }]}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Cascader
                placeholder="请选择"
                //@ts-expect-error
                renderFormat={(labels, selectedOptions) => {
                  const value = `${labels?.[0]?.props?.value} / ${labels?.[1]?.props?.value}`;
                  return (
                    <div>
                      <EllipsisPopover value={value}></EllipsisPopover>
                    </div>
                  );
                }}
                options={targetDataSourceOptions}
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
                dropdownMenuClassName="showData"
              />
            </FormItem> */}
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
                  <span style={{ fontWeight: '500', color: '#000' }}>预览</span>{' '}
                  {storageType === StorageType.File
                    ? '文件格式数据集暂不支持数据预览，仅显示选中的文件列表：'
                    : storageType === StorageType.Jsonl
                      ? '目前平台仅支持格式为JSON的数据，并且按照KV对的格式进行解析，预览仅限显示前50行数据：'
                      : '数据表格式数据集支持数据预览，显示表格结构和前50行数据：'}
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
                  rowKey="file_name"
                  columns={fileColumns}
                  data={previewFileData}
                  pagination={false}
                  rowSelection={{
                    type: 'checkbox',
                    onChange: (selectedRowKeys, selectedRows) => {
                      // if (selectedRowKeys.length > 0) {
                      //   setSelectedFiles(selectedRowKeys as string[]);
                      // }
                      setSelectedFiles(selectedRowKeys as string[]);
                    }
                  }}
                />
              </>
            ) : null}
          </div>
          {/* )} */}

          {/* {dataSource === 'connector' && (
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
                  storageType === StorageType.File ||
                    storageType === StorageType.DataBaseTable ? (
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
                          ? '请先选数据文件'
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
          )} */}

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
