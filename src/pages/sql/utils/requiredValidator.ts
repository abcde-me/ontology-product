export default function requiredValidator(value, cb, tip) {
  if (!value) {
    return cb(tip || '必填项');
  }
  return cb();
}
