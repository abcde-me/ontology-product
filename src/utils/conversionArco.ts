const weekDayMap = {
  周一: '1',
  周二: '2',
  周三: '3',
  周四: '4',
  周五: '5',
  周六: '6',
  周日: '7'
} as const;

export type WeekDay = keyof typeof weekDayMap;

/**
 * 将星期数组转换为数字字符串（如 ['周一','周三'] → '1,3'）
 */
export function convertWeekDaysToString(days: WeekDay[] | undefined): string {
  if (!days || days.length === 0) return '';

  // 过滤掉不在映射中的值（防御性编程）
  const validDays = days.filter((day) => day in weekDayMap);

  // 映射为数字并去重
  const numbers = Array.from(new Set(validDays.map((day) => weekDayMap[day])));

  // 排序（可选，如果需要固定顺序）
  numbers.sort((a, b) => parseInt(a) - parseInt(b));

  return numbers.join(',');
}
