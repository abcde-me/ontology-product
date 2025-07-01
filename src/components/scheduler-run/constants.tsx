import { CycleValues, WeekValues } from './types';

// 每周的数据
export const WEEKLY_OPTIONS = [
  {
    lable: '周一',
    value: WeekValues.MONDAY
  },
  {
    lable: '周二',
    value: WeekValues.TUESDAY
  },
  {
    lable: '周三',
    value: WeekValues.WEDNESDAY
  },
  {
    lable: '周四',
    value: WeekValues.THURSDAY
  },
  {
    lable: '周五',
    value: WeekValues.FRIDAY
  },
  {
    lable: '周六',
    value: WeekValues.SATURDAY
  },
  {
    lable: '周日',
    value: WeekValues.SUNDAY
  }
];
export const TIME_TAB = ['具体日期', '相对时间'];
// 每月的数据
export const MONTHLY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  return {
    lable: `${i + 1}号`,
    value: `${i + 1}`
  };
});
export const RELATIVE_TIME_OPTIONS = [
  {
    lable: '每月最后一天',
    value: 'L'
  }
];
// 快捷键的数据
export const QUICK_OPTIONS_DATA = [
  '每天凌晨0点',
  '每天中午12点',
  '每月一日凌晨0点',
  '每周一上午9点'
];
export const CYCLE_OPTIONS = [
  {
    lable: '每日',
    value: CycleValues.PER_DAY
  },
  {
    lable: '每周',
    value: CycleValues.PER_WEEK
  },
  {
    lable: '每月',
    value: CycleValues.PER_MONTH
  }
];
