import frame from './image/body.png';
import ellipse from './image/ellipse.png';
import point from './image/point.png';
//格式化时间函数
export const formatDateTime = (dateTimeString) => {
  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateTimeString; // 如果格式化失败，返回原字符串
  }
};


export const numberToChinese = (num: number) => {
  // 验证输入是否为非负整数
  if (typeof num !== 'number' || num < 0 || !Number.isInteger(num)) {
    return '请输入非负整数';
  }

  // 基本数字映射
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  // 位数单位
  const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千'];

  if (num === 0) {
    return digits[0];
  }

  let result = '';
  const numStr = num.toString();
  const length = numStr.length;

  for (let i = 0; i < length; i++) {
    const digit = parseInt(numStr[i]);
    const position = length - i - 1; // 当前数字的位数位置

    if (digit !== 0) {
      // 非零数字直接拼接数字和单位
      result += digits[digit] + units[position];
    } else {
      // 处理零的情况，避免连续多个零
      if (result[result.length - 1] !== digits[0]) {
        result += digits[0];
      }
    }
  }

  // 处理特殊情况：十位数以"一十"开头时，简化为"十"（如10 -> 十，11 -> 十一）
  if (result.startsWith('一十')) {
    result = result.substring(1);
  }

  // 去除末尾可能的零
  if (result.endsWith(digits[0])) {
    result = result.substring(0, result.length - 1);
  }

  return result;
}

export const shapeOptions = [
  {
    icon: frame,
    value: 1,
    label: '矩形',
  },
  {
    icon: frame,
    value: 2,
    label: '多边形',
  }, {
    icon: frame,
    value: 3,
    label: '线段',
  }, {
    icon: point,
    value: 4,
    label: '特征点',
  }, {
    icon: ellipse,
    value: 5,
    label: '椭圆',
  }, {
    icon: frame,
    value: 6,
    label: '立方体',
  }];
