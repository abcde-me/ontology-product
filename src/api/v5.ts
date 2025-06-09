import UAPI from '@/api';

export function getLogoInfo() {
  return UAPI.RES.logoInfo({})
    .post()
    .inRegion()
    .do({ headers: { 'x-auth-validate': 'false' } });
}
