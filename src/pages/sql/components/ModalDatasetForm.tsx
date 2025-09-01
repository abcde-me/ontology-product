import React from 'react';
import {
  Input,
  Modal,
  Table,
  TableColumnProps,
  Form,
  Select
} from '@arco-design/web-react';
import {
  DATASET_LIST,
  DATASET_SOURCE_LIST,
  DATASET_STORAGE_TYPE_LIST,
  DATASET_TAG_LIST
} from '../constant';
import { SqlIndexStore, useSqlIndexStore } from '../store';

const FormItem = Form.Item;

/** 保存为新数据集 弹框 */
const ModalDatasetForm = () => {
  const datasetFormVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.datasetFormVisible
  );

  const closeDatasetForm = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeDatasetForm
  );

  return (
    <Modal
      title="保存为新数据集"
      style={{ width: 636 }}
      visible={datasetFormVisible}
      onCancel={closeDatasetForm}
    >
      <div className="pb-[16px]">
        <DatasetForm />
      </div>
    </Modal>
  );
};

/** 新数据集表单 组件 */
function DatasetForm(props) {
  const {} = props;

  const listData = DATASET_SOURCE_LIST;
  const storageOptions = DATASET_STORAGE_TYPE_LIST;
  const tagOptions = DATASET_TAG_LIST;

  const columns: TableColumnProps[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60
    },
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

  function handleTableInputChange(newValue, record, index) {
    console.log(
      'handleTableInputChange value, record, index:',
      newValue,
      record,
      index
    );
  }

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
        <div>
          <span className="text-[14px] font-[600]">基本信息</span>
        </div>
        <Form
          autoComplete="off"
          colon={true}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onValuesChange={handleValuesChange}
        >
          <FormItem field="name" label="数据集名称" required>
            <Input allowClear placeholder="请输入中文名称" />
          </FormItem>
          <FormItem field="storage" label="存储格式" required>
            <Select
              placeholder="请选择存储格式"
              options={storageOptions}
              allowClear
              showSearch
            ></Select>
          </FormItem>
          <FormItem field="table_name" label="表名">
            <Input allowClear placeholder="请输入英文存储表名" />
          </FormItem>
          <FormItem field="des" label="描述说明">
            <Input.TextArea rows={3} allowClear placeholder="请输入说明" />
          </FormItem>
          <FormItem field="tag" label="标签">
            <Select
              placeholder="请选择标签"
              options={tagOptions}
              allowClear
              showSearch
            ></Select>
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
          data={listData}
          rowKey="id"
          pagination={false}
          scroll={{ y: 400 }}
        />
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
