import React from 'react';
import { Form, Modal } from '@arco-design/web-react';
import styles from '././index.module.scss';
import { NoDataCard, ProButton } from '@ceai-front/arco-material';
import { IconPlayArrowFill } from '@arco-design/web-react/icon';
import { OntologyActionParam } from '@/pages/ontologyScene/types/behaviorActions';
import { renderComponentByUiType } from '@/pages/ontologyScene/utils';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';

interface IProps {
  visible: boolean;
  data: OntologyActionParam[];
  onOk?: () => void;
  onClose?: () => void;
}

export const ParamsTestDialog = (props: IProps) => {
  const { data, visible, onClose, onOk } = props;
  const [form] = Form.useForm();
  return (
    <Modal
      title={'参数测试'}
      footer={null}
      visible={visible}
      style={{ width: '900px' }}
      className={styles['params-dialog']}
      onCancel={onClose}
    >
      <div className={styles['params-dialog-content']}>
        <div className={styles['left']}>
          <div className={styles['header']}>参数配置</div>
          <div className={styles['body']}>
            <Form autoComplete={'off'} layout={'vertical'}>
              {data?.map((param) => {
                const { name, code, uiType } = param;
                return (
                  <Form.Item
                    required
                    key={code}
                    label={name}
                    field={code}
                    rules={[{ required: true, message: '请输入参数值' }]}
                    triggerPropName={
                      uiType === UiType.Switch ? 'checked' : 'value'
                    }
                  >
                    {renderComponentByUiType(uiType)}
                  </Form.Item>
                );
              })}
            </Form>
          </div>
          <div className={styles['footer']}>
            <ProButton
              type={'primary'}
              icon={<IconPlayArrowFill>/</IconPlayArrowFill>}
              size={'small'}
            >
              运行
            </ProButton>
          </div>
        </div>
        <div className={styles['right']}>
          <div className={styles['header']}>运行结果</div>
          <div className={styles['body']}>
            <NoDataCard type={'block'} title={'请先在左侧配置参数'} />
          </div>
        </div>
      </div>
    </Modal>
  );
};
