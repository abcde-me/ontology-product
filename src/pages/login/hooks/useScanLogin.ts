import { CheckScanLoginStatus, GetScanLoginQrCode } from '@/api/modules/user';
import type { ScanLoginProvider, ScanLoginStatus } from '@/api/types/auth';
import { isRequestSuccess } from '@/api/utils';
import { Message } from '@arco-design/web-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { SCAN_LOGIN_POLL_INTERVAL } from '../constants';
import { getLoginRedirectPath } from '../utils';

function isSessionInvalidMessage(message?: string) {
  if (!message) {
    return false;
  }
  return (
    message.includes('会话') ||
    message.includes('过期') ||
    message.includes('无效')
  );
}

export function useScanLogin(provider: ScanLoginProvider, enabled: boolean) {
  const history = useHistory();
  const location = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ScanLoginStatus>('pending');
  const pollTimerRef = useRef<number>();
  const sessionIdRef = useRef('');

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    clearPollTimer();
    const redirectPath = getLoginRedirectPath(location.search);
    history.push(redirectPath);
  }, [clearPollTimer, history, location.search]);

  const pollStatus = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      return;
    }

    try {
      const res = await CheckScanLoginStatus({ sessionId: currentSessionId });
      if (sessionIdRef.current !== currentSessionId) {
        return;
      }

      if (!isRequestSuccess(res)) {
        if (isSessionInvalidMessage(res?.message)) {
          setStatus('expired');
          clearPollTimer();
        }
        return;
      }

      const nextStatus = res.data?.status as ScanLoginStatus | undefined;
      if (!nextStatus) {
        return;
      }

      setStatus(nextStatus);

      if (nextStatus === 'confirmed') {
        handleLoginSuccess();
        return;
      }

      if (nextStatus === 'expired' || nextStatus === 'cancelled') {
        clearPollTimer();
      }
    } catch (error) {
      console.error('扫码登录状态查询失败:', error);
    }
  }, [clearPollTimer, handleLoginSuccess]);

  const startPolling = useCallback(() => {
    clearPollTimer();
    void pollStatus();
    pollTimerRef.current = window.setInterval(() => {
      void pollStatus();
    }, SCAN_LOGIN_POLL_INTERVAL);
  }, [clearPollTimer, pollStatus]);

  const fetchQrCode = useCallback(async () => {
    clearPollTimer();
    setLoading(true);
    setStatus('pending');
    setQrCodeUrl('');
    setSessionId('');
    sessionIdRef.current = '';

    try {
      const res = await GetScanLoginQrCode({ provider });
      if (!isRequestSuccess(res)) {
        Message.error(res?.message || '获取扫码登录二维码失败');
        return;
      }

      const nextSessionId = res.data?.sessionId;
      const nextQrCodeUrl = res.data?.qrCodeUrl;
      if (!nextSessionId || !nextQrCodeUrl) {
        Message.error('扫码登录二维码数据不完整');
        return;
      }

      setSessionId(nextSessionId);
      setQrCodeUrl(nextQrCodeUrl);
      sessionIdRef.current = nextSessionId;
      startPolling();
    } catch (error) {
      console.error('获取扫码登录二维码失败:', error);
      Message.error('获取扫码登录二维码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [clearPollTimer, provider, startPolling]);

  useEffect(() => {
    if (!enabled) {
      clearPollTimer();
      return;
    }

    void fetchQrCode();

    return () => {
      clearPollTimer();
    };
  }, [clearPollTimer, enabled, fetchQrCode]);

  return {
    qrCodeUrl,
    sessionId,
    loading,
    status,
    refresh: fetchQrCode
  };
}
