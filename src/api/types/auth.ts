export type ScanLoginProvider = 'lanxin' | 'wecom' | 'dingtalk' | 'feishu';

export type ScanLoginStatus =
  | 'pending'
  | 'scanned'
  | 'confirmed'
  | 'expired'
  | 'cancelled';

export interface ScanLoginQrCodeData {
  sessionId: string;
  qrCodeUrl: string;
  expireAt?: number;
}

export interface ScanLoginStatusData {
  status: ScanLoginStatus;
}

export interface LoginCaptchaData {
  captchaId: string;
  captchaImage: string;
}
