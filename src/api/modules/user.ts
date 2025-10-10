import UAPI from '@/api';
// 登录
export function Login(params) {
  return UAPI.RES.Login({}).post(params).inRegion().do();
}
// 退出登录
export function Logout() {
  return UAPI.RES.Logout({}).post().inRegion().do();
}
// 获取用户信息
export function GetUser(params) {
  return UAPI.RES.GetUser({}).post(params).inRegion().do();
}
