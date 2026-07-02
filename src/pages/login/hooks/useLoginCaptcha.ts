import { GetLoginCaptcha } from '@/api/modules/user';
import { isRequestSuccess } from '@/api/utils';
import { isDevBypassEnabled } from '@/utils/devFallback';
import { useCallback, useEffect, useState } from 'react';
import { DEV_LOGIN_CAPTCHA_ID } from '../constants';

function normalizeCaptchaImage(image: string) {
  if (!image) {
    return '';
  }
  if (image.startsWith('data:image')) {
    return image;
  }
  return `data:image/png;base64,${image}`;
}

function applyDevCaptchaFallback(
  setCaptchaId: (id: string) => void,
  setCaptchaImage: (image: string) => void
) {
  if (!isDevBypassEnabled()) {
    setCaptchaId('');
    setCaptchaImage('');
    return;
  }

  setCaptchaId(DEV_LOGIN_CAPTCHA_ID);
  setCaptchaImage('');
}

export function useLoginCaptcha(enabled = true) {
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    try {
      const res = await GetLoginCaptcha();
      if (!isRequestSuccess(res)) {
        applyDevCaptchaFallback(setCaptchaId, setCaptchaImage);
        return;
      }

      const nextCaptchaId = res.data?.captchaId;
      const nextCaptchaImage = normalizeCaptchaImage(res.data?.captchaImage);
      if (!nextCaptchaId || !nextCaptchaImage) {
        applyDevCaptchaFallback(setCaptchaId, setCaptchaImage);
        return;
      }

      setCaptchaId(nextCaptchaId);
      setCaptchaImage(nextCaptchaImage);
    } catch (error) {
      console.error('获取验证码失败:', error);
      applyDevCaptchaFallback(setCaptchaId, setCaptchaImage);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    captchaId,
    captchaImage,
    loading,
    refresh
  };
}
