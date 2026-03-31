let draft = null;

const computeHashSync = (jsonObject: any) => {
  // 将对象序列化为标准JSON字符串
  const jsonString = JSON.stringify(jsonObject);

  let hash = 0;

  // 简单的哈希算法实现
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }

  // 转换为32位无符号整数，然后转为十六进制
  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(16).padStart(8, '0');
};

const setDraft = (d) => {
  draft = d;
};

const getWorkflow = () => {
  return !draft
    ? Promise.resolve({
        code: 'ResourceNotFound',
        data: null,
        message: '资源不存在'
      })
    : Promise.resolve({ data: draft as any });
};
const createWorkflow = (args: any) => {
  draft = { ...args, updated_at: Math.ceil(Date.now() / 1000) };
  // @ts-expect-error
  draft.hash = computeHashSync(draft);
  console.log('createWorkflow', draft);
  return Promise.resolve({ data: draft as any });
};

const updateWorkflow = (args: any) => {
  draft = { ...args, updated_at: Math.ceil(Date.now() / 1000) };
  // @ts-expect-error
  draft.hash = computeHashSync(draft);
  console.log('updateWorkflow', draft);
  return Promise.resolve({ data: draft as any });
};

export { setDraft, getWorkflow, createWorkflow, updateWorkflow };
