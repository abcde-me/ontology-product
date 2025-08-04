import type { Block } from '../types';
import { BlockEnum } from '../types';
import { BlockClassificationEnum } from './types';

export const BLOCKS: Block[] = [
  // {
  //   classification: BlockClassificationEnum.Default,
  //   type: BlockEnum.LLM,
  //   title: 'LLM',
  // },
  // {
  //   classification: BlockClassificationEnum.Default,
  //   type: BlockEnum.KnowledgeRetrieval,
  //   title: 'Knowledge Retrieval'
  // },
  // {
  //   classification: BlockClassificationEnum.Default,
  //   type: BlockEnum.Answer,
  //   title: 'Direct Answer'
  // },
  {
    classification: BlockClassificationEnum.QuestionUnderstand,
    type: BlockEnum.QuestionClassifier,
    title: 'Question Classifier'
  },
  {
    classification: BlockClassificationEnum.Logic,
    type: BlockEnum.IfElse,
    title: 'IF/ELSE'
  },
  {
    classification: BlockClassificationEnum.Logic,
    type: BlockEnum.Iteration,
    title: 'Iteration'
  },
  {
    classification: BlockClassificationEnum.Logic,
    type: BlockEnum.Loop,
    title: 'Loop'
  },
  {
    classification: BlockClassificationEnum.Transform,
    type: BlockEnum.TemplateTransform,
    title: 'Templating Transform'
  },
  {
    classification: BlockClassificationEnum.Transform,
    type: BlockEnum.VariableAggregator,
    title: 'Variable Aggregator'
  },
  {
    classification: BlockClassificationEnum.Transform,
    type: BlockEnum.DocExtractor,
    title: 'Doc Extractor'
  },
  {
    classification: BlockClassificationEnum.Transform,
    type: BlockEnum.Assigner,
    title: 'Variable Assigner'
  },
  {
    classification: BlockClassificationEnum.Transform,
    type: BlockEnum.ParameterExtractor,
    title: 'Parameter Extractor'
  },
  {
    classification: BlockClassificationEnum.Utilities,
    type: BlockEnum.Code,
    title: 'Code'
  },
  {
    classification: BlockClassificationEnum.Utilities,
    type: BlockEnum.HttpRequest,
    title: 'HTTP Request'
  },
  {
    classification: BlockClassificationEnum.Utilities,
    type: BlockEnum.ListFilter,
    title: 'List Filter'
  },
  // {
  //   classification: BlockClassificationEnum.Default,
  //   type: BlockEnum.Agent,
  //   title: 'Agent'
  // },
  // TODO：上面无用代码删除

  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Start,
    title: 'Start',
    description: ''
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Text,
    title: '文本解析节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Pic,
    title: '图片解析节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Audio,
    title: '音频解析节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Video,
    title: '视频解析节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Cleaning,
    title: '数据清洗节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Enhancement,
    title: '数据增强节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Customize,
    title: '自定义节点'
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.End,
    title: '结束节点'
  }
];

export const BLOCK_CLASSIFICATIONS: string[] = [
  BlockClassificationEnum.Default
  // BlockClassificationEnum.Logic,
  // // BlockClassificationEnum.Transform,
  // BlockClassificationEnum.QuestionUnderstand,
  // BlockClassificationEnum.Utilities,
];
