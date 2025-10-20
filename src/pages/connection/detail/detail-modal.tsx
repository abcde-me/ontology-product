import { Message, Modal, Popover, Tooltip } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { IconCopy, IconLoading } from '@arco-design/web-react/icon';
import TimeFormatting from '../../../utils/timeFormatting';
import { getdetailList } from '@/api/connectionApi';
import { connectorDetailType } from '../type';
import copy from 'copy-to-clipboard';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import { DATABASE_TYPE_ENUM, ConnectorType, TYPE_CONFIG } from '../config';
import getLabelByValue from '@/utils/getLabelByValue';
import styles from '../styles/detail.module.scss';

const ModalDetail = (props) => {
  // 默认显示对象为空
  const [DetailData, setDetailData] = useState<connectorDetailType | null>(
    null
  );
  // 默认弹框的状态
  const [loading, setLoading] = useState(false);
  // 获取详情页的数据
  const getdetailListHan = async () => {
    try {
      setLoading(true);
      const res = await getdetailList({
        id: props.detailId
      });
      setDetailData(res.data);
    } catch (error) {
      console.error('获取详情页数据失败:', error);
    } finally {
      setLoading(false);
    }
  };
  function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  useEffect(() => {
    getdetailListHan();
  }, [props.detailId]);
  return (
    <>
      {loading ? (
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '32px'
          }}
        >
          <IconLoading style={{ color: '#165dff', fontSize: '30px' }} />
        </div>
      ) : (
        <div className={styles['connector-detail']}>
          <>
            <h3
              style={{
                marginBottom: '15px',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              连接器信息
            </h3>
            <div className={styles['info-item']}>
              <span className={styles['item-label']}>连接器名称:</span>
              <span className={styles['item-value']}>
                <EllipsisPopoverCom value={DetailData?.name} isEdit={false} />
              </span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['item-label']}>状态:</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '30px'
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor:
                      DetailData?.status == 'connected'
                        ? '#059669'
                        : DetailData?.status == 'disconnected'
                          ? '#DC2626'
                          : '',
                    borderRadius: '50%',
                    marginRight: '5px'
                  }}
                ></div>
                <div>
                  {DetailData?.status == 'connected' && '已连接'}
                  {DetailData?.status == 'disconnected' && '已断开'}
                </div>
              </div>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['item-label']}>数据源类型:</span>
              <span className={styles['item-value']}>
                {DetailData?.type !== 'db'
                  ? (DetailData?.type && TYPE_CONFIG[DetailData.type]) ||
                    '未知类型'
                  : TYPE_CONFIG[DetailData?.sub_type]}
              </span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['item-label']}>创建人:</span>
              <span className={styles['item-value']}>
                {DetailData?.creator}
              </span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['item-label']}>创建时间:</span>
              <span className={styles['item-value']}>
                {DetailData?.created_at}
              </span>
            </div>
            <div className={styles['info-item']}>
              <span className={styles['item-label']}>更新时间:</span>
              <span className={styles['item-value']}>
                {DetailData?.updated_at}{' '}
              </span>
            </div>
          </>
          <div
            style={{
              margin: '24px 0px',
              width: '100%',
              height: '1px',
              background: '#CBD5E1'
            }}
          ></div>
          <>
            <h3
              style={{
                marginBottom: '15px',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              连接信息
            </h3>
            {DetailData?.type == 's3' ? (
              <>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>Endpoint:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.endpoint}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.endpoint}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.endpoint || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>AccessKey ID:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.access_key}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.access_key}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.access_key || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>
                    AccessKey Secret:
                  </span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.secret_key}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.secret_key}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.secret_key || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>文件路径:</span>
                  <span className={styles['item-value']}>
                    {DetailData.config.path}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.path}
                    >
                      <IconCopy
                        style={{ marginLeft: '10px' }}
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData.config.path || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
              </>
            ) : DetailData?.type == 'hdfs' ? (
              <>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>Host:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.host}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.host}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.host || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>port:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.port}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.port}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.port || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>user:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.user}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.user}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.user || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>文件路径:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.path}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.path}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.path || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>所属系统:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config?.system || '-'}
                    {DetailData?.config?.system && (
                      <Tooltip
                        position="tl"
                        trigger="hover"
                        content={DetailData?.config?.system}
                      >
                        <IconCopy
                          className="ml-1 cursor-pointer"
                          onClick={() => {
                            copy(DetailData?.config?.system || '');
                            Message.success('复制成功');
                          }}
                        />
                      </Tooltip>
                    )}
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>数据库类型:</span>
                  <span className={styles['item-value']}>
                    {getLabelByValue(
                      DATABASE_TYPE_ENUM,
                      DetailData?.sub_type || ''
                    )}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={getLabelByValue(
                        DATABASE_TYPE_ENUM,
                        DetailData?.sub_type || ''
                      )}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.sub_type || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>主机名:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.host}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.host}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.host || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>端口:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.port}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.port}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.port || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>数据库名:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.database}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.database}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.database || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['item-label']}>用户名:</span>
                  <span className={styles['item-value']}>
                    {DetailData?.config.user}{' '}
                    <Tooltip
                      position="tl"
                      trigger="hover"
                      content={DetailData?.config.user}
                    >
                      <IconCopy
                        className="ml-1 cursor-pointer"
                        onClick={() => {
                          copy(DetailData?.config.user || '');
                          Message.success('复制成功');
                        }}
                      />
                    </Tooltip>
                  </span>
                </div>
              </>
            )}
          </>
        </div>
      )}
    </>
  );
};
export default ModalDetail;
