import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import './index.less';
import { useHistory } from 'react-router-dom';
import { debounce } from 'lodash-es';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Upload,
  Message,
  Space,
  Cascader,
  InputNumber,
  Tooltip,
  Progress
} from '@arco-design/web-react';
import Ridioright from '@/assets/ridioright.svg';
import Check from '@/assets/check.svg';
import { useLocation } from 'react-router-dom';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDelete,
  IconFile,
  IconFilePdf,
  IconImage,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import { useState } from 'react';
import { get } from 'lodash';
import { getdatasetstree } from '@/api/datasetsV2';
import { PrefixV2 } from '@/api/endpoints';
import { getToken } from '@/utils/request';
import BaseListIcon from '@/assets/baselist.png';
import TextTruncate from '../../configurationpage/compontents/TextTruncate';
import UpLoad from '@/assets/file/upload.svg';
import FromTable from '../FromTable/index';
import TagTree from '../TagTree/index';
import SwitchTag from '../SwitchTag';
import useTagEment from '../../../store/useTagEment';

const uploadUrl = `${PrefixV2}/files/upload`;

function DemoForm(props, ref) {
  //交互事件
  useImperativeHandle(ref, () => ({
    //新建知识库
    submitFromOnc: () => {
      submitFromOncFunc();
    },
    clearFromOnc: () => {
      clearFromOncFunc();
    },
    //编辑切片
    submitEditFromOnc: () => {
      submitEditFromOncFunc();
    },
    clearEditFromOnc: () => {
      clearEditFromOncFunc();
    },
    //切片配置
    submitEditFromOnM: () => {
      submitEditFromOnMFunc();
    },
    clearEditFromOnM: () => {
      clearEditFromOnMFunc();
    },
    submitaddfile: () => {
      submitaddfileFunc();
    },
    clearfileFrom: () => {
      clearfileFromFunc();
    }
  }));
  const {
    typemodel,
    seteditChildVisible,
    seteditManageVisible,
    FuncEdit,
    FuncEditM,
    detailsdata,
    setaddfileVisible,
    FunSubmitAddfile,
    switchList,
    typeDisabled
  } = props;

  const RadioGroup = Radio.Group;
  const { Option } = Select;
  const [optionsCascader, setoptionsCascader] = useState([]); //知识库目录
  const [upfiletype, setupfiletype] = useState('text');
  const { name = '', description = '', process_rule = {} } = detailsdata || {};
  const { mode = '', rules = {} } = process_rule || {};
  const history = useHistory();
  const [form] = Form.useForm();
  const [formvalues, setformvalues] = useState<any>({});
  const [staturules1, setstaturules1] = useState<any>('');
  const [staturules2, setstaturules2] = useState<any>('');
  const [fileList, setFileList] = useState<any>([]);
  const {
    switchTag,
    switchTagVisible,
    onHandTreeTag,
    onSwitchTagVisible,
    onSwitchTag,
    onHandSwitchTreeTag
  } = useTagEment();

  const upfilehandleChange = (e) => {
    setFileList([]);
    setupfiletype(e);
  };
  // 初始状态计算函数
  const calculateInitialState = () => {
    if (typemodel === 'createPolicy') {
      return {
        name: name
          ? name
          : `我的知识库-${+localStorage.getItem('knowledgetotal')! || '1'}`,
        description: description,
        uploadiconV: [],
        selectedOptionV:
          JSON.parse(localStorage.getItem('cascader') || '[]') || [],
        uploadfileV: [],
        parseTacticsV: ['text_ocr'],
        sublevelTacticsV: 'automatic',
        logotypeV: [
          'Period',
          'Comma',
          'Question Mark',
          'Exclamation Mark',
          'Ellipsis',
          'Line Break'
        ],
        sliceLengthV: '600',
        sliceOverlapLengthV: '15',
        expressionV: '',
        regularPositionV: 'prev',
        spreadsheet_schema: {
          sheet_id: '',
          header_line_idx: '',
          start_line_idx: '',
          columns: []
        }
      };
    } else {
      return {
        name: name,
        description: description,
        uploadiconV: [],
        selectedOptionV:
          JSON.parse(localStorage.getItem('cascader') || '[]') || [],
        uploadfileV: [],
        parseTacticsV: rules.parsing_strategy || ['text_ocr'],
        sublevelTacticsV: mode || 'automatic',
        logotypeV: rules.segmentation?.separators || [
          'Period',
          'Comma',
          'Question Mark',
          'Exclamation Mark',
          'Ellipsis',
          'Line Break'
        ],
        sliceLengthV: rules.segmentation?.max_tokens || '600',
        sliceOverlapLengthV: rules.segmentation?.chunk_overlap || '15',
        expressionV: rules.segmentation?.regex || '',
        regularPositionV: rules.segmentation?.matchstrategy || 'prev'
      };
    }
  };

  const [initFromValue, setinitFromValue] = useState(calculateInitialState());

  useEffect(() => {
    setinitFromValue(calculateInitialState());
  }, [detailsdata, typemodel]);

  // 当 initFromValue 更新时同步到表单
  useEffect(() => {
    if (form) {
      form.setFieldsValue(initFromValue);
    }
  }, [initFromValue]);
  const traverseAndTransform = (node) => {
    // 检查当前节点是否包含 'childs' 属性
    node.label = node.name;
    node.value = node.id;
    if (node.childs) {
      // 替换 'childs' 为 'children'
      node.children = node.childs;
      delete node.childs;

      // 遍历 children 中的每个节点并递归处理
      node.children.forEach((child) => traverseAndTransform(child));
    }
    return node;
  };
  useEffect(() => {
    const initialize = async () => {
      try {
        const itemtree = await getdatasetstree();
        const { data: treed = [] } = itemtree;
        const options = treed.map((node) => traverseAndTransform(node));

        setoptionsCascader(options);
      } catch {}
    };
    initialize();
  }, []);
  const CheckboxOne = [
    {
      value: 'text_ocr',
      name: '文字识别',
      title: '基于规则的文档提取',
      placeholder: null
    },
    {
      value: 'image_ocr',
      name: '图片文字识别',
      title: '解析图片、扫描件中的文字信息',
      placeholder: null
    },
    {
      value: 'table_ocr',
      name: '表格解析',
      title: '保留文内表格中的结构化信息',
      placeholder:
        '开启后会调用表格深度解析服务，提升表格解析效果，尤其在涉及跨行跨列等复杂表格时候;关闭后可提升解析速度。'
    }
  ];
  const RadioOne = [
    {
      value: 'automatic',
      name: '自动切片',
      title: '通用格式文本常见切分方法',
      placeholder: '经评测可在多数⽂档上获得较佳的检索效果。'
    },
    {
      value: 'split_by_chunk',
      name: '按常⻅标识符切分',
      title: '配置常见的标识符、切片最大长度等选项',
      placeholder: '按照常见中英文标点拆分句子后按序累加为完整切片'
    },
    {
      value: 'split_by_page',
      name: '按⻚切分',
      title: '适用于PPT、单页图标等',
      placeholder: '以⽂档物理⻚⾯为划分单位，确保单⻚内容完整独⽴。'
    },
    {
      value: 'split_by_regex',
      name: '⾃定义正则切分',
      title: '通过正则表达式，自定义匹配切片分隔符',
      placeholder: (
        <div className="text-[12px]">
          规则详见：
          <span
            className="cursor-pointer text-[12px] font-normal text-[#007DFA]"
            onClick={() =>
              window.open(
                'https://docs.python.org/zh-cn/3.12/howto/regex.html',
                '_blank'
              )
            }
          >
            正则表达式指南
          </span>
        </div>
      )
    },
    {
      value: 'split_by_title',
      name: '按层级切分',
      title: '根据文档中的标题层级结构，智能切分内容片段',
      placeholder:
        '以多级标题作为切片分隔；适用于论文、法律合同等标题层级结构清晰的文本；开启后会增加处理时间。'
    }
  ];
  const regularoption = [
    {
      value: 'prev',
      name: '正则式与前序切片合并'
    },
    {
      value: 'next',
      name: '正则式与后序切片合并'
    }
  ];
  const formItemLayout = {
    labelCol: {
      span: 1.5
    },
    wrapperCol: {
      span: 22.5
    }
  };

  const onValuesChange = (changeValue, values) => {
    setformvalues(values);
  };
  const uploadFileList = React.useMemo(() => {
    return fileList.map((x: any) => {
      if (x.status === 'done' && x.response.message != '请求成功') {
        Message.error(x.response.message);
      }
      if (x.status === 'error' && x.response.message != '请求成功') {
        Message.error('解析失败，请检查文件内容或联系技术支持');
      }
      return x.status === 'error'
        ? {
            ...x,
            response: get(x, 'response.message', '网络错误')
          }
        : x;
    });
  }, [fileList]);
  const onProgress = (file) => {
    setFileList((files) => {
      return files.map((x) => (x.uid === file.uid ? file : x));
    });
  };
  const showDebouncedError = debounce(
    (message) => {
      Message.error(message);
    },
    500,
    { leading: true, trailing: false }
  );

  const checkFile = (file, list) => {
    if (upfiletype == 'text') {
      // 检查文件数量
      if (Array.isArray(list) && list?.length > 20) {
        showDebouncedError('单次最多上传20个文件');
        return false;
      }

      // 检查文件类型
      const isValidFileType = /\.(docx|pdf|txt|doc)$/i.test(file.name);
      if (!isValidFileType) {
        showDebouncedError('只能上传 doc、docx、pdf、txt 文件');
        return false;
      }

      // 检查文件大小
      if (file.size > 200 * 1024 * 1024) {
        showDebouncedError('单文件大小不能超过200M');
        return false;
      }
    } else {
      // 检查文件数量
      if (Array.isArray(list) && list?.length > 1) {
        showDebouncedError(
          '禁止上传多个文件。一次只能上传一个文件，请删除后重试'
        );
        return false;
      }
      if (uploadFileList.length >= 1) {
        showDebouncedError(
          '禁止上传多个文件。一次只能上传一个文件，请删除后重试'
        );
        return false; // 阻止上传
      }

      // 检查文件类型
      const isValidFileType = /\.(|csv|xlsx)$/i.test(file.name);
      if (!isValidFileType) {
        showDebouncedError(
          '不支持的文件类型。请上传 .csv 或 .xlsx 格式的表格文件。'
        );
        return false;
      }

      // 检查文件大小
      if (file.size > 20 * 1024 * 1024) {
        showDebouncedError(' 文件大小超出限制（20MB）。请拆分或压缩后上传。');
        return false;
      }
    }

    return true;
  };

  const clearFromOncFunc = () => {
    form.resetFields();
    setFileList([]);
    window.history.back();
  };
  const isDuplicate = (array, field) => {
    const seen = new Set();
    return array.some((item) => {
      const value = item[field];
      if (seen.has(value)) {
        return true; // 如果已经出现过该值，返回 true，表示重复
      }
      seen.add(value);
      return false;
    });
  };
  const submitFromOncFunc = async () => {
    try {
      const values = await form.validate();
      if (upfiletype == 'tabel') {
        values.parseTacticsV = ['text_ocr'];
        values.sublevelTacticsV = 'split_by_line';
        const result = isDuplicate(
          values.spreadsheet_schema.columns,
          'column_name'
        );
        if (!result) {
          history.push({
            pathname: '/tenant/compute/appforge/knowledge',
            state: { values: values }
          });
        } else {
          Message.error('检测到重复列名，请修改为唯一列名。');
        }
      } else {
        history.push({
          pathname: '/tenant/compute/appforge/knowledge',
          state: { values: values }
        });
      }
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  //编辑切片
  const submitEditFromOncFunc = async () => {
    try {
      const values = await form.validate();
      console.log(values, '编辑分段配置');

      onHandTreeTag([]);
      onSwitchTagVisible(false);
      onSwitchTag('');
      onHandSwitchTreeTag([]);
      FuncEdit(values);
      seteditChildVisible(false);
      setFileList([]);
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  //切片配置
  const submitEditFromOnMFunc = async () => {
    try {
      const values = await form.validate();
      onHandTreeTag([]);
      onSwitchTag('');
      onHandSwitchTreeTag([]);
      FuncEditM(values);
      seteditManageVisible(false);
      setFileList([]);
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  const submitaddfileFunc = async () => {
    try {
      const values = await form.validate();

      if (upfiletype == 'tabel') {
        values.parseTacticsV = ['text_ocr'];
        values.sublevelTacticsV = 'split_by_line';
        const result = isDuplicate(
          values.spreadsheet_schema.columns,
          'column_name'
        );
        if (!result) {
          FunSubmitAddfile(values);
          setaddfileVisible(false);
          setFileList([]);
          onHandTreeTag([]);
          onSwitchTag('');
          onHandSwitchTreeTag([]);
        } else {
          Message.error('检测到重复列名，请修改为唯一列名。');
        }
      } else {
        FunSubmitAddfile(values);
        setaddfileVisible(false);
        setFileList([]);
        onHandTreeTag([]);
        onSwitchTag('');
        onHandSwitchTreeTag([]);
      }
    } catch {}
  };
  const clearEditFromOncFunc = () => {
    form.resetFields();
    onSwitchTagVisible(false);
    setFileList([]);
    onHandTreeTag([]);
    onSwitchTag('');
    onHandSwitchTreeTag([]);
    seteditChildVisible(false);
  };
  const clearEditFromOnMFunc = () => {
    form.resetFields();
    setFileList([]);
    onHandTreeTag([]);
    onSwitchTag('');
    onHandSwitchTreeTag([]);
    seteditManageVisible(false);
  };
  const clearfileFromFunc = () => {
    form.resetFields();
    setFileList([]);
    onSwitchTagVisible(false);
    onHandTreeTag([]);
    onSwitchTag('');
    onHandSwitchTreeTag([]);
    setaddfileVisible(false);
  };
  const FimsetFieldsValue = (item) => {
    form.setFieldsValue(item);
  };
  //自定义文件列表
  const renderUploadList = (filesList: any, props: any) => (
    <div className="mt-5 flex flex-col gap-2">
      {filesList.map((e: any, index: any) => {
        const code = e?.response?.code || null;
        const bgColorClass =
          e.status === 'uploading'
            ? 'bg-[#EEF6FF]'
            : e.status === 'done' && code == 'Success'
              ? 'bg-[#ECFDF5]'
              : e.status === 'error' || code !== 'Success'
                ? 'bg-[#fef2f2]'
                : 'bg-[#fef2f2]';
        return (
          <div
            className={` flex flex-1 items-center rounded py-2 pl-3 pr-3 text-xs ${bgColorClass}`}
            key={index}
          >
            <div className="mr-3 h-[16px] w-[16px]">
              {e.originFile.type === 'image/bmp' ||
              e.originFile.type === 'image/jpg' ||
              e.originFile.type === 'image/jpeg' ||
              e.originFile.type === 'image/png' ||
              e.originFile.type === 'image/tiff' ? (
                <IconImage className="h-[16px] w-[16px] text-[16px]" />
              ) : e.originFile.type == 'application/pdf' ? (
                <IconFilePdf className="h-[16px] w-[16px] text-[16px]" />
              ) : (
                <IconFile className="h-[16px] w-[16px] text-[16px]" />
              )}
            </div>
            <div
              className={`flex h-[22px] w-full items-center text-[14px] font-normal `}
            >
              <div className=" w-[16px]  flex-1 cursor-pointer  text-left text-[14px] text-[var(--color-text-1)]">
                <TextTruncate text={e.name} />
              </div>
            </div>
            <div className=" h-[16px] px-[8px]">
              {e.status === 'uploading' ? (
                <Progress size="mini" percent={e.percent} />
              ) : e.status === 'done' && code == 'Success' ? (
                <IconCheckCircleFill
                  className="h-[16px] w-[16px] text-[16px]"
                  style={{ color: 'rgb(var(--success-6))' }}
                />
              ) : e.status === 'error' || code !== 'Success' ? (
                <Tooltip content={e.response?.message} position="top">
                  <IconCloseCircleFill
                    className="h-[16px] w-[16px] text-[16px]"
                    style={{ color: 'rgb(var(--danger-6))' }}
                  />
                </Tooltip>
              ) : (
                ''
              )}
            </div>
            <div className="h-[16px] w-[16px] cursor-pointer">
              <IconDelete
                style={{ fontSize: 16 }}
                onClick={() => {
                  props.onRemove(e);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
  return (
    <Form
      className="fromstyle"
      form={form}
      {...formItemLayout}
      onValuesChange={onValuesChange}
      initialValues={initFromValue}
    >
      {typemodel !== 'editChild' && typemodel !== 'editManage' ? (
        <div className="mb-4 text-[16px] font-[600] leading-[24px] text-[#000]">
          基本信息
        </div>
      ) : null}
      {typemodel !== 'editManage' ? (
        <div>
          {/* 输入框 */}
          <Form.Item
            label="知识库名称："
            validateStatus={staturules1}
            help="支持50位字符，只能输入字母、中文、数字、下划线（_）、中划线（-）、点（.），并且必须以字母或中文开头"
            extra="支持50位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头"
            field="name"
            rules={[
              { required: true, message: '请输入' },
              {
                validator: (item, value: any) => {
                  const regex =
                    /^[A-Za-z\u4e00-\u9fa5][A-Za-z0-9\u4e00-\u9fa5_.-]{0,49}$/;
                  if (!regex.test(item)) {
                    setstaturules1('error');
                    return Promise.reject('请输入有效的名称');
                  } else {
                    setstaturules1('');
                    return Promise.resolve();
                  }
                }
              }
            ]}
            wrapperCol={{
              span: 14
            }}
          >
            <Input
              disabled={typeDisabled}
              placeholder="请输入"
              showWordLimit
              maxLength={{ length: 50 }}
            />
          </Form.Item>

          {/* 文本域 */}
          <Form.Item
            label="知识库描述："
            // field="description"
            help="支持0-100位字符"
            validateStatus={staturules2}
            rules={[
              { required: false, message: '请输入描述' },
              {
                validator: (item, value: any) => {
                  const regex = /^.{0,100}$/;

                  if (!regex.test(item)) {
                    setstaturules2('error');
                    return Promise.reject('请输入100以内字符');
                  } else {
                    setstaturules2('');
                    return Promise.resolve();
                  }
                }
              }
            ]}
            wrapperCol={{
              span: 14
            }}
          >
            <Input.TextArea
              disabled={typeDisabled}
              showWordLimit
              maxLength={{ length: 100 }}
              placeholder="请输入知识库内容备注说明，便于查找和管理知识库。描述不影响Agent对知识库的调用效果"
              rows={4}
            />
          </Form.Item>

          {/* 上传图标 */}
          <Form.Item label="上传图标：" field="uploadiconV">
            <img src={BaseListIcon} alt="" className="h-[64px] w-[64px]" />
          </Form.Item>

          {/* 下拉框 */}
          {optionsCascader.length > 0 ? (
            <Form.Item
              label="所属群组："
              field="selectedOptionV"
              rules={[{ required: true, message: '请选择一个选项' }]}
              wrapperCol={{
                span: 14
              }}
            >
              <Cascader
                placeholder="请选择"
                changeOnSelect
                options={optionsCascader}
                showSearch
                allowClear
              />
            </Form.Item>
          ) : null}
        </div>
      ) : null}

      {typemodel !== 'editChild' ? (
        <div>
          {/* 本地上传文件 */}
          {typemodel !== 'editManage' ? (
            <div>
              <Form.Item
                field="filetype"
                required
                label="文件类型："
                wrapperCol={{
                  span: 20
                }}
              >
                <RadioGroup
                  type="button"
                  name="lang"
                  className={'uploadfileV'}
                  defaultValue={upfiletype}
                  onChange={upfilehandleChange}
                >
                  <Radio value="text">文本型数据</Radio>
                  <Radio value="tabel">表格型数据</Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item
                field="uploadfileV"
                required
                label="文件上传："
                rules={[{ required: true, message: '请上传文件' }]}
                className="knowbase-upload-formitem"
                wrapperCol={{
                  span: 20
                }}
              >
                <Upload
                  className="bg-white"
                  drag
                  // accept=".doc,.docx,.pdf,.txt"
                  // disabled={upfiletype !== 'text' && uploadFileList.length >= 1}
                  multiple
                  action={uploadUrl}
                  headers={{ ...getToken() }}
                  onChange={setFileList}
                  onProgress={onProgress}
                  fileList={uploadFileList}
                  beforeUpload={(file, list) => checkFile(file, list)}
                  renderUploadList={renderUploadList}
                >
                  <div className="flex w-full flex-col items-center  rounded-[2px]  border border-dashed border-[#CBD5E1] px-[50px] py-[40px] ">
                    <div className=" h-[80px] w-[80px]">
                      <UpLoad className=" h-[80px] w-[80px]"></UpLoad>
                    </div>
                    <div className="font-pingfang mb-[10px] mt-[10px] text-sm font-medium leading-5 leading-[22px] text-[#1E293B]">
                      将文件拖拽到此处或
                      <span className="font-pingfang text-sm font-medium leading-5 text-[#007DFA]">
                        点击上传
                      </span>
                    </div>
                    <div className="  font-pingfang text-ellipsis text-center text-xs font-normal leading-[18px] text-[#6E7B8D]">
                      {upfiletype == 'text'
                        ? '支持上传.doc .docx .pdf .txt文件；单次至多上传20个文件；每个文件不超过200MB'
                        : '从本地文件中导入表格内容，支持.csv和.xlsx文件格式，文件大小限制在20MB以内'}
                    </div>
                  </div>
                </Upload>
              </Form.Item>
              {upfiletype == 'text' ? (
                <div className="mb-4 text-[16px] font-[600] leading-[24px] text-[#000]">
                  策略配置
                </div>
              ) : null}
            </div>
          ) : null}
          {upfiletype == 'text' ? (
            <div>
              {/* 多选框 */}
              <Form.Item
                label="解析策略："
                field="parseTacticsV"
                className="sublevelTacticsV"
                rules={[{ required: true, message: '请选择至少一个' }]}
              >
                <Checkbox.Group>
                  {CheckboxOne.map((e, index) => {
                    return (
                      <Checkbox
                        value={e.value}
                        key={index}
                        disabled={e.value == 'text_ocr' ? true : false}
                      >
                        {({ checked }) => {
                          return (
                            <Space
                              align="start"
                              className={`custom-checkbox-card ${checked ? 'custom-checkbox-card-checked' : ''}`}
                            >
                              {checked ? (
                                <div>
                                  <Ridioright className="Ridioright"></Ridioright>
                                  <Check className="Check"></Check>
                                </div>
                              ) : (
                                <div></div>
                              )}
                              <div>
                                <div className="checkbox-title">{e.name}</div>
                                <div className="checkbox-desc">
                                  <Tooltip
                                    position="top"
                                    trigger="hover"
                                    content={e.placeholder}
                                  >
                                    {e.title}
                                  </Tooltip>
                                </div>
                              </div>
                            </Space>
                          );
                        }}
                      </Checkbox>
                    );
                  })}
                </Checkbox.Group>
              </Form.Item>
              {/* 单选框 */}
              <Form.Item
                label="切片策略："
                field="sublevelTacticsV"
                className="sublevelTacticsV"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Radio.Group
                  onChange={(e) => {
                    // e.target.value 获取当前选中的值
                    console.log('选中的值:', e);
                  }}
                >
                  {RadioOne.map((e, index) => {
                    return (
                      <Radio value={e.value} key={index}>
                        {({ checked }) => {
                          return (
                            <Space
                              align="start"
                              className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}
                            >
                              <div>
                                <div className="radio-title">{e.name}</div>
                                <div className="radio-desc">
                                  <Tooltip
                                    position="top"
                                    trigger="hover"
                                    content={e.placeholder}
                                  >
                                    {e.title}
                                  </Tooltip>
                                </div>
                              </div>
                            </Space>
                          );
                        }}
                      </Radio>
                    );
                  })}
                </Radio.Group>
              </Form.Item>
              {formvalues && formvalues.sublevelTacticsV == 'split_by_chunk' ? (
                <div>
                  <Form.Item
                    label="标识符："
                    field="logotypeV"
                    rules={[{ required: true, message: '请选择选项' }]}
                    wrapperCol={{
                      span: 14
                    }}
                    tooltip={
                      <div>
                        按照所选的标识符初步切分⽂本；切分后的⽂本会再组合成单⼀切⽚内容。
                      </div>
                    }
                  >
                    <Select placeholder="请选择" mode="multiple" allowClear>
                      <Option value="Period">中/英⽂句号</Option>
                      <Option value="Comma">中/英⽂逗号</Option>
                      <Option value="Question Mark">中/英⽂问号</Option>
                      <Option value="Exclamation Mark">中/英⽂叹号</Option>
                      <Option value="Ellipsis">中/英⽂省略号</Option>
                      <Option value="Line Break">中/英⽂换行符</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="切片最大长度："
                    field="sliceLengthV"
                    className="formItem-c"
                    rules={[{ required: true, message: '请输入' }]}
                    wrapperCol={{
                      span: 14
                    }}
                    tooltip={
                      <div>
                        单一切片的最大长度。切片越长，召回的上下文越丰富；长度越小，召回的信息越精简；
                      </div>
                    }
                  >
                    <InputNumber min={100} step={1} max={8000} />
                  </Form.Item>
                  <Form.Item
                    label="切片重叠长度："
                    field="sliceOverlapLengthV"
                    rules={[{ required: true, message: '请输入' }]}
                    wrapperCol={{
                      span: 14
                    }}
                  >
                    <InputNumber min={0} max={25} suffix="%" step={1} />
                  </Form.Item>
                </div>
              ) : null}
              {formvalues && formvalues.sublevelTacticsV == 'split_by_page' ? (
                <div>
                  <Form.Item
                    className="formItem-c"
                    label="切片最大长度："
                    field="sliceLengthV"
                    rules={[{ required: true, message: '请输入' }]}
                    wrapperCol={{
                      span: 14
                    }}
                    tooltip={
                      <div>
                        按照所选的标识符初步切分⽂本；单⻚超出最⼤⻓度将⾃动截断。
                      </div>
                    }
                  >
                    <InputNumber min={100} step={1} max={8000} />
                  </Form.Item>
                  <Form.Item
                    label="切片重叠长度："
                    field="sliceOverlapLengthV"
                    rules={[{ required: true, message: '请输入' }]}
                    wrapperCol={{
                      span: 14
                    }}
                  >
                    <InputNumber min={0} max={25} suffix="%" step={1} />
                  </Form.Item>
                </div>
              ) : null}
              {formvalues && formvalues.sublevelTacticsV == 'split_by_regex' ? (
                <div>
                  <Form.Item
                    label="表达式："
                    field="expressionV"
                    // validateStatus={staturules3}
                    // help="请输⼊正则表达式，如第d+章"
                    rules={[
                      { required: true, message: '请输⼊正则表达式，如第d+章' }
                      // {
                      //   validator: (text, value) => {
                      //     // 使用正则表达式进行校验
                      //     const regex = /^(第\d+章|\(\d+\))$/;
                      //     if (text && !regex.test(text)) {
                      //       setstaturules3('error');
                      //       return Promise.reject('请输⼊正则表达式，如第d+章');
                      //     } else {
                      //       setstaturules3('');
                      //       return Promise.resolve();
                      //     }
                      //   }
                      // }
                    ]}
                    wrapperCol={{
                      span: 14
                    }}
                    tooltip={
                      <div>
                        通过正则表达式，⾃定义匹配的分隔符。如按章节标题
                        (“第*章”)切分可输⼊第\d+章,;按括号序号切分(x)可输⼊“(d+)”
                      </div>
                    }
                  >
                    <Input
                      placeholder="请输⼊正则表达式，如第d+章"
                      maxLength={{ length: 250 }}
                      showWordLimit
                    />
                  </Form.Item>
                  <Form.Item
                    label="正则式位置："
                    field="regularPositionV"
                    rules={[{ required: true, message: '请输入' }]}
                    wrapperCol={{
                      span: 14
                    }}
                    tooltip={
                      <div>
                        正则式与前序切片合并：将正则式拼接至前一个切片的末尾；正则式与后序切片合并：将正则式拼接至后一个切片的开头
                      </div>
                    }
                  >
                    <Radio.Group>
                      {regularoption.map((e, index) => {
                        return (
                          <Radio value={e.value} key={index}>
                            {e.name}
                          </Radio>
                        );
                      })}
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    className="formItem-c"
                    label="切片最大长度："
                    field="sliceLengthV"
                    rules={[{ required: true, message: '请输入' }]}
                    wrapperCol={{
                      span: 14
                    }}
                    tooltip={
                      <div>
                        按照所选的标识符初步切分⽂本；切分后的⽂本会再组合
                        成单⼀切⽚内容。
                      </div>
                    }
                  >
                    <InputNumber min={100} step={1} max={8000} />
                  </Form.Item>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              {fileList.length > 0 &&
              fileList[0]?.response?.message == '请求成功' ? (
                <Form.Item
                  label="表结构配置："
                  field="spreadsheet_schema"
                  className="spreadsheet_schema"
                  // validateStatus={staturules3}
                  rules={[
                    {
                      required: true,
                      validator: (value, callback) => {
                        // const allNamesValid = value.columns.every(
                        //   (item) =>
                        //     item.column_name && item.column_name.trim() !== ''
                        // );
                        // console.log(allNamesValid, 'allNamesValid');

                        // if (
                        //   !value ||
                        //   !value.sheet_id ||
                        //   !value.header_line_idx ||
                        //   !value.start_line_idx
                        // ) {
                        //   // setstaturules3('error');
                        //   return Promise.reject(
                        //     new Error('请填写完整的表结构配置')
                        //   );
                        // }
                        const trueCount = value.columns.filter(
                          (item) => item.is_semantic === true
                        ).length;
                        const columnname = value.columns.filter(
                          (item) => item.column_name === ''
                        ).length;
                        if (columnname >= 1) {
                          Message.error('列名不能为空');
                          return Promise.reject(
                            new Error('请填写完整的表结构配置')
                          );
                        }
                        // 验证是否符合要求
                        if (trueCount >= 1 && trueCount <= 50) {
                          console.log(
                            '数组符合要求，type: true 的数量在 1 到 50 之间'
                          );
                        } else {
                          Message.error('最少打开1项索引列！');
                          return Promise.reject(
                            new Error('请填写完整的表结构配置')
                          );
                        }
                        // if (value.columns.length < 1) {
                        //   Message.error('最少打开1项索引列！');
                        //   return Promise.reject(
                        //     new Error('请填写完整的表结构配置')
                        //   );
                        // }
                        // if (!allNamesValid) {
                        //   return Promise.reject(
                        //     new Error('请填写完整的表结构配置')
                        //   );
                        // }

                        // setstaturules3('');
                        return Promise.resolve();
                      }
                    }
                  ]}
                  wrapperCol={{
                    span: 20
                  }}
                >
                  <FromTable
                    FimsetFieldsValue={FimsetFieldsValue}
                    fileList={fileList}
                  ></FromTable>
                </Form.Item>
              ) : null}
            </div>
          )}
          <div className="mb-4 text-[16px] font-[600] leading-[24px] text-[#000]">
            标签配置
          </div>

          <Form.Item
            label={
              <>
                文档标签：
                <Tooltip content="选择标签，并应用于本次上传的全部文档中">
                  <IconQuestionCircle
                    className="h-[14px] w-[14px]"
                    style={{ color: '#7F8C9F' }}
                  />
                </Tooltip>
              </>
            }
            field="tagText"
            rules={[{ required: true, message: '请输入' }]}
            wrapperCol={{
              span: 14
            }}
          >
            <TagTree />
          </Form.Item>
          {switchTag === 'display' && switchTagVisible === false ? null : (
            <Form.Item
              label={
                <>
                  文档切片标签：
                  <Tooltip content="使用大模型依据已配置的标签目录自动匹配标签；仅从目录内选择，不会生成新标签">
                    <IconQuestionCircle
                      className="w-[14px h-[14px]"
                      style={{ color: '#7F8C9F' }}
                    />
                  </Tooltip>
                </>
              }
              field="docTagText"
              rules={[{ required: true, message: '请输入' }]}
              wrapperCol={{
                span: 14
              }}
            >
              <SwitchTag switchDisble={switchTag} switchList={switchList} />
            </Form.Item>
          )}
        </div>
      ) : null}
    </Form>
  );
}

export default forwardRef(DemoForm);
