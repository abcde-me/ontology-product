import { generateNewNode } from '../utils';
import { NODE_WIDTH_X_OFFSET, START_INITIAL_POSITION } from '../constants';
import { useIsChatMode } from './use-workflow';
import { useNodesInitialData } from './use-nodes-data';

export const useWorkflowTemplate = () => {
  const isChatMode = useIsChatMode();
  const nodesInitialData = useNodesInitialData();

  const { newNode: startNode } = generateNewNode({
    data: nodesInitialData.start,
    position: START_INITIAL_POSITION
  });
  const { newNode: textNode } = generateNewNode({
    id: `${Number(startNode.id) + 1}`,
    data: nodesInitialData.text,
    position: {
      x: START_INITIAL_POSITION.x + 32 + 270,
      y: START_INITIAL_POSITION.y
    }
  });
  const { newNode: picNode } = generateNewNode({
    id: `${Number(startNode.id) + 2}`,
    data: nodesInitialData.pic,
    position: {
      x: START_INITIAL_POSITION.x + 32 + 270,
      y: START_INITIAL_POSITION.y + 125
    }
  });
  const { newNode: audioNode } = generateNewNode({
    id: `${Number(startNode.id) + 3}`,
    data: nodesInitialData.audio,
    position: {
      x: START_INITIAL_POSITION.x + 32 + 270,
      y: START_INITIAL_POSITION.y + 125 * 2
    }
  });
  const { newNode: videoNode } = generateNewNode({
    id: `${Number(startNode.id) + 4}`,
    data: nodesInitialData.video,
    position: {
      x: START_INITIAL_POSITION.x + 32 + 270,
      y: START_INITIAL_POSITION.y + 125 * 3
    }
  });
  const { newNode: cleaningNode } = generateNewNode({
    id: `${Number(startNode.id) + 5}`,
    data: nodesInitialData.cleaning,
    position: {
      x: START_INITIAL_POSITION.x + 32 * 2 + 270 * 2,
      y: START_INITIAL_POSITION.y
    }
  });
  const { newNode: enhancementNode } = generateNewNode({
    id: `${Number(startNode.id) + 6}`,
    data: nodesInitialData.enhancement,
    position: {
      x: START_INITIAL_POSITION.x + 32 * 2 + 270 * 3,
      y: START_INITIAL_POSITION.y
    }
  });
  const { newNode: endNode } = generateNewNode({
    id: `${Number(startNode.id) + 7}`,
    data: nodesInitialData.end,
    position: {
      x: START_INITIAL_POSITION.x + 32 * 2 + 270 * 4,
      y: START_INITIAL_POSITION.y
    }
  });

  const startToTextEdge = {
    id: `${startNode.id}-${textNode.id}`,
    source: startNode.id,
    sourceHandle: 'source',
    target: textNode.id,
    targetHandle: 'target'
  };
  const startToPicEdge = {
    id: `${startNode.id}-${picNode.id}`,
    source: startNode.id,
    sourceHandle: 'source',
    target: picNode.id,
    targetHandle: 'target'
  };
  const startToAudioEdge = {
    id: `${startNode.id}-${audioNode.id}`,
    source: startNode.id,
    sourceHandle: 'source',
    target: audioNode.id,
    targetHandle: 'target'
  };
  const startToVideoEdge = {
    id: `${startNode.id}-${videoNode.id}`,
    source: startNode.id,
    sourceHandle: 'source',
    target: videoNode.id,
    targetHandle: 'target'
  };
  const textToCleaningEdge = {
    id: `${textNode.id}-${cleaningNode.id}`,
    source: textNode.id,
    sourceHandle: 'source',
    target: cleaningNode.id,
    targetHandle: 'target'
  };
  const picToCleaningEdge = {
    id: `${picNode.id}-${cleaningNode.id}`,
    source: picNode.id,
    sourceHandle: 'source',
    target: cleaningNode.id,
    targetHandle: 'target'
  };
  const audioToCleaningEdge = {
    id: `${audioNode.id}-${cleaningNode.id}`,
    source: audioNode.id,
    sourceHandle: 'source',
    target: cleaningNode.id,
    targetHandle: 'target'
  };
  const videoToCleaningEdge = {
    id: `${videoNode.id}-${cleaningNode.id}`,
    source: videoNode.id,
    sourceHandle: 'source',
    target: cleaningNode.id,
    targetHandle: 'target'
  };
  const cleaningToEnhancementEdge = {
    id: `${cleaningNode.id}-${enhancementNode.id}`,
    source: cleaningNode.id,
    sourceHandle: 'source',
    target: enhancementNode.id,
    targetHandle: 'target'
  };
  const enhancementToEndEdge = {
    id: `${enhancementNode.id}-${endNode.id}`,
    source: enhancementNode.id,
    sourceHandle: 'source',
    target: endNode.id,
    targetHandle: 'target'
  };

  if (isChatMode) {
    // const { newNode: llmNode } = generateNewNode({
    //   id: 'llm',
    //   data: {
    //     ...nodesInitialData.llm,
    //     memory: {
    //       window: { enabled: false, size: 10 },
    //       query_prompt_template: '{{#sys.query#}}',
    //     },
    //     selected: true,
    //   },
    //   position: {
    //     x: START_INITIAL_POSITION.x + NODE_WIDTH_X_OFFSET,
    //     y: START_INITIAL_POSITION.y,
    //   },
    // } as any)
    // const { newNode: answerNode } = generateNewNode({
    //   id: 'answer',
    //   data: {
    //     ...nodesInitialData.answer,
    //     answer: `{{#${llmNode.id}.text#}}`,
    //   },
    //   position: {
    //     x: START_INITIAL_POSITION.x + NODE_WIDTH_X_OFFSET * 2,
    //     y: START_INITIAL_POSITION.y,
    //   },
    // } as any)
    // const startToLlmEdge = {
    //   id: `${startNode.id}-${llmNode.id}`,
    //   source: startNode.id,
    //   sourceHandle: 'source',
    //   target: llmNode.id,
    //   targetHandle: 'target',
    // }
    // const llmToAnswerEdge = {
    //   id: `${llmNode.id}-${answerNode.id}`,
    //   source: llmNode.id,
    //   sourceHandle: 'source',
    //   target: answerNode.id,
    //   targetHandle: 'target',
    // }
    // return {
    //   nodes: [startNode, llmNode, answerNode],
    //   edges: [startToLlmEdge, llmToAnswerEdge],
    // }
  } else {
    return {
      nodes: [
        startNode,
        textNode,
        picNode,
        audioNode,
        videoNode,
        cleaningNode,
        enhancementNode,
        endNode
      ],
      edges: [
        startToTextEdge,
        startToPicEdge,
        startToAudioEdge,
        startToVideoEdge,
        textToCleaningEdge,
        picToCleaningEdge,
        audioToCleaningEdge,
        videoToCleaningEdge,
        cleaningToEnhancementEdge,
        enhancementToEndEdge
      ]
    };
  }
};
