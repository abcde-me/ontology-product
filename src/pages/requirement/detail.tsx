import React, { useEffect, useRef, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Radio,
  Tabs,
  Typography,
  Select,
  Checkbox,
  Tooltip,
  Image,
  Dropdown,
  Menu,
  ColorPicker
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconDelete,
  IconPlus,
  IconQuestionCircle
} from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import { getTaskDetail } from '@/api/taskDetail';
import { useUserInfo } from '@/store/userInfoStore';
import { DataSourceModal } from '@/pages/requirement/components/DetailModal';
import { DepartmentModal } from './components/DepartmentModal';
import { IndividualModal } from './components/IndividualModal';
import { v4 as uuidV4 } from 'uuid';
import {
  convertToUTCFormat,
  getRandomHexColorStrict,
  numberToChinese,
  shapeOptions
} from './common';
import AnnotationType from './components/AnnotationType';
import TextSubstanceComponent from './components/TextEntity';
import { publishRequirement, getRequirementDetail } from '@/api/dataAnnotation';
import { Classify } from './components/Classify';
import _, { omitBy, isArray, isEmpty, get } from 'lodash';
import {
  AnnotationChildType,
  AnnotationTypeContentCode,
  AnnotationTypeStatus,
  LabelInfoAttributeGroupType,
  LabelShape,
  RequirementTypeMap,
  RequirementTypeNameMap,
  TeamType,
  TeamTypeMap,
  toolFileType
} from './type';

import './detail.scss';
const BreadcrumbItem = Breadcrumb.Item;

// 定义数据类型接口
interface LabelInfoAttribute {
  label_info_id: string;
  attribute_name_cn: string;
  attribute_name_en: string;
  input_type: 1 | 2; // 1=选项，2=输入框
}

interface LabelInfoAttributeGroup {
  attribute_id: string;
  attribute_group_name: string;
  attribute_group_class: 1 | 2 | 3; // 1=单选，2=多选，3=输入框
  attribute_group_type: 1 | 2; // 1=必选，2=非必选
  label_info_attribute: LabelInfoAttribute[];
}
interface LabelData {
  label_id: string;
  label_name_cn: string;
  label_name_en: string;
  label_shape: LabelShape; // 1=点，2=线，3=正方形，4=多边形 5=椭圆 6=立方体
  label_colour: string;
  label_info_attribute_groups: LabelInfoAttributeGroup[];
}

