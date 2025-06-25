// 每周的数据
export const WEEKLY_OPTIONS = [
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
  '周日'
];
// 每月的数据
export const MONTHLY_OPTIONS = Array.from(
  { length: 31 },
  (_, i) => `${i + 1}号`
);
// 快捷键的数据
export const QUICK_OPTIONS_DATA = [
  '每天凌晨0点',
  '每天中午12点',
  '每月一日凌晨0点',
  '每周一上午9点'
];
