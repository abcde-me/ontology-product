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
