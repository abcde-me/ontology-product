import type { ScanLoginProvider } from './types';

export interface ScanLoginProviderOption {
  key: ScanLoginProvider;
  label: string;
  color: string;
  abbr: string;
}

export const SCAN_LOGIN_PROVIDERS: ScanLoginProviderOption[] = [
  { key: 'lanxin', label: '蓝信', color: '#0066CC', abbr: '蓝' },
  { key: 'wecom', label: '企业微信', color: '#267EF0', abbr: '企' },
  { key: 'dingtalk', label: '钉钉', color: '#0089FF', abbr: '钉' },
  { key: 'feishu', label: '飞书', color: '#3370FF', abbr: '飞' }
];

export const SCAN_LOGIN_POLL_INTERVAL = 2000;

export const DEFAULT_LOGIN_CAPTCHA_CODE = '1111';

export const DEV_LOGIN_CAPTCHA_ID = 'dev-local-captcha';

/** 后端登录不可用时写入的本地开发 token */
export const DEV_LOGIN_TOKEN = 'dev-local-token';
