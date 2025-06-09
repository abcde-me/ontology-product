import UAPI from '@/api';

export function imageGenerate(params: { title: string; describe: string }) {
  return UAPI.RES.imageGenerate({}).post(params).inRegion().do();
}
