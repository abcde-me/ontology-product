export default function generateSqlDefaultName(value: Date | string): string {
  try {
    let date;

    if (typeof value === 'string') {
      date = new Date(value);
    }

    if (value instanceof Date) {
      date = value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `SQL查询${year}${month}${day}${hours}${minutes}${seconds}`;
  } catch (error) {
    return value as string; // 如果格式化失败，返回原字符串
  }
}
