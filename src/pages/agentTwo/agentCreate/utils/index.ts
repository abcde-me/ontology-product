export function transformArray(inputArray) {
  return inputArray?.map((item) => ({
    dataset: {
      enabled: true,
      id: String(item.id) // 确保 id 是字符串
    }
  }));
}

export function getIdsAsString(data) {
  return data?.map((item) => item.dataset.id).join(',');
}

// 格式化工作流数据
export function formatWorkflowData(data) {
  return data?.map((item) => ({
    provider_id: item.id,
    provider_name: item.name,
    provider_type: 'workflow',
    enabled: true
  }));
}
// 根据data中的id获取工作流

export function getProviderIdsAsString(data) {
  return data?.map((item) => item.provider_id).join(',');
}
