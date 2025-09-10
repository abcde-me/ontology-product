export default function tableNameValidator(value, cb, tip) {
  if (!value) {
    return cb(tip || '请输入英文存储表名');
  }
  if (value.length > 100) {
    return cb('表名长度不能超过100个字符');
  }
  if (value !== value.toLowerCase()) {
    return cb('表名只能为小写字母、数字和下划线');
  }
  if (!/^[a-z][a-z0-9_]*$/.test(value)) {
    return cb('表名需以小写字母开头，仅支持小写字母、数字和下划线');
  }
  return cb();
}
