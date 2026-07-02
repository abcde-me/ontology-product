import { ONTO_DEFAULT_HOME_PATH } from '@/common/constants';

const baseName = 'noto';

export function getLoginRedirectPath(search: string) {
  const params = new URLSearchParams(search);
  const redirectUri = params.get('redirect_uri');
  if (redirectUri) {
    try {
      const url = new URL(redirectUri);
      let path = url.pathname + url.search + url.hash;
      const prefix = `/${baseName}`;
      if (path === prefix) {
        path = '/';
      } else if (path.startsWith(`${prefix}/`)) {
        path = path.slice(prefix.length);
      }
      return path;
    } catch (error) {
      console.error('Invalid redirect URL:', error);
    }
  }
  return ONTO_DEFAULT_HOME_PATH;
}
