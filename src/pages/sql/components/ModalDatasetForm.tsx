import React, { useEffect, useState } from 'react';
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
import { DATASET_LIST, DATASET_STORAGE_TYPE_LIST } from '../constant';
import { SqlIndexStore, useSqlIndexStore } from '../store';
import { exportSqlResult } from '@/api/sql';

const FormItem = Form.Item;

/** 保存为新数据集 弹框 */
const ModalDatasetForm = () => {
  const datasetFormVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.datasetFormVisible
  );

  const closeDatasetForm = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDatasetForm
  );

  const currentRunResult = useSqlIndexStore(
    (state: SqlIndexStore) => state.currentRunResult
  );

  return (
    <Modal
      title="保存为新数据集"
      style={{ width: 636 }}
      visible={datasetFormVisible}
      onCancel={closeDatasetForm}
      footer={null}
    >
      <div className="pb-[16px]">
        <DatasetForm currentRunResult={currentRunResult} />
      </div>
    </Modal>
  );
};

/** 新数据集表单 组件 */
function DatasetForm(props) {
  const { currentRunResult } = props;

  const [form] = Form.useForm();
  const [tagOptions, setTagOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const storageOptions = DATASET_STORAGE_TYPE_LIST;

  const closeDatasetForm = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDatasetForm
  );

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
            defaultValue={text}
            onChange={(value) => handleTableInputChange(value, item, index)}
          />
        );
      }
    }
  ];

  useEffect(() => {
    const initialData = generateTableData(currentRunResult.columns);
    setTableData(initialData);
  }, [currentRunResult.columns]);

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
      // 将表格数据转换为 fields 数组格式
      const fields = tableData.map((item) => ({
        name: item.name,
        cname: item.c_name
      }));

      // 合并表单数据和 fields 数组
      const submitData = {
        ...values,
        fields: fields
      };

      setLoading(true);

      try {
        const res = await exportSqlResult(
          currentRunResult.script_id,
          submitData
        );
        if (res.status !== 200) {
          Message.error(res.message || '数据集导出失败！');
        }

        Message.success(res.message || '导出任务已创建！');
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
          <FormItem field="dataset_name" label="数据集名称" required>
            <Input allowClear placeholder="请输入中文名称" />
          </FormItem>
          <FormItem field="strage_type" label="存储格式" required>
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
                  if (!value) {
                    return cb('请输入英文存储表名');
                  }
                  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
                    return cb('表名需以字母开头，仅支持字母、数字和下划线');
                  }
                  return cb();
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
        <Button onClick={closeDatasetForm}>取消</Button>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          确定
        </Button>
      </div>
    </div>
  );
}

/** 保存为新版本 弹框 */
const ModalDatasetFormVersion = () => {
  const datasetVersionFormVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.datasetVersionFormVisible
  );

  const closeDatasetVersionForm = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDatasetVersionForm
  );

  return (
    <Modal
      title="保存为新版本"
      style={{ width: 717 }}
      visible={datasetVersionFormVisible}
      onCancel={closeDatasetVersionForm}
    >
      <div className="pb-[16px]">
        <DatasetVersionForm />
      </div>
    </Modal>
  );
};

/** 新版本表单 组件 */
function DatasetVersionForm(props) {
  const {} = props;

  const options = DATASET_LIST;

  const handleValuesChange = (changedValues, allValues) => {
    console.log(
      'handleValuesChange changedValues, allValues:',
      changedValues,
      allValues
    );
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[12px]">
        <Form
          autoComplete="off"
          colon={true}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onValuesChange={handleValuesChange}
        >
          <FormItem field="dataset" label="选择目标数据目录/卷" required>
            <Select
              placeholder="请选择数据集"
              options={options}
              allowClear
              showSearch
            ></Select>
          </FormItem>
          <FormItem field="des" label="版本说明">
            <Input.TextArea
              rows={3}
              allowClear
              placeholder="可给出数据特征，加工处理条件等内容"
            />
          </FormItem>
        </Form>
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

function generateTableData(
  rawColumns: { title: string; dataIndex: string }[]
): any[] {
  return rawColumns.map((col, idx) => ({
    key: idx,
    name: col.dataIndex,
    c_name: col.title
  }));
}
