import { cloneDeep } from 'lodash-es';

/**
 * 安全获取嵌套属性
 * @param obj - 目标对象
 * @param path - 属性路径数组
 * @returns 嵌套属性值或 undefined
 */
export const getNestedValue = (obj: any, path: (string | number)[]): any => {
  return path.reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, obj);
};

/**
 * 不可变更新嵌套属性
 * @param obj - 目标对象
 * @param path - 属性路径数组
 * @param value - 要设置的值
 * @returns 更新后的新对象
 */
export const setNestedValue = (
  obj: any,
  path: (string | number)[],
  value: any
): any => {
  // 创建原始对象的深拷贝
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };

  // 如果路径只有一项，直接更新
  if (path.length === 1) {
    newObj[path[0]] = value;
    return newObj;
  }

  // 递归更新嵌套属性
  const [currentKey, ...remainingPath] = path;
  newObj[currentKey] = setNestedValue(newObj[currentKey], remainingPath, value);
  return newObj;
};

/**
 * 创建嵌套值更新函数
 * @param setLabelDataList - 设置标签数据的函数
 * @param setTemplateData - 设置模板数据的函数
 * @returns 更新嵌套值的函数
 */
export const createUpdateNestedValue = (
  setLabelDataList: React.Dispatch<React.SetStateAction<any[]>>,
  setTemplateData: React.Dispatch<React.SetStateAction<any[]>>
) => {
  return (path: (string | number)[], value: any, isTemp?: boolean) => {
    if (path.length === 0) return;

    // 使用函数式更新确保基于最新状态
    const updateFn = (prevData: any) => {
      // 创建数据的深拷贝，避免直接修改原数据
      const newData = cloneDeep(prevData);
      // 遍历路径找到目标位置并更新值
      let current: any = newData;
      for (let i = 0; i < path.length; i++) {
        const key = path[i];
        // 如果是最后一个路径段，设置值
        if (i === path.length - 1) {
          current[key] = value;
          break;
        }

        // 移动到下一个层级
        if (current[key] === undefined) {
          console.error(`路径错误: 找不到 ${key} 在层级 ${i}`);
          return prevData; // 返回原数据，不做更新
        }
        current = current[key];
      }
      return newData;
    };

    // 更新状态
    isTemp ? setTemplateData(updateFn) : setLabelDataList(updateFn);
  };
};
