export const validateApiName = (value, callback) => {
  const apiNameReg = /^[a-zA-Z0-9_]+$/;
  // value 是表单输入的实际值
  if (!value) {
    callback(); // 无错误时直接调用 callback()
    return;
  }
  // 正则匹配校验
  if (!apiNameReg.test(value)) {
    // 校验失败：调用 callback 并传入错误提示信息
    callback('API名称格式错误！仅支持字母、数字、下划线');
    return;
  }
  // 校验成功：无参数调用 callback 即可
  callback();
};

export const validateApiPath = (value, callback) => {
  const apiPathReg = /^\/[a-zA-Z0-9\/]{0,49}$/;
  // value 是表单输入的实际值
  if (!value) {
    callback(); // 无错误时直接调用 callback()
    return;
  }
  // 正则匹配校验
  if (!apiPathReg.test(value)) {
    // 校验失败：调用 callback 并传入错误提示信息
    callback(
      'API路径格式错误！需以/开头，仅支持字母、数字、斜杠，长度不超过50个字符'
    );
    return;
  }
  // 校验成功：无参数调用 callback 即可
  callback();
};
