/**
 * 验证名称是否符合规范
 * @param name 待验证的名称
 * @returns 返回验证结果对象，包含是否通过验证和错误信息
 */
export interface ValidateNameResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 名称正则校验函数
 * 校验规则：
 * 1. 允许包含中文、英文字符和阿拉伯数字
 * 2. 允许包含的特殊字符为 '-'、'_'
 * 3. 长度不能超过256个字符
 * 4. 必须以中文、英文、数字开头，不允许以特殊字符开头
 *
 * @param name 待验证的名称
 * @returns 验证结果对象
 */
export function validateName(name: string): ValidateNameResult {
  // 检查是否为空
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      errorMessage: '名称不能为空'
    };
  }

  // 检查长度是否超过256个字符
  if (name.length > 256) {
    return {
      isValid: false,
      errorMessage: '名称长度不能超过256个字符'
    };
  }

  // 正则表达式说明：
  // ^[\u4e00-\u9fa5a-zA-Z0-9] - 以中文、英文字母或数字开头
  // [\u4e00-\u9fa5a-zA-Z0-9_-]* - 后续字符可以是中文、英文、数字、下划线或连字符
  // $ - 字符串结束
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9][\u4e00-\u9fa5a-zA-Z0-9_-]*$/;

  if (!nameRegex.test(name)) {
    // 检查是否以特殊字符开头
    if (/^[-_]/.test(name)) {
      return {
        isValid: false,
        errorMessage: '名称不能以特殊字符（-、_）开头'
      };
    }

    // 检查是否包含不允许的字符
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]*$/.test(name)) {
      return {
        isValid: false,
        errorMessage: '名称只能包含中文、英文字符、数字以及特殊字符（-、_）'
      };
    }

    return {
      isValid: false,
      errorMessage: '名称格式不正确'
    };
  }

  return {
    isValid: true
  };
}

/**
 * 简化版本的名称校验函数，只返回布尔值
 * @param name 待验证的名称
 * @returns 是否通过验证
 */
export function isValidName(name: string): boolean {
  return validateName(name).isValid;
}
