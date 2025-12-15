import { v4 as uuidV4 } from 'uuid';
import { LabelShape } from '../../type';
import { getRandomHexColorStrict } from '../../common';

// 初始化label数据
export const generateInitialData = [
  {
    label_id: uuidV4(),
    label_name_cn: '',
    label_name_en: '',
    label_shape: LabelShape.RECTANGLE,
    label_colour: getRandomHexColorStrict(),
    label_info_attribute_groups: [],
    label_mappings: []
  }
];

// 提交label数据
export const generateLabels = (data: any[], type: string) => {
  // 第一步：根据 type 过滤或处理 data
  let filteredData = data;
  if (type === 'edit') {
    // edit 模式：过滤掉 label_id 为 number 的 item
    filteredData = data.filter((item) => typeof item.label_id !== 'number');
  }

  return filteredData.map((item, itemIndex) => {
    // 处理 label_id
    let processedItem = { ...item };
    if (type === 'copy') {
      // copy 模式：删除 id 字段，将 label_id 替换为 uuidV4()
      const { id, ...restItem } = processedItem;
      processedItem = { ...restItem, label_id: uuidV4() };
    }

    // 处理 label_info_attribute_groups
    let filteredGroups = processedItem.label_info_attribute_groups || [];
    if (type === 'edit') {
      // edit 模式：过滤掉 attribute_id 为 number 的 group
      filteredGroups = filteredGroups.filter(
        (group) => typeof group.attribute_id !== 'number'
      );
    }

    return {
      ...processedItem,
      order_num: itemIndex + 1,
      label_info_attribute_groups: filteredGroups.map((group, groupIndex) => {
        // 处理 group
        let processedGroup = { ...group };
        if (type === 'copy') {
          // copy 模式：删除 id 字段，将 attribute_id 替换为 uuidV4()
          const { id, ...restGroup } = processedGroup;
          processedGroup = { ...restGroup, attribute_id: uuidV4() };
        }

        // 处理 label_info_attribute
        let filteredAttributes = processedGroup.label_info_attribute || [];
        if (type === 'edit') {
          // edit 模式：过滤掉 label_info_id 为 number 的 attribute
          filteredAttributes = filteredAttributes.filter(
            (attr) => typeof attr.label_info_id !== 'number'
          );
        }

        return {
          ...processedGroup,
          order_num: groupIndex + 1,
          label_info_attribute: filteredAttributes.map(
            (attribute, attrIndex) => {
              // 处理 attribute
              let processedAttribute = { ...attribute };
              if (type === 'copy') {
                // copy 模式：删除 id 字段，将 label_info_id 替换为 uuidV4()
                const { id, ...restAttr } = processedAttribute;
                processedAttribute = { ...restAttr, label_info_id: uuidV4() };
              }

              return {
                ...processedAttribute,
                order_num: attrIndex + 1,
                attribute_name_en:
                  processedAttribute.attribute_name_en?.replace(/\s+/g, '_')
              };
            }
          )
        };
      })
    };
  });
};

// 处理文本分类标签数据
export const generateTextFlData = (data: any[], type: string) => {
  // 无数据返回空数组
  if (!data || data.length === 0) {
    return [];
  }

  // create 模式：保持不变，只删除 isFromDetail 字段
  if (type === 'create') {
    return data.map((item, index) => {
      const { isFromDetail, ...restItem } = item;
      return {
        ...restItem,
        order_num: index + 1,
        file_label_attribute: (item.file_label_attribute || []).map(
          (attr, attrIndex) => {
            const { isFromDetail: attrIsFromDetail, ...restAttr } = attr;
            return {
              ...restAttr,
              order_num: attrIndex + 1
            };
          }
        )
      };
    });
  }

  // edit 模式：删除所有 isFromDetail 为 true 的项
  if (type === 'edit') {
    const filteredData = data.filter((item) => item.isFromDetail !== true);
    return filteredData.map((item, index) => {
      const { isFromDetail, ...restItem } = item;
      const filteredAttrs = (item.file_label_attribute || []).filter(
        (attr) => attr.isFromDetail !== true
      );
      return {
        ...restItem,
        order_num: index + 1,
        file_label_attribute: filteredAttrs.map((attr, attrIndex) => {
          const { isFromDetail: attrIsFromDetail, ...restAttr } = attr;
          return {
            ...restAttr,
            order_num: attrIndex + 1
          };
        })
      };
    });
  }

  // copy 模式：删除 id，将 attribute_id 替换为 uuidV4()
  if (type === 'copy') {
    return data.map((item, index) => {
      const { id, isFromDetail, ...restItem } = item;
      return {
        ...restItem,
        attribute_id: uuidV4(),
        order_num: index + 1,
        file_label_attribute: (item.file_label_attribute || []).map(
          (attr, attrIndex) => {
            const {
              id: attrId,
              isFromDetail: attrIsFromDetail,
              ...restAttr
            } = attr;
            return {
              ...restAttr,
              attribute_id: uuidV4(),
              order_num: attrIndex + 1
            };
          }
        )
      };
    });
  }

  // 默认返回原数据
  return data;
};

// 处理实体关系数据
export const generateEntityRelations = (data: any[], type: string) => {
  // 无数据返回空数组
  if (!data || data.length === 0) {
    return [];
  }

  // create 模式：删除 isFromDetail 字段
  if (type === 'create') {
    return data.map((item) => {
      const { isFromDetail, ...restItem } = item;
      return restItem;
    });
  }

  // edit 模式：删除所有 isFromDetail 为 true 的项
  if (type === 'edit') {
    return data
      .filter((item) => item.isFromDetail !== true)
      .map((item) => {
        const { isFromDetail, ...restItem } = item;
        return restItem;
      });
  }

  // copy 模式：删除 id，将 relation_id 替换为 uuidV4()，删除 isFromDetail
  if (type === 'copy') {
    return data.map((item) => {
      const { id, isFromDetail, ...restItem } = item;
      return {
        ...restItem,
        relation_id: uuidV4()
      };
    });
  }

  return data;
};

// 处理关系标签数据（实体标签）
export const generateEntityLabels = (data: any[], type: string) => {
  // 无数据返回空数组
  if (!data || data.length === 0) {
    return [];
  }

  // create 模式：删除 isFromDetail 字段
  if (type === 'create') {
    return data.map((item) => {
      const { isFromDetail, ...restItem } = item;
      return restItem;
    });
  }

  // edit 模式：删除所有 isFromDetail 为 true 的项
  if (type === 'edit') {
    return data
      .filter((item) => item.isFromDetail !== true)
      .map((item, index) => {
        const {
          isFromDetail,
          label_info_attribute_groups,
          label_mappings,
          label_shape,
          ...restItem
        } = item;
        return {
          ...restItem,
          order_num: index + 1
        };
      });
  }

  // copy 模式：删除 id，将 label_id 替换为 uuidV4()
  if (type === 'copy') {
    return data.map((item, index) => {
      const {
        id,
        isFromDetail,
        label_info_attribute_groups,
        label_mappings,
        label_shape,
        ...restItem
      } = item;
      return {
        ...restItem,
        label_id: uuidV4(),
        order_num: index + 1
      };
    });
  }

  return data;
};
// 模型标签形状映射：将API返回的字符串形状转换为数字
export const LABEL_MAPPING = {
  3: 'rectangle', // 矩形
  4: 'polygon' // 多边形
};