export default function RequirementDetail() {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form2Child] = Form.useForm();
  const FormItem = Form.Item;
  const TabPane = Tabs.TabPane;
  const RadioGroup = Radio.Group;
  const Option = Select.Option;
  const TextArea = Input.TextArea;

  const type = useParams('type');
  const requirementId = useParams('id') as string;
  const history = useHistory();
  const userInfo = useUserInfo();
  const [selectedRadio, setSelectedRadio] = useState('');
  const [isShowErrorInfo, setIsShowErrorInfo] = useState(false);
  const [isShowDataErrorInfo, setIsShowDataErrorInfo] = useState(false);
  const [isShowTypeErrorInfo, setIsShowTypeErrorInfo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // 类型定义
  const [taskTypeVal, setTaskTypeVal] = useState(2);
  // 发布数据集合
  const [publishData, setPublishData] = useState<any>({});
  // 数据集 - 选中数据内容
  const [selectedData, setSelectedData]: any = useState([]);
  // 任务分配选中的数据
  const [taskAssignData, setTaskAssignData]: any = useState([]);
  // 选项部门数据内容
  const [departmentIds, setDepartmentIds] = useState([]);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 标签和属性
  const [activeTab, setActiveTab] = useState(1);
  // 详情数据存储
  const [getDetailObj, setGetDetailObj]: any = useState({});
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [individualModalVisible, setIndividualModalVisible] = useState(false);
  useEffect(() => {
    if (selectedRadio !== '') {
      setIsShowErrorInfo(false);
    }
    if (selectedData?.length > 0) {
      setIsShowDataErrorInfo(false);
    }
  }, [selectedRadio, selectedData]);
  // 基础配置

  const handleChildData = (data: any, key) => {
    const newSetDataContent = data.map((item) => {
      return {
        dir_name: String(key),
        load_start_time: convertToUTCFormat(item?.start_time),
        load_end_time: convertToUTCFormat(item?.end_time),
        load_num: item?.load_num,
        create_by: item?.upload_user,
        run_id: String(item?.data_path_id)
      };
    });
    setSelectedData(newSetDataContent);
  };

  const handleChildTreeSelectData = (data: any) => {
    setTaskAssignData(data);
    if (data?.length > 0) {
      setIsShowTypeErrorInfo(false);
    }
    // setPublishData({ ...publishData, label_count: taskAssignData.length })
  };
  const getChildTreeIds = (data) => {
    setDepartmentIds(data);
  };
  // 显示标注类型 以及 类型内容
  const [annotationTypeVal, setAnnotationTypeVal] = useState(
    AnnotationTypeStatus.IMAGE
  );
  const [annotationTypeContentVal, setAnnotationTypeContentVal] = useState<
    string | number
  >(AnnotationChildType.ENTITY);
  // 当前标注类型选择内容
  const [annotationTypeContentCode, setAnnotationTypeContentCode] =
    useState('');
  const getAnnotationType = (
    selectedRadio,
    activeKey,
    annotationTypeContentCode
  ) => {
    setSelectedRadio(activeKey);
    setAnnotationTypeVal(selectedRadio);
    setAnnotationTypeContentVal(activeKey);
    setAnnotationTypeContentCode(annotationTypeContentCode);
    setPublishData({
      ...publishData,
      label_type_code: annotationTypeContentCode
    });
    // setDatalist(generateInitialData());
  };

  // 工具函数：安全获取嵌套属性
  const getNestedValue = (obj, path) => {
    return path.reduce((acc, key) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[key];
    }, obj);
  };
  // 工具函数：不可变更新嵌套属性
  const setNestedValue = (obj, path, value) => {
    // 创建原始对象的深拷贝
    const newObj = Array.isArray(obj) ? [...obj] : { ...obj };

    // 如果路径只有一项，直接更新
    if (path.length === 1) {
      newObj[path[0]] = value;
      return newObj;
    }

    // 递归更新嵌套属性
    const [currentKey, ...remainingPath] = path;
    newObj[currentKey] = setNestedValue(
      newObj[currentKey],
      remainingPath,
      value
    );
    return newObj;
  };
  /**
   * 删除标签
   * @param {number} labelIndex - 要删除的标签索引
   */
  const deleteLabel = (labelIndex) => {
    const newDatalist = datalist.filter((_, index) => index !== labelIndex);
    setDatalist(newDatalist);
  };

  const updateField = (path, value) => {
    const currentValue = getNestedValue(datalist, path);
    if (currentValue === undefined) {
      console.warn(`无效的路径: ${path.join('.')}`);
      return;
    }

    const newData = setNestedValue(datalist, path, value);
    setDatalist(newData);
  };
  /**
   * 删除属性组
   * @param {number} labelIndex - 标签索引
   * @param {number} groupIndex - 要删除的属性组索引
   */
  const deleteAttributeGroup = (labelIndex, groupIndex) => {
    const currentGroups =
      getNestedValue(datalist, [labelIndex, 'label_info_attribute_groups']) ||
      [];

    const newGroups = currentGroups.filter((_, index) => index !== groupIndex);
    updateField([labelIndex, 'label_info_attribute_groups'], newGroups);
  };

  /**
   * 删除属性
   * @param {number} labelIndex - 标签索引
   * @param {number} groupIndex - 属性组索引
   * @param {number} attributeIndex - 要删除的属性索引
   */
  const deleteAttribute = (labelIndex, groupIndex, attributeIndex) => {
    const currentAttributes =
      getNestedValue(datalist, [
        labelIndex,
        'label_info_attribute_groups',
        groupIndex,
        'label_info_attribute'
      ]) || [];

    const newAttributes = currentAttributes.filter(
      (_, index) => index !== attributeIndex
    );
    updateField(
      [
        labelIndex,
        'label_info_attribute_groups',
        groupIndex,
        'label_info_attribute'
      ],
      newAttributes
    );
  };

  // 生成初始示例数据
  const generateInitialData = (): LabelData[] => {
    return [
      {
        label_id: uuidV4(),
        label_name_cn: '',
        label_name_en: '',
        label_shape: LabelShape.RECTANGLE,
        label_colour: getRandomHexColorStrict(),
        label_info_attribute_groups: [
          {
            attribute_id: uuidV4(),
            attribute_group_name: '',
            attribute_group_class: 1,
            attribute_group_type: 1,
            label_info_attribute: [
              {
                label_info_id: uuidV4(),
                attribute_name_cn: '',
                attribute_name_en: '',
                input_type: 1
              }
            ]
          }
        ]
      }
    ];
  };

  // 初始化状态
  const [datalist, setDatalist] = useState<LabelData[]>(generateInitialData());
  // 模版数据存储
  const [templateData, setTemplateData] = useState<any[]>([]);
  /**
   * 修复后的通用修改方法 - 可以修改任意层级的任意字段
   * @param path 路径数组，格式如: [datalist索引, '字段名', 数组索引, '字段名', ...]
   * @param value 要设置的新值
   */
  const updateNestedValue = (
    path: (string | number)[],
    value: any,
    isTemp?: boolean
  ) => {
    if (path.length === 0) return;
    // 创建数据的深拷贝，避免直接修改原数据
    // 深拷贝
    const newData = _.cloneDeep(isTemp ? templateData : datalist);

    // 遍历路径找到目标位置并更新值
    let current: any = newData;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      // 如果是最后一个路径段，设置值
      if (i === path.length - 1) {
        current[key] = value;
        break;
      }

      // 移动到下一个层级
      if (current[key] === undefined) {
        console.error(`路径错误: 找不到 ${key} 在层级 ${i}`);
        return;
      }
      current = current[key];
    }
    // 更新状态
    isTemp ? setTemplateData(newData) : setDatalist(newData);
  };

  const getLastItem = (arr) => {
    // 先校验：确保输入是数组且非空
    if (!Array.isArray(arr) || arr.length === 0) {
      return null;
    }
    // 创建最后一个元素的深拷贝，避免引用冲突
    const lastItem = _.cloneDeep(arr[arr.length - 1]);
    // 生成全新的唯一ID
    lastItem.label_id = uuidV4() + new Date().getTime();
    lastItem.attribute_id = uuidV4();
    lastItem.label_colour = getRandomHexColorStrict();
    // 重置属性组（如果需要全新开始）
    lastItem.label_info_attribute_groups = [];
    // 返回新创建的元素
    return lastItem;
  };
  // 添加新标签
  const addNewLabel = () => {
    setDatalist([...datalist, getLastItem(datalist)]);
  };

  // 为指定标签添加属性组
  const addAttributeGroup = (labelIndex: number) => {
    const newGroup: LabelInfoAttributeGroup = {
      attribute_id: uuidV4(),
      attribute_group_name: '新属性组',
      attribute_group_class: 1,
      attribute_group_type: 1,
      label_info_attribute: []
    };

    // 获取当前属性组并添加新组
    const currentGroups = datalist[labelIndex].label_info_attribute_groups;
    updateNestedValue(
      [labelIndex, 'label_info_attribute_groups'],
      [...currentGroups, newGroup]
    );
  };

  // 为指定属性组添加属性
  const addAttribute = (labelIndex: number, groupIndex?: number) => {
    const newAttribute: LabelInfoAttribute = {
      label_info_id: uuidV4(),
      attribute_name_cn: '新属性',
      attribute_name_en: 'new_attribute',
      input_type: 1
    };

    // 获取当前属性并添加新属性
    const currentAttributes =
      datalist[labelIndex].label_info_attribute_groups[groupIndex as number]
        .label_info_attribute;

    updateNestedValue(
      [
        labelIndex,
        'label_info_attribute_groups',
        groupIndex as number,
        'label_info_attribute'
      ],
      [...currentAttributes, newAttribute]
    );
  };

  const addAttributeT = (labelIndex: number) => {
    const newAttribute: LabelInfoAttribute = {
      label_info_id: uuidV4(),
      attribute_name_cn: '新属性',
      attribute_name_en: 'new_attribute',
      input_type: 1
    };

    // 获取当前属性并添加新属性
    const currentAttributes = datalist[labelIndex].label_info_attribute_groups;
    updateNestedValue(
      [labelIndex, 'label_info_attribute_groups'],
      [...currentAttributes, newAttribute],
      true
    );
  };
  //  属性模版名字点击
  const handleTemplateClick = (item: any, index: number) => {
    if (item === '' || item === undefined || item === null) {
      setActiveTab(2);
    } else {
      // 如果属性名称有，那就插入到对应的标签中,只是当前按钮的属性组，其他的不处理
      const newGroup: LabelInfoAttributeGroup = {
        attribute_id: uuidV4(),
        attribute_group_name: '新属性组',
        attribute_group_class: 1,
        attribute_group_type: 1,
        label_info_attribute: []
      };

      // 获取当前属性组并添加新组
      const currentGroups = datalist[index].label_info_attribute_groups;
      updateNestedValue(
        [index, 'label_info_attribute_groups'],
        [...currentGroups, templateData[index]]
      );
    }
  };

  const stepNext = async () => {
    const result = await Promise.all([
      form1
        .validate()
        .then(() => {
          if (selectedData?.length <= 0) {
            setIsShowDataErrorInfo(true);
            return;
          }
          if (selectedRadio === '') {
            setIsShowErrorInfo(true);
            return;
          }
          return true;
        })
        .catch((errorInfo) => {
          if (selectedData?.length <= 0) {
            setIsShowDataErrorInfo(true);
          }
          if (selectedRadio === '') {
            setIsShowErrorInfo(true);
            return;
          }
        }),
      form2
        .validate()
        .then((val) => {
          return true;
        })
        .catch((errorInfo) => {}),
      form2Child
        .validate()
        .then((value) => {
          return true;
        })
        .catch((errorInfo) => {}),
      // 任务验证
      form3
        .validate()
        .then(() => {
          // 验证通过，切换到下一步
          if (taskAssignData?.length === 0) {
            setIsShowTypeErrorInfo(true);
            return;
          }
          return true;
        })
        .catch((errorInfo) => {
          if (taskAssignData?.length === 0) {
            setIsShowTypeErrorInfo(true);
            return;
          }
        })
    ]);
    // 所有的form 验证都通过调用发布接口
    if (result.every((item) => item === true)) {
      publish();
    } else {
    }
  };
  const removeEmptyArrays = (obj) => {
    return omitBy(obj, (value) => isArray(value) && isEmpty(value));
  };
  const [text_fl_data, setText_fl_data] = useState([]);
  const getClassIfyChildData = (data) => {
    setText_fl_data(data);
  };
  const [TextEntityDataContent, setTextEntityDataContent]: any = useState({});
  // entityRelations = 实体关系内容  relationRelations = 关系标签内容
  const getTextFlChildData = (entityRelations, relationRelations) => {
    setTextEntityDataContent({
      entityRelations,
      relationRelations
    });
  };
  // 计算总数
  const getTotal = (dataArr) => {
    let num = 0;
    dataArr.map((item) => {
      num = num + item?.load_num;
    });
    return num;
  };
  const publish = async () => {
    const { entityRelations, relationRelations } = TextEntityDataContent;
    const newSetLabels = datalist.map((item, index) => {
      return {
        ...item,
        order_num: datalist?.length + 1,
        label_info_attribute_groups: item.label_info_attribute_groups.map(
          (group) => {
            return {
              ...group,
              order_num: item?.label_info_attribute_groups?.length + 1,
              label_info_attribute: group.label_info_attribute.map(
                (attribute) => {
                  return {
                    ...attribute,
                    order_num: group?.label_info_attribute?.length + 1,
                    attribute_name_en: attribute.attribute_name_en.replace(
                      /\s+/g,
                      '_'
                    )
                  };
                }
              )
            };
          }
        )
      };
    });

    // 发布数据重置
    const new_publishData = {
      name: publishData?.name,
      description: publishData?.description,
      label_type: annotationTypeVal,
      label_count: getTotal(selectedData), //数据量（所有数据集之和）
      team_type: taskTypeVal,
      label_tool: {
        label_tool_name: RequirementTypeNameMap[annotationTypeVal],
        label_tool_code: annotationTypeContentCode,
        image_out_of_bounds: 0
      },
      // 配置文件分类标签
      file_labels:
        annotationTypeContentCode ===
        AnnotationTypeContentCode.TEXT_CLASSIFICATION
          ? text_fl_data
          : [],
      label_data_set: selectedData,
      labels:
        annotationTypeContentVal === AnnotationTypeContentCode.ENTITY
          ? entityRelations
          : annotationTypeContentCode !== AnnotationTypeContentCode.QA &&
              annotationTypeContentCode !==
                AnnotationTypeContentCode.TEXT_SORT &&
              annotationTypeContentCode !==
                AnnotationTypeContentCode.TEXT_CLASSIFICATION
            ? newSetLabels
            : [],
      entity_relations:
        annotationTypeContentCode === AnnotationTypeContentCode.ENTITY
          ? relationRelations
          : [],
      label_operate:
        //配置标注人员
        {
          user_id: taskTypeVal === 1 ? taskAssignData : [],
          org_id: taskTypeVal === 2 ? taskAssignData : departmentIds
        }
    };
    const obj: any = removeEmptyArrays(new_publishData);
    setLoading(true);
    console.log(obj, 'top ---- 我是提交的数据', text_fl_data);
    // 发布数据
    const res = await publishRequirement(obj);
    if (res.code === 0) {
      history.goBack();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (type === 'detail') {
      const getDetail = async () => {
        try {
          const res = await getRequirementDetail({
            requirement_id: Number(requirementId)
          });
          if (res.code === 0) {
            setAnnotationTypeContentCode(
              res?.data?.label_tool?.label_tool_code
            );
            setAnnotationTypeContentVal(res?.data?.label_tool?.label_tool_code);
            form1.setFieldValue('name', res?.data?.name);
            form1.setFieldValue('description', res?.data?.description);
            setGetDetailObj(res?.data);
            setTaskTypeVal(res?.data?.team_type);
            res?.data?.labels?.map((item) => {
              form2.setFieldValue(
                `label_name_cn_${item?.order_num}`,
                item?.label_name_cn
              );
              form2.setFieldValue(
                `label_name_en_${item?.order_num}`,
                item?.label_name_en
              );
              form2.setFieldValue(
                `label_shape_${item?.order_num}`,
                item?.label_shape
              );
              form2.setFieldValue(
                `label_colour_${item?.order_num}`,
                item?.label_colour
              );
              item?.label_info_attribute_groups?.map((group) => {
                group?.label_info_attribute?.map((attribute) => {
                  form2.setFieldValue(
                    `label_info_attribute_groups_${item?.order_num}_${group?.order_num}_label_info_attribute_${attribute?.order_num}_attribute_name_cn`,
                    attribute?.attribute_name_cn
                  );
                  form2.setFieldValue(
                    `label_info_attribute_groups_${item?.order_num}_${group?.order_num}_label_info_attribute_${attribute?.order_num}_attribute_name_en`,
                    attribute?.attribute_name_en
                  );
                });
              });
            });
            setDatalist(res?.data?.labels);
          }
        } catch (error) {}
      };
      getDetail();
    }
  }, [requirementId]);
  return (
    <div className="requirement-detail">
      <div className="head-breadcrumb-box">
        {type === 'create' ? (
          <div>
            <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
              <BreadcrumbItem
                onClick={() => history.goBack()}
                className={'breadcrumb-text'}
              >
                创建需求
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        ) : (
          <div>
            <IconArrowLeft
              style={{ cursor: 'pointer', fontSize: '14px' }}
              onClick={() => history.goBack()}
            />
            <Breadcrumb style={{ fontSize: 20, marginLeft: '21px' }}>
              <BreadcrumbItem
                onClick={() => history.goBack()}
                className={'breadcrumb-text'}
              >
                标注详情
              </BreadcrumbItem>
              <BreadcrumbItem>{getDetailObj?.name || ''}</BreadcrumbItem>
            </Breadcrumb>
          </div>
        )}
      </div>
      <div className="detail-content">
        {/* 基础配置部分 */}
        <div className="basic-configuration">
          <div className="basic-title">基础信息</div>
          <Form
            form={form1}
            disabled={type === 'detail'}
            initialValues={{ name: publishData?.name }}
            onValuesChange={(_, val) => {
              setPublishData({ ...publishData, ...val });
            }}
            labelCol={{
              span: 1
            }}
          >
            <FormItem
              label="需求名称"
              field="name"
              rules={[{ required: true, message: '请输入需求名称', max: 50 }]}
            >
              <Input placeholder="请输入需求名称" style={{ width: 643 }} />
            </FormItem>
            <FormItem
              label="描述说明"
              field="description"
              rules={[{ required: true, message: '请输入描述内容', max: 200 }]}
            >
              <TextArea placeholder="请输入描述内容" style={{ width: 643 }} />
            </FormItem>
            <div className="basic-title">任务配置</div>
            <FormItem
              label="标注类型"
              required
              className="annotation-tool"
              field="label_type"
            >
              {isShowErrorInfo && (
                <span className="error-info-text">请选择标注工具</span>
              )}
              <AnnotationType
                isDisabled={type === 'detail'}
                label_type={getDetailObj?.label_type || 2}
                label_tool_code={
                  getDetailObj?.label_tool?.label_tool_code ||
                  'IMAGE_ANNOTATION'
                }
                getChildAnnotationType={getAnnotationType}
              />
            </FormItem>
            <FormItem field="dataset" label="标注数据" required>
              <div className="data-content-set">
                <Button
                  // disabled={type === 'detail'}
                  type="primary"
                  onClick={() => {
                    setModalVisible(true);
                  }}
                >
                  选择
                </Button>
                <div className="data-set-text">
                  已选数据量：
                  {getTotal(selectedData) || getDetailObj?.label_count}
                </div>
              </div>
              {selectedData?.length <= 0 && isShowDataErrorInfo && (
                <div className="data-error-info error-info-text">
                  请选择数据集合
                </div>
              )}
            </FormItem>
          </Form>
          <DataSourceModal
            fileType={toolFileType[Number(annotationTypeVal)]}
            visible={modalVisible}
            type={type}
            onClose={() => {
              setModalVisible(false);
            }}
            title="数据集合"
            getChildTableSelectData={handleChildData}
            getDetailObj={getDetailObj}
          />
        </div>
        {/* 工具配置部分 */}
        {(annotationTypeContentVal ===
          AnnotationTypeContentCode.IMAGE_ANNOTATION ||
          annotationTypeContentVal === AnnotationTypeContentCode.ENTITY ||
          annotationTypeContentVal ===
            AnnotationTypeContentCode.TEXT_CLASSIFICATION) && (
          <div className="tool-annotation-config">
            <div className="basic-title">标签配置</div>
            <Form
              form={form2}
              disabled={type === 'detail'}
              onValuesChange={(_, val) => {
                setPublishData({ ...publishData, val });
              }}
              layout="inline"
              labelAlign="right"
              labelCol={{ flex: 'none' }}
              wrapperCol={{ flex: 1 }}
            >
              <FormItem
                field="label_info_attribute_groups"
                label="标签和属性"
                required
              >
                {/* 循环显示内容 */}
                {annotationTypeContentVal ===
                  AnnotationTypeContentCode.IMAGE_ANNOTATION && (
                  // annotationTypeContentVal ===
                  // AnnotationChildType.IMAGE_ANNOTATION &&

                  <div className="labe-and-attribute-warp">
                    <div className="attribute-header">
                      {[
                        { key: 1, label: '标签' },
                        { key: 2, label: '标签模版属性' }
                      ].map((item) => {
                        return (
                          <div
                            key={item?.key}
                            onClick={() => {
                              setActiveTab(item.key);
                            }}
                            className={[
                              'attribute-header-text',
                              activeTab === item.key ? 'active' : ''
                            ].join(' ')}
                          >
                            {item.label}
                          </div>
                        );
                      })}
                    </div>
                    {activeTab === LabelInfoAttributeGroupType.LABEL && (
                      <div className="attribute-content">
                        {datalist &&
                          datalist?.map((item, labelIndex) => (
                            <div className="sortable-item" key={labelIndex}>
                              <div className="sortable-item-content">
                                <FormItem
                                  label="标注名称:"
                                  field={`label_name_cn_${labelIndex}`}
                                  rules={[
                                    {
                                      required: true,
                                      message: '请输入标注展示名称'
                                    }
                                  ]}
                                  style={{ padding: 0 }}
                                >
                                  <Input
                                    style={{
                                      minWidth: 206
                                    }}
                                    onChange={(val: any) => {
                                      updateNestedValue(
                                        [labelIndex, 'label_name_cn'],
                                        val
                                      );
                                      // updateNestedValue(
                                      //   [labelIndex, 'label_name_cn'],
                                      //   val
                                      // );
                                    }}
                                    className="sortable-item-input"
                                    placeholder="请输入标注展示名称"
                                    value={item.label_name_cn}
                                  />
                                </FormItem>
                                <FormItem
                                  field={`label_name_en_${labelIndex}`}
                                  label={
                                    <div>
                                      展示名称
                                      <Tooltip content="展示在标注页面的名称">
                                        <IconQuestionCircle />
                                      </Tooltip>
                                      :
                                    </div>
                                  }
                                  style={{ padding: 0 }}
                                >
                                  <Input
                                    style={{
                                      minWidth: 196
                                    }}
                                    onChange={(val: any) => {
                                      updateNestedValue(
                                        [labelIndex, 'label_name_en'],
                                        val
                                      );
                                    }}
                                    className="sortable-item-input"
                                    placeholder="请输入结果存储名称"
                                    value={item.label_name_en}
                                  />
                                </FormItem>
                                <FormItem field={`label_shape_${labelIndex}`}>
                                  <Select
                                    placeholder="请选择形状"
                                    value={item.label_shape}
                                    onChange={(val: any) => {
                                      updateNestedValue(
                                        [labelIndex, 'label_shape'],
                                        parseInt(val)
                                      );
                                    }}
                                    style={{ width: 100, height: 32 }}
                                    renderFormat={(option, value) => {
                                      return (
                                        <span>
                                          <Image
                                            width={20}
                                            style={{ marginRight: 8 }}
                                            src={
                                              shapeOptions.find(
                                                (opt) => opt.value === value
                                              )?.icon
                                            }
                                            alt="lamp"
                                          />
                                          {
                                            shapeOptions.find(
                                              (opt) => opt.value === value
                                            )?.label
                                          }
                                        </span>
                                      );
                                    }}
                                  >
                                    {shapeOptions.map((option, index) => (
                                      <Option
                                        key={option.label}
                                        value={option.value}
                                      >
                                        <Image
                                          width={20}
                                          src={option?.icon}
                                          alt="lamp"
                                        />{' '}
                                        {option.label}
                                      </Option>
                                    ))}
                                  </Select>
                                </FormItem>
                                <FormItem field={`label_colour_${labelIndex}`}>
                                  <ColorPicker
                                    defaultValue={item?.label_colour}
                                    onChange={(val: any) => {
                                      updateNestedValue(
                                        [labelIndex, 'label_colour'],
                                        val
                                      );
                                    }}
                                    showPreset
                                  />
                                </FormItem>
                                <FormItem>
                                  {datalist.length > 1 && (
                                    <IconDelete
                                      className={
                                        type === 'detail' ? 'is-disabled' : ''
                                      }
                                      fontSize={16}
                                      onClick={() => {
                                        if (type !== 'detail') {
                                          deleteLabel(labelIndex);
                                        }
                                      }}
                                    />
                                  )}
                                </FormItem>
                              </div>
                              {item?.label_info_attribute_groups?.length > 0 &&
                                item?.label_info_attribute_groups?.map(
                                  (attrGroup, groupIndex) => {
                                    return (
                                      <div
                                        key={`${labelIndex}_${groupIndex}`}
                                        className="attribute-group-item"
                                      >
                                        <FormItem
                                          field={`label_info_attribute_groups_${labelIndex}_${groupIndex}_attribute_group_name`}
                                          required
                                          disabled={type === 'detail'}
                                          label="属性组件名称"
                                        >
                                          <div className="group-items">
                                            <Input
                                              width={400}
                                              height={32}
                                              disabled={type === 'detail'}
                                              value={
                                                attrGroup.attribute_group_name
                                              }
                                              onChange={(val: any) => {
                                                updateNestedValue(
                                                  [
                                                    labelIndex,
                                                    'label_info_attribute_groups',
                                                    groupIndex,
                                                    'attribute_group_name'
                                                  ],
                                                  val
                                                );
                                              }}
                                              placeholder="请输入属性组名称"
                                            />
                                            <Select
                                              disabled={type === 'detail'}
                                              className="ml-2 mr-2"
                                              style={{ width: 100, height: 32 }}
                                              value={
                                                attrGroup.attribute_group_class
                                              }
                                              onChange={(value) => {
                                                // 切换到输入框的时候 清空对应属性组的选项
                                                if (parseInt(value) === 3) {
                                                  updateNestedValue(
                                                    [
                                                      labelIndex,
                                                      'label_info_attribute_groups',
                                                      groupIndex,
                                                      'label_info_attribute'
                                                    ],
                                                    []
                                                  );
                                                }
                                                updateNestedValue(
                                                  [
                                                    labelIndex,
                                                    'label_info_attribute_groups',
                                                    groupIndex,
                                                    'attribute_group_class'
                                                  ],
                                                  parseInt(value)
                                                );
                                              }}
                                            >
                                              <Option key={1} value={1}>
                                                单选
                                              </Option>
                                              <Option key={2} value={2}>
                                                多选
                                              </Option>
                                              <Option key={3} value={3}>
                                                输入框
                                              </Option>
                                            </Select>
                                            {/* 必选状态切换 */}
                                            <Checkbox
                                              disabled={type === 'detail'}
                                              style={{ whiteSpace: 'nowrap' }}
                                              checked={
                                                attrGroup.attribute_group_type ===
                                                1
                                              }
                                              onChange={(checked) => {
                                                updateNestedValue(
                                                  [
                                                    labelIndex,
                                                    'label_info_attribute_groups',
                                                    groupIndex,
                                                    'attribute_group_type'
                                                  ],
                                                  checked ? 1 : 2
                                                );
                                              }}
                                            >
                                              必须标注
                                            </Checkbox>
                                            {attrGroup.attribute_group_class !==
                                              3 && (
                                              <IconPlus
                                                style={{
                                                  cursor:
                                                    type === 'detail'
                                                      ? 'not-allowed'
                                                      : 'pointer'
                                                }}
                                                className={`icon-wrapper ml-2 ${type === 'detail' ? 'icon-disabled' : ''}`}
                                                fontSize={16}
                                                onClick={() => {
                                                  if (type !== 'detail') {
                                                    addAttribute(
                                                      labelIndex,
                                                      groupIndex
                                                    );
                                                  }
                                                }}
                                              />
                                            )}
                                            {item?.label_info_attribute_groups
                                              ?.length > 1 && (
                                              <IconDelete
                                                className={`ml-2 ${type === 'detail' ? 'is-disabled' : ''}`}
                                                fontSize={16}
                                                onClick={() => {
                                                  // 删除当前属性组
                                                  if (type !== 'detail') {
                                                    deleteAttributeGroup(
                                                      labelIndex,
                                                      groupIndex
                                                    );
                                                  }
                                                }}
                                              />
                                            )}
                                          </div>
                                        </FormItem>
                                        {/* 选项内容区域 */}
                                        <div className="attribute-group-info-title">
                                          {1 === attrGroup.attribute_group_class
                                            ? '单选选项'
                                            : 2 ===
                                                attrGroup.attribute_group_class
                                              ? '多选选项'
                                              : ''}
                                        </div>
                                        {attrGroup?.label_info_attribute.map(
                                          (attr, attrIndex) => (
                                            <div
                                              key={attr.label_info_id}
                                              className="attribute-group-info-item"
                                            >
                                              {(1 ===
                                                attrGroup.attribute_group_class ||
                                                2 ===
                                                  attrGroup.attribute_group_class) && (
                                                <div className="attribute-info-item">
                                                  <FormItem
                                                    field={`label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attrIndex}_attribute_name_cn`}
                                                    rules={[
                                                      {
                                                        required: true,
                                                        message:
                                                          '请输入选项名称'
                                                      }
                                                    ]}
                                                    label={`选项${attrIndex + 1}`}
                                                  >
                                                    <Input
                                                      type="text"
                                                      value={
                                                        attr.attribute_name_cn
                                                      }
                                                      onChange={(val) =>
                                                        updateNestedValue(
                                                          [
                                                            labelIndex,
                                                            'label_info_attribute_groups',
                                                            groupIndex,
                                                            'label_info_attribute',
                                                            attrIndex,
                                                            'attribute_name_cn'
                                                          ],
                                                          val
                                                        )
                                                      }
                                                    />
                                                  </FormItem>
                                                  <FormItem
                                                    label={
                                                      <div>
                                                        展示名称
                                                        <Tooltip content="展示在标注页面的名称">
                                                          <IconQuestionCircle />
                                                        </Tooltip>
                                                      </div>
                                                    }
                                                    field={`label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attrIndex}_attribute_name_en`}
                                                  >
                                                    <Input
                                                      placeholder="展示在标注页面的名称"
                                                      type="text"
                                                      value={
                                                        attr.attribute_name_en
                                                      }
                                                      onChange={(val) =>
                                                        updateNestedValue(
                                                          [
                                                            labelIndex,
                                                            'label_info_attribute_groups',
                                                            groupIndex,
                                                            'label_info_attribute',
                                                            attrIndex,
                                                            'attribute_name_en'
                                                          ],
                                                          val
                                                        )
                                                      }
                                                    />
                                                  </FormItem>
                                                  {attrGroup
                                                    .label_info_attribute
                                                    .length > 1 && (
                                                    <IconDelete
                                                      className={`${type === 'detail' ? 'is-disabled' : ''}`}
                                                      fontSize={16}
                                                      onClick={() => {
                                                        // 删除当前属性组
                                                        if (type !== 'detail') {
                                                          deleteAttribute(
                                                            labelIndex,
                                                            groupIndex,
                                                            attrIndex
                                                          );
                                                        }
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              <div className="btn-content-items">
                                <Button
                                  disabled={type === 'detail'}
                                  className="btn-add-label btn-add"
                                  style={{ marginRight: 16 }}
                                  onClick={() => {
                                    addNewLabel();
                                  }}
                                >
                                  <IconPlus />
                                  添加标签
                                </Button>
                                <Button
                                  disabled={type === 'detail'}
                                  className="btn-add-attribute btn-add"
                                  style={{ marginRight: 16 }}
                                  onClick={() => {
                                    addAttributeGroup(labelIndex);
                                  }}
                                >
                                  <IconPlus />
                                  添加属性
                                </Button>
                                <div className="btn-option-content">
                                  <Dropdown
                                    disabled={type === 'detail'}
                                    position={'bottom'}
                                    droplist={
                                      <Menu>
                                        {templateData.map((TempItem, index) => (
                                          <Menu.Item
                                            onClick={() => {
                                              handleTemplateClick(
                                                TempItem?.attribute_group_name,
                                                labelIndex
                                              );
                                            }}
                                            key={String(index)}
                                          >
                                            {TempItem.attribute_group_name}
                                          </Menu.Item>
                                        ))}
                                        <Menu.Item
                                          onClick={() => {
                                            setActiveTab(2);
                                          }}
                                          key="2"
                                        >
                                          创建属性模版
                                        </Menu.Item>
                                      </Menu>
                                    }
                                  >
                                    <Button
                                      disabled={type === 'detail'}
                                      type="secondary"
                                    >
                                      <IconPlus />
                                      添加模版属性
                                    </Button>
                                  </Dropdown>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    {activeTab ===
                      LabelInfoAttributeGroupType.TEMPLATE_ATTRIBUTE && (
                      <div className="attribute-content">
                        {templateData.map((attrGroup, labelIndex) => (
                          <div className="sortable-item" key={labelIndex}>
                            <div
                              key={labelIndex}
                              className="attribute-group-item-template"
                            >
                              <FormItem
                                required
                                label="属性组件名称"
                                disabled={type === 'detail'}
                              >
                                <div className="group-items">
                                  <Input
                                    disabled={type === 'detail'}
                                    width={400}
                                    height={32}
                                    value={attrGroup.attribute_group_name}
                                    onChange={(val: any) => {
                                      updateNestedValue(
                                        [labelIndex, 'attribute_group_name'],
                                        val,
                                        true
                                      );
                                    }}
                                    placeholder="请输入属性组名称"
                                  />
                                  <Select
                                    className="ml-2 mr-2"
                                    style={{ width: 100, height: 32 }}
                                    value={attrGroup.attribute_group_class}
                                    onChange={(value) => {
                                      // 更新组件类型（单选/多选/输入框）
                                      if (parseInt(value) === 3) {
                                        updateNestedValue(
                                          [labelIndex, 'label_info_attribute'],
                                          [],
                                          true
                                        );
                                      }
                                      updateNestedValue(
                                        [labelIndex, 'attribute_group_class'],
                                        parseInt(value),
                                        true
                                      );
                                    }}
                                  >
                                    <Option key={1} value={1}>
                                      单选
                                    </Option>
                                    <Option key={2} value={2}>
                                      多选
                                    </Option>
                                    <Option key={3} value={3}>
                                      输入框
                                    </Option>
                                  </Select>
                                  {/* 必选状态切换 */}
                                  <Checkbox
                                    style={{ whiteSpace: 'nowrap' }}
                                    checked={
                                      attrGroup.attribute_group_type === 1
                                    }
                                    onChange={(checked) => {
                                      updateNestedValue(
                                        [labelIndex, 'attribute_group_type'],
                                        checked ? 1 : 2,
                                        true
                                      );
                                    }}
                                  >
                                    必须标注
                                  </Checkbox>
                                  {attrGroup.attribute_group_class !== 3 && (
                                    <IconPlus
                                      fontSize={16}
                                      className="ml-2"
                                      onClick={() => {
                                        addAttributeT(labelIndex);
                                      }}
                                    />
                                  )}
                                  {
                                    <IconDelete
                                      className={`ml-2 ${type === 'detail' ? 'is-disabled' : ''}`}
                                      fontSize={16}
                                      onClick={() => {
                                        // 删除当前属性组
                                        if (type !== 'detail') {
                                          setTemplateData(
                                            templateData.filter(
                                              (g) =>
                                                g.attribute_id !==
                                                attrGroup.attribute_id
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  }
                                </div>
                              </FormItem>
                              {/* 选项内容区域 */}
                              {attrGroup.label_info_attribute.map(
                                (attr, attrIndex) => (
                                  <div
                                    key={attr.label_info_id}
                                    className="attribute-group-info-item"
                                  >
                                    <div className="attribute-group-info-title">
                                      {1 === attrGroup.attribute_group_class
                                        ? '单选选项'
                                        : 2 === attrGroup.attribute_group_class
                                          ? '多选选项'
                                          : ''}
                                    </div>
                                    {(1 === attrGroup.attribute_group_class ||
                                      2 ===
                                        attrGroup.attribute_group_class) && (
                                      <div className="attribute-info-item">
                                        <FormItem
                                          label={`选项${attrIndex + 1}`}
                                        >
                                          <Input
                                            type="text"
                                            value={attr.attribute_name_cn}
                                            onChange={(val) =>
                                              updateNestedValue(
                                                [
                                                  labelIndex,
                                                  'label_info_attribute',
                                                  attrIndex,
                                                  'attribute_name_cn'
                                                ],
                                                val,
                                                true
                                              )
                                            }
                                          />
                                        </FormItem>
                                        <FormItem
                                          label={
                                            <div>
                                              展示名称{' '}
                                              <Tooltip content="展示在标注页面的名称">
                                                {' '}
                                                <IconQuestionCircle />
                                              </Tooltip>
                                            </div>
                                          }
                                        >
                                          <Input
                                            placeholder="展示在标注页面的名称"
                                            type="text"
                                            value={attr.attribute_name_en}
                                            onChange={(val: any) => {
                                              updateNestedValue(
                                                [
                                                  labelIndex,
                                                  'label_info_attribute',
                                                  attrIndex,
                                                  'attribute_name_en'
                                                ],
                                                val
                                              );
                                              // 移除英文名称同步更新
                                            }}
                                          />
                                        </FormItem>
                                        {attrGroup.label_info_attribute.length >
                                          1 && (
                                          <IconDelete
                                            className={`${type === 'detail' ? 'is-disabled' : ''}`}
                                            fontSize={16}
                                            onClick={() => {
                                              // 删除当前属性组中的选项
                                              if (type !== 'detail') {
                                                setTemplateData(
                                                  templateData.map((label) =>
                                                    label.attribute_id ===
                                                    attrGroup.attribute_id
                                                      ? {
                                                          ...label,
                                                          label_info_attribute:
                                                            label.label_info_attribute.filter(
                                                              (g) =>
                                                                g.label_info_id !==
                                                                attr.label_info_id
                                                            )
                                                        }
                                                      : label
                                                  )
                                                );
                                              }
                                            }}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                        <Button
                          className="add-template-btn"
                          disabled={type === 'detail'}
                          onClick={() => {
                            setTemplateData([
                              ...templateData,
                              {
                                attribute_id: uuidV4(),
                                attribute_group_name: '',
                                attribute_group_class: 1,
                                attribute_group_type: 1,
                                label_info_attribute: [
                                  {
                                    label_info_id: uuidV4(),
                                    attribute_name_cn: '',
                                    attribute_name_en: '',
                                    input_type: 1
                                  }
                                ]
                              }
                            ]);
                          }}
                        >
                          <IconPlus />
                          添加属性
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {annotationTypeContentVal ===
                  AnnotationTypeContentCode.ENTITY && (
                  <TextSubstanceComponent
                    type={type}
                    getDetailObj={getDetailObj}
                    getTextEntityData={getTextFlChildData}
                  />
                )}
                {annotationTypeContentVal ===
                  AnnotationTypeContentCode.TEXT_CLASSIFICATION && (
                  <Classify
                    type={type}
                    getDetailObj={getDetailObj}
                    getClassIfyData={getClassIfyChildData}
                  />
                )}
              </FormItem>
            </Form>
          </div>
        )}
        {/* 任务分配功能 */}
        <div className="task-configuration-content">
          <div className="basic-title">任务分配</div>
          <Form
            form={form3}
            disabled={type === 'detail'}
            onValuesChange={(_, val) => {
              setPublishData({ ...publishData, val });
            }}
            labelCol={{
              span: 1
            }}
          >
            <FormItem
              label="选择类型:"
              rules={[{ required: true, message: '请选择部门或者个人' }]}
            >
              <RadioGroup
                value={taskTypeVal}
                onChange={(val) => {
                  setTaskTypeVal(val);
                  setTaskAssignData([]);
                }}
              >
                <Radio value={2}>部门</Radio>
                <Radio value={1}>个人</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem
              rules={[
                {
                  required: true,
                  message: '请选择类型'
                }
              ]}
              label={taskTypeVal === 2 ? '选择部门' : '选择个人'}
              disabled={type === 'detail'}
            >
              <div className="btn-content-text">
                <Button
                  disabled={type === 'detail'}
                  onClick={() => {
                    taskTypeVal === 2
                      ? setDepartmentModalVisible(true)
                      : setIndividualModalVisible(true);
                  }}
                >
                  选择
                </Button>
                <div className="text-content">
                  已选：
                  {taskAssignData.length ||
                    getDetailObj?.label_operate?.[0].user_id?.length ||
                    getDetailObj?.label_operate?.[0].org_id?.length}
                </div>
              </div>
            </FormItem>
            {isShowTypeErrorInfo && taskAssignData.length === 0 ? (
              <div className="error-info">请选择部门或者个人内容</div>
            ) : null}
          </Form>
        </div>
        {taskTypeVal === 2 ? (
          <DepartmentModal
            visible={departmentModalVisible}
            onClose={() => {
              setDepartmentModalVisible(false);
            }}
            title="选择部门"
            getChildTreeSelectData={handleChildTreeSelectData}
          />
        ) : (
          <IndividualModal
            visible={individualModalVisible}
            onClose={() => {
              setIndividualModalVisible(false);
            }}
            title="选择个人"
            getChildTreeSelectData={handleChildTreeSelectData}
            getTreeIds={getChildTreeIds}
          />
        )}
        <div className="btn-content">
          <Button
            onClick={() => {
              stepNext();
            }}
            disabled={type === 'detail'}
            style={{ marginRight: 8 }}
            type="primary"
          >
            确认
          </Button>
          <Button
            type="secondary"
            onClick={() => {
              history.goBack();
            }}
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
