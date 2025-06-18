import { number } from "echarts";

// 传过来的数据转换哼后端需要的arco格式
const conversionArco = (time, day, week, cycle) => {
  // 解析时间（如 "09:10" -> 小时 9，分钟 10）
  const [hour, minute] = time.split(':').map(Number);
    
  // 初始化 Cron 字段（秒 分 时 日 月 星期 年）
  const cronSec = 0; // 秒（默认 0）
  const cronMin = minute; // 分
  const cronHour = hour; // 时
  const cronDay = '*'; // 日（默认 *）
  const cronMonth = '*'; // 月（默认 *）
  let cronWeek = '?'; // 星期（默认 ?）

//     const resultday = day.map(item => {
//   // 使用正则表达式提取数字部分
//   const match = item.match(/\d+/);
//   return match ? parseInt(match[0], 10) : null; // 转换为整数
// }).filter(num => num !== null).join(', '); // 过滤掉可能的 null 值并连接

  const weekMap = {
    "周一": 1,
    "周二": 2,
    "周三": 3,
    "周四": 4,
    "周五": 5,
    "周六": 6,
    "周日": 0
  };
  // 根据 cycle 调整日和星期
  if (cycle === '每日') {
    cronDay = '*';
    cronWeek = '?'; // 日和星期互斥，每日时星期不指定
  } else if (cycle === '每周') {
    cronDay = '?'; // 每周时日不指定
    cronWeek = week.map(week => weekMap[week]) ?? '?'; // 使用传入的 week 参数（如 "周一"）
  } else if (cycle === '每月') {
    cronDay = day || '*'; // 使用传入的 day 参数（如 1）
    cronWeek = '?'; // 月和日时星期不指定
  }

  // 拼接 Cron 表达式（秒 分 时 日 月 星期）
  const cronExpression = `${cronSec} ${cronMin} ${cronHour} ${cronDay} ${cronMonth} ${cronWeek}`;
  
  return cronExpression; // 返回 Cron 表达式，而不是直接打印
};

export default conversionArco;