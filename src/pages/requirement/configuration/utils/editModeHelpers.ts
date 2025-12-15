/**
 * Edit 模式下判断元素是否来自详情数据的辅助函数
 */

/**
 * 判断标签是否来自requirementDetail（用于edit模式下判断是否禁用）
 */
export const isLabelFromDetail = (
  type: string | null | undefined,
  requirementDetail: any,
  labelId: string
): boolean => {
  if (type !== 'edit' || !requirementDetail?.labels) {
    return false;
  }
  return requirementDetail.labels.some(
    (label: any) => (label.label_id || label.id) === labelId
  );
};

/**
 * 判断属性组是否来自requirementDetail
 */
export const isAttributeGroupFromDetail = (
  type: string | null | undefined,
  requirementDetail: any,
  labelId: string,
  attributeId: string
): boolean => {
  // 只有在edit模式下才需要判断，其他模式下都返回false（不禁用）
  if (type !== 'edit' || !requirementDetail?.labels) {
    return false;
  }
  const label = requirementDetail.labels.find(
    (l: any) => (l.label_id || l.id) === labelId
  );
  if (!label?.label_info_attribute_groups) {
    return false;
  }
  return label.label_info_attribute_groups.some(
    (group: any) => (group.attribute_id || group.id) === attributeId
  );
};

/**
 * 判断属性是否来自requirementDetail
 */
export const isAttributeFromDetail = (
  type: string | null | undefined,
  requirementDetail: any,
  labelId: string,
  attributeGroupId: string,
  attributeId: string
): boolean => {
  if (type !== 'edit' || !requirementDetail?.labels) {
    return false;
  }
  const label = requirementDetail.labels.find(
    (l: any) => (l.label_id || l.id) === labelId
  );
  if (!label?.label_info_attribute_groups) {
    return false;
  }
  const attributeGroup = label.label_info_attribute_groups.find(
    (group: any) => (group.attribute_id || group.id) === attributeGroupId
  );
  if (!attributeGroup?.label_info_attribute) {
    return false;
  }
  return attributeGroup.label_info_attribute.some(
    (attr: any) => (attr.label_info_id || attr.id) === attributeId
  );
};
