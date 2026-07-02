import React, { useEffect, useRef } from 'react';
import { PageContainer, RuleForm, RuleFormRef } from '../../components';
import styles from '../../styles/index.module.scss';
import { useHistory } from 'react-router-dom';
import { buildSaveAutoRuleData } from '@/pages/ruleManagement/utils';
import { saveAutoRule } from '@/api/businessAutomation/list';
import { Message } from '@arco-design/web-react';
import { useRuleManagementStore } from '@/pages/ruleManagement/stores';
import { ExecutionMode } from '@/pages/ruleManagement/types';
import { CycleValues } from '@/pages/ruleManagement/components/SchedulerRun/types';

const RuleCreatePage = () => {
  const ruleForm = useRef<RuleFormRef>();
  const { ruleDetail, clearData } = useRuleManagementStore((state) => {
    return {
      ruleDetail: state.ruleData,
      clearData: state.clear
    };
  });
  const history = useHistory();

  const handleSubmit = () => {
    ruleForm.current?.form
      .validate()
      .then((formData) => {
        const autoRule = buildSaveAutoRuleData(ruleDetail);
        return saveAutoRule(autoRule).then((res) => {
          if (res.message !== 'ok') {
            Message.error(res.message);
            return;
          }
          Message.success({
            content: '保存成功',
            duration: 2000,
            onClose: goBack
          });
          return Promise.resolve();
        });
      })
      .catch((e) => {
        console.error('保存失败啦', e);
      });
  };

  const goBack = () => {
    // 跳转到列表页
    history.replace('/tenant/compute/onto/businessAutomation/management/list');
  };

  useEffect(() => {
    ruleForm.current?.form.setFieldsValue({
      triggerType: 1,
      cycle: 'per_day',
      executionMode: ExecutionMode.Auto
    });
    return clearData;
  }, []);

  return (
    <PageContainer
      title={'创建规则'}
      confirmButtonProps={{ children: '确定', onClick: handleSubmit }}
      cancelButtonProps={{ children: '取消', onClick: goBack }}
      backPath={'/tenant/compute/onto/businessAutomation/management/list'}
      showBack
    >
      <div className={styles['rule-info-page-content']}>
        <div className={styles['rule-info-page-line']} />
        <div className={styles['rule-info-page-body']}>
          <RuleForm ref={ruleForm} mode={'create'} />
        </div>
      </div>
    </PageContainer>
  );
};
export default RuleCreatePage;
