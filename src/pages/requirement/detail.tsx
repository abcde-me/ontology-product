import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Checkbox,
  Tooltip,
  Image,
  Dropdown,
  Menu,
  ColorPicker,
  Message,
  Spin
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconDelete,
  IconDown,
  IconPlus,
  IconQuestionCircle,
  IconSwap
} from '@arco-design/web-react/icon';
import { useParams } from '@/utils/url';
import { useHistory } from 'react-router';
import { useUserInfo } from '@/store/userInfoStore';
import { DataSourceModal } from '@/pages/requirement/components/DetailModal';
import { DepartmentModal } from './components/DepartmentModal';
import { IndividualModal } from './components/IndividualModal';
import { v4 as uuidV4 } from 'uuid';
import {
  convertToUTCFormat,
  getRandomHexColorStrict,
  shapeOptions
} from './common';
import AnnotationType from './components/AnnotationType';
import TextSubstanceComponent from './components/TextEntity';
import { publishRequirement, getRequirementDetail } from '@/api/dataAnnotation';
import { Classify } from './components/Classify';
import _, { omitBy, isArray, isEmpty, min } from 'lodash';
import {
  AnnotationChildType,
  AnnotationTypeContentCode,
  AnnotationTypeStatus,
  LabelInfoAttributeGroupType,
  LabelShape,
  RequirementTypeNameMap,
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
  const [TextEntityDataContent, setTextEntityDataContent]: any = useState({});
  const [formType, setFormType]: any = useState({});
  const [text_fl_data, setText_fl_data] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  // 生成初始示例数据
  const generateInitialData = (): LabelData[] => {
    return [
      {
        label_id: uuidV4(),
        label_name_cn: '',
        label_name_en: '',
        label_shape: LabelShape.RECTANGLE,
        label_colour: getRandomHexColorStrict(),
        label_info_attribute_groups: []
      }
    ];
  };

  // 创建需求，角色=开发者、用户时，禁止勾选 个人
  const isShowPersonal = useMemo(() => {
    return (
      !['Developer', 'User'].includes(userInfo?.role || '') && type === 'create'
    );
  }, [userInfo, type]);

  // 初始化状态
  const [datalist, setDatalist] = useState<LabelData[]>(generateInitialData());
  // 模版数据存储
  const [templateData, setTemplateData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedRadio !== '') {
      setIsShowErrorInfo(false);
    }
    if (selectedData?.length > 0) {
      setIsShowDataErrorInfo(false);
    }
  }, [selectedRadio, selectedData]);
  // 找到现有的useEffect，在其后添加一个新的useEffect来处理templateData的更新同步
  useEffect(() => {
    if (activeTab === 1) {
      // 深拷贝当前的 templateData 来触发更新
      const updatedTemplateData = _.cloneDeep(templateData);
      setTemplateData(updatedTemplateData);
    }
  }, [activeTab]);

  // 添加新的useEffect来同步模板更新到标签
  useEffect(() => {
    // 当templateData更新时，检查并更新所有使用了该模板的标签属性组
    if (
      templateData &&
      templateData.length > 0 &&
      datalist &&
      datalist.length > 0
    ) {
      // 使用函数式状态更新，一次性更新所有数据
      setDatalist((prevDatalist) => {
        const newDatalist = _.cloneDeep(prevDatalist);
        let hasChanges = false;

        // 遍历datalist中的每个标签
        newDatalist.forEach((labelItem, labelIndex) => {
          if (
            labelItem.label_info_attribute_groups &&
            labelItem.label_info_attribute_groups.length > 0
          ) {
            // 遍历每个标签的属性组
            labelItem.label_info_attribute_groups.forEach(
              (attrGroup, groupIndex) => {
                // 通过多种方式查找对应的模板
                let matchingTemplate = templateData.find(
                  (template) => template.attribute_id === attrGroup.attribute_id
                );

                // 如果通过ID没找到，尝试通过名称匹配
                if (!matchingTemplate) {
                  matchingTemplate = templateData.find(
                    (template) =>
                      template.attribute_group_name ===
                      attrGroup.attribute_group_name
                  );
                }

                // 如果还没找到，尝试通过属性内容匹配（用于复制的标签）
                if (
                  !matchingTemplate &&
                  attrGroup.label_info_attribute &&
                  attrGroup.label_info_attribute.length > 0
                ) {
                  matchingTemplate = templateData.find((template) => {
                    if (
                      !template.label_info_attribute ||
                      template.label_info_attribute.length !==
                        attrGroup.label_info_attribute.length
                    ) {
                      return false;
                    }
                    // 比较属性的中文名和英文名是否匹配
                    return template.label_info_attribute.every(
                      (tplAttr, idx) => {
                        const groupAttr = attrGroup.label_info_attribute[idx];
                        return (
                          tplAttr.attribute_name_cn ===
                            groupAttr.attribute_name_cn &&
                          tplAttr.attribute_name_en ===
                            groupAttr.attribute_name_en
                        );
                      }
                    );
                  });
                }

                if (matchingTemplate) {
                  hasChanges = true;

                  // 更新属性组名称
                  attrGroup.attribute_group_name =
                    matchingTemplate.attribute_group_name;
                  attrGroup.attribute_group_class =
                    matchingTemplate.attribute_group_class;
                  attrGroup.attribute_group_type =
                    matchingTemplate.attribute_group_type;

                  // 更新属性数据，保留原有的label_info_id
                  if (
                    Array.isArray(matchingTemplate.label_info_attribute) &&
                    Array.isArray(attrGroup.label_info_attribute)
                  ) {
                    attrGroup.label_info_attribute =
                      matchingTemplate.label_info_attribute.map(
                        (tplAttr, idx) => {
                          const existAttr = attrGroup.label_info_attribute[idx];
                          return {
                            ...tplAttr,
                            label_info_id:
                              existAttr?.label_info_id || tplAttr.label_info_id,
                            input_type:
                              tplAttr.input_type ?? existAttr?.input_type ?? 1
                          };
                        }
                      );
                  }

                  // 更新表单字段
                  form2.setFieldValue(
                    `label_info_attribute_groups_${attrGroup.attribute_id}_attribute_group_name`,
                    attrGroup.attribute_group_name
                  );

                  // 更新属性的表单字段
                  if (
                    attrGroup.label_info_attribute &&
                    attrGroup.label_info_attribute.length > 0
                  ) {
                    attrGroup.label_info_attribute.forEach(
                      (attribute, attrIndex) => {
                        const fieldId = attribute.label_info_id;

                        // 更新两种可能的字段命名格式
                        form2.setFieldValue(
                          `label_info_attribute_groups_${fieldId}_attribute_name_cn`,
                          attribute.attribute_name_cn
                        );
                        form2.setFieldValue(
                          `label_info_attribute_groups_${fieldId}_attribute_name_en`,
                          attribute.attribute_name_en
                        );
                        form2.setFieldValue(
                          `attribute_name_cn${fieldId}`,
                          attribute.attribute_name_cn
                        );
                        form2.setFieldValue(
                          `attribute_name_en${fieldId}`,
                          attribute.attribute_name_en
                        );
                        form2.setFieldValue(
                          `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attrIndex}_input_type`,
                          attribute.input_type
                        );
                      }
                    );
                  }
                }
              }
            );
          }
        });

        // 只有在有变化时才返回新数据
        return hasChanges ? newDatalist : prevDatalist;
      });
    }
  }, [templateData]);
  // 基础配置

  const handleChildData = (data: any, key) => {
    const newSetDataContent = data?.map((item) => {
      return {
        dir_name: String(key),
        load_start_time: convertToUTCFormat(item?.start_time),
        load_end_time: convertToUTCFormat(item?.end_time),
        load_num: item?.load_num,
        create_by: item?.upload_user,
        run_id: String(item?.execution_id)
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

  // 安全获取嵌套属性
  const getNestedValue = (obj, path) => {
    return path.reduce((acc, key) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[key];
    }, obj);
  };
  // 不可变更新嵌套属性
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
    // 使用函数式更新确保获取到最新的状态
    setDatalist((prevDatalist) => {
      const newDatalist = [...prevDatalist];

      // 在删除前获取要删除的标签数据，以便清除相关表单字段
      const deletedLabel = newDatalist[labelIndex];
      newDatalist.splice(labelIndex, 1);

      // 清除表单中与该标签相关的所有字段
      if (deletedLabel) {
        // 清除标签基本信息字段
        form1.resetFields(`datalist_${labelIndex}_label_name_cn`);
        form1.resetFields(`datalist_${labelIndex}_label_name_en`);
        form1.resetFields(`datalist_${labelIndex}_label_type`);
        form1.resetFields(`datalist_${labelIndex}_label_tool_code`);

        // 清除所有属性组及其属性字段
        if (deletedLabel.label_info_attribute_groups) {
          deletedLabel.label_info_attribute_groups.forEach(
            (group, groupIndex) => {
              // 清除属性组基本信息字段
              form1.resetFields(
                `label_info_attribute_groups_${labelIndex}_${groupIndex}_attribute_group_name`
              );
              form1.resetFields(
                `label_info_attribute_groups_${labelIndex}_${groupIndex}_attribute_group_class`
              );
              form1.resetFields(
                `label_info_attribute_groups_${labelIndex}_${groupIndex}_attribute_group_type`
              );

              // 清除属性组中的所有属性字段
              if (group.label_info_attribute) {
                group.label_info_attribute?.forEach((_, attrIndex) => {
                  form1.resetFields(
                    `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attrIndex}_attribute_name_cn`
                  );
                  form1.resetFields(
                    `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attrIndex}_attribute_name_en`
                  );
                  form1.resetFields(
                    `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attrIndex}_input_type`
                  );
                });
              }
            }
          );
        }
      }

      return newDatalist;
    });
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
    setDatalist((prevData) => {
      // 创建数据的深拷贝，避免直接修改原数据
      const newData = _.cloneDeep(prevData);

      // 只在指定的标签中删除指定的属性组
      if (
        newData[labelIndex] &&
        newData[labelIndex].label_info_attribute_groups
      ) {
        const attributeGroups = newData[labelIndex].label_info_attribute_groups;
        // 删除指定索引的属性组
        attributeGroups.splice(groupIndex, 1);
      }

      return newData;
    });
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

    // 使用splice方法直接删除指定索引的元素，更直观且确保删除正确位置
    const newAttributes = [...currentAttributes];
    newAttributes.splice(attributeIndex, 1);

    updateField(
      [
        labelIndex,
        'label_info_attribute_groups',
        groupIndex,
        'label_info_attribute'
      ],
      newAttributes
    );

    // 清除表单中与该属性相关的所有字段
    form1.resetFields(
      `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attributeIndex}_attribute_name_cn`
    );
    form1.resetFields(
      `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attributeIndex}_attribute_name_en`
    );
    form1.resetFields(
      `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attributeIndex}_input_type`
    );
  };

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

  // 添加新标签
  const addNewLabel = () => {
    // 使用函数式更新确保基于最新状态进行操作
    setDatalist((prevDatalist) => {
      // 检查数组是否为空
      if (!Array.isArray(prevDatalist) || prevDatalist.length === 0) {
        // 如果为空，创建一个初始标签
        return [...prevDatalist, generateInitialData()[0]];
      }

      // 获取最后一个标签的深拷贝
      const lastLabel = _.cloneDeep(prevDatalist[prevDatalist.length - 1]);
      // 生成全新的唯一ID
      lastLabel.label_id = uuidV4();
      lastLabel.label_colour = getRandomHexColorStrict();
      // 清空标签名称和展示名称，让用户重新输入
      lastLabel.label_name_en = '';
      lastLabel.label_name_cn = '';

      // 确保完整保留所有属性组和属性
      if (
        lastLabel.label_info_attribute_groups &&
        Array.isArray(lastLabel.label_info_attribute_groups)
      ) {
        lastLabel.label_info_attribute_groups =
          lastLabel.label_info_attribute_groups.map((group) => {
            const newGroup = _.cloneDeep(group);
            newGroup.attribute_id = uuidV4();
            // 为每个属性生成新ID
            if (
              newGroup.label_info_attribute &&
              Array.isArray(newGroup.label_info_attribute) &&
              newGroup.label_info_attribute.length > 0
            ) {
              newGroup.label_info_attribute = newGroup.label_info_attribute.map(
                (attr) => {
                  const newAttr = _.cloneDeep(attr);
                  newAttr.label_info_id = uuidV4();
                  return newAttr;
                }
              );
            }

            return newGroup;
          });
      }

      // 创建新的标签列表
      const newDatalist = [...prevDatalist, lastLabel];
      newDatalist?.map((item) => {
        form2.setFieldValue(`label_shape_${item?.label_id}`, item?.label_shape);
        form2.setFieldValue(
          `label_colour_${item?.label_id}`,
          item?.label_colour
        );
        item?.label_info_attribute_groups?.map((group) => {
          form2.setFieldValue(
            `label_info_attribute_groups_${group?.attribute_id}_attribute_group_name`,
            group?.attribute_group_name
          );
          group?.label_info_attribute?.map((attribute) => {
            form2.setFieldValue(
              `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_cn`,
              attribute?.attribute_name_cn
            );
            form2.setFieldValue(
              `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_en`,
              attribute?.attribute_name_en
            );
          });
        });
      });
      // 将新标签添加到数组末尾
      return newDatalist;
    });
  };
  // 为指定标签添加属性组
  const addAttributeGroup = (labelIndex: number) => {
    const newGroup: LabelInfoAttributeGroup = {
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
        },
        {
          label_info_id: uuidV4(),
          attribute_name_cn: '',
          attribute_name_en: '',
          input_type: 1
        }
      ]
    };

    // 获取当前属性组并添加新组
    const currentGroups = datalist[labelIndex].label_info_attribute_groups;
    updateNestedValue(
      [labelIndex, 'label_info_attribute_groups'],
      [...currentGroups, newGroup]
    );
  };

  // 为指定属性组添加属性
  const addAttribute = (labelIndex: number, groupIndex?: number, type?) => {
    const newAttribute: LabelInfoAttribute = {
      label_info_id: uuidV4(),
      attribute_name_cn: '',
      attribute_name_en: '',
      input_type: 1
    };
    // 获取当前属性并添加新属性
    const currentAttributes =
      datalist[labelIndex].label_info_attribute_groups[groupIndex as number]
        .label_info_attribute;

    const updatedAttributes = [...currentAttributes];

    if (type === 2 && updatedAttributes.length >= 1) {
      // 当type为2且数组长度大于等于1时，在倒数第二个位置插入
      updatedAttributes.splice(-1, 0, newAttribute);
    } else {
      // 当type为1或其他情况时，添加到最后一个位置
      updatedAttributes.push(newAttribute);
    }

    updateNestedValue(
      [
        labelIndex,
        'label_info_attribute_groups',
        groupIndex as number,
        'label_info_attribute'
      ],
      updatedAttributes
    );
  };
  // 模版的内容放到标注中
  const tempDataToLabel = (labelIndex: number, attributeGroupName: string) => {
    // 通过属性组名称查找对应的模板数据
    const selectedTemplate = templateData.find(
      (template) => template.attribute_group_name === attributeGroupName
    );
    if (selectedTemplate) {
      // 深拷贝选中的模板，确保包含完整的label_info_attribute内容
      const newGroup = _.cloneDeep(selectedTemplate);
      // 获取当前属性组并添加新组
      const currentGroups = datalist[labelIndex].label_info_attribute_groups;
      updateNestedValue(
        [labelIndex, 'label_info_attribute_groups'],
        [...currentGroups, newGroup]
      );
      form2.setFieldValue(
        `label_info_attribute_groups_${newGroup.attribute_id}_attribute_group_name`,
        newGroup.attribute_group_name
      );

      // 如果新组有属性，也需要设置这些属性的表单字段
      if (
        newGroup.label_info_attribute &&
        newGroup.label_info_attribute.length > 0
      ) {
        newGroup.label_info_attribute.forEach((attribute, attrIndex) => {
          form2.setFieldValue(
            `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_cn`,
            attribute.attribute_name_cn
          );
          form2.setFieldValue(
            `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_en`,
            attribute.attribute_name_en
          );
          form2.setFieldValue(
            `label_info_attribute_groups_${labelIndex}_${currentGroups.length}_label_info_attribute_${attrIndex}_input_type`,
            attribute.input_type
          );
        });
      }
    }
  };
  //  属性模版名字点击
  const handleTemplateClick = (attributeGroupName: any, labelIndex: number) => {
    // 同组标签如果选择一个模版就不能二次选择
    if (
      attributeGroupName === '' ||
      attributeGroupName === undefined ||
      attributeGroupName === null
    ) {
      setActiveTab(2);
    } else {
      tempDataToLabel(labelIndex, attributeGroupName);
    }
  };
  // 有必填信息没输入
  const errorInfoContent = () => {
    return Message.error('请输入必填信息');
  };
  const stepNext = async () => {
    const { formText, formLabel, entityRelations, relationRelations } =
      TextEntityDataContent;
    const result = await Promise.all([
      annotationTypeContentVal === AnnotationTypeContentCode.ENTITY
        ? formText
            .validate()
            .then((val) => {
              const entityRelationsFlag = entityRelations.every(
                (item) =>
                  item?.label_name_en !== '' && item?.label_name_cn !== ''
              );
              return entityRelationsFlag;
            })
            .catch((errorInfo) => {
              return false;
            })
        : true,
      annotationTypeContentVal === AnnotationTypeContentCode.ENTITY
        ? formLabel
            .validate()
            .then((val) => {
              const relationRelationsFlag = relationRelations.every(
                (item) =>
                  item?.relation_name_en !== '' &&
                  item?.relation_name_cn !== '' &&
                  (item?.start_entity_labels || []).length > 0 &&
                  (item?.target_entity_labels || []).length > 0
              );

              return relationRelationsFlag;
            })
            .catch((errorInfo) => {
              return false;
            })
        : true,
      annotationTypeContentVal === AnnotationTypeContentCode.TEXT_CLASSIFICATION
        ? formType
            .validate()
            .then((val) => {
              return true;
            })
            .catch((errorInfo) => {
              return false;
            })
        : true,
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
          return false;
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
      errorInfoContent();
    }
  };
  const removeEmptyArrays = (obj) => {
    return omitBy(obj, (value) => isArray(value) && isEmpty(value));
  };

  const getClassIfyChildData = (data, formClassify) => {
    setFormType(formClassify);
    setText_fl_data(data);
  };
  // entityRelations = 实体关系内容  relationRelations = 关系标签内容
  const getTextFlChildData = (
    entityRelations,
    relationRelations,
    formText,
    formLabel
  ) => {
    setTextEntityDataContent({
      entityRelations,
      relationRelations,
      formText,
      formLabel
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
    setPageLoading(true);
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
              label_info_attribute: group.label_info_attribute?.map(
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
    try {
      const res = await publishRequirement(obj);
      if (res.code === 0) {
        setPageLoading(false);
        Message.success('创建成功');
        history.goBack();
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
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
                `label_name_cn_${item?.id}`,
                item?.label_name_cn
              );
              form2.setFieldValue(
                `label_name_en_${item?.id}`,
                item?.label_name_en
              );
              form2.setFieldValue(`label_shape_${item?.id}`, item?.label_shape);
              form2.setFieldValue(
                `label_colour_${item?.id}`,
                item?.label_colour
              );
              item?.label_info_attribute_groups?.map((group) => {
                form2.setFieldValue(
                  `label_info_attribute_groups_${group?.id}_attribute_group_name`,
                  group?.attribute_group_name
                );
                group?.label_info_attribute?.map((attribute) => {
                  form2.setFieldValue(
                    `label_info_attribute_groups_${attribute?.id}_attribute_name_cn`,
                    attribute?.attribute_name_cn
                  );
                  form2.setFieldValue(
                    `label_info_attribute_groups_${attribute?.id}_attribute_name_en`,
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
            <Breadcrumb style={{ fontSize: 20 }}>
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
              style={{ cursor: 'pointer', fontSize: '14px', marginRight: 12 }}
              onClick={() => history.goBack()}
            />
            <Breadcrumb style={{ fontSize: 20 }}>
              <BreadcrumbItem
                onClick={() => history.goBack()}
                className={'breadcrumb-text'}
              >
                需求管理
              </BreadcrumbItem>
              <BreadcrumbItem>{getDetailObj?.name || ''}</BreadcrumbItem>
            </Breadcrumb>
          </div>
        )}
      </div>
      <Spin loading={pageLoading}>
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
              style={{
                marginLeft: '20px',
                marginRight: 'auto'
              }}
              layout="horizontal"
              labelCol={{
                span: 1,
                offset: 0
              }}
            >
              <FormItem
                label="需求名称:"
                field="name"
                rules={[
                  {
                    required: true,
                    max: 50,
                    validateTrigger: ['onChange', 'onBlur'],
                    validator: (value, callback) => {
                      if (!value) {
                        callback('请输入需求名称');
                      } else if (value?.length > 50) {
                        callback('需求名称不能超过50个字符');
                      }
                      return true;
                    }
                  }
                ]}
              >
                <Input
                  placeholder="请输入需求名称"
                  style={{ width: 800 }}
                  showWordLimit
                  maxLength={50}
                />
              </FormItem>
              <FormItem
                label="描述说明:"
                field="description"
                style={{
                  marginBottom: 24
                }}
                rules={[
                  {
                    max: 200,
                    validator: (value, callback) => {
                      if (value?.length > 200) {
                        callback('描述说明不能超过200个字符');
                      }
                      return true;
                    }
                  }
                ]}
              >
                <TextArea
                  placeholder="请输入描述内容"
                  style={{ width: 800 }}
                  showWordLimit
                  maxLength={200}
                />
              </FormItem>
              <div className="basic-title" style={{ marginLeft: '-20px' }}>
                任务配置
              </div>
              <FormItem
                label="标注类型:"
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
              <FormItem
                field="dataset"
                label="标注数据:"
                required
                style={{ marginBottom: 24 }}
              >
                <div className="data-content-set">
                  <Button
                    // disabled={type === 'detail'}
                    onClick={() => {
                      setModalVisible(true);
                    }}
                  >
                    {type === 'detail' ? '查看已选' : '选择数据'}
                  </Button>
                  <div className="data-set-text">
                    已选数据量{' '}
                    {getTotal(selectedData) || getDetailObj?.label_count || 0}
                  </div>
                </div>
                {selectedData?.length <= 0 && isShowDataErrorInfo && (
                  <div className="data-error-info error-info-text">
                    请选择数据
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
              title="选择数据"
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
              <Form
                form={form2}
                disabled={type === 'detail'}
                onValuesChange={(_, val) => {
                  setPublishData({ ...publishData, val });
                }}
                style={{
                  marginLeft: '0',
                  marginRight: 'auto',
                  marginBottom: 24
                }}
                layout="inline"
                labelCol={{
                  span: 1,
                  offset: 0
                }}
              >
                <FormItem
                  field="label_info_attribute_groups"
                  label="标签和属性:"
                  required
                  className="label_info_attribute_groups_content"
                >
                  {/* 循环显示内容 */}
                  {annotationTypeContentVal ===
                    AnnotationTypeContentCode.IMAGE_ANNOTATION && (
                    // annotationTypeContentVal ===
                    // AnnotationChildType.IMAGE_ANNOTATION &&

                    <div className="labe-and-attribute-warp">
                      <div className="attribute-header">
                        <div
                          className={[
                            'attribute-header-text attribute-content-label',
                            activeTab === 1 ? 'active' : ''
                          ].join(' ')}
                          onClick={() => {
                            setActiveTab(1);
                          }}
                        >
                          <div
                            className={[activeTab === 1 ? 'active' : ''].join(
                              ' '
                            )}
                          >
                            标签
                          </div>
                          {/* 这期不做 <div
                          className="attribute-content-right"
                          onClick={() => {
                            console.log('跳转预览页面');
                          }}
                          >
                          预览
                          <IconSwap />
                          </div> */}
                        </div>
                        <div
                          className={[
                            'attribute-header-text',
                            activeTab === 2 ? 'active' : ''
                          ].join(' ')}
                          onClick={() => {
                            setActiveTab(2);
                          }}
                        >
                          标签模版属性
                        </div>
                      </div>
                      {/* 原有的标签部分内容 */}
                      {activeTab === LabelInfoAttributeGroupType.LABEL && (
                        <div className="attribute-content">
                          {datalist &&
                            datalist?.map((item: any, labelIndex) => (
                              <div
                                className="sortable-item"
                                key={item?.label_id}
                              >
                                <div className="sortable-item-content">
                                  <FormItem
                                    label="标签名称:"
                                    field={`label_name_en_${type === 'detail' ? item?.id : item?.label_id}`}
                                    rules={[
                                      {
                                        required: true,
                                        validateTrigger: ['onChange', 'onBlur'],
                                        validator: (value, callback) => {
                                          // 检查是否有重复的标注名称（排除当前项）
                                          const isDuplicate = datalist.some(
                                            (otherItem, otherIndex) =>
                                              otherIndex !== labelIndex &&
                                              otherItem.label_name_en ===
                                                value &&
                                              value.trim() !== ''
                                          );
                                          if (!value) {
                                            callback('请输入标签名称');
                                          } else if (isDuplicate) {
                                            callback('标签名称不能重复');
                                          } else {
                                            callback();
                                          }
                                        }
                                      }
                                    ]}
                                    style={{ padding: 0 }}
                                  >
                                    <Input
                                      style={{
                                        minWidth: 200
                                      }}
                                      onChange={(val: any) => {
                                        updateNestedValue(
                                          [labelIndex, 'label_name_en'],
                                          val
                                        );
                                      }}
                                      className="sortable-item-input"
                                      placeholder="用于储存标注结果"
                                      value={item.label_name_en}
                                    />
                                  </FormItem>
                                  <FormItem
                                    field={`label_name_cn_${type === 'detail' ? item?.id : item?.label_id}`}
                                    label={
                                      <div>
                                        <span
                                          style={{
                                            marginRight: 2
                                          }}
                                        >
                                          展示名称
                                        </span>
                                        <Tooltip
                                          content={
                                            <div style={{ fontSize: 14 }}>
                                              展示在标注页面的名称
                                            </div>
                                          }
                                        >
                                          <IconQuestionCircle
                                            style={{ color: '#6E7B8D' }}
                                          />
                                        </Tooltip>
                                        :
                                      </div>
                                    }
                                    style={{ padding: 0 }}
                                    rules={[
                                      {
                                        validateTrigger: ['onChange', 'onBlur'],
                                        validator: (value, callback) => {
                                          if (!value) {
                                            callback('请输入标注展示名称');
                                            return;
                                          }
                                          // 检查是否有重复的展示名称（排除当前项）
                                          const isDuplicate = datalist.some(
                                            (otherItem, otherIndex) =>
                                              otherIndex !== labelIndex &&
                                              otherItem.label_name_cn ===
                                                value &&
                                              value.trim() !== ''
                                          );
                                          if (isDuplicate) {
                                            callback('展示名称不能重复');
                                          } else {
                                            callback();
                                          }
                                        }
                                      }
                                    ]}
                                  >
                                    <Input
                                      style={{
                                        minWidth: 190
                                      }}
                                      onChange={(val: any) => {
                                        updateNestedValue(
                                          [labelIndex, 'label_name_cn'],
                                          val
                                        );
                                      }}
                                      onFocus={(e: any) => {
                                        // 从 datalist 中获取最新的值
                                        const currentItem =
                                          datalist[labelIndex];
                                        // 判断展示名称是否为空（包括 undefined、null、空字符串或只有空格）
                                        if (
                                          !currentItem.label_name_cn?.trim() &&
                                          currentItem.label_name_en?.trim()
                                        ) {
                                          // 使用 item 来生成字段名（与 FormItem 的 field 保持一致）
                                          const fieldName = `label_name_cn_${type === 'detail' ? item?.id : item?.label_id}`;
                                          // 更新数据状态
                                          updateNestedValue(
                                            [labelIndex, 'label_name_cn'],
                                            currentItem.label_name_en
                                          );
                                          // 更新表单字段，使用 currentItem 的值
                                          form2.setFieldValue(
                                            fieldName,
                                            currentItem.label_name_en
                                          );
                                          // 使用 setTimeout 确保值更新后再选中
                                          setTimeout(() => {
                                            e.target.select();
                                          }, 0);
                                        } else {
                                          e.target.select();
                                        }
                                      }}
                                      className="sortable-item-input"
                                      placeholder="展示在标注页面的名称"
                                      value={item.label_name_cn}
                                    />
                                  </FormItem>
                                  <FormItem
                                    field={`label_shape_${type === 'detail' ? item?.id : item?.label_id}`}
                                    initialValue={item.label_shape ?? 3} // 添加initialValue确保表单初始化时就有默认值
                                  >
                                    <Select
                                      placeholder="请选择形状"
                                      value={item.label_shape ?? 3}
                                      onChange={(val: any) => {
                                        updateNestedValue(
                                          [labelIndex, 'label_shape'],
                                          parseInt(val)
                                        );
                                      }}
                                      style={{ width: 110, height: 32 }}
                                      renderFormat={(option, value) => {
                                        return (
                                          <span className="label-shape-options">
                                            <Image
                                              width={20}
                                              style={{
                                                marginRight: 4,
                                                pointerEvents: 'none'
                                              }}
                                              src={
                                                shapeOptions.find(
                                                  (opt) => opt.value === value
                                                )?.icon
                                              }
                                            />
                                            <span>
                                              {
                                                shapeOptions.find(
                                                  (opt) => opt.value === value
                                                )?.label
                                              }
                                            </span>
                                          </span>
                                        );
                                      }}
                                    >
                                      {shapeOptions?.map((option) => (
                                        <Option
                                          key={option.value}
                                          value={option.value}
                                          className="label_shape_options"
                                        >
                                          <Image
                                            width={20}
                                            src={option?.icon}
                                            style={{
                                              pointerEvents: 'none',
                                              marginRight: 4
                                            }}
                                          />
                                          {option.label}
                                        </Option>
                                      ))}
                                    </Select>
                                  </FormItem>
                                  <FormItem
                                    field={`label_colour_${type === 'detail' ? item?.id : item?.label_id}`}
                                  >
                                    <div className="color-content">
                                      <ColorPicker
                                        disabled={type === 'detail'}
                                        defaultValue={item?.label_colour}
                                        onChange={(val: any) => {
                                          updateNestedValue(
                                            [labelIndex, 'label_colour'],
                                            val
                                          );
                                        }}
                                        showPreset
                                      />
                                      <IconDown
                                        className="color-icon"
                                        onClick={(e) => {
                                          if (type !== 'detail') {
                                            e.stopPropagation();
                                            const trigger =
                                              e.currentTarget.parentElement?.querySelector(
                                                '.arco-color-picker-preview'
                                              ) as HTMLElement;
                                            trigger?.click();
                                          }
                                        }}
                                        style={{
                                          cursor:
                                            type === 'detail'
                                              ? 'not-allowed'
                                              : 'pointer'
                                        }}
                                      />
                                    </div>
                                  </FormItem>
                                  <FormItem>
                                    {datalist.length > 1 && (
                                      <Tooltip content="删除">
                                        <IconDelete
                                          className={`${type === 'detail' ? 'is-disabled' : 'icon-wrapper'}`}
                                          fontSize={16}
                                          onClick={() => {
                                            if (type !== 'detail') {
                                              deleteLabel(labelIndex);
                                            }
                                          }}
                                        />
                                      </Tooltip>
                                    )}
                                  </FormItem>
                                </div>
                                {item?.label_info_attribute_groups?.length >
                                  0 &&
                                  item?.label_info_attribute_groups?.map(
                                    (attrGroup, groupIndex) => {
                                      return (
                                        <div
                                          key={`${item?.label_id}_${groupIndex}`}
                                          className="attribute-group-item"
                                        >
                                          <div className="attribute-group-content-item">
                                            <FormItem
                                              field={`label_info_attribute_groups_${type === 'detail' ? attrGroup?.id : attrGroup?.attribute_id}_attribute_group_name`} // 使用item.label_id替代labelIndex
                                              disabled={
                                                type === 'detail' ||
                                                attrGroup?.isTemp === true
                                              }
                                              className="attribute-group-name-label"
                                              label="属性名称:"
                                              rules={[
                                                {
                                                  required: true,
                                                  validateTrigger: [
                                                    'onChange',
                                                    'onBlur'
                                                  ],
                                                  validator: (
                                                    value,
                                                    callback
                                                  ) => {
                                                    // 只有当用户输入了内容时，才检查是否有重复
                                                    if (value) {
                                                      // 检查同组内是否有重复的属性名称
                                                      const hasDuplicate =
                                                        item?.label_info_attribute_groups?.some(
                                                          (
                                                            otherGroup: any,
                                                            otherIndex: number
                                                          ) => {
                                                            // 排除当前正在编辑的属性组
                                                            return (
                                                              otherIndex !==
                                                                groupIndex &&
                                                              otherGroup.attribute_group_name ===
                                                                value
                                                            );
                                                          }
                                                        );
                                                      if (hasDuplicate) {
                                                        callback(
                                                          '属性名称不能重复'
                                                        );
                                                      } else {
                                                        callback();
                                                      }
                                                    } else if (!value) {
                                                      callback(
                                                        '请输入属性组名称'
                                                      );
                                                    } else {
                                                      // 如果没有输入内容，直接验证通过
                                                      callback();
                                                    }
                                                  }
                                                }
                                              ]}
                                            >
                                              <Input
                                                style={{
                                                  width: 422,
                                                  backgroundColor:
                                                    type === 'detail' ||
                                                    attrGroup?.isTemp
                                                      ? '#e2e8f0'
                                                      : '#fff'
                                                }}
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
                                                placeholder="请输入名称"
                                              />
                                            </FormItem>
                                            <FormItem
                                              label={null}
                                              style={{ marginRight: 0 }}
                                            >
                                              {console.log(
                                                attrGroup.attribute_group_class,
                                                datalist,
                                                'top'
                                              )}
                                              <Select
                                                disabled={
                                                  type === 'detail' ||
                                                  attrGroup?.isTemp === true
                                                }
                                                className="mr-2"
                                                style={{
                                                  width: 100,
                                                  height: 32
                                                }}
                                                value={
                                                  attrGroup.attribute_group_class
                                                }
                                                onChange={(value) => {
                                                  updateNestedValue(
                                                    [
                                                      labelIndex,
                                                      'label_info_attribute_groups',
                                                      groupIndex,
                                                      'attribute_group_class'
                                                    ],
                                                    parseInt(value)
                                                  );
                                                  // // 切换到输入框的时候 清空对应属性组的选项
                                                  if (value === 3) {
                                                    updateNestedValue(
                                                      [
                                                        labelIndex,
                                                        'label_info_attribute_groups',
                                                        groupIndex,
                                                        'label_info_attribute'
                                                      ],
                                                      []
                                                    );
                                                    updateNestedValue(
                                                      [
                                                        labelIndex,
                                                        'label_info_attribute_groups',
                                                        groupIndex,
                                                        'attribute_group_class'
                                                      ],
                                                      parseInt(value)
                                                    );
                                                  }
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
                                            </FormItem>
                                            <FormItem
                                              label={null}
                                              style={{ marginRight: 0 }}
                                            >
                                              <Checkbox
                                                disabled={
                                                  type === 'detail' ||
                                                  attrGroup?.isTemp === true
                                                }
                                                style={{
                                                  whiteSpace: 'nowrap',
                                                  fontSize: 14
                                                }}
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
                                            </FormItem>
                                            <FormItem
                                              label={null}
                                              style={{ marginRight: 0 }}
                                            >
                                              {attrGroup.attribute_group_class !==
                                                3 && (
                                                <Tooltip
                                                  content={
                                                    type === 'detail' ||
                                                    attrGroup?.isTemp === true
                                                      ? ''
                                                      : '添加选项'
                                                  }
                                                >
                                                  <IconPlus
                                                    style={{
                                                      marginLeft: 12,
                                                      fontSize: 16,
                                                      cursor:
                                                        type === 'detail'
                                                          ? 'not-allowed'
                                                          : 'pointer'
                                                    }}
                                                    className={`${type === 'detail' || attrGroup?.isTemp === true ? 'is-disabled' : 'icon-wrapper'}`}
                                                    onClick={() => {
                                                      if (
                                                        type === 'detail' ||
                                                        attrGroup?.isTemp ===
                                                          true
                                                      ) {
                                                        return;
                                                      }
                                                      if (type !== 'detail') {
                                                        // 修改增加逻辑 往倒数第二个增加
                                                        addAttribute(
                                                          labelIndex,
                                                          groupIndex,
                                                          attrGroup
                                                            .label_info_attribute?.[
                                                            attrGroup
                                                              .label_info_attribute
                                                              ?.length - 1
                                                          ]?.input_type
                                                        );
                                                      }
                                                    }}
                                                  />
                                                </Tooltip>
                                              )}
                                            </FormItem>
                                            <FormItem
                                              label={null}
                                              style={{ marginRight: 0 }}
                                            >
                                              <Tooltip content="删除">
                                                <IconDelete
                                                  className={`icon-wrapper ${type === 'detail' ? 'is-disabled' : ''}`}
                                                  style={{
                                                    marginLeft: 12
                                                  }}
                                                  fontSize={16}
                                                  onClick={() => {
                                                    // 删除当前属性组
                                                    if (type === 'detail') {
                                                      return;
                                                    }
                                                    if (type !== 'detail') {
                                                      deleteAttributeGroup(
                                                        labelIndex,
                                                        groupIndex
                                                      );
                                                    }
                                                  }}
                                                />
                                              </Tooltip>
                                            </FormItem>
                                          </div>
                                          {/* 选项内容区域 */}
                                          {/* {groupClassVal !== 3 && (
                                          <div className="attribute-group-header-content">
                                            <div className="attribute-group-info-title">
                                              {1 ===
                                              attrGroup.attribute_group_class
                                                ? '单选选项'
                                                : 2 ===
                                                    attrGroup.attribute_group_class
                                                  ? '多选选项'
                                                  : ''}
                                            </div>
                                            <Checkbox
                                              disabled={
                                                type === 'detail' ||
                                                attrGroup?.isTemp === true
                                              }
                                              style={{
                                                whiteSpace: 'nowrap',
                                                fontSize: 14,
                                                marginLeft: 5
                                              }}
                                              checked={
                                                attrGroup.label_info_attribute?.some(
                                                  (item) =>
                                                    item.input_type === 2
                                                )
                                                  ? true
                                                  : false
                                              }
                                              onChange={(checked) => {
                                                // 选中的时候在数组最后一个增加一项 取消选中删除，再次选择增加
                                                if (checked) {
                                                  const newData =
                                                    _.cloneDeep(datalist);
                                                  newData[
                                                    labelIndex
                                                  ].label_info_attribute_groups?.[
                                                    groupIndex
                                                  ]?.label_info_attribute.push({
                                                    label_info_id: uuidV4(),
                                                    attribute_name_cn:
                                                      '标注时的输入内容',
                                                    attribute_name_en: '其他',
                                                    input_type: 2
                                                  });
                                                  // 把选项组最后一个的选项名称和展示名称的内重置
                                                  const updatedAttrGroup =
                                                    newData[labelIndex]
                                                      ?.label_info_attribute_groups?.[
                                                      groupIndex
                                                    ];
                                                  const lastIndex =
                                                    updatedAttrGroup
                                                      ?.label_info_attribute
                                                      ?.length - 1;
                                                  const lastAttr =
                                                    updatedAttrGroup
                                                      ?.label_info_attribute?.[
                                                      lastIndex
                                                    ];
                                                  if (lastAttr?.label_info_id) {
                                                    form2?.setFieldValue(
                                                      `label_info_attribute_groups_${type === 'detail' ? item?.id : lastAttr.label_info_id}_attribute_name_en`,
                                                      '标注时的输入内容'
                                                    );
                                                    form2?.setFieldValue(
                                                      `label_info_attribute_groups_${type === 'detail' ? item?.id : lastAttr.label_info_id}_attribute_name_cn`,
                                                      '其他'
                                                    );
                                                  }
                                                  setDatalist(newData);
                                                } else {
                                                  // 取消选中的时候删除增加的内容，复选框恢复到未选中
                                                  const newItems =
                                                    _.cloneDeep(datalist);
                                                  // 过滤掉所有input_type为2的元素
                                                  newItems[
                                                    labelIndex
                                                  ].label_info_attribute_groups[
                                                    groupIndex
                                                  ].label_info_attribute =
                                                    newItems[
                                                      labelIndex
                                                    ].label_info_attribute_groups[
                                                      groupIndex
                                                    ].label_info_attribute.filter(
                                                      (item) =>
                                                        item.input_type !== 2
                                                    );
                                                  setDatalist(newItems);
                                                }
                                              }}
                                            >
                                              支持手动输入
                                            </Checkbox>
                                          </div>
                                        )} */}
                                          {attrGroup?.label_info_attribute?.map(
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
                                                    {console.log(
                                                      attrGroup.attribute_name_en
                                                    )}
                                                    <FormItem
                                                      label={
                                                        <div
                                                          style={{
                                                            color: '#6E7B8D'
                                                          }}
                                                        >
                                                          选项{attrIndex + 1}：
                                                        </div>
                                                      }
                                                      field={`label_info_attribute_groups_${type === 'detail' ? attr?.id : attr?.label_info_id}_attribute_name_en`}
                                                      rules={[
                                                        {
                                                          required: true,
                                                          validateTrigger: [
                                                            'onChange',
                                                            'onBlur'
                                                          ],
                                                          validator: (
                                                            value,
                                                            callback
                                                          ) => {
                                                            // 检查同组内是否有重复的选项名称
                                                            const hasDuplicate =
                                                              attrGroup?.label_info_attribute?.some(
                                                                (
                                                                  otherAttr: any,
                                                                  otherIndex: number
                                                                ) => {
                                                                  // 排除当前正在编辑的选项
                                                                  return (
                                                                    otherIndex !==
                                                                      attrIndex &&
                                                                    otherAttr.attribute_name_en ===
                                                                      value
                                                                  );
                                                                }
                                                              );
                                                            if (!value) {
                                                              callback(
                                                                '请输入选项名称'
                                                              );
                                                            } else if (
                                                              hasDuplicate
                                                            ) {
                                                              callback(
                                                                '选项名称不能重复'
                                                              );
                                                            } else {
                                                              callback();
                                                            }
                                                          }
                                                        }
                                                      ]}
                                                      disabled={
                                                        type === 'detail' ||
                                                        attrGroup?.isTemp ===
                                                          true ||
                                                        attrGroup
                                                          ?.label_info_attribute[
                                                          attrIndex
                                                        ].input_type === 2
                                                          ? true
                                                          : false
                                                      }
                                                    >
                                                      <Input
                                                        disabled={
                                                          type === 'detail' ||
                                                          attrGroup?.isTemp ===
                                                            true ||
                                                          attrGroup
                                                            ?.label_info_attribute[
                                                            attrIndex
                                                          ].input_type === 2
                                                            ? true
                                                            : false
                                                        }
                                                        type="text"
                                                        placeholder="用于储存标注结果"
                                                        value={
                                                          attr.attribute_name_en
                                                        }
                                                        style={{
                                                          width: 290,
                                                          backgroundColor:
                                                            type === 'detail' ||
                                                            attrGroup?.isTemp ||
                                                            (type !==
                                                              'detail' &&
                                                              attrGroup
                                                                ?.label_info_attribute[
                                                                attrIndex
                                                              ].input_type ===
                                                                2)
                                                              ? '#e2e8f0'
                                                              : '#fff'
                                                        }}
                                                        onChange={(val) => {
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
                                                          );
                                                        }}
                                                      />
                                                    </FormItem>
                                                    <FormItem
                                                      label={
                                                        <div
                                                          style={{
                                                            marginRight: 3,
                                                            color: '#6E7B8D'
                                                          }}
                                                        >
                                                          <span
                                                            style={{
                                                              marginRight: 2
                                                            }}
                                                          >
                                                            展示名称
                                                          </span>
                                                          <Tooltip
                                                            content={
                                                              <div
                                                                style={{
                                                                  fontSize: 14
                                                                }}
                                                              >
                                                                展示在标注页面的名称
                                                              </div>
                                                            }
                                                          >
                                                            <IconQuestionCircle
                                                              style={{
                                                                color:
                                                                  '#6E7B8D',
                                                                marginRight: 2
                                                              }}
                                                            />
                                                          </Tooltip>
                                                          :
                                                        </div>
                                                      }
                                                      rules={[
                                                        {
                                                          validateTrigger: [
                                                            'onChange',
                                                            'onBlur'
                                                          ],
                                                          validator: (
                                                            value,
                                                            callback
                                                          ) => {
                                                            // 检查同组内是否有重复的展示名称
                                                            const hasDuplicate =
                                                              attrGroup?.label_info_attribute?.some(
                                                                (
                                                                  otherAttr: any,
                                                                  otherIndex: number
                                                                ) => {
                                                                  // 排除当前正在编辑的选项
                                                                  return (
                                                                    otherIndex !==
                                                                      attrIndex &&
                                                                    otherAttr.attribute_name_cn?.trim() ===
                                                                      value?.trim() &&
                                                                    value.trim() !==
                                                                      ''
                                                                  );
                                                                }
                                                              );
                                                            if (!value) {
                                                              callback(
                                                                '请输入展示名称'
                                                              );
                                                            } else if (
                                                              hasDuplicate
                                                            ) {
                                                              callback(
                                                                '展示名称不能重复'
                                                              );
                                                            } else {
                                                              callback();
                                                            }
                                                          }
                                                        }
                                                      ]}
                                                      field={`label_info_attribute_groups_${type === 'detail' ? attr?.id : attr?.label_info_id}_attribute_name_cn`}
                                                    >
                                                      <Input
                                                        style={{
                                                          width: 268,
                                                          backgroundColor:
                                                            type === 'detail' ||
                                                            attrGroup?.isTemp
                                                              ? '#e2e8f0'
                                                              : '#fff'
                                                        }}
                                                        placeholder="展示在标注页面的名称"
                                                        type="text"
                                                        value={
                                                          attr.attribute_name_cn
                                                        }
                                                        disabled={
                                                          type === 'detail' ||
                                                          attrGroup?.isTemp ===
                                                            true
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
                                                    {attrGroup
                                                      .label_info_attribute
                                                      .length > 1 && (
                                                      <FormItem>
                                                        <Tooltip content="删除">
                                                          <IconDelete
                                                            className={`icon-wrapper ${type === 'detail' || attrGroup?.isTemp === true ? 'is-disabled' : ''}`}
                                                            fontSize={16}
                                                            onClick={() => {
                                                              // 删除当前属性组
                                                              if (
                                                                type ===
                                                                  'detail' ||
                                                                attrGroup?.isTemp ===
                                                                  true
                                                              ) {
                                                                return;
                                                              }
                                                              if (
                                                                type !==
                                                                'detail'
                                                              ) {
                                                                deleteAttribute(
                                                                  labelIndex,
                                                                  groupIndex,
                                                                  attrIndex
                                                                );
                                                              }
                                                            }}
                                                          />
                                                        </Tooltip>
                                                      </FormItem>
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
                                  {labelIndex === datalist?.length - 1 && (
                                    <Button
                                      disabled={type === 'detail'}
                                      className={
                                        type === 'detail'
                                          ? 'btn-add-label'
                                          : 'btn-add'
                                      }
                                      style={{ marginRight: 16 }}
                                      onClick={() => {
                                        addNewLabel();
                                      }}
                                    >
                                      <IconPlus />
                                      添加标签
                                    </Button>
                                  )}
                                  <Button
                                    disabled={type === 'detail'}
                                    className={[
                                      type === 'detail'
                                        ? ''
                                        : 'btn-add-default btn-add'
                                    ].join(' ')}
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
                                        <Menu
                                          style={{
                                            width: '100%'
                                          }}
                                        >
                                          {templateData?.length > 0 &&
                                            templateData?.map(
                                              (TempItem, index) => {
                                                const isDis = datalist[
                                                  labelIndex
                                                ]?.label_info_attribute_groups?.find(
                                                  (item) =>
                                                    item?.attribute_group_name ===
                                                    TempItem?.attribute_group_name
                                                );
                                                if (
                                                  !TempItem?.attribute_group_name
                                                ) {
                                                  return;
                                                }
                                                return (
                                                  <Tooltip
                                                    style={{ fontSize: 14 }}
                                                    content={
                                                      isDis
                                                        ? '一个标签下不能重复选择属性组'
                                                        : ''
                                                    }
                                                    key={String(index)}
                                                  >
                                                    <Menu.Item
                                                      // 如果当前标签已经选择了模版，就不能再次选择
                                                      className={[
                                                        'menu-item-content',
                                                        datalist[
                                                          labelIndex
                                                        ]?.label_info_attribute_groups?.find(
                                                          (item) =>
                                                            item?.attribute_group_name ===
                                                            TempItem?.attribute_group_name
                                                        )
                                                          ? ''
                                                          : 'menu-item-content-active'
                                                      ].join(' ')}
                                                      disabled={
                                                        datalist[
                                                          labelIndex
                                                        ]?.label_info_attribute_groups?.find(
                                                          (item) =>
                                                            item?.attribute_group_name ===
                                                            TempItem?.attribute_group_name
                                                        )
                                                          ? true
                                                          : false
                                                      }
                                                      onClick={() => {
                                                        handleTemplateClick(
                                                          TempItem?.attribute_group_name,
                                                          labelIndex
                                                        );
                                                      }}
                                                      key={String(index)}
                                                    >
                                                      {
                                                        TempItem.attribute_group_name
                                                      }
                                                    </Menu.Item>
                                                  </Tooltip>
                                                );
                                              }
                                            )}
                                          <Menu.Item
                                            onClick={() => {
                                              setActiveTab(2);
                                            }}
                                            key="2"
                                            className="menu-item-create"
                                          >
                                            <IconPlus className="menu-item-create-icon" />
                                            <span className="menu-item-create-text">
                                              创建模板属性
                                            </span>
                                          </Menu.Item>
                                        </Menu>
                                      }
                                    >
                                      <Button
                                        disabled={type === 'detail'}
                                        className="btn-add-template-attribute btn-add-default btn-add"
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
                          {templateData?.map((attrGroup, labelIndex) => (
                            <div
                              style={{ paddingBottom: 16 }}
                              className="sortable-item"
                              key={labelIndex}
                            >
                              <div className="attribute-group-name">
                                <FormItem
                                  style={{ marginRight: 0, marginBottom: 0 }}
                                  field={`attribute_group_name_${attrGroup?.attribute_id}`}
                                  label="属性名称:"
                                  disabled={type === 'detail'}
                                  rules={[
                                    {
                                      required: true,
                                      validateTrigger: ['onChange', 'onBlur'],
                                      validator: (value, callback) => {
                                        // 在同组内检查重复（排除当前项）
                                        const hasDuplicateInGroup =
                                          templateData.some(
                                            (otherGroup, otherIndex) => {
                                              // 排除当前项并检查名称是否重复
                                              return (
                                                otherIndex !== labelIndex && // 正确排除当前项
                                                otherGroup.attribute_group_name &&
                                                otherGroup.attribute_group_name.trim() ===
                                                  value.trim()
                                              );
                                            }
                                          );

                                        if (!value) {
                                          return callback('请输入属性名称');
                                        } else if (hasDuplicateInGroup) {
                                          return callback('属性名称不能重复');
                                        }

                                        // 验证通过
                                        callback();
                                      }
                                    }
                                  ]}
                                >
                                  <Input
                                    disabled={type === 'detail'}
                                    style={{
                                      width: 446,
                                      height: 32
                                    }}
                                    value={attrGroup.attribute_group_name}
                                    onChange={(val: any) => {
                                      updateNestedValue(
                                        [labelIndex, 'attribute_group_name'],
                                        val,
                                        true
                                      );
                                    }}
                                    placeholder="请输入名称"
                                  />
                                </FormItem>
                                <FormItem
                                  style={{ marginRight: 0, marginBottom: 0 }}
                                  label={null}
                                >
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
                                </FormItem>
                                <FormItem
                                  style={{ marginRight: 0 }}
                                  label={null}
                                >
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
                                </FormItem>
                                {attrGroup.attribute_group_class !== 3 && (
                                  <FormItem
                                    style={{ marginRight: 0, marginBottom: 0 }}
                                    label={null}
                                  >
                                    <IconPlus
                                      className={`icon-wrapper ml-2 ${type === 'detail' ? 'is-disabled' : ''}`}
                                      fontSize={16}
                                      onClick={() => {
                                        // 点击icon添加一个选项，选项插入是同组最后一项
                                        if (type !== 'detail') {
                                          setTemplateData(
                                            templateData?.map((g) => {
                                              if (
                                                g.attribute_id ===
                                                attrGroup.attribute_id
                                              ) {
                                                return {
                                                  ...g,
                                                  label_info_attribute: [
                                                    ...g.label_info_attribute,
                                                    {
                                                      label_info_id: uuidV4(),
                                                      attribute_group_class:
                                                        attrGroup.attribute_group_class,
                                                      attribute_group_type:
                                                        attrGroup.attribute_group_type
                                                    }
                                                  ]
                                                };
                                              }
                                              return g;
                                            })
                                          );
                                        }
                                      }}
                                    />
                                  </FormItem>
                                )}
                                <FormItem
                                  style={{ marginRight: 0, marginBottom: 0 }}
                                  label={null}
                                >
                                  <Tooltip content="删除">
                                    <IconDelete
                                      className={`icon-wrapper ml-2 ${type === 'detail' ? 'is-disabled' : ''}`}
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
                                  </Tooltip>
                                </FormItem>
                              </div>
                              {(1 === attrGroup.attribute_group_class ||
                                2 === attrGroup.attribute_group_class) && (
                                <div
                                  key={labelIndex}
                                  className="attribute-group-item-template"
                                >
                                  {/* 选项内容区域 */}
                                  <div className="attribute-group-info-title-temp">
                                    {1 === attrGroup.attribute_group_class
                                      ? '单选选项'
                                      : 2 === attrGroup.attribute_group_class
                                        ? '多选选项'
                                        : ''}
                                  </div>
                                  {attrGroup.label_info_attribute?.map(
                                    (attr, attrIndex) => (
                                      <div
                                        key={attr.label_info_id}
                                        className="attribute-group-info-item"
                                      >
                                        <div className="attribute-info-item">
                                          <FormItem
                                            field={`attribute_name_en${attr?.label_info_id}`}
                                            label={`选项${attrIndex + 1}:`}
                                            style={{ color: 'red' }}
                                            rules={[
                                              {
                                                required: true,
                                                validateTrigger: [
                                                  'onChange',
                                                  'onBlur'
                                                ],
                                                validator: (
                                                  value,
                                                  callback
                                                ) => {
                                                  // 同组下面选项不能重复
                                                  if (!value) {
                                                    return callback(
                                                      '请输入选项名称'
                                                    );
                                                  }
                                                  // 检查同组内其他选项是否有重复的名称
                                                  const duplicateFound =
                                                    attrGroup.label_info_attribute.some(
                                                      (
                                                        otherAttr,
                                                        otherIndex
                                                      ) => {
                                                        // 排除当前项自身
                                                        return (
                                                          otherIndex !==
                                                            attrIndex &&
                                                          otherAttr.attribute_name_en &&
                                                          otherAttr.attribute_name_en.trim() ===
                                                            value.trim()
                                                        );
                                                      }
                                                    );
                                                  if (!value) {
                                                    callback('请输入选项');
                                                  } else if (duplicateFound) {
                                                    return callback(
                                                      '选项名称不能重复'
                                                    );
                                                  }

                                                  callback();
                                                }
                                              }
                                            ]}
                                          >
                                            <Input
                                              type="text"
                                              placeholder="用于存储标注结果"
                                              value={attr.attribute_name_en}
                                              style={{
                                                width: 290,
                                                height: 32,
                                                backgroundColor: '#fff'
                                              }}
                                              onChange={(val) =>
                                                updateNestedValue(
                                                  [
                                                    labelIndex,
                                                    'label_info_attribute',
                                                    attrIndex,
                                                    'attribute_name_en'
                                                  ],
                                                  val,
                                                  true
                                                )
                                              }
                                            />
                                          </FormItem>
                                          <FormItem
                                            field={`attribute_name_cn${attr?.label_info_id}`}
                                            label={
                                              <div>
                                                <span
                                                  style={{
                                                    marginRight: 2
                                                  }}
                                                >
                                                  展示名称
                                                </span>
                                                <Tooltip
                                                  content={
                                                    <div
                                                      style={{ fontSize: 14 }}
                                                    >
                                                      展示在标注页面的名称
                                                    </div>
                                                  }
                                                >
                                                  <IconQuestionCircle
                                                    style={{ color: '#6E7B8D' }}
                                                  />
                                                </Tooltip>
                                                :
                                              </div>
                                            }
                                            rules={[
                                              {
                                                validateTrigger: [
                                                  'onChange',
                                                  'onBlur'
                                                ],
                                                validator: (
                                                  value,
                                                  callback
                                                ) => {
                                                  // 同组下面展示名称不能重复
                                                  if (!value) {
                                                    return callback(
                                                      '请输入展示名称'
                                                    );
                                                  }
                                                  // 检查同组内其他选项是否有重复的展示名称
                                                  const duplicateFound =
                                                    attrGroup.label_info_attribute.some(
                                                      (
                                                        otherAttr,
                                                        otherIndex
                                                      ) => {
                                                        // 排除当前项自身
                                                        return (
                                                          otherIndex !==
                                                            attrIndex &&
                                                          otherAttr.attribute_name_cn &&
                                                          otherAttr.attribute_name_cn.trim() ===
                                                            value.trim()
                                                        );
                                                      }
                                                    );
                                                  if (duplicateFound) {
                                                    return callback(
                                                      '展示名称不能重复'
                                                    );
                                                  }

                                                  callback();
                                                }
                                              }
                                            ]}
                                          >
                                            <Input
                                              placeholder="展示在标注页面的名称"
                                              type="text"
                                              style={{
                                                width: 290,
                                                height: 32,
                                                backgroundColor: '#fff'
                                              }}
                                              value={attr.attribute_name_cn}
                                              onChange={(val: any) => {
                                                // 使用labelIndex和isTemp=true来更新模板数据
                                                updateNestedValue(
                                                  [
                                                    labelIndex, // 保持使用labelIndex，因为这是在templateData.map循环中
                                                    'label_info_attribute',
                                                    attrIndex,
                                                    'attribute_name_cn'
                                                  ],
                                                  val,
                                                  true // 添加isTemp=true参数，确保更新的是模板数据
                                                );
                                                // 移除英文名称同步更新
                                              }}
                                            />
                                          </FormItem>
                                          <FormItem
                                            label={null}
                                            style={{ margin: 0 }}
                                          >
                                            {attrGroup.label_info_attribute
                                              ?.length > 1 && (
                                              <Tooltip content="删除">
                                                <IconDelete
                                                  className={`icon-wrapper ${type === 'detail' ? 'is-disabled' : ''}`}
                                                  fontSize={16}
                                                  onClick={() => {
                                                    // 删除当前属性组中的选项
                                                    if (type !== 'detail') {
                                                      setTemplateData(
                                                        templateData?.map(
                                                          (label) =>
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
                                              </Tooltip>
                                            )}
                                          </FormItem>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            className={[
                              type === 'detail' ? '' : 'btn-add-default btn-add'
                            ].join(' ')}
                            style={{
                              marginLeft: 16,
                              marginBottom: 16
                            }}
                            disabled={type === 'detail'}
                            onClick={() => {
                              setTemplateData([
                                ...templateData,
                                {
                                  attribute_id: uuidV4(),
                                  attribute_group_name: '',
                                  attribute_group_class: 1,
                                  attribute_group_type: 1,
                                  isTemp: true,
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
              style={{
                marginLeft: '20px',
                marginRight: 'auto'
              }}
              labelCol={{
                span: 1,
                offset: 0
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
                  style={{ display: 'flex' }}
                >
                  <Radio
                    style={{ display: 'flex', alignItems: 'center' }}
                    value={2}
                  >
                    部门
                  </Radio>
                  <Radio
                    disabled={!isShowPersonal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    value={1}
                  >
                    个人
                  </Radio>
                </RadioGroup>
              </FormItem>
              <FormItem
                rules={[
                  {
                    required: true,
                    message: '请选择类型'
                  }
                ]}
                label={taskTypeVal === 2 ? '选择部门:' : '选择个人:'}
                disabled={type === 'detail'}
              >
                <div className="btn-content-text">
                  <Button
                    onClick={() => {
                      taskTypeVal === 2
                        ? setDepartmentModalVisible(true)
                        : setIndividualModalVisible(true);
                    }}
                  >
                    {type === 'detail' ? '查看已选' : '选择'}
                  </Button>
                  <div className="text-content">
                    已选{' '}
                    {type === 'detail'
                      ? getDetailObj?.label_operate?.user_id?.length ||
                        getDetailObj?.label_operate?.org_id?.length
                      : taskAssignData.length}
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
              getDetailObj={getDetailObj}
              type={type}
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
              getDetailObj={getDetailObj}
              type={type}
            />
          )}
          {type !== 'detail' && (
            <div className="btn-content">
              <Button
                onClick={() => {
                  stepNext();
                }}
                disabled={type === 'detail'}
                style={{ marginRight: 8 }}
                type="primary"
                loading={loading}
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
          )}
        </div>
      </Spin>
    </div>
  );
}
