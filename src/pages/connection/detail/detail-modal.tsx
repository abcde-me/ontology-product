import { Message, Modal } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import '../index.css';
import { IconCopy } from '@arco-design/web-react/icon';
import TimeFormatting from '../../../utils/timeFormatting';
import { getdetailList } from '@/api/connectionApi';
import { connectorDetailType } from '../type';
const ModalDetail = (props) => {
  // 默认显示对象为空
  const [DetailData, setDetailData] = useState<connectorDetailType | null>(
    null
  );
  // 默认弹框的状态
  const [loading, setLoading] = useState(false);
  // 点击复制的逻辑
  const handleCopy = (text?: string) => {
    if (!text) {
      console.warn('没有可复制的内容');
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // 复制成功回调
        Message.success('复制成功');
      })
      .catch((err) => {
        console.error('复制失败:', err);
        Message.error('复制失败');
      });
  };
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
    <div>
      <div className="modal-overlay">
        <div className="modal">
          {loading == true ? (
            <div>正在加载中...</div>
          ) : (
            <div className="modal">
              <div className="modal-header">
                <h2>连接器详情</h2>
              </div>
              <div className="modal-content" style={{ fontSize: '14px' }}>
                <section className="section">
                  <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                    连接器信息
                  </h3>
                  <div className="info-item">
                    <span className="label">连接器名称:</span>
                    <span className="value">{DetailData?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">状态:</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '20px'
                      }}
                    >
                      <div
                        style={{
                          width: '5px',
                          height: '5px',
                          backgroundColor:
                            DetailData?.status == 'connected' ? 'green' : 'red',
                          borderRadius: '50%',
                          marginRight: '5px'
                        }}
                      ></div>
                      <div>
                        {DetailData?.status == 'connected'
                          ? '已连接'
                          : '已断开'}
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="label">数据源类型:</span>
                    <span className="value">{DetailData?.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">创建人:</span>
                    <span className="value">默认</span>
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
                <hr />
                <section className="section">
                  <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>
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
                              handleCopy(DetailData?.config.endpoint);
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
                              handleCopy(DetailData?.config.access_key);
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
                              handleCopy(DetailData?.config.secret_key);
                            }}
                          />
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">文件路径:</span>
                        <span className="value">
                          {DetailData.config.path}
                          <IconCopy
                            className="set-mouse"
                            onClick={() => {
                              handleCopy(DetailData.config.path);
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
                              handleCopy(DetailData?.config.host);
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
                              handleCopy(DetailData?.config.port);
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
                              handleCopy(DetailData?.config.user);
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
                              handleCopy(DetailData?.config.path);
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ModalDetail;
