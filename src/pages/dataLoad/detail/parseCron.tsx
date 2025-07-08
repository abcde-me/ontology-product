/**
 * Cron表达式转换工具
 * 支持每日、每月和每周的格式，并处理月末（L）的特殊情况
 */
// interface CronOptions {
//   type: 'daily' | 'weekly' | 'monthly'; // 类型：每日、每周或每月
//   value?: number | 'L';                 // 值：对应的日期或星期几，或'L'表示月末
//   hour?: number;                        // 小时（0-23）
//   minute?: number;                      // 分钟（0-59）
// }

/**
 * 将自定义选项转换为cron表达式
 * @param options Cron选项
 * @returns cron表达式字符串
 */
function convertToCron(options): string {
  const { type, value = '*', hour = 0, minute = 0 } = options;

  // 验证输入
  if (hour < 0 || hour > 23) throw new Error('小时必须在0-23之间');
  if (minute < 0 || minute > 59) throw new Error('分钟必须在0-59之间');

  // 初始化cron表达式的5个部分（分、时、日、月、周）
  let cronExpression = '';

  switch (type) {
    case 'daily':
      // 每日：分 时 * * *
      cronExpression = `${minute} ${hour} * * *`;
      break;

    case 'weekly':
      // 验证星期值
      if (typeof value === 'number' && (value < 0 || value > 6)) {
        throw new Error('星期几必须在0-6之间（0表示星期日）');
      }

      // 每周：分 时 * * 星期几
      cronExpression = `${minute} ${hour} * * ${value}`;
      break;

    case 'monthly':
      if (value === 'L') {
        // 每月最后一天：分 时 L * *
        cronExpression = `${minute} ${hour} L * *`;
      } else {
        // 验证日期值
        if (typeof value === 'number' && (value < 1 || value > 31)) {
          throw new Error('日期必须在1-31之间');
        }

        // 每月特定日期：分 时 日期 * *
        cronExpression = `${minute} ${hour} ${value} * *`;
      }
      break;

    default:
      throw new Error('不支持的类型，必须是daily、weekly或monthly');
  }

  return cronExpression;
}

/**
 * 将cron表达式转换为人类可读的时间描述
 * @param cronExpression cron表达式
 * @returns 人类可读的时间描述
 */
export function cronToHumanReadable(cronExpression: string): string {
  const parts = cronExpression.split(' ');
  if (parts.length !== 5) {
    throw new Error('无效的cron表达式');
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // 格式化时间
  const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    // 每周
    const weekdays = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六'
    ];
    const day = parseInt(dayOfWeek);
    return `每${weekdays[day]} ${formattedTime}`;
  } else if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    // 每月特定日期
    if (dayOfMonth === 'L') {
      return `每月最后一天 ${formattedTime}`;
    } else {
      return `每月${dayOfMonth}日 ${formattedTime}`;
    }
  } else if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    // 每天
    return `每天 ${formattedTime}`;
  } else {
    return `自定义: ${cronExpression}`;
  }
}

// 使用示例
function example() {
  // 每天早上8:30
  const dailyCron = convertToCron({
    type: 'daily',
    hour: 8,
    minute: 30
  });
  console.log(dailyCron); // 输出: 30 8 * * *
  console.log(cronToHumanReadable(dailyCron)); // 输出: 每天 08:30

  // 每周一下午2:15
  const weeklyCron = convertToCron({
    type: 'weekly',
    value: 1, // 1表示星期一
    hour: 14,
    minute: 15
  });
  console.log(weeklyCron); // 输出: 15 14 * * 1
  console.log(cronToHumanReadable(weeklyCron)); // 输出: 每星期一 14:15

  // 每月15号晚上10点
  const monthlyCron = convertToCron({
    type: 'monthly',
    value: 15,
    hour: 22,
    minute: 0
  });
  console.log(monthlyCron); // 输出: 0 22 15 * *
  console.log(cronToHumanReadable(monthlyCron)); // 输出: 每月15日 22:00

  // 每月最后一天中午12点
  const monthlyLastDayCron = convertToCron({
    type: 'monthly',
    value: 'L',
    hour: 12,
    minute: 0
  });
  console.log(monthlyLastDayCron); // 输出: 0 12 L * *
  console.log(cronToHumanReadable(monthlyLastDayCron)); // 输出: 每月最后一天 12:00
}
