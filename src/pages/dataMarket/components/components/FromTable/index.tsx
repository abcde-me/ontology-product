import {
  Alert,
  Input,
  InputNumber,
  Link,
  Message,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
  Tooltip
} from '@arco-design/web-react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import './index.less';
import {
  apiTableConfiguration,
  apiTableHeaderConfiguration
} from '@/api/datasetsV2';
import NoDataEmpty from '@/components/NoDataEmpty';
import Required from '@/assets/file/Required.svg';
import ToolTipSvg from '@/assets/file/tooltip.svg';

const FromTable = (props, ref) => {
  const { FimsetFieldsValue, fileList, type, filedetail, onDataChange } = props;
  const Option = Select.Option;
  const [options, setoptions] = useState<
    {
      sheet_id: string;
      valueinput1: number;
      valueinput2: number;
    }[]
  >([]);
  const [optionslist, setoptionslist] = useState<any>({});
  const [inittabeldata, setInittabeldata] = useState([]);
  const [tabeldata, settabeldata] = useState<string[]>([]);
  const [requestloading, setrequestloading] = useState(false);
  useImperativeHandle(ref, () => ({
    closeModel: () => {
      const newdata = inittabeldata.map((e: any, index) => {
        return {
          ...e,
          key: index + 1
        };
      });
      settabeldata(newdata);
    }
  }));
  useEffect(() => {
    if (fileList && fileList.length > 0 && fileList[0].status == 'done') {
      const init = async () => {
        setrequestloading(true);
        try {
          const fileid = fileList[0].response.data.id;
          const params = {
            file_id: fileid
          };

          const { data: tabeldata1 } = await apiTableConfiguration(params);
          const sheet_list = tabeldata1.sheet_list.map((e) => {
            return {
              ...e,
              valueinput1: 1,
              valueinput2: 2
            };
          });

          setoptions(sheet_list);
          setoptionslist(sheet_list[0]);
        } catch {
          setrequestloading(false);
          console.log('无id');
          setoptions([]);
          setoptionslist({});
        }
      };
      init();
    }
  }, [fileList]);

  useEffect(() => {
    if (filedetail) {
      const {
        process_rule: {
          rules: { spreadsheet_schema }
        }
      } = filedetail;
      const optionsheet_list = {
        sheet_id: spreadsheet_schema.sheet_id,
        valueinput1: spreadsheet_schema.header_line_idx + 1,
        valueinput2: spreadsheet_schema.start_line_idx + 1
      };
      setoptionslist(optionsheet_list);
      const newdata = spreadsheet_schema.columns.map((e, index) => {
        return {
          ...e,
          key: index + 1
        };
      });
      setoptions([optionsheet_list]);
      settabeldata(newdata || []);
      setInittabeldata(newdata);
    }
  }, [filedetail]);
  useEffect(() => {
    if (
      optionslist.sheet_name ||
      optionslist.col_row ||
      optionslist.total_row
    ) {
      const inittabel = async () => {
        setrequestloading(true);
        try {
          const fileid = fileList[0].response.data.id;
          const params = {
            file_id: fileid,
            sheet_id: optionslist.sheet_id,
            header_line_idx: optionslist.valueinput1,
            start_line_idx: optionslist.valueinput2
          };
          const { data: tabeldata } = await apiTableHeaderConfiguration(params);

          const newdata = tabeldata.user_columns.map((e, index) => {
            return {
              ...e,
              key: index + 1
            };
          });

          settabeldata(newdata);
          setInittabeldata(newdata);
          setrequestloading(false);
        } catch {
          setrequestloading(false);
        }
      };
      inittabel();
    }
  }, [optionslist]);
  useEffect(() => {
    if (FimsetFieldsValue) {
      FimsetFieldsValue({
        spreadsheet_schema: {
          sheet_id: optionslist.sheet_id,
          header_line_idx: optionslist.valueinput1,
          start_line_idx: optionslist.valueinput2,
          columns: tabeldata.filter((e) => {
            // if (e.is_semantic == true) {
            delete e['key'];
            return e;
            // }
          })
        }
      });
    }
    if (type == 'edit') {
      const columns = {
        sheet_id: optionslist.sheet_id,
        header_line_idx: optionslist.valueinput1,
        start_line_idx: optionslist.valueinput2,
        columns: tabeldata.filter((e) => {
          // if (e.is_semantic == true) {
          delete e['key'];
          return e;
          // }
        })
      };
      onDataChange(columns);
    }
  }, [optionslist, tabeldata]);

  const columns = [
    {
      title: '列',
      dataIndex: 'key',
      width: 50
    },
    {
      title: (
        <div className="flex items-center">
          <div>
            <Required></Required>
          </div>
          <div className="ml-[4px]">列名</div>
        </div>
      ),
      dataIndex: 'column_name',
      width: 280,
      render(i, app) {
        return (
          <div
            className={`column_name rounded border ${i == '' ? 'border-[#FF0000]' : 'border-[#cbd5e1]'}`}
          >
            <Input
              maxLength={30}
              showWordLimit
              value={i}
              onChange={(e) => changename(e, app)}
            />
          </div>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'column_description',
      width: 280,
      render(i, app) {
        return (
          <Input
            maxLength={100}
            showWordLimit
            value={i}
            onChange={(e) => changedescription(e, app)}
          />
        );
      }
    },
    {
      title: (
        <div className="flex  items-center">
          {/* <div> */}
          <Required></Required>
          {/* </div> */}
          <div className="ml-[4px]">索引</div>
          <div className={'ml-[8px]'}>
            <Tooltip
              position="top"
              trigger="hover"
              content={
                '1、支持设置多个索引,用于匹配，到更多字段的信息。2、至少启用1个索引字段，过多的索引可能会导致精准度的下降，建议最多启用5个字段。'
              }
            >
              {' '}
              <ToolTipSvg></ToolTipSvg>
            </Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'is_semantic',
      width: 100,
      render(i, app) {
        return (
          <Switch checked={i} onChange={(e) => onChangesemantic(e, app)} />
        );
      }
    },
    {
      title: '操作',
      dataIndex: '',
      width: 60,
      render(_, app, index) {
        return (
          <Link
            disabled={tabeldata.length == 1}
            onClick={() => doDelete(app, index)}
          >
            删除
          </Link>
        );
      }
    }
  ];
  const onChangeSelect = (e) => {
    const foundOption = options.find((option) => option.sheet_id === e);
    setoptionslist(foundOption);
  };
  const doDelete = (item, index) => {
    Modal.confirm({
      style: { width: '400px' },
      title: '删除数据',
      content: (
        <div className="pl-6">删除后，该数据将不可恢复。确认删除吗？</div>
      ),
      onOk() {
        const newTabeldata = tabeldata.filter(
          (e: any) => e.column_id !== item.column_id
        );
        const newdata = newTabeldata.map((e: any, index) => {
          return {
            ...e,
            key: index + 1
          };
        });
        settabeldata(newdata);
        Message.success('删除成功！');
      }
    });
  };
  const changename = (value, item) => {
    const newTabeldata = tabeldata.map((e: any) => {
      if (e.column_id === item.column_id) {
        // 找到目标对象并修改它
        return { ...e, column_name: value };
      }
      return e;
    });

    const newdata = newTabeldata.map((e, index) => {
      return {
        ...e,
        key: index + 1
      };
    });
    // 更新状态
    settabeldata(newdata);
  };
  const changedescription = (value, item) => {
    const newTabeldata = tabeldata.map((e: any) => {
      if (e.column_id === item.column_id) {
        // 找到目标对象并修改它
        return { ...e, column_description: value };
      }
      return e;
    });
    const newdata = newTabeldata.map((e, index) => {
      return {
        ...e,
        key: index + 1
      };
    });
    // 更新状态
    settabeldata(newdata);
  };
  const onChangesemantic = (value, item) => {
    const newTabeldata = tabeldata.map((e: any) => {
      if (e.column_id === item.column_id) {
        // 找到目标对象并修改它
        return { ...e, is_semantic: value };
      }
      return e;
    });
    const newdata = newTabeldata.map((e, index) => {
      return {
        ...e,
        key: index + 1
      };
    });
    // 更新状态
    settabeldata(newdata);
  };
  const onChangeone = (value) => {
    setoptionslist({
      ...optionslist,
      valueinput1: value,
      valueinput2: value + 1
    });
  };
  const onChangetwo = (value) => {
    setoptionslist({
      ...optionslist,
      valueinput2: value
    });
  };
  return (
    <div className="ClassFromTable w-full rounded border border-[#CBD5E1] p-5">
      <Spin
        tip="正在进行字段解析中，请稍等..."
        className={' w-full'}
        loading={requestloading}
      >
        {options.length > 0 ? (
          <div className=" w-full">
            {options.length >= 2 ? (
              <div className="mb-4 border-b border-b-[1px] border-b-[#CBD5E1] pb-[16px]">
                <div>
                  <Alert content="识别到该文件中有多张数据表，仅支持单张表上传，请设置要提取的数据表" />
                </div>
                <div className="mt-[12px]">
                  <Select
                    value={optionslist.sheet_name}
                    onChange={(e) => onChangeSelect(e)}
                  >
                    {options.map((option: any, index) => (
                      <Option key={option.sheet_id} value={option.sheet_id}>
                        {option.sheet_name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            ) : null}

            <div className="flex items-center pb-4">
              <div className="flex items-center">
                <Required></Required>
                <div className={`ml-[4px] flex items-center`}>
                  表头
                  <Tooltip
                    position="top"
                    trigger="hover"
                    content="表头所在行会被解析为列名（字段名称）"
                  >
                    <ToolTipSvg className="ml-[4px]"></ToolTipSvg>
                  </Tooltip>
                  :
                </div>
                <div
                  className={`classInputName ml-[16px] flex h-[32px] w-[120px] items-center rounded border  p-[5px_12px] ${!optionslist.valueinput1 ? 'border-[#FF0000]' : 'border-[#cbd5e1]'} ${type === 'edit' ? 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]' : ''}`}
                >
                  第
                  <InputNumber
                    disabled={type == 'edit'}
                    min={1}
                    max={optionslist.total_row - 1}
                    onChange={(e) => onChangeone(e)}
                    value={optionslist.valueinput1}
                    size="mini"
                    className="mx-1 w-[60px]"
                  />
                  行
                </div>
              </div>
              <div className="ml-[24px] flex items-center">
                <Required></Required>
                <div className="ml-[4px] flex  items-center">
                  数据起始行
                  <Tooltip
                    position="top"
                    trigger="hover"
                    content="数据应在表头之下，即数据起始行 ＞ 表头所在行"
                  >
                    <ToolTipSvg className="ml-[4px]"></ToolTipSvg>
                  </Tooltip>
                  :
                </div>
                <div
                  className={`classInputName ml-[16px] flex h-[32px] w-[120px] items-center rounded border  p-[5px_12px] ${!optionslist.valueinput2 ? 'border-[#FF0000]' : 'border-[#cbd5e1]'} ${type === 'edit' ? 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]' : ''}`}
                >
                  第
                  <InputNumber
                    disabled={type == 'edit'}
                    min={optionslist.valueinput1 + 1}
                    max={optionslist.total_row}
                    onChange={(e) => onChangetwo(e)}
                    value={optionslist.valueinput2}
                    size="mini"
                    className="mx-1 w-[60px] "
                  />
                  行
                </div>
              </div>
            </div>
            <div>
              <Table
                scroll={{
                  y: 500
                }}
                columns={columns}
                data={tabeldata}
                pagination={false}
              />
            </div>
          </div>
        ) : (
          <NoDataEmpty />
        )}
      </Spin>
    </div>
  );
};
export default forwardRef(FromTable);
