import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';

// 取消请求工具
export const createCancelToken = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

export const requestApi = async (
  config: AxiosRequestConfig,
  cancelToken?: CancelTokenSource
) => {
  try {
    const response = await axios({
      ...config,
      cancelToken: cancelToken?.token
    });

    // 检查是否有 ETag 响应头
    const etag = response.headers['etag'];
    if (etag) {
      return {
        eTag: etag.replace(/^"|"$/g, '')
      };
    } else {
      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (axios.isCancel(error)) {
        throw new Error('请求已被取消');
      }

      throw new Error(
        `请求失败: ${error.response?.status} ${error.response?.statusText}`
      );
    }
    throw error;
  }
};
