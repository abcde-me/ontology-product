export default function timeFormattig(timestamp) {
  const date = new Date(Number(timestamp));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 返回格式化的字符串，例如：YYYY-MM-DD HH:MM:SS
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function toISOStringWithMicroseconds(now: Date) {
  const isoStr = now.toISOString();
  const microSec = (now.getMilliseconds() / 1000).toFixed(6).slice(2);
  return isoStr.replace(/\d{3}Z$/, microSec + 'Z');
}
