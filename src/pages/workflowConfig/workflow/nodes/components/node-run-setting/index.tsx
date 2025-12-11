import React from 'react';
import {
  InputNumber,
  Radio,
  Typography,
  Form,
  Grid
} from '@arco-design/web-react';
import { PRIORITY_OPTIONS } from '@/pages/workflowList/types';

const FormItem = Form.Item;
const { Row, Col } = Grid;

export const NodeRunSetting = () => {
  return (
    <>
      <Typography.Text bold className={'mb-2'}>
        运行设置
      </Typography.Text>
      <FormItem field={'task_priority'} label={'运行优先级'}>
        <Radio.Group options={PRIORITY_OPTIONS} />
      </FormItem>
      <Row gutter={12}>
        <Col span={12}>
          <FormItem field={'fail_retry_times'} label={'失败重试次数'}>
            <InputNumber
              placeholder={'失败重试次数'}
              suffix={'次'}
              hideControl
            />
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem field={'fail_retry_interval'} label={'失败重试间隔'}>
            <InputNumber
              placeholder={'失败重试间隔'}
              suffix={'分钟'}
              hideControl
            />
          </FormItem>
        </Col>
      </Row>
    </>
  );
};
