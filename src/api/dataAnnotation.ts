import { create } from './../../integration-tests-cypress/support/index';
import UAPI from '@/api';

// 需求列表
export async function getAnnotationList(params: {
    page: number; // 页码
    pageSize: number; // 每页数量
    filters: {
        name: string; // 需求名称
        create_by: string; // 创建人
    }
}) {
    return await UAPI.RES.getAnnotationListApi({}).post(params).inRegion().do();
}
