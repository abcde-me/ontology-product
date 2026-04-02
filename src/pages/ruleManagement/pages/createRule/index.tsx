import React, { useRef } from 'react';
import { PageContainer, RuleForm, RuleFormRef } from '../../components';
import styles from '../../styles/index.module.scss';
import { useHistory } from 'react-router-dom';
import { buildAutoRule } from '@/pages/ruleManagement/utils';
import { saveAutoRule } from '@/api/businessAutomation/list';
import { Message } from '@arco-design/web-react';
import { useRuleManagementStore } from '@/pages/ruleManagement/stores';

const RuleCreatePage = () => {
  const ruleForm = useRef<RuleFormRef>();
  const { ruleDetail } = useRuleManagementStore((state) => {
    return {
      ruleDetail: state.ruleData
    };
  });
  const history = useHistory();

  const handleSubmit = () => {
    ruleForm.current?.form
      .validate()
      .then((formData) => {
        const autoRule = buildAutoRule(formData);
        return saveAutoRule(ruleDetail).then((res) => {
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

  return (
    <PageContainer
      confirmButtonProps={{ children: '确定', onClick: handleSubmit }}
      cancelButtonProps={{ children: '取消', onClick: goBack }}
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
