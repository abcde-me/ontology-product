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
