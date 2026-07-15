/** 科研主题二级导航配置 */
export const RESEARCH_THEME_ITEMS = [
  {
    key: 'ModelResearch',
    title: '型号研究',
    pathSegment: 'modelResearch',
    subTitle: '覆盖型号论证、研制过程与试验鉴定的全生命周期管理'
  }
] as const;

export type ResearchThemeItem = (typeof RESEARCH_THEME_ITEMS)[number];
