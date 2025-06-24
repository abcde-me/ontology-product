import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveEffectVarConfirm from '../_base/components/remove-effect-var-confirm';
import useConfig from './use-config';
import type { TextParserNodeType } from './types';
import VarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/var-list';
import OutputVarList from '@/pages/workflowConfig/workflow/nodes/_base/components/variable/output-var-list';
import AddButton from '@/pages/workflowConfig/components/button/add-button';
import Field from '@/pages/workflowConfig/workflow/nodes/_base/components/field';
import Split from '@/pages/workflowConfig/workflow/nodes/_base/components/split';
import CodeEditor from '@/pages/workflowConfig/workflow/nodes/_base/components/editor/code-editor';
import TypeSelector from '@/pages/workflowConfig/workflow/nodes/_base/components/selector';
import {
  BlockEnum,
  type NodePanelProps
} from '@/pages/workflowConfig/workflow/types';
import BeforeRunForm from '@/pages/workflowConfig/workflow/nodes/_base/components/before-run-form';
import ResultPanel from '@/pages/workflowConfig/workflow/run/result-panel';
import {
  Table,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Typography
} from '@arco-design/web-react';
import { RiAddLine } from '@remixicon/react';
import { cloneDeep, difference, reduce, dropWhile } from 'lodash-es';
import { v4 as uuid4 } from 'uuid';
import { useNodes } from 'reactflow';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import EmptyIcon from '@/assets/empty.svg';
import { IconSearch } from '@arco-design/web-react/icon';
import FileList from './file-list';

const i18nPrefix = 'workflow.nodes.code';
const FormItem = Form.Item;
const Option = Select.Option;

// 分段方式选项
const segmentationOptions: any = [
  { value: 1, label: '按字符' },
  { value: 2, label: '按段落' },
  { value: 3, label: '按句子' }
];

