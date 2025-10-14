import { Button, Input, Message, Modal, Table } from '@arco-design/web-react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import './index.less';
import { OperationColumn } from '@ccf2e/arco-material';
import { IconPlus } from '@arco-design/web-react/icon';

const TableModel = ({ user_columns, editsliceSubmit }, ref) => {
  const [slicetype, setslicetype] = useState('add');
  const [sliceVisible, setsliceVisible] = useState(false);
  const [columnsdata, setcolumnsdata] = useState<any>([]);
  const [listData, setlistData] = useState<any>([]);
  const [initdata, setinitdata] = useState<any>([]);
  const [itemdata, seitemdata] = useState<any>({});
  const listDataRef = useRef(listData);

  useEffect(() => {
    listDataRef.current = listData;
  }, [listData]);
  useImperativeHandle(ref, () => ({
    openModel: (item, type) => {
      openModel(item, type);
    }
  }));
  const openModel = (item, type) => {
    seitemdata(item.itemdata);
    // 删除 'key' 键
    delete item['itemdata'];
    delete item['key'];
    const columns0 = [
      {
        title: '序号',
        dataIndex: 'key',
        width: 100
      }
    ];
    const columns1: any = user_columns.map((e, index) => {
      return {
        ...e,
        title: (
          <div className="flex items-center">
            <div>{e.column_name}</div>
            {e.column_description !== '' ? (
              <div className="ml-[8px] h-[18px] rounded-[4px] bg-[#E7ECF0] px-[4px] text-[12px] font-normal text-[#0F172A]">
                索引
              </div>
            ) : (
              ''
            )}
          </div>
        ),
        dataIndex: e.column_name,
        render(i, app, rowindex) {
          return (
            <Input
              // maxLength={30}
              showWordLimit
              value={i}
              onChange={(ev) =>
                changedescription(ev, app, index, rowindex, e.column_name)
              }
            />
          );
        }
      };
    });
    const columns2 = [
      {
        dataIndex: 'operation',
        title: '操作',
        width: 100,
        fixed: 'right',
        align: 'left',
        render: (_, record, index) => {
          const config = [] as any;
          // if (perms.includes('dataset:can_delete')) {
          config.push({
            label: '删除',
            onClick: () => tabelModelDelete(record, index)
          });
          // }
          return (
            <OperationColumn
              row={record}
              index={index}
              config={config}
              extendFont="更多"
            />
          );
        }
      }
    ];

    if (type == 'edit') {
      setlistData([item]);
      setcolumnsdata(columns1);
    } else {
      // 使用 reduce() 创建新的对象
      item = Object.keys(item).reduce((acc, key) => {
        acc[key] = ''; // 将每个值设置为空字符串
        return acc;
      }, {});
      item['key'] = '1';
      // 输出修改后的对象
      setlistData([item]);
      setinitdata([item]);
      setcolumnsdata([...columns0, ...columns1, ...columns2]);
    }
    setslicetype(type);
    setsliceVisible(true);
  };
  const tabelModelDelete = (item, index) => {
    Modal.confirm({
      style: { width: '400px' },
      title: '删除数据',
      content: (
        <div className="pl-6">删除后，该数据将不可恢复。确认删除吗？</div>
      ),
      onOk() {
        listDataRef.current.splice(index, 1);

        const newdata = listDataRef.current.map((e, index) => {
          return {
            ...e,
            key: index + 1
          };
        });
        setlistData(newdata);
        Message.success('删除成功！');
      }
    });
  };
  const changedescription = (value, item, index, rowindex, column_name) => {
    const newTabeldata = listDataRef.current.map((e) => {
      if (e.key === item.key) {
        // 找到目标对象并修改它
        e = { ...e, [column_name]: value };
        console.log(e, 'e');

        return e;
      }
      return e;
    });

    setlistData(newTabeldata);
  };
  const slicesubmit = () => {
    if (listData.length > 0) {
      editsliceSubmit(listData, itemdata, slicetype);
      setsliceVisible(false);
    } else {
      Message.error('请最少添加一个切片！');
    }
  };
  const sliceclear = () => {
    setsliceVisible(false);
  };
  const addslicelist = () => {
    const newdata = [...listData, ...initdata].map((e, index) => {
      return {
        ...e,
        key: index + 1
      };
    });

    setlistData(newdata);
  };
  return (
    <div className="classTableModel">
      <Modal
        title={slicetype == 'add' ? '新增切片' : '编辑切片'}
        visible={sliceVisible}
        onOk={() => slicesubmit()}
        onCancel={() => sliceclear()}
        autoFocus={false}
        focusLock={true}
        style={{
          width: '70%'
        }}
      >
        <Table
          className={'classTableModelTable'}
          //   pagination={{
          //     current: pagination.page,
          //     pageSize: pagination.limit,
          //     total: pagination.total
          //   }}
          // onChange={onChangeTable}
          // noDataElement={ <NoDataEmpty />}
          columns={columnsdata}
          data={listData}
          scroll={{ x: true }}
          pagination={false}
          rowKey="id"
        />
        {slicetype !== 'edit' ? (
          <Button
            className={'mt-[16px]'}
            type="outline"
            icon={<IconPlus />}
            onClick={addslicelist}
          >
            添加
          </Button>
        ) : null}
      </Modal>
    </div>
  );
};
export default forwardRef(TableModel);
