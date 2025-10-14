import {
  Button,
  Empty,
  Input,
  Link,
  Message,
  Modal,
  Radio,
  Space,
  Switch,
  TableColumnProps,
  Tooltip
} from '@arco-design/web-react';
import { Table } from '@ccf2e/arco-material';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import './index.less';
import NoDataEmpty from '@/components/NoDataEmpty';
import TabelModel from '../../../components/tableModel';
import TableStructureModel from '../../../components/TableStructureModel';
import {
  AddDocsublevel,
  deletedocsublevel,
  editDocsublevel,
  putdocSwitchSegmentation
} from '@/api/datasetsV2';
import TextTruncate from '../TextTruncate';
import ToolTipSvg from '@/assets/file/tooltip.svg';

const TabelPage = (props, ref) => {
  const {
    segmentationlist,
    segment_count,
    docOperation,
    tabelPageradioFun,
    pagination,
    handlePaginationChange,
    onInit,
    tabelPageonclick,
    filedetail,
    detailsdata,
    funChildStructure,
    handleSearchSublevel
  } = props;

  const InputSearch = Input.Search;
  const tabelModelref: any = useRef();
  const structureModelref: any = useRef();
  const [loading1, setloading1] = useState(false);
  const [apidata, setapidata] = useState({});
  const [optionlist, setoptionlist] = useState([]);
  const [tabelheader, settabelheader] = useState<TableColumnProps[]>([]);
  const [user_columns, setuser_columns] = useState([]);
  const [searchQuery, setsearchQuery] = useState('');
  const option = [
    {
      name: '全部数据',
      value: segment_count.total_segment_count,
      key: 0
    },
    {
      name: '原文切片',
      value: segment_count.original_segment_count,
      key: 1
    },
    {
      name: '新增切片',
      value: segment_count.new_segment_count,
      key: 2
    }
  ];
  useEffect(() => {
    const FuncTabel = () => {
      // segmentationlist  分段列表 tabeldata
      if (segmentationlist.length > 0) {
        const listData = segmentationlist.map((i, index) => {
          const parsedData = JSON.parse(i.content);

          return {
            itemdata: i,
            ...parsedData,
            key: index + 1
          };
        });
        if (listData.length > 0) {
          FuncTabelHeader(listData); //tabeltitle
        }
        // console.log(listData, 'listData');

        setoptionlist(listData);
      } else {
        setoptionlist([]);
      }
    };
    FuncTabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentationlist]);
  const FuncTabelHeader = (value) => {
    setloading1(true);
    const element = document.querySelector('.ClassTabelPage_content');
    const rect = element?.getBoundingClientRect();
    const Page_content_Width = rect?.width || 0;

    const columns0 = [
      {
        title: '序号',
        dataIndex: 'key',
        width: 70
      }
    ];
    const {
      process_rule: {
        rules: { spreadsheet_schema }
      }
    } = filedetail;
    let tabelcolumns2width;
    const columns2width = spreadsheet_schema.columns.length * 150;
    if (290 + columns2width < Page_content_Width) {
      tabelcolumns2width = '';
    } else {
      tabelcolumns2width = 150;
    }
    const columns1: any = spreadsheet_schema.columns
      .map((e, index) => {
        return {
          ...e,
          title: (
            <div className="flex  items-center">
              <div>
                <TextTruncate
                  text={e.column_name}
                  clientHeight={1}
                ></TextTruncate>
              </div>
              {e.is_semantic == true ? (
                <div className="ml-[8px] h-[18px] rounded-[4px] bg-[#E7ECF0] px-[4px] text-[12px] font-normal text-[#0F172A]">
                  索引
                </div>
              ) : null}
              {e.column_description !== '' ? (
                <div className="ml-[8px]">
                  <Tooltip
                    position="top"
                    trigger="hover"
                    content={e.column_description}
                  >
                    <ToolTipSvg></ToolTipSvg>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          ),
          dataIndex: e.column_name,
          width: tabelcolumns2width,
          render: (perms, record) => (
            <TextTruncate text={perms} clientHeight={1}></TextTruncate>
          )
        };
      })
      .filter((e) => e !== null);
    const columns2 = [
      // {
      //   title: '',
      //   dataIndex: '1'
      // },
      {
        dataIndex: 'enabled',
        title: '启用',
        width: 100,
        fixed: 'right',
        align: 'left',
        render: (_, record, index) => {
          return (
            <Switch
              checked={record.itemdata.enabled}
              onChange={() => handleChangeChild(record.itemdata)}
              className="btnCs"
              checkedText="启用"
              uncheckedText="禁用"
            />
          );
        }
      },
      {
        dataIndex: 'operation',
        title: '操作',
        width: 120,
        fixed: 'right',
        align: 'left',
        render: (_, record, index) => {
          const perms = record.list_api_user_perms?.perms || [];
          const config = [] as any;

          // if (perms.includes('dataset:can_get')) {
          config.push({
            label: '编辑',
            onClick: () => editslice(record, 'edit', index)
          });
          // }

          // if (perms.includes('dataset:can_delete')) {
          config.push({
            label: '删除',
            onClick: () => doDelete(record)
          });
          // }
          return (
            <div className="tabelclassbuttom flex">
              <Button
                type="text"
                onClick={() => editslice(record, 'edit', index)}
                disabled={record.itemdata.enabled == false}
              >
                编辑
              </Button>
              <Button type="text" onClick={() => doDelete(record)}>
                删除
              </Button>
            </div>
            // <OperationColumn
            //   row={record}
            //   index={index}
            //   config={config}
            //   extendFont="更多"
            // />
          );
        }
      }
    ];
    const columnsdata = [...columns0, ...columns1, ...columns2];

    setuser_columns(columns1);
    settabelheader(columnsdata);
    setloading1(false);
  };
  useImperativeHandle(ref, () => ({
    editTableStructure: () => {
      structureModelref.current.openModel();
    },
    newTableStructure: () => {
      addslice(optionlist[0], 'add');
    }
  }));

  //事件
  const onChange = (e) => {
    tabelPageradioFun(e);
  };
  const onSearchChange = (e) => {
    setsearchQuery(e);

    handleSearchSublevel(e);
  };
  const onChangeTable = (pagination) => {
    handlePaginationChange(pagination.current, pagination.pageSize);
  };
  const editslice = (item, type, index) => {
    tabelModelref.current.openModel(item, type, index);
  };
  const editsliceSubmit = async (item, initItem, type) => {
    if (type == 'edit') {
      const params = {
        content: JSON.stringify(item[0]),
        keywords: [],
        answer: ''
      };
      await editDocsublevel(
        initItem.dataset_id,
        initItem.document_id,
        initItem.id,
        params
      );
      await tabelPageonclick();
      Message.success('编辑切片成功！');
    } else {
      const promises = item.map((i) =>
        AddDocsublevel(initItem.dataset_id, initItem.document_id, {
          content: JSON.stringify(i),
          keywords: [],
          answer: ''
        })
      );
      await Promise.all(promises);
      await tabelPageonclick();
      Message.success('新增切片成功！');
    }
  };
  const addslice = (item, type) => {
    tabelModelref.current.openModel(item, type);
  };
  const doDelete = (item) => {
    Modal.confirm({
      style: { width: '400px' },
      title: '删除数据',
      content: (
        <div className="pl-6">删除后，该数据将不可恢复。确认删除吗？</div>
      ),
      async onOk() {
        try {
          const itemdata = item.itemdata;
          await deletedocsublevel(
            itemdata.dataset_id,
            itemdata.document_id,
            itemdata.id
          );
          await tabelPageonclick();
          Message.success('删除成功！');
        } catch {
          Message.error('删除失败！');
        }
      }
    });
  };
  const handleChangeChild = async (e) => {
    try {
      let ty = '';
      if (e.enabled !== true) {
        ty = 'enable';
      } else {
        ty = 'disable';
      }
      await putdocSwitchSegmentation(e.dataset_id, e.document_id, ty, e.id);
      await tabelPageonclick();
      Message.success(`${ty == 'enable' ? '启用' : '禁用'}成功`);
    } catch {}
  };

  return (
    <div className="ClassTabelPage">
      <div className="ClassTabelPage_header">
        <div className="header_ridio">
          <Radio.Group
            defaultValue={option[0].key}
            name="button-radio-group"
            onChange={onChange}
          >
            {option.map((item) => {
              return (
                <Radio key={item.name} value={item.key}>
                  {({ checked }) => {
                    return (
                      <Button
                        className={'mr-[12px] w-[130px]'}
                        key={item.name}
                        shape="round"
                        type={checked ? 'primary' : 'default'}
                      >
                        {item.name}({item.value})
                      </Button>
                    );
                  }}
                </Radio>
              );
            })}
          </Radio.Group>
        </div>
        <div className="header_input">
          <InputSearch
            className="w-[240px]"
            value={searchQuery}
            onChange={onSearchChange}
            allowClear
            placeholder="搜索"
          />
        </div>
      </div>
      <div className="ClassTabelPage_content">
        {optionlist.length > 0 ? (
          <Table
            // loading={loading1}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total
            }}
            onChange={onChangeTable}
            noDataElement={<NoDataEmpty />}
            columns={tabelheader}
            data={optionlist}
            scroll={{ x: true }}
            rowKey="id"
          />
        ) : (
          <NoDataEmpty />
        )}
      </div>
      <TabelModel
        ref={tabelModelref}
        user_columns={user_columns}
        editsliceSubmit={editsliceSubmit}
      ></TabelModel>
      <TableStructureModel
        ref={structureModelref}
        funChildStructure={funChildStructure}
        filedetail={filedetail}
        detailsdata={detailsdata}
      ></TableStructureModel>
    </div>
  );
};
export default forwardRef(TabelPage);
