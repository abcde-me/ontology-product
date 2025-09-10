import React, { useEffect, useRef, useState } from 'react';
import {
  Input,
  Modal,
  Table,
  TableColumnProps,
  Form,
  Select,
  Tooltip,
  Tag,
  Button,
  Message
} from '@arco-design/web-react';
import { getTagList } from '@/api/datasetManagement';
import { DATASET_STORAGE_TYPE_LIST } from '../constant';
import {
  exportSqlResult,
  exportSqlResultVersion,
  getDatasetsOptions
} from '@/api/sql';
import { requiredValidator, tableNameValidator } from '../utils';

const FormItem = Form.Item;

interface ModalDatasetFormProps {
  formOrigin: {};
  visible: boolean;
  onCancel: () => void;
}

/** 保存为新数据集 弹框 */
const ModalDatasetForm = (props: ModalDatasetFormProps) => {
  const { formOrigin, visible, onCancel } = props;

  // const datasetFormVisible = useSqlIndexStore(
  //   (state: SqlIndexStore) => state.datasetFormVisible
  // );

  // const closeDatasetForm = useSqlIndexStore(
  //   (state: SqlIndexStore) => state.closeDatasetForm
  // );

  // const currentRunResult = useSqlIndexStore(
  //   (state: SqlIndexStore) => state.currentRunResult
  // );

  return (
    <Modal
      title="保存为新数据集"
      style={{ width: 636 }}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div className="pb-[16px]">
        <DatasetForm formOrigin={formOrigin} onCancel={onCancel} />
      </div>
    </Modal>
  );
};

