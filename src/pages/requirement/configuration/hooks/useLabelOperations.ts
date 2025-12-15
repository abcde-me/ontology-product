import { cloneDeep } from 'lodash-es';
import { useCallback } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { getRandomHexColorStrict } from '../../common';
import {
  LabelData,
  LabelInfoAttribute,
  LabelInfoAttributeGroup
} from '../../type';
import { generateInitialData } from '../utils/generateLabels';
import { getNestedValue, setNestedValue } from '../utils/labelDataUtils';

interface UseLabelOperationsProps {
  labelDataList: LabelData[];
  setLabelDataList: React.Dispatch<React.SetStateAction<LabelData[]>>;
  templateData: any[];
  setTemplateData: React.Dispatch<React.SetStateAction<any[]>>;
  labelToolForm: any;
  basicForm: any;
  setActiveTab: (tab: number) => void;
}

export const useLabelOperations = ({
  labelDataList,
  setLabelDataList,
  templateData,
  setTemplateData,
  labelToolForm,
  basicForm,
  setActiveTab
}: UseLabelOperationsProps) => {
  // 更新嵌套值
  const updateNestedValue = useCallback(
    (path: (string | number)[], value: any, isTemp?: boolean) => {
      if (path.length === 0) return;

      const updateFn = (prevData: any) => {
        const newData = cloneDeep(prevData);
        let current: any = newData;
        for (let i = 0; i < path.length; i++) {
          const key = path[i];
          if (i === path.length - 1) {
            current[key] = value;
            break;
          }
          if (current[key] === undefined) {
            console.error(`路径错误: 找不到 ${key} 在层级 ${i}`);
            return prevData;
          }
          current = current[key];
        }
        return newData;
      };

      isTemp ? setTemplateData(updateFn) : setLabelDataList(updateFn);
    },
    [setLabelDataList, setTemplateData]
  );

  // 更新字段
  const updateField = useCallback(
    (path: (string | number)[], value: any) => {
      const currentValue = getNestedValue(labelDataList, path);
      if (currentValue === undefined) {
        console.warn(`无效的路径: ${path.join('.')}`);
        return;
      }
      const newData = setNestedValue(labelDataList, path, value);
      setLabelDataList(newData);
    },
    [labelDataList, setLabelDataList]
  );

  // 删除标签
  const deleteLabel = useCallback(
    (labelIndex: number) => {
      setLabelDataList((prevDatalist) => {
        const newDatalist = [...prevDatalist];
        newDatalist.splice(labelIndex, 1);
        return newDatalist;
      });
    },
    [setLabelDataList]
  );

  // 删除属性组
  const deleteAttributeGroup = useCallback(
    (labelIndex: number, groupIndex: number) => {
      setLabelDataList((prevData) => {
        const newData = cloneDeep(prevData);
        if (
          newData[labelIndex] &&
          newData[labelIndex].label_info_attribute_groups
        ) {
          const attributeGroups =
            newData[labelIndex].label_info_attribute_groups;
          attributeGroups.splice(groupIndex, 1);
        }
        return newData;
      });
    },
    [setLabelDataList]
  );

  // 删除属性
  const deleteAttribute = useCallback(
    (labelIndex: number, groupIndex: number, attributeIndex: number) => {
      const currentAttributes =
        getNestedValue(labelDataList, [
          labelIndex,
          'label_info_attribute_groups',
          groupIndex,
          'label_info_attribute'
        ]) || [];

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
      basicForm.resetFields(
        `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attributeIndex}_attribute_name_cn`
      );
      basicForm.resetFields(
        `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attributeIndex}_attribute_name_en`
      );
      basicForm.resetFields(
        `label_info_attribute_groups_${labelIndex}_${groupIndex}_label_info_attribute_${attributeIndex}_input_type`
      );
    },
    [labelDataList, updateField, basicForm]
  );

  // 添加新标签
  const addNewLabel = useCallback(() => {
    setLabelDataList((prevDatalist) => {
      if (!Array.isArray(prevDatalist) || prevDatalist.length === 0) {
        return [...prevDatalist, ...generateInitialData];
      }

      const lastLabel = cloneDeep(prevDatalist[prevDatalist.length - 1]);
      lastLabel.label_id = uuidV4();
      lastLabel.label_colour = getRandomHexColorStrict();
      lastLabel.label_name_en = '';
      lastLabel.label_name_cn = '';
      lastLabel.label_mappings = [];

      if (
        lastLabel.label_info_attribute_groups &&
        Array.isArray(lastLabel.label_info_attribute_groups)
      ) {
        lastLabel.label_info_attribute_groups =
          lastLabel.label_info_attribute_groups.map((group) => {
            const newGroup = cloneDeep(group);
            newGroup.attribute_id = uuidV4();
            if (
              newGroup.label_info_attribute &&
              Array.isArray(newGroup.label_info_attribute) &&
              newGroup.label_info_attribute.length > 0
            ) {
              newGroup.label_info_attribute = newGroup.label_info_attribute.map(
                (attr) => {
                  const newAttr = cloneDeep(attr);
                  newAttr.label_info_id = uuidV4();
                  return newAttr;
                }
              );
            }
            return newGroup;
          });
      }

      const newDatalist = [...prevDatalist, lastLabel];
      newDatalist?.forEach((item) => {
        labelToolForm.setFieldValue(
          `label_shape_${item?.label_id}`,
          item?.label_shape
        );
        labelToolForm.setFieldValue(
          `label_colour_${item?.label_id}`,
          item?.label_colour
        );
        item?.label_info_attribute_groups?.forEach((group) => {
          labelToolForm.setFieldValue(
            `label_info_attribute_groups_${group?.attribute_id}_attribute_group_name`,
            group?.attribute_group_name
          );
          group?.label_info_attribute?.forEach((attribute) => {
            labelToolForm.setFieldValue(
              `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_cn`,
              attribute?.attribute_name_cn
            );
            labelToolForm.setFieldValue(
              `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_en`,
              attribute?.attribute_name_en
            );
          });
        });
      });
      return newDatalist;
    });
  }, [setLabelDataList, labelToolForm]);

  // 为指定标签添加属性组
  const addAttributeGroup = useCallback(
    (labelIndex: number) => {
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

      const currentGroups =
        labelDataList[labelIndex].label_info_attribute_groups;
      updateNestedValue(
        [labelIndex, 'label_info_attribute_groups'],
        [...currentGroups, newGroup]
      );
    },
    [labelDataList, updateNestedValue]
  );

  // 为指定属性组添加属性
  const addAttribute = useCallback(
    (labelIndex: number, groupIndex?: number, type?: number) => {
      const newAttribute: LabelInfoAttribute = {
        label_info_id: uuidV4(),
        attribute_name_cn: '',
        attribute_name_en: '',
        input_type: 1
      };

      const currentAttributes =
        labelDataList[labelIndex].label_info_attribute_groups[
          groupIndex as number
        ].label_info_attribute;

      const updatedAttributes = [...currentAttributes];

      if (type === 2 && updatedAttributes.length >= 1) {
        updatedAttributes.splice(-1, 0, newAttribute);
      } else {
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
    },
    [labelDataList, updateNestedValue]
  );

  // 模版的内容放到标注中
  const tempDataToLabel = useCallback(
    (labelIndex: number, attributeGroupName: string) => {
      const selectedTemplate = templateData.find(
        (template) => template.attribute_group_name === attributeGroupName
      );
      if (selectedTemplate) {
        const newGroup = cloneDeep(selectedTemplate);
        const currentGroups =
          labelDataList[labelIndex].label_info_attribute_groups;
        updateNestedValue(
          [labelIndex, 'label_info_attribute_groups'],
          [...currentGroups, newGroup]
        );
        labelToolForm.setFieldValue(
          `label_info_attribute_groups_${newGroup.attribute_id}_attribute_group_name`,
          newGroup.attribute_group_name
        );

        if (
          newGroup.label_info_attribute &&
          newGroup.label_info_attribute.length > 0
        ) {
          newGroup.label_info_attribute.forEach(
            (attribute: any, attrIndex: number) => {
              labelToolForm.setFieldValue(
                `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_cn`,
                attribute.attribute_name_cn
              );
              labelToolForm.setFieldValue(
                `label_info_attribute_groups_${attribute?.label_info_id}_attribute_name_en`,
                attribute.attribute_name_en
              );
              labelToolForm.setFieldValue(
                `label_info_attribute_groups_${labelIndex}_${currentGroups.length}_label_info_attribute_${attrIndex}_input_type`,
                attribute.input_type
              );
            }
          );
        }
      }
    },
    [templateData, labelDataList, updateNestedValue, labelToolForm]
  );

  // 属性模版名字点击
  const handleTemplateClick = useCallback(
    (attributeGroupName: any, labelIndex: number) => {
      if (
        attributeGroupName === '' ||
        attributeGroupName === undefined ||
        attributeGroupName === null
      ) {
        setActiveTab(2);
      } else {
        tempDataToLabel(labelIndex, attributeGroupName);
      }
    },
    [setActiveTab, tempDataToLabel]
  );

  return {
    updateNestedValue,
    updateField,
    deleteLabel,
    deleteAttributeGroup,
    deleteAttribute,
    addNewLabel,
    addAttributeGroup,
    addAttribute,
    tempDataToLabel,
    handleTemplateClick
  };
};
