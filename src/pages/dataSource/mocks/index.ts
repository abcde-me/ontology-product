import { isDevBypassEnabled } from '@/utils/devFallback';
import * as mockApi from './mockApi';

// 本地开发自动使用 Mock 数据；生产环境走真实接口
export const USE_MOCK = isDevBypassEnabled();

export { mockApi };
