export enum RequirementType {
  Text = 1, // 文本
  Image = 2, // 图片
  Audio = 3, // 音频
  Video = 4 // 视频
}
export const RequirementTypeMap = {
  [RequirementType.Text]: '文本',
  [RequirementType.Image]: '图片',
  [RequirementType.Audio]: '音频',
  [RequirementType.Video]: '视频'
};
export enum RequirementStatus {
  Draft = 1, // 发布中
  Published = 2, // 已发布
  PublishFailed = 3, // 发布失败
  Annotated = 4 // 标注完成
}
export const RequirementStatusMap = {
  [RequirementStatus.Draft]: '发布中',
  [RequirementStatus.Published]: '已发布',
  [RequirementStatus.PublishFailed]: '发布失败',
  [RequirementStatus.Annotated]: '标注完成'
};

// 标注类型
export enum AnnotationTypeStatus {
  /** 图片 */
  IMAGE = 2,
  /** 文本 */
  TEXT = 1,
  /** 音频 */
  AUDIO = 3,
  /** 视频 */
  VIDEO = 4
}
export enum AnnotationChildType {
  /** 实体/实体关系 */
  ENTITY = 1,
  /** 文本分类 */
  TEXT_CLASSIFICATION = 2,
  /** 问答 */
  QA = 3,
  /** 文本排序 */
  TEXT_SORT = 4,
  /** 图片标注 */
  IMAGE_ANNOTATION = 1
}

export enum AnnotationTypeContentCode {
  /** 实体/实体关系 */
  ENTITY = 'TEXT_ENTITY',
  /** 文本分类 */
  TEXT_CLASSIFICATION = 'TEXT_CLASSIFICATION',
  /** 问答 */
  QA = 'TEXT_QA',
  /** 文本排序 */
  TEXT_SORT = 'TEXT_SORT',
  /** 图片标注 */
  IMAGE_ANNOTATION = 'IMAGE_ANNOTATION'
}

export enum LabelShape {
  /** 矩形 */
  RECTANGLE = 1,
  /** 多边形 */
  POLYGON = 2,
  /** 线段 */
  SEGMENT = 3,
  /** 特征点 */
  POINT = 4,
  /** 椭圆 */
  ELLIPSE = 5,
  /** 立方体 */
  CUBE = 6
}

export enum LabelInfoAttributeGroupType {
  /** 标签 */
  LABEL = 1,
  /** 标签模版属性 */
  TEMPLATE_ATTRIBUTE = 2
}

export enum TeamType {
  /** 个人 */
  PERSON = 1,
  /** 部门 */
  DEPARTMENT = 2
}
export const TeamTypeMap = {
  [TeamType.PERSON]: '个人',
  [TeamType.DEPARTMENT]: '部门'
};
// 标注工具查询表格type类型
// 1 图片 2 文本 3 音频 4 视频
export const toolFileType = {
  1: ['jpeg', 'jpg', 'png', 'gif'],
  2: ['txt', 'jsonl'],
  3: ['mp3', 'wma', 'wav', 'flac', 'ape', 'aac'],
  4: [
    'wmv',
    'asf',
    'asx',
    'rm',
    'rmvb',
    'mp4',
    '3gp',
    'mov',
    'm4v',
    'avi',
    'dat',
    'mkv',
    'flv',
    'vob'
  ]
};
