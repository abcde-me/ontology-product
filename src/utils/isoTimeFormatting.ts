export default function isoTimeFormattig(isoTime: string | number | Date) {
  const date = new Date(isoTime);
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24小时制
    timeZone: 'Asia/Shanghai' // 指定目标时区
  });

  // 格式化为 "YYYY-MM-DD HH:MM:SS"，再替换分隔符
  const formatted = formatter
    .format(date)
    .replace(/\//g, '-')
    .replace(/(\d{2}):(\d{2}):(\d{2})/, '$1:$2:$3');
  // 返回格式化的字符串，例如：YYYY-MM-DD HH:MM:SS
  return formatted;
}
