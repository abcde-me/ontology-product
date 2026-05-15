/**
 * StepIcon - 步骤类型图标组件
 * 根据不同的步骤类型显示对应的图标
 */
import React from 'react';
import type { FC } from 'react';
import ThinkingIcon from './assets/thinking.svg';
import KnowledgeIcon from './assets/knowledge.svg';
import OntologyIcon from './assets/ontology.svg';
import WorkflowIcon from './assets/workflow.svg';
import McpIcon from './assets/mcp.svg';
import HttpIcon from './assets/http.svg';

/** 步骤类型图标 */
const StepIcon: FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'thinking':
      return <ThinkingIcon />;
    case 'knowledge':
      return <KnowledgeIcon />;
    case 'ontology':
      return <OntologyIcon />;
    case 'workflow':
      return <WorkflowIcon />;
    case 'mcp':
      return <McpIcon />;
    case 'http':
      return <HttpIcon />;
    default:
      return <ThinkingIcon />;
  }
};

export default StepIcon;
