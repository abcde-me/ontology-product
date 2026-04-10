import React, { useEffect, useRef } from 'react';
import { PageContainer, RuleForm, RuleFormRef } from '../../components';
import styles from '../../styles/index.module.scss';
import { useHistory, useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getAutoRuleDetail, saveAutoRule } from '@/api/businessAutomation/list';
import { useRuleManagementStore } from '@/pages/ruleManagement/stores';
import {
  buildSaveAutoRuleData,
  buildAutoRuleForm,
  handleRuleDetailParams
} from '@/pages/ruleManagement/utils';
import { Message } from '@arco-design/web-react';
import { isNil } from 'lodash-es';

const RuleEditPage = () => {
  const ruleForm = useRef<RuleFormRef>();
  const { id } = useParams<Record<string, any>>();
  const { ruleDetail, clearData, initRule } = useRuleManagementStore(
    (state) => {
      return {
        ruleDetail: state.ruleData,
        clearData: state.clear,
        initRule: state.init
      };
    }
  );

  useEffect(() => {
    ruleForm.current?.form.setFieldsValue(ruleDetail);
    return clearData;
  }, []);

  const { loading } = useRequest(
    () => {
      return getAutoRuleDetail(id);
    },
    {
      ready: !!id,
      refreshDeps: [id],
      onSuccess(data) {
        if (isNil(data)) {
          Message.error('加载数据失败');
          return;
        }
        handleRuleDetailParams(data);
        initRule(data);
        const ruleFormData = buildAutoRuleForm(data);
        ruleForm.current?.form.setFieldsValue(ruleFormData);
      }
    }
  );

  const history = useHistory();

  const handleSubmit = () => {
    ruleForm.current?.form
      .validate()
      .then(() => {
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

  return (
    <PageContainer
      title={'编辑规则'}
      confirmButtonProps={{ children: '确定', onClick: handleSubmit }}
      cancelButtonProps={{ children: '取消', onClick: goBack }}
      backPath={'/tenant/compute/onto/businessAutomation/management/list'}
      showBack
      loading={loading}
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
export default RuleEditPage;
