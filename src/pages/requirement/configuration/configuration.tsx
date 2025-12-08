import { publishRequirement, editRequirement } from '@/api/dataAnnotation';
import { useParams } from '@/utils/url';
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  InputNumber,
  Message,
  Radio,
  Select,
  Spin,
  Tooltip
} from '@arco-design/web-react';
import { IconArrowLeft, IconQuestionCircle } from '@arco-design/web-react/icon';
import { cloneDeep, isArray, isEmpty, omitBy } from 'lodash-es';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { convertToUTCFormat } from '../common';
import {
  useGetModelLabelList,
  useGetModelList
} from '../hooks/useGetModelInfo';
import { useGetRequirementDetail } from '../hooks/useGetRequirementDetail';
import {
  AnnotationChildType,
  AnnotationTypeContentCode,
  AnnotationTypeStatus,
  LabelData,
  RequirementTypeNameMap,
  toolFileType
} from '../type';
import AnnotationType from './components/AnnotationType';
import { Classify } from './components/Classify';
import { DataSourceModal } from './components/DetailModal';
import LabelAndAttributeForm from './components/LabelAndAttributeForm';
import QualityConfig from './components/QualityConfig';
import {
  formatSubmitData,
  generateTaskPackages,
  TaskDistributionPanel,
  TaskPackage,
  validateTaskAssignment,
  ValidationErrors
} from './components/TaskDistribution';
import TextSubstanceComponent from './components/TextEntity';
import './configuration.scss';
import { useLabelOperations } from './hooks/useLabelOperations';
import {
  isAttributeFromDetail as checkAttributeFromDetail,
  isAttributeGroupFromDetail as checkAttributeGroupFromDetail,
  isLabelFromDetail as checkLabelFromDetail
} from './utils/editModeHelpers';
import {
  generateInitialData,
  generateLabels,
  LABEL_MAPPING,
  generateTextFlData,
  generateEntityRelations,
  generateEntityLabels
} from './utils/generateLabels';
const BreadcrumbItem = Breadcrumb.Item;

