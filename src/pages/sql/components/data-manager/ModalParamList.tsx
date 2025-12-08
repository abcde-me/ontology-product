import React from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Popover,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { DbTableListParamss, getDbItemList } from '@/api/dataCatalog';
import { formatDateTime } from '../../utils';
import getLabelByValue from '@/utils/getLabelByValue';
import { IconRefresh } from '@arco-design/web-react/icon';
import './ModalParamList.scss';
const FormItem = Form.Item;

const defaultfileTypeList = [
  {
    label: 'MySQL',
    text: 'MySQL',
    value: 'MySQL'
  },
  {
    label: 'PostgreSQL',
    text: 'PostgreSQL',
    value: 'PostgreSQL'
  }
];

// 参数详情 弹框
const ModalParamList = ({ paramVisible, onCancel }) => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = React.useState<DbTableListParamss>();
  const [listData, setListData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [total, setTotal] = React.useState<number>(0);
  const [current, setCurrent] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const handleSearchChange = (values: any) => {};

  const columns: TableColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: '参数名',
      dataIndex: 'table_name',
      ellipsis: true,
      width: 174
    },
    {
      title: '参数值',
      dataIndex: 'table_name',
      ellipsis: true,
      width: 174
    },
    {
      title: '参数说明',
      dataIndex: 'table_name',
      ellipsis: true,
      width: 174,
      // 如果没有值显示暂无参数说明
      render: (_, record) =>
        record.table_name ? (
          <EllipsisPopover
            value={record.table_name}
            isEdit={false}
            preferTypography
          />
        ) : (
          <div>暂无参数说明</div>
        )
    }
  ];
  return (
    <Modal
      title="参数详情"
      style={{ width: 1000 }}
      visible={paramVisible}
      footer={null}
      onCancel={onCancel}
    >
      <div className="modal-param-list-warper pb-[16px]">
        <div className="from-search-warper">
          <Form
            autoComplete="off"
            layout="inline"
            form={form}
            onValuesChange={(values: any) => handleSearchChange(values)}
          >
            <FormItem
              label="参数名:"
              field="param_name"
              style={{ marginRight: 8, marginBottom: 16 }}
            >
              <Input.Search
                style={{ width: 193 }}
                allowClear
                placeholder="输入参数名搜索"
              />
            </FormItem>
            <FormItem
              label="参数值:"
              field="param_value"
              style={{ marginRight: 8, marginBottom: 16 }}
            >
              <Input.Search
                style={{ width: 193 }}
                allowClear
                placeholder="输入参数值搜索"
              />
            </FormItem>
            <FormItem
              label="参数说明:"
              field="param_desc"
              style={{ marginRight: 8, marginBottom: 16 }}
            >
              <Input.Search
                style={{ width: 180 }}
                allowClear
                placeholder="输入参数说明搜索"
              />
            </FormItem>
          </Form>
          <Button
            icon={<IconRefresh />}
            onClick={() => {
              form.resetFields();
            }}
            type="text"
          >
            重置
          </Button>
          <Button type="primary">查询</Button>
        </div>
        <Table
          style={{
            width: '100%',
            height: '100%'
          }}
          columns={columns}
          data={listData}
          loading={loading}
          rowKey="table_id"
          scroll={{ y: 500 }}
        />
        <div className="pagination-content">
          <Pagination
            total={total}
            current={current}
            pageSize={pageSize}
            showTotal
            showJumper
            sizeCanChange
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalParamList;
