import UAPI from '@/api';
import { Get, Post } from '@/utils/request';
import { PythonListRes, PythonListParams } from '@/types/pythonApi';

// 获取数据目录列表
export async function getPythonList(
  id: string,
  params: PythonListParams
): Promise<ApiRes<PythonListRes>> {
  return Promise.resolve({
    code: '200',
    status: 200,
    requestId: '',
    message: 'success',
    data: {
      path_name: '',
      items: [
        {
          id: 1,
          name: 'Python数据分析项目',
          type: 'notebook',
          path: '',
          created: '2025-08-18 14:00',
          last_modified: '2025-08-18 15:00'
        },
        {
          id: 2,
          name: 'Python数据分析项目',
          type: 'notebook',
          path: '',
          created: '2025-08-18 14:00',
          last_modified: '2025-08-18 15:00'
        },
        {
          id: 3,
          name: 'Python数据分析项目',
          type: 'notebook',
          path: '',
          created: '2025-08-18 14:00',
          last_modified: '2025-08-18 15:00'
        }
      ],
      total: 3,
      page: 1,
      page_size: 10
    }
  });
  // return await UAPI.RES.pythonListApi({ id }).post(params).inRegion().do();
}
