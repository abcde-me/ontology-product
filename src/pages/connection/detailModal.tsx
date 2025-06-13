
import { Message, Modal } from '@arco-design/web-react';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './index.css'
import { IconCopy } from '@arco-design/web-react/icon';
import TimeFormatting from '../../components/conversion-time/timeFormatting'
const ModalDetail = forwardRef((props, ref) => {
    // 默认弹框隐藏
    const [visible2, setVisible2] = React.useState(false);
    // 默认显示对象为空
    const [DetailData,setDetailData]=useState({
        config:{}
    }) as any

    // 将子组件方法暴露给父组件
    useImperativeHandle(ref, () => ({
        displayDetailHan: (obj) => {
              if (!obj?.config) {
                return;
    }
            setVisible2(true)
            setDetailData(obj || { config: {} }); // 确保 obj 有 config 字段
            console.log(obj);
        }, 
    }));
    // 点击复制的逻辑
    const cloneHan = () => {
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
                                <span className="value">{DetailData.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">状态:</span>
                                <div style={{ display: 'flex', alignItems: 'center',marginLeft:'20px' }}>
                                    <div style={{ width: '5px', height: '5px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px' }}></div>
                                    <div>已连接</div>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="label">数据源类型:</span>
                                <span className="value">{DetailData.type}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">创建人:</span>
                                <span className="value">默认</span>
                            </div>
                            <div className="info-item">
                                <span className="label">创建时间:</span>
                                <span className="value">{TimeFormatting(DetailData.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">更新时间:</span>
                                <span className="value">{TimeFormatting(DetailData.updated_at)} </span>
                            </div>
                        </section>
                        <hr />
                        <section className="section">
                            <h3>连接信息</h3>
                            {DetailData.type=='s3'?
                            <div>
                                <div className="info-item">
                                <span className="label">Endpoint:</span>
                                <span className="value">{DetailData.config.endpoint} <IconCopy className='set-mouse' onClick={()=>{
                                    navigator.clipboard.writeText(DetailData.config.endpoint)
                                    cloneHan()
                                }} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">AccessKey ID:</span>
                                <span className="value">{DetailData.config.access_key} <IconCopy className='set-mouse' onClick={()=>{
                                    navigator.clipboard.writeText(DetailData.config.access_key)
                                    cloneHan()
                                }} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">AccessKey Secret:</span>
                                <span className="value">{DetailData.config.secret_key} <IconCopy className='set-mouse' onClick={()=>{
                                    navigator.clipboard.writeText(DetailData.config.secret_key)
                                    cloneHan()
                                }} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">文件路径:</span>
                                <span className="value">{DetailData.config.path}<IconCopy className='set-mouse' onClick={()=>{
                                    navigator.clipboard.writeText(DetailData.config.path)
                                    cloneHan()
                                }} /></span>
                            </div>
                            </div>
                            :
                            <div>
                                <div className="info-item">
                                <span className="label">Host:</span>
                                <span className="value">{DetailData.config.host}<IconCopy className='set-mouse' onClick={()=>{
                                     navigator.clipboard.writeText(DetailData.config.host)
                                    cloneHan()
                                }} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">port:</span>
                                <span className="value">{DetailData.config.port}<IconCopy className='set-mouse' onClick={()=>{
                                     navigator.clipboard.writeText(DetailData.config.port)
                                    cloneHan()
                                }} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">user:</span>
                                <span className="value">{DetailData.config.user} <IconCopy className='set-mouse' onClick={()=>{
                                    navigator.clipboard.writeText(DetailData.config.user)
                                    cloneHan()
                                }} /></span>
                            </div>
                            <div className="info-item">
                                <span className="label">文件路径:</span>
                                <span className="value">{DetailData.config.path} <IconCopy className='set-mouse' onClick={()=>{
                                    navigator.clipboard.writeText(DetailData.config.path)
                                    cloneHan()
                                }} /></span>
                            </div>
                            </div>
                            }
                        </section>
                    </div>
                </div>
            </div>
        </Modal>
    </div>;
});
export default ModalDetail