export default function RequirementConfig() {
  const [basicForm] = Form.useForm();
  const [labelToolForm] = Form.useForm();
  const [distributeForm] = Form.useForm();
  const [qualityTaskForm] = Form.useForm();
  const FormItem = Form.Item;
  const TextArea = Input.TextArea;

  const type = useParams('type') || 'create';
  const requirementId = useParams('id') as string;
  const history = useHistory();
  const [selectedRadio, setSelectedRadio] = useState('');
  const [isShowErrorInfo, setIsShowErrorInfo] = useState(false);
  const [isShowDataErrorInfo, setIsShowDataErrorInfo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // 类型定义
  const [taskTypeVal, setTaskTypeVal] = useState(2);
  // 发布数据集合
  const [publishData, setPublishData] = useState<any>({});
  // 数据集 - 选中数据内容
  const [selectedData, setSelectedData]: any = useState([]);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 标签和属性
  const [activeTab, setActiveTab] = useState(1);
  const [TextEntityDataContent, setTextEntityDataContent]: any = useState({});
  const [formType, setFormType]: any = useState({});
  const [text_fl_data, setText_fl_data] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const [labelDataList, setLabelDataList] =
    useState<LabelData[]>(generateInitialData);
  // 用于跟踪 copy 模式下是否已完成初始化，避免切换标注类型时的重复处理
  const copyModeInitializedRef = useRef(false);
  // 模版数据存储
  const [templateData, setTemplateData] = useState<any[]>([]);

  // 使用 useLabelOperations hook 管理标签操作
  const {
    updateNestedValue,
    deleteLabel,
    deleteAttributeGroup,
    deleteAttribute,
    addNewLabel,
    addAttributeGroup,
    addAttribute,
    handleTemplateClick
  } = useLabelOperations({
    labelDataList,
    setLabelDataList,
    templateData,
    setTemplateData,
    labelToolForm,
    basicForm,
    setActiveTab
  });

  // 使用 editModeHelpers 创建判断函数
  const isLabelFromDetail = (labelId: string) =>
    checkLabelFromDetail(type, requirementDetail, labelId);
  const isAttributeGroupFromDetail = (labelId: string, attributeId: string) =>
    checkAttributeGroupFromDetail(
      type,
      requirementDetail,
      labelId,
      attributeId
    );
  const isAttributeFromDetail = (
    labelId: string,
    attributeGroupId: string,
    attributeId: string
  ) =>
    checkAttributeFromDetail(
      type,
      requirementDetail,
      labelId,
      attributeGroupId,
      attributeId
    );

  // 任务分配模块状态
  const [taskPackages, setTaskPackages] = useState<TaskPackage[]>([]);
  const [taskDistributionErrors, setTaskDistributionErrors] =
    useState<ValidationErrors>({});

  const { data: requirementDetail = {} } = useGetRequirementDetail({
    requirement_id: Number(requirementId)
  });

  useEffect(() => {
    if (isEmpty(requirementDetail)) {
      return;
    }
    setAnnotationTypeContentCode(
      requirementDetail?.label_tool?.label_tool_code
    );
    setAnnotationTypeContentVal(requirementDetail?.label_tool?.label_tool_code);
    setAnnotationTypeVal(requirementDetail?.label_type);
    basicForm.setFieldValue('name', requirementDetail?.name);
    basicForm.setFieldValue('description', requirementDetail?.description);
    basicForm.setFieldValue('model_id', requirementDetail?.model_id);
    // 渲染label数据
    requirementDetail?.labels?.map((item) => {
      // 使用 label_id 来匹配表单字段
      const labelId = item?.label_id || item?.id;
      labelToolForm.setFieldValue(
        `label_name_cn_${labelId}`,
        item?.label_name_cn
      );
      labelToolForm.setFieldValue(
        `label_name_en_${labelId}`,
        item?.label_name_en
      );
      if (!isEmpty(item?.label_mappings) && !isEmpty(item?.label_mappings[0])) {
        labelToolForm.setFieldValue(
          `label_mappings_${labelId}`,
          item?.label_mappings
        );
      }
      labelToolForm.setFieldValue(`label_shape_${labelId}`, item?.label_shape);
      labelToolForm.setFieldValue(
        `label_colour_${labelId}`,
        item?.label_colour
      );
      item?.label_info_attribute_groups?.map((group) => {
        // 使用 attribute_id 来匹配表单字段
        const groupId = group?.attribute_id || group?.id;
        labelToolForm.setFieldValue(
          `label_info_attribute_groups_${groupId}_attribute_group_name`,
          group?.attribute_group_name
        );
        group?.label_info_attribute?.map((attribute) => {
          // 使用 label_info_id 来匹配表单字段
          const attrId = attribute?.label_info_id || attribute?.id;
          labelToolForm.setFieldValue(
            `label_info_attribute_groups_${attrId}_attribute_name_cn`,
            attribute?.attribute_name_cn
          );
          labelToolForm.setFieldValue(
            `label_info_attribute_groups_${attrId}_attribute_name_en`,
            attribute?.attribute_name_en
          );
        });
      });
    });
    // 映射数据结构，确保字段名正确
    const mappedLabels = requirementDetail?.labels?.map((item) => ({
      ...item,
      label_id: item?.label_id || item?.id,
      label_info_attribute_groups: item?.label_info_attribute_groups?.map(
        (group) => ({
          ...group,
          attribute_id: group?.attribute_id || group?.id,
          label_info_attribute: group?.label_info_attribute?.map((attr) => ({
            ...attr,
            label_info_id: attr?.label_info_id || attr?.id
          }))
        })
      )
    }));
    setLabelDataList(mappedLabels);
    // 标记 copy 模式初始化完成
    if (type === 'copy') {
      copyModeInitializedRef.current = true;
    }
  }, [requirementDetail]);
  // 监听 taskPackages 变化，自动清除已选人员的错误
  useEffect(() => {
    if (Object.keys(taskDistributionErrors).length > 0) {
      const newErrors = { ...taskDistributionErrors };
      let hasChanges = false;

      taskPackages.forEach((pkg) => {
        pkg.roles.forEach((role) => {
          const errorKey = `${pkg.taskId}-${role.roleType}`;
          // 如果该角色已经选择了人员，清除错误
          if (newErrors[errorKey] && role.selectedCount > 0) {
            delete newErrors[errorKey];
            hasChanges = true;
          }
        });
      });

      if (hasChanges) {
        setTaskDistributionErrors(newErrors);
      }
    }
  }, [taskPackages]);

  useEffect(() => {
    if (selectedRadio !== '') {
      setIsShowErrorInfo(false);
    }
    if (selectedData?.length > 0) {
      setIsShowDataErrorInfo(false);
    }
  }, [selectedRadio, selectedData]);

  // 监听表单字段变化，动态生成任务包列表
  useEffect(() => {
    const splitCount =
      publishData?.split_task_package ||
      labelToolForm.getFieldValue('split_task_package');
    const qualityRounds = qualityTaskForm.getFieldValue('qc_round') ?? 0;
    const totalDataAmount = getTotal(selectedData) || 0;

    if (splitCount && totalDataAmount && splitCount >= 1) {
      // edit模式下，taskId从详情pkg_infos的长度+1开始
      const startTaskId =
        type === 'edit' ? (requirementDetail?.pkg_infos?.length || 0) + 1 : 1;
      // 传入现有的taskPackages，保留已选数据
      const packages = generateTaskPackages(
        splitCount,
        qualityRounds,
        totalDataAmount,
        taskPackages,
        startTaskId
      );
      setTaskPackages(packages);
      // 清除验证错误
      setTaskDistributionErrors({});
    } else {
      setTaskPackages([]);
    }
  }, [
    publishData?.split_task_package,
    selectedData,
    type,
    requirementDetail?.pkg_infos?.length
    // qc_round 需要通过表单变化触发
  ]);
  // 找到现有的useEffect，在其后添加一个新的useEffect来处理templateData的更新同步
  useEffect(() => {
    if (activeTab === 1) {
      // 深拷贝当前的 templateData 来触发更新
      const updatedTemplateData = cloneDeep(templateData);
      setTemplateData(updatedTemplateData);
    }
  }, [activeTab]);

  // 添加新的useEffect来同步模板更新到标签
  useEffect(() => {
    // 当templateData更新时，检查并更新所有使用了该模板的标签属性组
    if (
      templateData &&
      templateData.length > 0 &&
      labelDataList &&
      labelDataList.length > 0
    ) {
      // 使用函数式状态更新，一次性更新所有数据
      setLabelDataList((prevDatalist) => {
        const newDatalist = cloneDeep(prevDatalist);
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
                  labelToolForm.setFieldValue(
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
                        labelToolForm.setFieldValue(
                          `label_info_attribute_groups_${fieldId}_attribute_name_cn`,
                          attribute.attribute_name_cn
                        );
                        labelToolForm.setFieldValue(
                          `label_info_attribute_groups_${fieldId}_attribute_name_en`,
                          attribute.attribute_name_en
                        );
                        labelToolForm.setFieldValue(
                          `attribute_name_cn${fieldId}`,
                          attribute.attribute_name_cn
                        );
                        labelToolForm.setFieldValue(
                          `attribute_name_en${fieldId}`,
                          attribute.attribute_name_en
                        );
                        labelToolForm.setFieldValue(
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
            .catch(() => {
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
            .catch(() => {
              return false;
            })
        : true,
      annotationTypeContentVal === AnnotationTypeContentCode.TEXT_CLASSIFICATION
        ? formType
            .validate()
            .then(() => {
              return true;
            })
            .catch(() => {
              return false;
            })
        : true,
      basicForm
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
        .catch(() => {
          if (selectedData?.length <= 0) {
            setIsShowDataErrorInfo(true);
          }
          if (selectedRadio === '') {
            setIsShowErrorInfo(true);
            return;
          }
          return false;
        }),
      labelToolForm
        .validate()
        .then(() => {
          return true;
        })
        .catch(() => {}),
      // 任务分配验证
      distributeForm
        .validate()
        .then(() => {
          // 验证任务包分配
          const errors = validateTaskAssignment(taskPackages);
          if (Object.keys(errors).length > 0) {
            setTaskDistributionErrors(errors);
            Message.error('请完成所有必填的人员分配');
            return false;
          }
          return true;
        })
        .catch(() => {
          const errors = validateTaskAssignment(taskPackages);
          if (Object.keys(errors).length > 0) {
            setTaskDistributionErrors(errors);
          }
          return false;
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
    const { name, description } = basicForm.getFieldsValue();
    const label_count =
      type === 'edit'
        ? requirementDetail?.label_count + getTotal(selectedData)
        : getTotal(selectedData);
    // 发布数据重置
    const new_publishData = {
      name,
      description,
      label_type: annotationTypeVal,
      label_count, //数据量（所有数据集之和）
      label_tool: {
        label_tool_name: RequirementTypeNameMap[annotationTypeVal],
        label_tool_code: annotationTypeContentCode,
        image_out_of_bounds: 0
      },
      // 配置文件分类标签
      file_labels:
        annotationTypeContentCode ===
        AnnotationTypeContentCode.TEXT_CLASSIFICATION
          ? generateTextFlData(text_fl_data, type)
          : [],
      label_data_set: selectedData,
      labels:
        annotationTypeContentVal === AnnotationTypeContentCode.ENTITY
          ? generateEntityLabels(entityRelations, type)
          : annotationTypeContentCode !== AnnotationTypeContentCode.QA &&
              annotationTypeContentCode !==
                AnnotationTypeContentCode.TEXT_SORT &&
              annotationTypeContentCode !==
                AnnotationTypeContentCode.TEXT_CLASSIFICATION
            ? generateLabels(labelDataList, type)
            : [],
      entity_relations:
        annotationTypeContentVal === AnnotationTypeContentCode.ENTITY
          ? generateEntityRelations(relationRelations, type)
          : [],
      // 任务分配数据
      ...formatSubmitData(taskPackages),
      // 质检配置
      req_config: {
        qc_round: qualityTaskForm.getFieldValue('qc_round') ?? 0,
        is_result_modify:
          qualityTaskForm.getFieldValue('is_result_modify') ?? 0,
        reject_to: qualityTaskForm.getFieldValue('reject_to') ?? 1,
        task_effective_minute:
          distributeForm.getFieldValue('task_effective_minute') || 30
      }
    };
    if (model_id) {
      new_publishData['model_id'] = model_id;
    }
    // 编辑模式新增字段
    if (type === 'edit') {
      new_publishData['req_id'] = Number(requirementId);
    }
    const obj = removeEmptyArrays(new_publishData);
    setLoading(true);
    // 发布数据
    try {
      const res =
        type === 'edit'
          ? await editRequirement(obj as any)
          : await publishRequirement(obj as any);
      if (res.code === 'success') {
        Message.success('创建成功');
        history.goBack();
      }
      setLoading(false);
      setPageLoading(false);
    } catch {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // 图片、文本问答展示预标注
  const showPreLabeling = useMemo(() => {
    return (
      (annotationTypeContentCode ||
        requirementDetail?.label_tool?.label_tool_code) ===
        AnnotationTypeContentCode.IMAGE_ANNOTATION ||
      (annotationTypeContentCode ||
        requirementDetail?.label_tool?.label_tool_code) ===
        AnnotationTypeContentCode.QA
    );
  }, [
    annotationTypeContentCode,
    requirementDetail?.label_tool?.label_tool_code
  ]);

  // 判断当前标注类型是否与原始详情的标注类型一致
  const isAnnotationTypeMatchingDetail = useMemo(() => {
    if (!requirementDetail?.label_tool?.label_tool_code) {
      return true; // 没有详情时默认为匹配
    }
    return (
      annotationTypeContentCode ===
      requirementDetail?.label_tool?.label_tool_code
    );
  }, [
    annotationTypeContentCode,
    requirementDetail?.label_tool?.label_tool_code
  ]);

  // 传递给子组件的有效 type
  // 在 copy 模式下，如果标注类型与详情不匹配，则不应使用详情数据，行为应与新建模式一致
  const effectiveType = useMemo(() => {
    if (type === 'copy' && !isAnnotationTypeMatchingDetail) {
      return 'create';
    }
    return type;
  }, [type, isAnnotationTypeMatchingDetail]);

  // 在 copy 模式下，当切换标注类型时处理标签和属性数据
  useEffect(() => {
    // 只在 copy 模式下且已完成初始化后处理
    if (type !== 'copy' || !copyModeInitializedRef.current) {
      return;
    }

    const originalLabelToolCode =
      requirementDetail?.label_tool?.label_tool_code;

    // 如果当前标注类型与原始详情不匹配，重置为初始值（与新建模式一致）
    if (!isAnnotationTypeMatchingDetail) {
      // 如果当前是 IMAGE_ANNOTATION 但标注类型与详情不匹配，重置 labelDataList
      if (
        annotationTypeContentCode === AnnotationTypeContentCode.IMAGE_ANNOTATION
      ) {
        setLabelDataList(generateInitialData);
        // 清空相关表单字段
        labelToolForm.resetFields();
      }
    } else if (
      originalLabelToolCode === AnnotationTypeContentCode.IMAGE_ANNOTATION &&
      annotationTypeContentCode ===
        AnnotationTypeContentCode.IMAGE_ANNOTATION &&
      requirementDetail?.labels
    ) {
      // 如果切回原始标注类型（IMAGE_ANNOTATION），恢复详情数据
      const mappedLabels = requirementDetail?.labels?.map((item) => ({
        ...item,
        label_id: item?.label_id || item?.id,
        label_info_attribute_groups: item?.label_info_attribute_groups?.map(
          (group) => ({
            ...group,
            attribute_id: group?.attribute_id || group?.id,
            label_info_attribute: group?.label_info_attribute?.map((attr) => ({
              ...attr,
              label_info_id: attr?.label_info_id || attr?.id
            }))
          })
        )
      }));
      setLabelDataList(mappedLabels);
      // 恢复表单字段值
      requirementDetail?.labels?.forEach((item) => {
        const labelId = item?.label_id || item?.id;
        labelToolForm.setFieldValue(
          `label_name_cn_${labelId}`,
          item?.label_name_cn
        );
        labelToolForm.setFieldValue(
          `label_name_en_${labelId}`,
          item?.label_name_en
        );
        labelToolForm.setFieldValue(
          `label_shape_${labelId}`,
          item?.label_shape
        );
        labelToolForm.setFieldValue(
          `label_colour_${labelId}`,
          item?.label_colour
        );
        if (
          !isEmpty(item?.label_mappings) &&
          !isEmpty(item?.label_mappings[0])
        ) {
          labelToolForm.setFieldValue(
            `label_mappings_${labelId}`,
            item?.label_mappings
          );
        }
        item?.label_info_attribute_groups?.forEach((group) => {
          const groupId = group?.attribute_id || group?.id;
          labelToolForm.setFieldValue(
            `label_info_attribute_groups_${groupId}_attribute_group_name`,
            group?.attribute_group_name
          );
          group?.label_info_attribute?.forEach((attribute) => {
            const attrId = attribute?.label_info_id || attribute?.id;
            labelToolForm.setFieldValue(
              `label_info_attribute_groups_${attrId}_attribute_name_cn`,
              attribute?.attribute_name_cn
            );
            labelToolForm.setFieldValue(
              `label_info_attribute_groups_${attrId}_attribute_name_en`,
              attribute?.attribute_name_en
            );
          });
        });
      });
    }
  }, [type, annotationTypeContentCode, isAnnotationTypeMatchingDetail]);

  useEffect(() => {
    basicForm.setFieldValue('model_id', undefined);
  }, [annotationTypeContentCode]);

  const { data: modelList = [] } = useGetModelList(
    { label_tool_code: annotationTypeContentCode, page: 1, page_size: 1000 },
    {
      enabled: showPreLabeling
    }
  );

  const model_id = Form.useWatch('model_id', basicForm);

  const { data: modelLabelList = [] } = useGetModelLabelList(
    { model_id },
    { enabled: !!model_id }
  );

  // 监听预标注模型变化，清空所有模型映射字段
  useEffect(() => {
    // 如果是copy、edit模式，初始化时不应该清空
    if (type === 'copy' || type === 'edit') {
      return;
    }
    if (labelDataList && labelDataList.length > 0) {
      labelDataList.forEach((item) => {
        const fieldName = `label_mappings_${item?.label_id}`;
        labelToolForm.setFieldValue(fieldName, undefined);
        item['label_mappings'] = [];
      });
    }
  }, [model_id, type]);

  const curModelLabelList = (labelShape) => {
    const curShape = LABEL_MAPPING[labelShape];
    return modelLabelList.filter((item) => item.label_shape === curShape);
  };

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
              <BreadcrumbItem>{requirementDetail?.name || ''}</BreadcrumbItem>
            </Breadcrumb>
          </div>
        )}
      </div>
      <Spin loading={pageLoading} className="requirement-detail-content-spin">
        <div className="detail-content">
          {/* 基础配置部分 */}
          <div className="basic-configuration">
            <div className="basic-title">基础信息</div>
            <Form
              form={basicForm}
              initialValues={{ name: publishData?.name }}
              onValuesChange={(_, val) => {
                setPublishData({ ...publishData, ...val });
              }}
              className="configuration-form"
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
                  style={{ width: 900 }}
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
                  style={{ width: 900 }}
                  showWordLimit
                  maxLength={200}
                />
              </FormItem>
              <div className="basic-title">任务配置</div>
              <FormItem
                label="标注类型:"
                required
                disabled={type === 'edit'}
                className="annotation-tool"
                field="label_type"
              >
                {isShowErrorInfo && (
                  <span className="error-info-text">请选择标注工具</span>
                )}
                <AnnotationType
                  isDisabled={type === 'edit'}
                  label_type={requirementDetail?.label_type || 2}
                  label_tool_code={
                    requirementDetail?.label_tool?.label_tool_code ||
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
                    onClick={() => {
                      setModalVisible(true);
                    }}
                  >
                    {type === 'edit' ? '新增数据' : '选择数据'}
                  </Button>
                  <div className="data-set-text">
                    已选数据量 {getTotal(selectedData) || 0}
                  </div>
                </div>
                {selectedData?.length <= 0 && isShowDataErrorInfo && (
                  <div className="data-error-info error-info-text">
                    请选择数据
                  </div>
                )}
              </FormItem>
              <FormItem
                initialValue={1}
                field="split_task_package"
                label="拆分任务包:"
                style={{ marginBottom: 24 }}
              >
                {selectedData?.length === 0 ? (
                  <div className="data-content-set">
                    <span style={{ color: '#86909c' }}>请先选择标注数据</span>
                  </div>
                ) : (
                  <InputNumber
                    mode="button"
                    onChange={(value) => {
                      setPublishData({
                        ...publishData,
                        split_task_package: value
                      });
                    }}
                    min={1}
                    max={
                      getTotal(selectedData) ||
                      requirementDetail?.label_count ||
                      1
                    }
                    precision={0}
                    style={{ width: 200 }}
                  />
                )}
              </FormItem>
              {showPreLabeling && (
                <FormItem
                  field="model_id"
                  label="预标注模型:"
                  disabled={type === 'edit'}
                  style={{ marginBottom: 24 }}
                >
                  <Select
                    allowClear
                    options={modelList}
                    style={{ width: 900 }}
                    placeholder="请选择预标注模型"
                  />
                </FormItem>
              )}
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
              requirementDetail={requirementDetail}
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
                form={labelToolForm}
                onValuesChange={(_, val) => {
                  setPublishData({ ...publishData, val });
                }}
                style={{ marginBottom: 24 }}
                layout="inline"
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
                    <LabelAndAttributeForm
                      labelDataList={labelDataList}
                      templateData={templateData}
                      labelToolForm={labelToolForm}
                      type={type}
                      model_id={model_id}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      setTemplateData={setTemplateData}
                      updateNestedValue={updateNestedValue}
                      deleteLabel={deleteLabel}
                      deleteAttributeGroup={deleteAttributeGroup}
                      deleteAttribute={deleteAttribute}
                      addNewLabel={addNewLabel}
                      addAttributeGroup={addAttributeGroup}
                      addAttribute={addAttribute}
                      handleTemplateClick={handleTemplateClick}
                      isLabelFromDetail={isLabelFromDetail}
                      isAttributeGroupFromDetail={isAttributeGroupFromDetail}
                      isAttributeFromDetail={isAttributeFromDetail}
                      curModelLabelList={curModelLabelList}
                    />
                  )}
                  {annotationTypeContentVal ===
                    AnnotationTypeContentCode.ENTITY && (
                    <TextSubstanceComponent
                      type={effectiveType}
                      requirementDetail={requirementDetail}
                      getTextEntityData={getTextFlChildData}
                    />
                  )}
                  {annotationTypeContentVal ===
                    AnnotationTypeContentCode.TEXT_CLASSIFICATION && (
                    <Classify
                      type={effectiveType}
                      requirementDetail={requirementDetail}
                      getClassIfyData={getClassIfyChildData}
                    />
                  )}
                </FormItem>
              </Form>
            </div>
          )}
          {/* 质检任务配置 */}
          <div className="quality-task-configuration">
            <div className="basic-title">质检任务配置</div>
            <Form
              form={qualityTaskForm}
              className="configuration-form"
              onValuesChange={(changedValues) => {
                // 当质检轮次变化时，重新生成任务包列表
                if ('qc_round' in changedValues) {
                  const splitCount =
                    publishData?.split_task_package ||
                    labelToolForm.getFieldValue('split_task_package');
                  const totalDataAmount =
                    getTotal(selectedData) ||
                    requirementDetail?.label_count ||
                    0;

                  if (splitCount && totalDataAmount && splitCount >= 1) {
                    // edit模式下，taskId从详情pkg_infos的长度+1开始
                    const startTaskId =
                      type === 'edit'
                        ? (requirementDetail?.pkg_infos?.length || 0) + 1
                        : 1;
                    // 传入现有的taskPackages，保留已选数据
                    const packages = generateTaskPackages(
                      splitCount,
                      changedValues.qc_round ?? 0,
                      totalDataAmount,
                      taskPackages,
                      startTaskId
                    );
                    setTaskPackages(packages);
                    setTaskDistributionErrors({});
                  }
                }
              }}
            >
              <QualityConfig
                form={qualityTaskForm}
                type={type}
                requirementDetail={requirementDetail}
              />
            </Form>
          </div>
          {/* 任务分配功能 */}
          <div className="task-configuration-content">
            <div className="basic-title">任务分配</div>
            <Form
              form={distributeForm}
              onValuesChange={(_, val) => {
                setPublishData({ ...publishData, val });
              }}
              className="configuration-form"
            >
              <FormItem
                initialValue={30}
                field="task_effective_minute"
                label={
                  <span>
                    超时释放
                    <Tooltip content="领取任务后超时未提交，则自动释放回公池">
                      <IconQuestionCircle
                        style={{ marginLeft: 2, color: 'var(--color-text-4)' }}
                      />
                    </Tooltip>
                    :
                  </span>
                }
                rules={[{ required: true, message: '请选择超时释放时间' }]}
              >
                <InputNumber
                  mode="button"
                  min={1}
                  precision={0}
                  style={{ width: 200 }}
                />
              </FormItem>
              <FormItem field="taskDistribution" label="分配人员:" required>
                <TaskDistributionPanel
                  taskPackages={taskPackages}
                  onUpdate={setTaskPackages}
                  validationErrors={taskDistributionErrors}
                />
              </FormItem>
            </Form>
          </div>
          <div className="btn-content">
            <Button
              onClick={() => {
                stepNext();
              }}
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
        </div>
      </Spin>
    </div>
  );
}
