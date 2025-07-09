function numberToUppercaseSimple(num) {
  const map = {
    7: '日',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六'
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
      result += `  ${arr[i]}号 ${arr[i] >= 30 ? '(无' + arr[i] + '号安最后一天算)' : ''}`;
      if (i < arr.length - 1) result;
    }
    return `每月${result}   ${hour}:${minute}运行`;
  } else if (date != '*' && week == '*') {
    const weekly = numberToUppercaseSimple(date);
    const arr = date && date.split(',');
    let result = '';
    for (let i = 0; i < arr.length; i++) {
      result += `${arr[i]}`;
      if (i < arr.length - 1) result;
    }
    return `每周${weekly}  ${hour}:${minute}运行`;
  } else if (date == 'L' && month == '*') {
    return `每月最后一天, ${hour}:${minute}运行`;
  }
}
