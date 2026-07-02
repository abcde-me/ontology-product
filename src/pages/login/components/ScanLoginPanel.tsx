import { Button, Spin } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { SCAN_LOGIN_PROVIDERS } from '../constants';
import { useScanLogin } from '../hooks/useScanLogin';
import type { ScanLoginProvider, ScanLoginStatus } from '../types';
import styles from '../index.module.scss';
import { PlatformSelector } from './PlatformSelector';

interface ScanLoginPanelProps {
  provider: ScanLoginProvider;
  onProviderChange: (provider: ScanLoginProvider) => void;
  enabled: boolean;
}

function getStatusHint(status: ScanLoginStatus, providerLabel: string) {
  switch (status) {
    case 'scanned':
      return '已扫码，请在手机上确认登录';
    case 'expired':
      return '二维码已过期，请点击刷新';
    case 'cancelled':
      return '扫码已取消，请重新扫码';
    default:
      return `请使用${providerLabel}扫码登录`;
  }
}

export function ScanLoginPanel({
  provider,
  onProviderChange,
  enabled
}: ScanLoginPanelProps) {
  const { qrCodeUrl, loading, status, refresh } = useScanLogin(
    provider,
    enabled
  );
  const providerLabel =
    SCAN_LOGIN_PROVIDERS.find((item) => item.key === provider)?.label || 'App';
  const showExpiredMask = status === 'expired' || status === 'cancelled';

  return (
    <div className={styles.scanLogin}>
      <div className={styles.qrWrapper}>
        {loading ? (
          <div className={styles.qrPlaceholder}>
            <Spin />
          </div>
        ) : qrCodeUrl ? (
          <QRCodeSVG value={qrCodeUrl} size={188} level="M" />
        ) : (
          <div className={styles.qrPlaceholder}>
            <Button
              type="text"
              icon={<IconRefresh />}
              onClick={() => refresh()}
            >
              重新获取
            </Button>
          </div>
        )}

        {showExpiredMask && qrCodeUrl ? (
          <div className={styles.qrExpiredMask}>
            <span>{status === 'expired' ? '二维码已过期' : '扫码已取消'}</span>
            <Button type="primary" size="small" onClick={() => refresh()}>
              刷新二维码
            </Button>
          </div>
        ) : null}
      </div>

      <p className={styles.hint}>请使用以下 App 扫码登录</p>
      <PlatformSelector value={provider} onChange={onProviderChange} />
      <p className={styles.statusHint}>
        {getStatusHint(status, providerLabel)}
      </p>
    </div>
  );
}
