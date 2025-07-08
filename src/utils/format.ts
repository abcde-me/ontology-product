export const formatNumber = (num: number | string) => {
  if (!num) return num;
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const formatTime = (num: number) => {
  if (!num) return num;
  const units = ['sec', 'min', 'h'];
  let index = 0;
  while (num >= 60 && index < units.length) {
    num = num / 60;
    index++;
  }
  return `${num.toFixed(2)} ${units[index]}`;
};

export function formatFileSize(bytes: number) {
  if (bytes >= 1073741824) {
    // 1GB = 1024^3 bytes
    return (bytes / 1073741824).toFixed(2) + 'GB';
  } else if (bytes >= 1048576) {
    // 1MB = 1024^2 bytes
    return (bytes / 1048576).toFixed(2) + 'MB';
  } else {
    // 小于1MB
    return (bytes / 1024).toFixed(2) + 'KB';
  }
}
