export type FieldCommentMap = Record<string, string>;

export const buildFieldCommentMap = (
  properties: Array<{ name?: string | null; comment?: string | null }>
): FieldCommentMap => {
  const map: FieldCommentMap = {};

  properties.forEach((item) => {
    const fieldName = item.name?.trim();
    if (!fieldName) {
      return;
    }

    map[fieldName] = item.comment?.trim() || '';
  });

  return map;
};

/** 英文字段名展示时附带中文注释，如 user_name（用户姓名） */
export const formatFieldDisplayLabel = (
  fieldName: string,
  commentMap?: FieldCommentMap
): string => {
  const comment = resolveFieldComment(fieldName, commentMap);

  if (!comment) {
    return fieldName;
  }

  return `${fieldName}（${comment}）`;
};

export const resolveFieldComment = (
  fieldName: string,
  commentMap?: FieldCommentMap
): string | undefined => {
  const comment = commentMap?.[fieldName]?.trim();

  if (!comment || comment === fieldName) {
    return undefined;
  }

  return comment;
};

export const resolveFieldHeaderLabel = (
  fieldName: string,
  commentMap?: FieldCommentMap
): string => resolveFieldComment(fieldName, commentMap) || fieldName;
