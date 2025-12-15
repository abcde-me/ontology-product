import React, { useState } from 'react';
import { Modal, Table, Link } from '@arco-design/web-react';
import dayjs from 'dayjs';
import SelectedDataModal from '@/pages/requirement/info/detail/SelectedDataModal';

interface HistoryRecord {
  edit_id: string;
  pkg_cnt: number;
  all_task_cnt: number;
  create_time: string;
  creator_name: string;
  label_data_set: any[];
}

interface HistoryRecordModalProps {
  visible: boolean;
  onClose: () => void;
  data: HistoryRecord[];
}

const HistoryRecordModal: React.FC<HistoryRecordModalProps> = ({
  visible,
  onClose,
  data
}) => {
  const [selectedDataModalVisible, setSelectedDataModalVisible] =
    useState(false);
  const [currentHistoryData, setCurrentHistoryData] = useState<any[]>([]);

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'create_time',
      width: 180,
      sorter: (a: HistoryRecord, b: HistoryRecord) =>
        dayjs(a.create_time).unix() - dayjs(b.create_time).unix(),
      sortDirections: ['ascend' as const, 'descend' as const],
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '数据量',
      dataIndex: 'all_task_cnt',
      width: 100
    },
    {
      title: '拆分任务包',
      dataIndex: 'pkg_cnt',
      width: 100
    },
    {
      title: '操作人',
      dataIndex: 'creator_name',
      width: 100,
      filterMultiple: false,
      filters:
        data
          ?.map((item) => item.creator_name)
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .map((name) => ({
            text: name,
            value: name
          })) || [],
      onFilter: (value: string, record: HistoryRecord) =>
        record.creator_name === value
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      render: (_: any, record: HistoryRecord) => (
        <Link
          onClick={() => {
            setCurrentHistoryData(record.label_data_set || []);
            setSelectedDataModalVisible(true);
          }}
        >
          查看已选数据
        </Link>
      )
    }
  ];

  return (
    <>
      <Modal
        title="历史记录"
        visible={visible}
        onCancel={onClose}
        alignCenter={true}
        escToExit={true}
        maskClosable={true}
        style={{ width: '900px' }}
        footer={null}
      >
        <Table
          columns={columns}
          data={data || []}
          rowKey="edit_id"
          pagination={false}
          border={false}
        />
      </Modal>
      <SelectedDataModal
        visible={selectedDataModalVisible}
        onClose={() => setSelectedDataModalVisible(false)}
        data={currentHistoryData}
      />
    </>
  );
};

export default HistoryRecordModal;
