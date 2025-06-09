import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import './index.css';
import { useHistory } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Radio,
  Upload,
  Message,
  Space,
  Cascader
} from '@arco-design/web-react';
import { useLocation } from 'react-router-dom';
import {
  IconCheck,
  IconCheckCircle,
  IconUpload
} from '@arco-design/web-react/icon';
import { useState } from 'react';
import { get } from 'lodash';
import {
  getknowledgeBaseRootTree,
  getknowledgeBaseRootTreeChild
} from '@/api/datasetsV2';
import { PrefixV2 } from '@/api/endpoints'
const uploadUrl =`${PrefixV2}/files/upload`


function DemoForm(props, ref) {
  const RadioGroup = Radio.Group;
  const { Option } = Select;
  const location = useLocation();
  const [optionsCascader, setoptionsCascader] = useState([]); //知识库目录
  //交互事件
  useImperativeHandle(ref, () => ({
    //新建知识库
    submitFromOnc: () => {
      submitFromOnc();
    },
    clearFromOnc: () => {
      clearFromOnc();
    },
    //编辑分段
    submitEditFromOnc: () => {
      submitEditFromOnc();
    },
    clearEditFromOnc: () => {
      clearEditFromOnc();
    },
    //分段配置
    submitEditFromOnM: () => {
      submitEditFromOnM();
    },
    clearEditFromOnM: () => {
      clearEditFromOnM();
    }
  }));
  const {
    typemodel,
    seteditChildVisible,
    seteditManageVisible,
    FuncEdit,
    FuncEditM,
    detailsdata
  } = props;

  const {
    name = '',
    description = '',
    content_id = '',
    process_rule = {}
  } = detailsdata || {};

  const { mode = '', rules = {} } = process_rule || {};
  const history = useHistory();
  const [form] = Form.useForm();
  const [formvalues, setformvalues] = useState<any>({});
  const [statusnameV, setStatusnameV] = useState<any>('');
  const [fileListicon, setFileListicon] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initFromValue, setinitFromValue] = useState(
    typemodel == 'createPolicy'
      ? {
          name: '',
          description: '',
          uploadiconV: [],
          selectedOptionV: [] as string[],
          uploadfileV: [],
          parseTacticsV: ['text_ocr'],
          sublevelTacticsV: 'automatic',
          logotypeV: [],
          sliceLengthV: '',
          sliceOverlapLengthV: '',
          expressionV: '',
          regularPositionV: 'prev'
        }
      : {
          name: name,
          description: description,
          uploadiconV: [],
          selectedOptionV: [content_id] as string[],
          uploadfileV: [],
          parseTacticsV: rules.parsing_strategy,
          sublevelTacticsV: mode,
          logotypeV: rules.segmentation.separators,
          sliceLengthV: rules.segmentation.max_tokens,
          sliceOverlapLengthV: rules.segmentation.chunk_overlap,
          expressionV: rules.segmentation.separator,
          regularPositionV: rules.segmentation.matchstrategy
        }
  );
  useEffect(() => {
    // if (initFromValue.sublevelTacticsV == 'custom') {
    setformvalues((prev) => ({
      ...prev,
      sublevelTacticsV: mode
    }));
    // }
  }, [initFromValue.sublevelTacticsV, mode]);
  useEffect(() => {
    const initialize = async () => {
      try {
        const itemtree = await getknowledgeBaseRootTree();
        const { data: treed = [] } = itemtree.data;
        const options = treed.map((it) => ({ value: it.id, label: it.name }));

        setoptionsCascader(options);
      } catch {}
    };
    initialize();
  }, []);
  // 合并初始化逻辑
  // useEffect(() => {
  //   console.log(location, 'location.state');
  //   const queryParams = new URLSearchParams(location.search);
  //   const getid = queryParams.get('getid');
  //   if (getid) {
  //     const initialize = async () => {
  //       setLoading(true);
  //       try {
  //         // 1. 加载选项数据
  //         const itemtree = await getknowledgeBaseRootTree();
  //         const { data: treed = [] } = itemtree.data;
  //         const options = treed.map((it) => ({ value: it.id, label: it.name }));
  //         setoptionsCascader(options);

  //         // 2. 设置默认值
  //         const historyData: any = location.state || {};
  //         if (historyData.getid) {
  //           // 验证默认值是否存在于选项中
  //           const isValid = options.some(
  //             (opt) => opt.value === historyData.getid
  //           );
  //           if (isValid) {

  //             setinitFromValue((prev) => ({
  //               ...prev,
  //               selectedOptionV: [historyData.getid]
  //             }));
  //           }
  //         }
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     initialize();
  //   }
  // }, [location]);
  const CheckboxOne = [
    {
      value: 'text_ocr',
      name: '文字识别',
      placeholder: '基于规则的⽂档⽂字提取'
    },
    // {
    //   value: 'image_ocr',
    //   name: '图片文字识别',
    //   placeholder: '解析图⽚、扫描件中的⽂字'
    // },
    {
      value: 'image_ocr',
      name: '图片识别',
      placeholder: '检索和召回文档中的图片'
    },
    {
      value: 'table_ocr',
      name: '表格识别',
      placeholder: '提升涉跨⾏跨⻚等复杂表格的问答效果'
    }
  ];
  const RadioOne = [
    {
      value: 'automatic',
      name: '自动切片',
      placeholder:
        '通⽤格式⽂本常⻅切分⽅法，经评测可在多数⽂档上获得较佳的检索效果。'
    },
    // {
    //   value: 'custom',
    //   name: '自定义切片',
    //   placeholder: '按标识符、切片长度等对文档切分'
    // }
    {
      value: 'split_by_chunk',
      name: '按常⻅标识符切分',
      placeholder:
        '按照所选的标识符初步切分⽂本；切分后的⽂本会再组合成单⼀切⽚内容。'
    },
    {
      value: 'split_by_page',
      name: '按⻚切分',
      placeholder:
        '以⽂档物理⻚⾯为划分单位，适⽤于演示⽂档、单⻚图表等⽂件源，确保单⻚内容完整独⽴。'
    },
    {
      value: 'split_by_regex',
      name: '⾃定义正则切分',
      placeholder:
        '通过正则表达式，⾃定义匹配的分隔符。如按章节标题（“第*章”）切分可输⼊第d+章,；按括号序号切分（x）可输⼊“(d+)”。'
    }
  ];
  const regularoption = [
    {
      value: 'prev',
      name: '前序切片'
    },
    {
      value: 'next',
      name: '后序切片'
    }
  ];
  const formItemLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 20
    }
  };
  // 上传文件
  const handleFileChange = (fileList: any) => {
    setFileListicon(fileList);
  };

  const onValuesChange = (changeValue, values) => {
    console.log('onValuesChange: ', changeValue, values);
    setformvalues(values);
  };
  const uploadFileList = React.useMemo(() => {
    return fileList.map((x) => {
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
  const checkFile = (file, list) => {
    if (file.size > 100 * 1024 * 1024 * 1024) {
      Message.error('单文件大小不能超过100GB');
      return false;
    }
    return true;
  };

  const clearFromOnc = () => {
    form.resetFields();
    window.history.back();
  };
  const submitFromOnc = async () => {
    try {
      const values = await form.validate();
      console.log('验证通过', values);
      history.push({
        pathname: '/tenant/compute/appforge/knowledgeBaseV2',
        state: { values: values }
      });
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  //编辑分段
  const submitEditFromOnc = async () => {
    try {
      const values = await form.validate();

      FuncEdit(values);
      seteditChildVisible(false);
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  //分段配置
  const submitEditFromOnM = async () => {
    try {
      const values = await form.validate();
      FuncEditM(values);
      seteditManageVisible(false);
    } catch (errorInfo) {
      console.log('验证失败', errorInfo);
    }
  };
  const clearEditFromOnc = () => {
    form.resetFields();
    seteditChildVisible(false);
  };
  const clearEditFromOnM = () => {
    form.resetFields();
    seteditManageVisible(false);
  };
  const selectedOptionVloadMore = async (
    pathValue: any[],
    level: number
  ): Promise<any[]> => {
    console.log(pathValue, level, 'qwwqd');

    // 必须返回一个 Promise 包含子节点数组
    try {
      const itemtree = await getknowledgeBaseRootTreeChild(pathValue[0], {});
      const { datasetContents: datasetContents = [], datasets: datasets = [] } =
        itemtree.data;
      return datasetContents.map((it) => ({
        value: it.id,
        label: it.name,
        // 根据业务需要决定是否是叶子节点
        isLeaf: true
      }));
    } catch (error) {
      console.error('加载失败:', error);
      return []; // 返回空数组表示加载失败
    }
  };

  return (
    <Form
      className="fromstyle"
      form={form}
      {...formItemLayout}
      onValuesChange={onValuesChange}
      initialValues={initFromValue}
    >
      {typemodel !== 'editChild' && typemodel !== 'editManage' ? (
        <div className="headerOne">基本信息</div>
      ) : null}
      {typemodel !== 'editManage' ? (
        <div>
          {/* 输入框 */}
          <Form.Item
            label="知识库名称："
            validateStatus={statusnameV}
            help="只能输入字母、中文、数字、下划线（_）、中划线（-）、点（.），并且必须以字母或中文开头"
            extra="支持50位字符，只允许输入字母、中文、数字、下划线（_）、中划线（-）、点（.），必须以字母或中文开头"
            field="name"
            rules={[
              { required: true, message: '请输入' },
              {
                validator: (item, value: any) => {
                  const regex =
                    /^[A-Za-z\u4e00-\u9fa5][A-Za-z0-9\u4e00-\u9fa5_.-]{0,49}$/;
                  if (!item) return Promise.resolve();
                  if (!regex.test(item)) {
                    setStatusnameV('error');
                  } else {
                    setStatusnameV('');
                  }
                  return Promise.resolve();
                }
              }
            ]}
            wrapperCol={{
              span: 12
            }}
          >
            <Input
              placeholder="请输入"
              showWordLimit
              maxLength={{ length: 50, errorOnly: true }}
            />
          </Form.Item>

          {/* 文本域 */}
          <Form.Item
            label="知识库描述："
            field="description"
            rules={[{ required: true, message: '请输入描述' }]}
            wrapperCol={{
              span: 12
            }}
          >
            <Input.TextArea
              showWordLimit
              maxLength={{ length: 100, errorOnly: true }}
              placeholder="请输入知识库内容备注说明，便于查找和管理知识库。描述不影响Agent对知识库的调用效果"
              rows={4}
            />
          </Form.Item>

          {/* 上传图标 */}
          <Form.Item
            label="上传图标："
            field="uploadiconV"
            // rules={[{ required: true, message: '请上传图标' }]}
          >
            <Upload
              listType="picture-card"
              action="/upload"
              onChange={handleFileChange}
              fileList={fileListicon}
            >
              <IconUpload />
            </Upload>
          </Form.Item>

          {/* 下拉框 */}
          {optionsCascader.length > 0 ? (
            <Form.Item
              label="所属群组："
              field="selectedOptionV"
              rules={[{ required: true, message: '请选择一个选项' }]}
              wrapperCol={{
                span: 12
              }}
            >
              <Cascader
                placeholder="请选择"
                changeOnSelect
                value={initFromValue.selectedOptionV}
                options={optionsCascader}
                loadMore={async (pathValue, level) => {
                  return await selectedOptionVloadMore(pathValue, level);
                }}
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
                field="uploadfileV"
                required
                label="上传文件："
                rules={[{ required: true, message: '请上传文件' }]}
              >
                <Upload
                  className="bg-white"
                  drag
                  disabled={uploadFileList.length >= 10}
                  multiple
                  accept=".docx,.pdf,.txt"
                  action={uploadUrl}
                  tip="支持上传docx、pdf、txt文件，文件大小、数量不做限制（大小至少100M，单次上传10000篇）"
                  onChange={setFileList}
                  onProgress={onProgress}
                  fileList={uploadFileList}
                  beforeUpload={(file, list) => checkFile(file, list)}
                />
              </Form.Item>
              <div className="headerOne">策略配置</div>
            </div>
          ) : null}
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
                          className={`custom-checkbox-card ${
                            checked ? 'custom-checkbox-card-checked' : ''
                          }`}
                        >
                          <div className="custom-checkbox-card-mask">
                            <div className="custom-checkbox-card-mask-dot"></div>
                          </div>
                          <div>
                            <div className="custom-checkbox-card-title title-n">
                              {e.name}
                            </div>
                            <div className="title-p">{e.placeholder}</div>
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
            label="分段策略："
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
                          <div className="custom-radio-card-mask">
                            <div className="custom-radio-card-mask-dot"></div>
                          </div>
                          <div>
                            <div className="custom-radio-card-title title-n">
                              {e.name}
                            </div>
                            <div className="title-p"> {e.placeholder}</div>
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
                  span: 12
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
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
                tooltip={
                  <div>
                    按照所选的标识符初步切分⽂本；切分后的⽂本会再组合成单⼀切⽚内容。
                  </div>
                }
              >
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item
                label="切片重叠长度："
                field="sliceOverlapLengthV"
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
              >
                <Input suffix="%" />
              </Form.Item>
            </div>
          ) : null}
          {formvalues && formvalues.sublevelTacticsV == 'split_by_page' ? (
            <div>
              <Form.Item
                label="切片最大长度："
                field="sliceLengthV"
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
                tooltip={
                  <div>
                    按照所选的标识符初步切分⽂本；单⻚超出最⼤⻓度将⾃动截断。
                  </div>
                }
              >
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item
                label="切片重叠长度："
                field="sliceOverlapLengthV"
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
              >
                <Input suffix="%" />
              </Form.Item>
            </div>
          ) : null}
          {formvalues && formvalues.sublevelTacticsV == 'split_by_regex' ? (
            <div>
              <Form.Item
                label="表达式："
                field="expressionV"
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
                tooltip={
                  <div>
                    通过正则表达式，⾃定义匹配的分隔符。如按章节标题
                    （“第*章”）切分可输⼊第\d+章,；按括号序号切分（x）可输⼊“\(\d+\)”
                    切⽚最⼤⻓度
                  </div>
                }
              >
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item
                label="正则式位置："
                field="regularPositionV"
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
                tooltip={
                  <div>
                    前序切片：将正则式拼贴至前一个切片的末尾；后序切片：将正则式拼贴至后一个切片的开头
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
                label="切片最大长度："
                field="sliceLengthV"
                rules={[{ required: true, message: '请输入' }]}
                wrapperCol={{
                  span: 12
                }}
                tooltip={
                  <div>
                    按照所选的标识符初步切分⽂本；切分后的⽂本会再组合
                    成单⼀切⽚内容。
                  </div>
                }
              >
                <Input placeholder="请输入" />
              </Form.Item>
            </div>
          ) : null}
        </div>
      ) : null}
    </Form>
  );
}

export default forwardRef(DemoForm);
