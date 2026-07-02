/** 表注释展示：去掉【】及其中的补充说明 */
export const formatTableComment = (comment: string): string =>
  comment.replace(/【[^】]*】/g, '').trim();
