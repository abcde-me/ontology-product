function numberToUppercaseSimple(num) {
  const map = {
    7: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六'
  };
  return num
    .toString()
    .split('')
    .map((digit) => map[digit])
    .join('');
}
export function parseCron(cron) {
  const { minute, hour, date, month, week } = cron;
  console.log(date);

  if (date == '*') {
    return `每天${hour}:${minute}运行`;
  } else if (date !== 'L' && date !== '*' && month == '*') {
    const arr = date && date.split(',');
    let result = '';
    for (let i = 0; i < arr.length; i++) {
      result += `  ${arr[i]}号 ${arr[i] >= 30 ? '(无' + arr[i] + '号则不执行)' : ''}`;
      if (i < arr.length - 1) result;
    }
    return `每月${result}   ${hour}:${minute}运行`;
  } else if (date != '*' && week == '*') {
    const weekly = numberToUppercaseSimple(date);
    // const newWeekly = weekly.map(item => `周${item}`)
    // const arr = date && date.split(',');
    // let result = '';
    // for (let i = 0; i < arr.length; i++) {
    //   result += `${arr[i]}`;
    //   if (i < arr.length - 1)  result;
    // }
    return `每${weekly}  ${hour}:${minute}运行`;
  } else if (date == 'L' && month == '*') {
    return `每月最后一天  ${hour}:${minute}运行`;
  }
}
export const formatRunTime = (totalSeconds: number) => {
  if (totalSeconds == 0) return '0s'; // 处理 0 秒的情况
  if (totalSeconds == -1) return '';
  // const newtotalSeconds = totalSeconds + 1
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length == 0) parts.push(`${seconds}s`);
  return parts.join(' ');
};
