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
export const RequirementTypeNameMap = {
  1: '文本',
  2: '图片',
  3: '音频',
  4: '视频'
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
  RECTANGLE = 3,
  /** 多边形 */
  POLYGON = 4,
  /** 线段 */
  SEGMENT = 2,
  /** 特征点 */
  POINT = 1,
  /** 椭圆 */
  ELLIPSE = 5
  // /** 立方体 */
  // CUBE = 6
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
export const toolFileType = {
  [AnnotationTypeStatus.IMAGE]: ['JPEG', 'JPG', 'PNG', 'GIF'],
  [AnnotationTypeStatus.TEXT]: ['TXT', 'JSON'],
  [AnnotationTypeStatus.AUDIO]: ['MP3', 'WMA', 'WAV', 'FLAC', 'APE', 'AAC'],
  [AnnotationTypeStatus.VIDEO]: [
    'WMV',
    'ASF',
    'ASX',
    'RM',
    'RMVB',
    'MP4',
    '3GP',
    'MOV',
    'M4V',
    'AVI',
    'DAT',
    'MKV',
    'FLV',
    'VOB'
  ]
};
