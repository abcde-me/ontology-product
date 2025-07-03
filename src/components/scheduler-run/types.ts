export interface CycleText {
  minute: string; // 10代表第10分钟
  hour: string; // 10代表10点
  date: string; // *代表每日，"1,3"代表1号和3号执行，"L"代表最后一天，默认空字符，代表未选择
  month: string; // *代表每月，默认空字符，代表未选择
  week: string; // *代表每周，默认空字符，代表未选择
}

export enum CycleValues {
  /** 每日 */
  PER_DAY = 'per_day',
  /** 每周 */
  PER_WEEK = 'per_week',
  /** 每月 */
  PER_MONTH = 'per_month',
  /** 未定义 */
  UNKNOWN = ''
}

export enum WeekValues {
  /** 周一 */
  MONDAY = '1',
  /** 周二 */
  TUESDAY = '2',
  /** 周三 */
  WEDNESDAY = '3',
  /** 周四 */
  THURSDAY = '4',
  /** 周五 */
  FRIDAY = '5',
  /** 周六 */
  SATURDAY = '6',
  /** 周日 */
  SUNDAY = '7'
}

export enum TimeType {
  /** 绝对时间 */
  SEPCIFICTIME = 'Specific',
  /** 相对时间 */
  RELATICELYTIME = 'relatively'
}
