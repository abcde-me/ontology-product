import FileIcon from '@/components/file-icon';
import { Button, Checkbox, Form, Input, Popover, Radio, Select, Space, Switch, Tree } from '@arco-design/web-react';
import { IconCheckCircle, IconClockCircle, IconInfoCircle, IconLoading } from '@arco-design/web-react/icon';
import React, { useEffect, useMemo, useState } from 'react'
import { Table, useTable } from '@ccf2e/arco-material';

function Step4(props) {
  const { setStepData } = props
  const dataOptions = [
    { key: 'advice', title: '推荐配置', desc: '推荐配置，在效果、推理成本、检索时延等方面的最佳实践' },
    { key: 'custom', title: '自定义', desc: '完全开放的离线知识库配置，按照检索需求自由配置，时延...' }
  ]

  const [form] = Form.useForm();

  return (
    <div className='step4'>
      <div className='sub-title mb-[4px]'>选择数据类型</div>
      <Radio.Group name='card-radio-group' defaultValue="advice" className="data-options">
        {dataOptions.map((item) => {
          return (
            <Radio key={item.key} value={item.key}>
              {({ checked }) => {
                return (
                  <div className={`custom-radio-card ${checked ? 'custom-radio-card-checked' : ''}`}>
                    <div className='brief-section'>
                      <div className='custom-radio-card-mask'>
                        <div className='custom-radio-card-mask-dot'></div>
                      </div>
                      <div className='txt-part'>
                        <div className='custom-radio-card-title'>{item.title}</div>
                        <div className='title-desc *:custom-radio-card-desc'>{item.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              }}
          </Radio>
        );
      })}
      </Radio.Group>
      <div className='detail-options'>
        <Form
          className="detail-options-form"
          form={form}
          autoComplete="off"
          colon="："
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
        >
          <Form.Item
            field="dialogs"
            label="多轮对话改写"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            field="embedding"
            label="Embedding模型"
          >
            <Select placeholder='请选择' style={{width: 400}}>
              <Select.Option value={1}>官方向量</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            field="ranking"
            label="Rank模型"
          >
            <Select placeholder='请选择' style={{width: 400}}>
              <Select.Option value={1}>官方排序</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
  </div>
)
}

export default Step4;