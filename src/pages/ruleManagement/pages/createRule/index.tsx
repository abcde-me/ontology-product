import React, { useRef } from 'react';
import { PageContainer, RuleForm, RuleFormRef } from '../../components';
import styles from '../../styles/index.module.scss';

const RuleCreatePage = () => {
  const ruleForm = useRef<RuleFormRef>();

  return (
    <PageContainer
      confirmButtonProps={{ children: '确定' }}
      cancelButtonProps={{ children: '取消' }}
      title={'创建规则'}
      showBack
      backPath={'/tenant/compute/onto/businessAutomation/management/list'}
    >
      <div className={styles['rule-info-page-content']}>
        <div className={styles['rule-info-page-line']} />
        <div className={styles['rule-info-page-body']}>
          <RuleForm ref={ruleForm} />
        </div>
      </div>
    </PageContainer>
  );
};
export default RuleCreatePage;
