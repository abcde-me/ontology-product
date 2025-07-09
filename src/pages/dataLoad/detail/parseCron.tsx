export function parseCron(cron) {
  const { minute, hour, date, month, week } = cron;
  console.log(date);

  if (date == '*') {
    return `每天${hour}:${minute}执行`;
  } else if (date !== 'L' && date !== '*' && month == '*') {
    const arr = date && date.split(',');
    let result = '';
    for (let i = 0; i < arr.length; i++) {
      result += `  ${arr[i]}号 ${arr[i] >= 30 ? '(无' + arr[i] + '号安最后一天算)' : ''}`;
      if (i < arr.length - 1) result;
    }
    return `每月${result}   ${hour}:${minute}执行`;
  } else if (date != '*' && week == '*') {
    const arr = date && date.split(',');
    let result = '';
    for (let i = 0; i < arr.length; i++) {
      result += `每周${arr[i]}`;
      if (i < arr.length - 1) result += ',';
    }
    return `${result}  ${hour}:${minute}执行`;
  } else if (date == 'L' && month == '*') {
    return `每月最后一天, ${hour}:${minute}执行`;
  }
}
/**
 * 根据 id 查找完整路径
 * @param {Array} options - Cascader 的 options 数据
 * @param {number} targetId - 目标 id
 * @param {Array} path - 当前路径（递归用）
 * @returns {Array|null} 完整路径，如 [1, 2, 123]，找不到返回 null
 */
export const findPathById = (options, targetId, path = []) => {
  for (const option of options) {
    const currentPath: any = [...path, option.value];
    if (option.value === targetId) {
      return currentPath; // 找到目标 id，返回路径
    }
    if (option.children) {
      const result = findPathById(option.children, targetId, currentPath);
      if (result) return result; // 在子级中找到，返回路径
    }
  }
  return null; // 没找到
};
