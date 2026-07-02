import UAPI from '@/api';
import type { ScanLoginProvider } from '@/api/types/auth';

// 登录
export function Login(params: {
  account: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}) {
  return UAPI.RES.Login({}).post(params).inRegion().do();
}

export function GetLoginCaptcha() {
  return UAPI.RES.GetLoginCaptcha({}).get().inRegion().do({ preCheck: false });
}

export function GetScanLoginQrCode(params: { provider: ScanLoginProvider }) {
  return UAPI.RES.GetScanLoginQrCode({})
    .post(params)
    .inRegion()
    .do({ preCheck: false });
}

export function CheckScanLoginStatus(params: { sessionId: string }) {
  return UAPI.RES.CheckScanLoginStatus({})
    .get(params)
    .inRegion()
    .do({ preCheck: false });
}
// 退出登录
export function Logout() {
  return UAPI.RES.Logout({}).post().inRegion().do();
}
// 获取用户信息
export function GetUser() {
  return UAPI.RES.GetUser({}).post().inRegion().do();
}

// 编辑个人信息
export function UpdateMyselfInformation(params) {
  return UAPI.RES.UpdateMyselfInformation({}).post(params).inRegion().do();
}