/** 新数据集表单 组件 */
function DatasetForm(props) {
  const { formOrigin, onCancel } = props;

  const [form] = Form.useForm();
  const [tagOptions, setTagOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [tableData, setTableData] = useState<any[]>(
    generateTableData(formOrigin.columns)
  );
  const [loading, setLoading] = useState(false);

  const storageOptions = DATASET_STORAGE_TYPE_LIST;

  const columns: TableColumnProps[] = [
    {
      title: '字段英文名',
      dataIndex: 'name'
    },
    {
      title: '字段中文名',
      dataIndex: 'c_name',
      width: 268,
      render: (text, item, index) => {
        return (
          <Input
            placeholder="请输入字段中文名"
            value={text}
            onChange={(value) => handleTableInputChange(value, item, index)}
          />
        );
      }
    }
  ];

  useEffect(() => {
    getTagList().then((res) => {
      setTagOptions(formatApiDataToOptions(res.data));
    });
  }, []);

  function handleTableInputChange(newValue, record, index) {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        c_name: newValue
      };
      return newData;
    });
  }

  const handleSubmit = () => {
    form.validate().then(async (values) => {
      // 校验每一行的字段中文名
      const emptyIndex = tableData.findIndex(
        (item) => !item.c_name || !item.c_name.trim()
      );
      if (emptyIndex !== -1) {
        Message.error(`第${emptyIndex + 1}行的字段中文名不能为空`);
        return;
      }

      // 将表格数据转换为 fields 数组格式
      const fields = tableData.map((item) => ({
        name: item.name,
        cn_name: item.c_name
      }));

      // 合并表单数据和 fields 数组
      const submitData = {
        ...values,
        fields: fields,
        script_execid: formOrigin.execid
      };

      setLoading(true);

      try {
        const res = await exportSqlResult(formOrigin.script_id, submitData);

        if (res.status !== 200) {
          Message.error(res.message || '数据集导出失败！');
          setLoading(false);
          return;
        }

        Message.success(res.message || '导出任务已创建！');
        form.resetFields();
        setTableData([]);
        setLoading(false);
      } catch (error) {
        Message.error('数据集导出失败！');
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[12px]">
        <div>
          <span className="text-[14px] font-[600]">基本信息</span>
        </div>
        <Form
          form={form}
          autoComplete="off"
          colon={true}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <FormItem
            field="dataset_name"
            label="数据集名称"
            required
            rules={[
              {
                validator(value, cb) {
                  return requiredValidator(value, cb, '请输入中文名称');
                }
              }
            ]}
          >
            <Input allowClear placeholder="请输入中文名称" />
          </FormItem>
          <FormItem
            field="strage_type"
            label="存储格式"
            required
            rules={[
              {
                validator(value, cb) {
                  return requiredValidator(value, cb, '请选择存储格式');
                }
              }
            ]}
          >
            <Select
              placeholder="请选择存储格式"
              options={storageOptions}
              allowClear
              showSearch
            ></Select>
          </FormItem>
          <FormItem
            field="dataset_table_name"
            label="表名"
            required
            rules={[
              {
                validator(value, cb) {
                  return tableNameValidator(value, cb, '请输入英文存储表名');
                }
              }
            ]}
          >
            <Input allowClear placeholder="请输入英文存储表名" />
          </FormItem>
          <FormItem field="desc" label="描述说明">
            <Input.TextArea rows={3} allowClear placeholder="请输入说明" />
          </FormItem>
          <FormItem
            label="标签"
            field="tag_names"
            rules={[{ required: false, message: '请选择至少一个标签' }]}
          >
            <Select
              placeholder="请输入或选择标签"
              mode="multiple"
              options={tagOptions}
              allowCreate
              maxTagCount={{
                count: 10,
                render: (invisibleTagCount) => {
                  const allTags = form.getFieldValue('tag_names') || [];
                  const remainingTags = allTags.slice(10);
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
        </Form>
      </div>
      <div className="flex flex-col gap-[12px]">
        <div>
          <span className="text-[14px] font-[600]">来源信息</span>
        </div>
        <Table
          style={{
            width: '100%',
            height: '100%'
          }}
          columns={columns}
          data={tableData}
          rowKey="id"
          pagination={false}
          scroll={{ y: 400 }}
        />
      </div>
      <div className="mt-[16px] flex justify-end gap-[12px]">
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          确定
        </Button>
      </div>
    </div>
  );
}

/** 保存为新版本 弹框 */
const ModalDatasetFormVersion = (props: ModalDatasetFormProps) => {
  const { formOrigin, visible, onCancel } = props;

  return (
    <Modal
      title="保存为新版本"
      style={{ width: 717 }}
      visible={visible}
      footer={null}
      onCancel={onCancel}
    >
      <div className="pb-[16px]">
        <DatasetVersionForm formOrigin={formOrigin} onCancel={onCancel} />
      </div>
    </Modal>
  );
};

/** 新版本表单 组件 */
function DatasetVersionForm(props) {
  const { formOrigin, onCancel } = props;

  const [form] = Form.useForm();
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const selectedOption = useRef<any>();

  useEffect(() => {
    const targetParams = {
      limit: 1000,
      page: 1,
      storage_type_list: ['table'],
      name: ''
    };
    getDatasetsOptions(targetParams).then((res) => {
      setOptions(formatDatesetsApiDataToOptions(res?.data?.list as any));
    });
  }, []);

  const handleSelectChange = (key, option) => {
    selectedOption.current = option.extra;
  };

  const handleSubmit = () => {
    form.validate().then(async (values) => {
      // 将表格数据转换为 fields 数组格式
      const tableData = generateTableData(formOrigin.columns);
      const fields = tableData.map((item) => ({
        name: item.name
      }));

      // 合并表单数据和 fields 数组
      const submitData: any = {
        script_execid: formOrigin.execid,
        fields,
        dataset_id: selectedOption.current.id,
        dataset_name: selectedOption.current.name,
        desc: values.desc,
        version_id: selectedOption.current.latest_version
      };

      setLoading(true);

      try {
        const res = await exportSqlResultVersion(
          formOrigin.script_id,
          submitData
        );

        if (res.status !== 200) {
          Message.error(res.message || '新版本导出失败！');
          setLoading(false);
          return;
        }

        Message.success(res.message || '新版本导出任务已创建！');
        form.resetFields();
        selectedOption.current = null;
        setLoading(false);
      } catch (error) {
        Message.error('新版本导出失败！');
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[12px]">
        <Form
          form={form}
          autoComplete="off"
          colon={true}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <FormItem
            field="dataset"
            label="选择目标数据集"
            required
            rules={[
              {
                validator(value, cb) {
                  return requiredValidator(value, cb, '请选择数据集');
                }
              }
            ]}
          >
            <Select
              placeholder="请选择数据集"
              options={options}
              allowClear
              showSearch
              onChange={handleSelectChange}
            ></Select>
          </FormItem>
          <FormItem field="desc" label="版本说明">
            <Input.TextArea
              rows={3}
              allowClear
              placeholder="可给出数据特征，加工处理条件等内容"
            />
          </FormItem>
        </Form>
        <div className="mt-[16px] flex justify-end gap-[12px]">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            确定
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ModalDatasetForm, ModalDatasetFormVersion };

function formatApiDataToOptions(data = []) {
  return data.map((item: any) => ({
    label: item.name,
    value: item.name
  }));
}

function formatDatesetsApiDataToOptions(data = []) {
  return data.map((item: any) => ({
    label: item.name,
    value: item.id,
    extra: { ...item }
  }));
}

function generateTableData(
  rawColumns: { title: string; dataIndex: string }[]
): any[] {
  return rawColumns.map((col, idx) => ({
    key: idx,
    name: col.dataIndex,
    c_name: col.title
  }));
}
