import {
  Alert,
  Descriptions,
  Input,
  Modal,
  Table,
  TableColumnProps,
  Tabs,
  Typography
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useRef } from 'react';
import { SqlIndexStore, useSqlIndexStore } from '../store';

const InputSearch = Input.Search;
const TabPane = Tabs.TabPane;

// interface ModalTableDetailProps {
//     visible?: boolean,
//     onClose?: () => void
// }

/** 数据表详情 弹框 */
const ModalTableDetail = () => {
  const tableDetailVisible = useSqlIndexStore(
    (state: SqlIndexStore) => state.tableDetailVisible
  );

  const closeTableDetail = useSqlIndexStore(
    (state: SqlIndexStore) => state.closeTableDetail
  );

  const selectedVolumnId = useSqlIndexStore(
    (state: SqlIndexStore) => state.selectedVolumnId
  );

  return (
    <Modal
      title="表详情"
      style={{ width: 960 }}
      visible={tableDetailVisible}
      footer={null}
      onCancel={closeTableDetail}
    >
      <div className="pb-[16px]">
        <TableDetail fromId={selectedVolumnId} />
      </div>
    </Modal>
  );
};

export default ModalTableDetail;

const TableDetail = (props) => {
  const { fromId } = props;

  return (
    <Tabs key="card" tabPosition="top">
      <TabPane key="simple" title="示例数据">
        <Alert content="仅展示前50行示例数据" className="mb-[16px]" />
        <SimpleData />
      </TabPane>
      <TabPane key="define" title="表定义">
        <TableDefine />
      </TabPane>
      <TabPane key="loaded" title="载入信息">
        <Loaded />
      </TabPane>
    </Tabs>
  );
};

/** 示例数据 组件 */
function SimpleData(props) {
  const { listData = [] } = props;

  const columns: TableColumnProps[] = [
    {
      title: 'c_name',
      dataIndex: 'c_name',
      ellipsis: true
    },
    {
      title: 'c_address',
      dataIndex: 'c_address',
      ellipsis: true
    },
    {
      title: 'c_nationkey',
      dataIndex: 'c_nationkey',
      ellipsis: true
    },
    {
      title: 'c_comment',
      dataIndex: 'c_comment',
      ellipsis: true
    }
  ];

  return (
    <Table
      style={{
        width: '100%',
        height: '100%'
      }}
      columns={columns}
      data={listData}
      rowKey="id"
      scroll={{ y: 500 }}
    />
  );
}

const defaultCodeValue = `import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# 设置随机种子
np.random.seed(0)

# 创建一个模拟 30 天的销售额数据
df = pd.DataFrame({
    'day': range(1, 31),
    'sales': np.random.normal(loc=200, scale=30, size=30).astype(int)
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# 设置随机种子
np.random.seed(0)

# 创建一个模拟 30 天的销售额数据
df = pd.DataFrame({
    'day': range(1, 31),
    'sales': np.random.normal(loc=200, scale=30, size=30).astype(int)`;

const typeFilters = [
  { text: 'INTEGER', value: 'INTEGER' },
  { text: 'VATRCHAR', value: 'VATRCHAR' }
];

/** 表定义 组件 */
function TableDefine(props) {
  const { codeValue = defaultCodeValue, listData = [] } = props;

  const columns: TableColumnProps[] = [
    {
      title: '字段名',
      dataIndex: 'name',
      filterIcon: <IconSearch />,
      filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => {
        return (
          <div className="arco-table-custom-filter">
            <InputSearch
              allowClear
              placeholder="搜索关键字"
              style={{ width: 150 }}
            />
          </div>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      filters: typeFilters
    },
    {
      title: '注释',
      dataIndex: 'c_nationkey',
      ellipsis: true
    }
  ];

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[12px]">
        <div>
          <span className="text-[14px] font-[600]">表DDL</span>
        </div>
        <CodeMirror value={codeValue} height="200px" />
      </div>
      <div className="flex flex-col gap-[12px]">
        <div>
          <span className="text-[14px] font-[600]">字段信息</span>
        </div>
        <Table
          style={{
            width: '100%',
            height: '100%'
          }}
          columns={columns}
          data={listData}
          rowKey="id"
          scroll={{ y: 200 }}
        />
      </div>
    </div>
  );
}

const defaultInfoData = [
  {
    label: '表ID',
    value: '1234567890'
  },
  {
    label: '创建时间',
    value: '2024-06-20 14:20:00'
  },
  {
    label: '最近更新时间',
    value: '2024-06-25 10:15:00'
  },
  {
    label: '载入用户',
    value: 'admin'
  },
  {
    label: '连接器名称',
    value: 'DataSource_01'
  },
  {
    label: '数据载入任务',
    value: 'LoadTask_202406'
  }
];

/** 载入信息 组件 */
function Loaded(props) {
  const { infoData = defaultInfoData } = props;

  function valueNode(value) {
    return <Typography.Paragraph copyable>{value}</Typography.Paragraph>;
  }

  const infoDataWithCopy = infoData.map((item) => {
    if (item.label === '表ID') {
      return { ...item, value: valueNode(item.value) };
    }
    return item;
  });

  return (
    <>
      <Descriptions
        className="my-descriptions"
        colon=" :"
        column={1}
        data={infoDataWithCopy}
        style={{ marginBottom: 20 }}
        labelStyle={{ paddingRight: 36 }}
      />
    </>
  );
}
