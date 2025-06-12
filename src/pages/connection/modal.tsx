
import { Message, Modal } from '@arco-design/web-react';
import React, { forwardRef, useImperativeHandle } from 'react';
import './index.css'
import { IconCopy } from '@arco-design/web-react/icon';


const ModalDetail = forwardRef((props, ref) => {
    // 默认弹框隐藏
    const [visible2, setVisible2] = React.useState(false);
    // 将子组件方法暴露给父组件
    useImperativeHandle(ref, () => ({
        displayDetailHan: () => {
            setVisible2(true)
        },
    }));
    // 点击复制的逻辑
    const cloneHan = () => {
        navigator.clipboard.writeText('oss-cn-hangzhou.aliyuncs.com ')
        Message.success('复制成功')
    }
    return <div>
        <Modal
            style={{ width: '700px', height: '500px' }}
            visible={visible2}
            footer={null}
            onCancel={() => {
                // 点击关闭隐藏弹框
                setVisible2(false);
            }}
        >
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h2>连接器详情</h2>
                    </div>
                    <div className="modal-content">
                        <section className="section">
                            <h3>连接器信息</h3>
                            <div className="info-item">
                                <span className="label">连接器名称:</span>
                                <span className="value">data-source-s3</span>
                            </div>
                            <div className="info-item">
                                <span className="label">状态:</span>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '5px', height: '5px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px' }}></div>
                                    <div>已连接</div>
                                </div>

                                {/* <span className="value status-disconnected">已断开</span> */}
                            </div>
                            <div className="info-item">
                                <span className="label">数据源类型:</span>
                                <span className="value">对象存储</span>
                            </div>
                            <div className="info-item">
                                <span className="label">创建人:</span>
                                <span className="value">admin</span>
                            </div>
                            <div className="info-item">
                                <span className="label">创建时间:</span>
                                <span className="value">2025-05-05 05:05:05</span>
                            </div>
                            <div className="info-item">
                                <span className="label">更新时间:</span>
                                <span className="value">2025-05-05 05:05:05</span>
                            </div>
                        </section>
                        <hr />
                        <section className="section">
                            <h3>连接信息</h3>
                            <div className="info-item">
                                <span className="label">Endpoint:</span>
                                <span className="value">oss-cn-hangzhou.aliyuncs.com <IconCopy className='set-mouse' onClick={cloneHan} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">AccessKey ID:</span>
                                <span className="value">AKIAIOSFODNN7EXAMPLE <IconCopy className='set-mouse' onClick={cloneHan} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">AccessKey Secret:</span>
                                <span className="value">wJalrX****************PLEKEY <IconCopy className='set-mouse' onClick={cloneHan} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">文件路径:</span>
                                <span className="value">/20250606/user_uploads/demo_file.txt <IconCopy className='set-mouse' onClick={cloneHan} /></span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </Modal>
    </div>;
});
export default ModalDetail