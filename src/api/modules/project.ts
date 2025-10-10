import UAPI from '@/api';

// 列出项目
export function ListProject(params) {
  return UAPI.RES.ListProject({}).post(params).inRegion().do();
}
