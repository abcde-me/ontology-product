import {
  Form,
  Input,
  Button,
  Select,
  Radio,
  Table,
  Modal,
  Tooltip,
  Message,
  Tag
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from './AddDatasetForm.module.css';
import { getCatalogList } from '@/api/dataCatalog';
import { validateName } from '@/utils/valiate';
import { getConnectorList, getTagList } from '@/api/datasetManagement';
import { debounce } from 'lodash-es';
import getFileIcon from '@/components/file-icon';
import { getExportFile, getExportJsonl } from '@/api/pyspark';
import { GetExportFile } from '@/types/pythonApi';
import { formatFileSize } from '@/utils/format';
import timeFormattig from '@/utils/timeFormatting';

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
  const { visible, onSubmit, onCancel, pysparkId, execid } = props;
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<'volume' | 'connector'>(
    'volume'
  ); //数据来源,判断是数据目录卷还是连接器，volume是数据目录卷，connector是连接器
  const [storageType, setStorageType] = useState<StorageType>(
    StorageType.Jsonl
  );
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); //选择文件
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
  const [tableLoading, setTableLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  // 选择的文件ID
  const [fileIds] = useState<string[]>([]);

  useImperativeHandle(ref, () => {
    const resetForm = () => {
      form.resetFields();
      form.setFieldValue('name', '');
      // form.setFieldValue('targetDataSource', '');
      setDataSource('volume'); //重置数据源
      setStorageType(StorageType.Jsonl); //重置数据集类型
      setSelectedFiles([]); //重置选择文件
      setPreviewData(null); //重置预览数据
      setPreviewColumns([]); //重置预览表格列
      setIsPreviewFile(false);
      setPreviewFileData(null);
      form.setFieldValue('dataSource', 'volume');
      form.setFieldValue('storageType', StorageType.Jsonl);
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
    getCatalogList({ root_type: 2 }).then(() => {});

    //连接器
    // TODO: ts错误
    // @ts-expect-error
    getConnectorList({ scope: 1 }).then(() => {});

    //标签
    getTagList().then((res) => {
      setTagList(convertTotagSelectOptions(res.data));
    });
  }, []);

  // 处理数据集类型变化
  const handleStorageTypeChange = (value: StorageType) => {
    form.setFieldValue('targetDataSource', undefined);
    setStorageType(value);
    form.setFieldValue('storageType', value);
    setSelectedFiles([]);
    setPreviewData(null);
    setIsPreviewFile(false);
    setPreviewFileData(null); //重置文件预览数据
    setPreviewColumns([]); //重置表格列
    // 清除表单字段
    form.setFieldValue('connector', undefined);
    form.setFieldValue('selectedFiles', []);
  };

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
    >
      <div>
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
                placeholder="请选择或添加自定义标签"
                mode="multiple"
                options={tagList}
                className={styles.dropdownSelect}
                dropdownMenuClassName={styles.dropdownMenuSelect}
                allowCreate
                style={{ width: '100%' }}
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
              style={{ minHeight: 74 }}
              placeholder="可以描述数据集的用途、特点或其他相关信息"
              rows={1}
              maxLength={500}
              showWordLimit
            />
          </FormItem>
          <FormItem
            label="数据集类型"
            field="storageType"
            rules={[{ required: true, message: '请选择数据集类型' }]}
            initialValue={StorageType.Jsonl}
            extra={
              storageType === StorageType.File
                ? '文件格式：支持各种文件类型，如图片、音频、视频等'
                : storageType === StorageType.Jsonl
                  ? 'JSONL格式：每行一个JSON对象，适用于结构化数据存储'
                  : '数据库表格式：表格形式的数据，支持SQL查询和数据分析'
            }
          >
            <Radio.Group value={storageType} onChange={handleStorageTypeChange}>
              <Radio value={StorageType.Jsonl}>jsonl</Radio>
              <Radio value={StorageType.File}>文件</Radio>
            </Radio.Group>
          </FormItem>

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
            <div
              style={{
                marginTop: 0,
                fontSize: '12px',
                color: '#86909c',
                marginBottom: 8
              }}
            >
              {previewData || previewFileData ? (
                <span style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '500', color: '#000' }}>
                    预览：
                  </span>{' '}
                  {storageType === StorageType.File
                    ? '文件格式数据集暂不支持数据预览，仅显示选中的文件列表'
                    : storageType === StorageType.Jsonl
                      ? '目前平台仅支持格式为JSON的数据，并且按照KV对的格式进行解析，预览仅限显示前50行数据'
                      : '数据表格式数据集支持数据预览，显示表格结构和前50行数据'}
                </span>
              ) : (
                <span style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '500', color: '#000' }}>
                    预览：
                  </span>
                  无jsonl文件
                </span>
              )}
            </div>
            {previewData ? (
              <div className={styles.previewContainer}>
                <Table
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
                    onChange: (selectedRowKeys) => {
                      setSelectedFiles(selectedRowKeys as string[]);
                    }
                  }}
                />
              </>
            ) : null}
          </div>

          <FormItem wrapperCol={{ span: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                marginTop: '24px'
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