const Panel: FC<NodePanelProps<TextParserNodeType>> = ({ id, data }) => {
  const [form] = Form.useForm();
  // const nodes = useNodes()
  // const startNode = nodes.find((node: any) => node.data.type === BlockEnum.Start);
  // const [filesData, setFilesData] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const inputRef = useRef(null);
  // const [pagination, setPagination] = useState({
  //   page: 1,
  //   limit: 5,
  //   total: 0,
  // });

  // const [fileNum, setFileNum] = useState(0);
  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const { t } = useTranslation('plugin__console-plugin-appforge');

  const {
    readOnly,
    inputs,
    handleFilesChange,
    // handleFilesCountChange,
    handleFiledsChange
  } = useConfig(id, data);

  // const columns = [
  //   {
  //     title: '文件名',
  //     dataIndex: 'name',
  //     width: 170,
  //     filterIcon: <IconSearch />,
  //     filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => {
  //       return (
  //         <div className='arco-table-custom-filter'>
  //           <Input.Search
  //             ref={inputRef}
  //             placeholder='输入文件名搜索'
  //             value={filterKeys[0] || ''}
  //             onChange={(value) => {
  //               setFilterKeys(value ? [value] : []);
  //             }}
  //             onSearch={() => {
  //               confirm();
  //             }}
  //           />
  //         </div>
  //       );
  //     },
  //     onFilter: (value, row) => (value ? row.name.indexOf(value) !== -1 : true),
  //     onFilterDropdownVisibleChange: (visible) => {
  //       if (visible) {
  //         setTimeout(() => inputRef.current.focus(), 150);
  //       }
  //     },
  //     render(col, record) {
  //       return <>
  //         <EllipsisPopover value={col} isEdit={false} preferTypography />
  //       </>
  //     }
  //   },
  //   {
  //     title: '类型',
  //     dataIndex: 'type',
  //     filters: [
  //       {
  //         text: 'docx',
  //         value: 'docx'
  //       },
  //       {
  //         text: 'pdf',
  //         value: 'pdf'
  //       }
  //     ],
  //     onFilter: (value, row) => row.type.indexOf(value) > -1,
  //   },
  //   {
  //     title: '文件大小',
  //     dataIndex: 'size'
  //   },
  //   {
  //     title: '创建时间',
  //     dataIndex: 'created_at',
  //     sorter: (a, b) => a.created_at.localeCompare(b.created_at),
  //   }
  // ]

  // const loadFiles = (params: any) => {
  //   try {
  //     setLoading(true);
  //     const item = {
  //       data: {
  //         data: [...new Array(5)].map((_, index) => {
  //           return {
  //             id: String(1000 * params.page + index),
  //             name: String(1000 * params.page + index) + 'Jane DoeJane DoeJane DoeJane DoeJane DoeJane Doe ',
  //             type: index % 2 === 0 ? 'docx' : 'pdf',
  //             size: '3.8M',
  //             created_at: '2025-05-05 05:05:05' + index
  //           };
  //         }),
  //         total: 100
  //       }
  //     }
  //     // console.log('列表数据:', item);
  //     const { data = [], total = 0 } = item.data;
  //     setFilesData(data || []);
  //     setPagination((prevPagination) => ({
  //       ...prevPagination,
  //       total: total
  //     }));

  //     const keysSet = new Set([...selectedRowKeys]);
  //     data.filter(d => !inputs.files?.includes(d.id)).forEach(d => {
  //       keysSet.add(d.id);
  //     });
  //     setSelectedRowKeys(Array.from(keysSet));
  //     console.log('loadFiles', total, inputs.files)
  //     handleFilesChange(inputs.files, total - inputs.files.length)
  //   } catch (error) {
  //     setFilesData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // const onChangeTable = (pagination, sorter, filters, extra) => {
  //   // console.log('表格变化:', { pagination, sorter, filters, extra });

  //   if (extra.action === 'paginate') {
  //     setPagination((prev) => ({
  //       ...prev,
  //       page: pagination.current,
  //       limit: pagination.pageSize
  //     }));
  //     loadFiles({
  //       ...pagination,
  //       page: pagination.current,
  //       limit: pagination.pageSize
  //     });
  //     return;
  //   }
  // }

  // useEffect(() => {
  //   loadFiles({
  //     page: pagination.page,
  //     limit: pagination.limit
  //   });
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <div className="wk-node-panel-content text-parser-panel-content mt-[16px]">
      <Form
        form={form}
        disabled={readOnly}
        autoComplete="off"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        initialValues={{
          ...data
        }}
        layout="vertical"
        onValuesChange={(_, v) => {
          // console.log('valuechange', _, v);
        }}
      >
        <FormItem
          label={`选择文件：已选择${inputs.selected_files_num}个文件`}
          field="files"
          labelAlign="left"
          required
        >
          {/* <Table
            className="files-table"
            loading={loading}
            // TODO：ts错误
            // @ts-expect-error
            columns={columns}
            // TODO: ts错误
            // @ts-expect-error
            pagePosition={null}
            pagination={{
              showTotal: true,
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total
            }}
            onChange={onChangeTable}
            rowSelection={{
              selectedRowKeys,
              onSelect: (selected, record, selectedRows) => {
                console.log('onSelect:', selected, record, selectedRows);
                if (selected) {
                  if (!selectedRowKeys.includes(record.id)) {
                    setSelectedRowKeys([...selectedRowKeys, record.id]);
                  }
                  if (inputs.files.includes(record.id)) {
                    handleFilesChange(inputs.files.filter(f => f !== record.id), inputs.selected_files_num + 1);
                  }
                } else {
                  if (selectedRowKeys.includes(record.id)) {
                    setSelectedRowKeys(old => old.filter(key => key !== record.id));
                  }
                  if (!inputs.files.includes(record.id)) {
                    handleFilesChange([...inputs.files, record.id], inputs.selected_files_num - 1);
                  }
                }
              },
              onSelectAll: (selected) => {
                console.log('onSelectAll:', selected);
                const currentPageFileIds = filesData.map(f => f.id);
                if (selected) {
                  setSelectedRowKeys(Array.from(new Set([...selectedRowKeys, ...currentPageFileIds])));
                  let counter = 0
                  currentPageFileIds.forEach((id) => {
                    if (inputs.files.includes(id)) {
                      counter++
                    }
                  })
                  handleFilesChange(inputs.files.filter(f => !currentPageFileIds.includes(f)), inputs.selected_files_num + counter);
                } else {
                  setSelectedRowKeys(oldKeys => oldKeys.filter((key) => !currentPageFileIds.includes(key)));
                  let counter = 0
                  currentPageFileIds.forEach((id) => {
                    if (!inputs.files.includes(id)) {
                      counter++
                    }
                  })
                  handleFilesChange(Array.from(new Set([...inputs.files, ...currentPageFileIds])), inputs.selected_files_num - counter);
                }
              }
            }}
            data={filesData}
            rowKey="id"
            noDataElement={<div className='flex flex-col items-center justify-center'>
              <EmptyIcon className='size-[48px]'></EmptyIcon>
              <span className='text-[#6E7B8D]'>请先选择源数据目录</span>
            </div>}
          /> */}
          <FileList
            catetoryId={1}
            files={inputs.files}
            selectedFilesNum={inputs.selected_files_num}
            handleFilesChange={handleFilesChange}
          />
        </FormItem>
        <Split className="my-[16px]" />
        <FormItem
          label="分段方式："
          field="text_slice_rule"
          labelAlign="left"
          required
          extra="选择切分文本的方式，目前支持按照字符、句子和段落。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="分段最大长度："
          field="slice_max_size"
          labelAlign="left"
          required
          extra="取值范围：800-1200"
        >
          <InputNumber min={800} max={1200} />
        </FormItem>
        <FormItem
          label="文本处理规则："
          field="text_proc_rules"
          labelAlign="left"
          extra="选择是否需要替换掉标点和一些特殊字符，以及是否删除有效URL和电子邮箱地址。"
        >
          <Checkbox.Group
            options={[
              { label: '替换表达和特殊符号', value: 1 },
              { label: '删除有效URL和电子邮箱地址', value: 2 }
            ]}
          />
        </FormItem>
        <FormItem
          label="多模态模型："
          field="text_orc_model_id"
          labelAlign="left"
          extra="当遇到文本文件（例如：ppt，pdf，doc）中的图片时采用的ocr模型名称。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="图片描述模型："
          field="text_pic_model_id"
          labelAlign="left"
          extra="用于指定对文本文件中的图片进行caption 时使用的模型。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          label="文本嵌入模型："
          field="text_emb_model_id"
          labelAlign="left"
          extra="指定对文本内容进行embedding 的模型。"
        >
          <Select>
            {segmentationOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
      </Form>
    </div>
  );
};

export default React.memo(Panel);
