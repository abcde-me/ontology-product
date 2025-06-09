import { Collapse, Form, Space, Tooltip } from '@arco-design/web-react';
import * as React from 'react';
import {
  CapabilityField,
  DescriptionField,
  InstructionField,
  StarterField,
  SuggestedQuestionsField
} from './fields';
import { observer } from 'mobx-react-lite';
import { appConfigStore } from '../model';
import { NameField } from './nameField';
import {
  IconPlusCircle,
  IconQuestionCircle,
  IconRight
} from '@arco-design/web-react/icon';
import './index.less';
import ToolsField from './toolField';
import AvatarField from './avatar';
import KnowledgeField from './knowledgeField';

const CollapseItem = Collapse.Item;

function Config() {
  const formData = appConfigStore.formData;
  const [form] = Form.useForm();
  React.useEffect(() => {
    form.setFieldsValue(formData);
  }, [formData, form]);

  const renderCollapseItem = (params: {
    header: string;
    key: string;
    children;
    addText?: string;
    onAddClick?: () => void;
    tooltip?: string;
  }) => {
    const {
      header,
      key,
      children,
      addText,
      onAddClick = () => {},
      tooltip
    } = params;
    return (
      <CollapseItem
        className="appcreate-collapseitem"
        header={
          <div className="flex items-center">
            <span className="mr-[8px] text-[14px] font-[600] leading-[22px] text-[color:var(--color-text-1)]">
              {header}
            </span>
            {tooltip ? (
              <Tooltip content={tooltip} position="left">
                <IconQuestionCircle className="mr-[8px] block text-[16px]" />
              </Tooltip>
            ) : null}
          </div>
        }
        name={key}
        extra={
          addText ? (
            <div onClick={onAddClick}>
              <Space className="text-[color:rgb(var(--primary-6))]">
                <IconPlusCircle className="block text-[16px]" />
                {addText}
              </Space>{' '}
            </div>
          ) : null
        }
      >
        {children}
      </CollapseItem>
    );
  };

  return (
    <Form
      form={form}
      onChange={(val, values) => {
        appConfigStore.updateFormData(values);
      }}
      layout="vertical"
    >
      <Collapse
        className="appconfig-collapse"
        bordered={false}
        expandIcon={<IconRight />}
        defaultActiveKey={[
          'myapp',
          'prompt',
          'starter',
          'dataset',
          'inner-tools',
          'mytools'
        ]}
        style={{ maxWidth: 1180 }}
      >
        {renderCollapseItem({
          header: '我的应用',
          key: 'myapp',
          children: (
            <>
              <AvatarField />
              <NameField />
              <DescriptionField />
            </>
          ),
          onAddClick: () => {}
        })}
        {renderCollapseItem({
          header: '指令',
          key: 'prompt',
          tooltip:
            '提示词用于对 AI 的回复做出一系列指令和约束。这段提示词不会被最终用户所看到',
          children: (
            <>
              <InstructionField />
            </>
          ),
          onAddClick: () => {}
        })}
        {renderCollapseItem({
          header: '开场白与预设问题',
          key: 'starter',
          children: (
            <>
              <StarterField />
              <SuggestedQuestionsField />
            </>
          )
        })}
        {renderCollapseItem({
          header: '知识',
          key: 'dataset',
          children: <KnowledgeField />,
          addText: '添加知识库',
          onAddClick: () => {
            appConfigStore.toggleKnowledgeDrawer();
          }
        })}
        {renderCollapseItem({
          header: '官方工具',
          key: 'inner-tools',
          children: <CapabilityField />
        })}
        {renderCollapseItem({
          header: '我的工具',
          key: 'mytools',
          children: <ToolsField />,
          addText: '添加工具',
          onAddClick: () => {
            appConfigStore.toggleToolsDrawer();
          }
        })}
      </Collapse>
    </Form>
  );
}
export default observer(Config);
