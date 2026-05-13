/**
 * renderStepContent - 根据步骤类型渲染内容
 */
import React from 'react';
import { ThinkingStep } from '@/hooks/chat/types';
import { STEP_TYPES } from './types.d';
import ThinkModel from './ThinkModel';
import ThinkOntology from './ThinkOntology';
import ThinkTool from './ThinkTool';

/** 根据步骤类型分发渲染内容 */
export default function renderStepContent(step: ThinkingStep): React.ReactNode {
  const { type } = step;

  console.log('[renderStepContent] step type:', type, 'step:', step);

  switch (type) {
    case STEP_TYPES.ONTOLOGY:
    case 'ontology':
      console.log('[renderStepContent] rendering ThinkOntology');
      return <ThinkOntology step={step} />;

    case STEP_TYPES.HTTP:
    case 'http':
    case STEP_TYPES.WORKFLOW:
    case 'workflow':
    case STEP_TYPES.MCP:
    case 'mcp':
    case STEP_TYPES.KNOWLEDGE:
    case 'knowledge':
      console.log('[renderStepContent] rendering ThinkTool for type:', type);
      return <ThinkTool step={step} />;

    case STEP_TYPES.THINKING:
    case 'thinking':
      console.log('[renderStepContent] rendering ThinkModel');
      return <ThinkModel step={step} />;

    default:
      // 其他类型暂时使用 ThinkModel 显示
      console.log('[renderStepContent] unknown type, using ThinkModel');
      return <ThinkModel step={step} />;
  }
}
