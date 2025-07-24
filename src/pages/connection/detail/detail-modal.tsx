import { Message, Modal, Popover, Tooltip } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import '../index.css';
import { IconCopy, IconLoading } from '@arco-design/web-react/icon';
import TimeFormatting from '../../../utils/timeFormatting';
import { getdetailList } from '@/api/connectionApi';
import { connectorDetailType } from '../type';
import copy from 'copy-to-clipboard';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
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
      const res = await getdetailList(props.detailId);
      setDetailData(res.data);
    } catch (error) {
      console.error('获取详情页数据失败:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getdetailListHan();
  }, [props.detailId]);
  return (
    <div style={{}}>
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
        <div className="connector-detail">
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content" style={{ fontSize: '14px' }}>
                <section className="section">
                  <h3
                    style={{
                      marginBottom: '15px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    连接器信息
                  </h3>
                  <div className="info-item">
                    <span className="label">连接器名称:</span>
                    <span className="value">
                      <EllipsisPopoverCom
                        value={DetailData?.name}
                        isEdit={false}
                      />
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">状态:</span>
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
                  <div className="info-item">
                    <span className="label">数据源类型:</span>
                    <span className="value">{DetailData?.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">创建人:</span>
                    <span className="value">{DetailData?.creator}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">创建时间:</span>
                    <span className="value">{DetailData?.created_at}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">更新时间:</span>
                    <span className="value">{DetailData?.updated_at} </span>
                  </div>
                </section>
                <div
                  style={{
                    margin: '24px 0px',
                    width: '100%',
                    height: '1px',
                    background: '#CBD5E1'
                  }}
                ></div>
                <section className="section">
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
                    <div>
                      <div className="info-item">
                        <span className="label">Endpoint:</span>
                        <span className="value">
                          {DetailData?.config.endpoint}{' '}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.endpoint || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">AccessKey ID:</span>
                        <span className="value">
                          {DetailData?.config.access_key}{' '}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.access_key || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">AccessKey Secret:</span>
                        <span className="value">
                          {DetailData?.config.secret_key}{' '}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.secret_key || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">文件路径:</span>
                        <span className="value">
                          {DetailData.config.path}
                          <IconCopy
                            style={{ marginLeft: '10px' }}
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData.config.path || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="info-item">
                        <span className="label">Host:</span>
                        <span className="value">
                          {DetailData?.config.host}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.host || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">port:</span>
                        <span className="value">
                          {DetailData?.config.port}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.port || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">user:</span>
                        <span className="value">
                          {DetailData?.config.user}{' '}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.user || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">文件路径:</span>
                        <span className="value">
                          {DetailData?.config.path}{' '}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              copy(DetailData?.config.path || '');
                              Message.success('复制成功');
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ModalDetail;
