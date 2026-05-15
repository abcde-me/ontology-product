/**
 * SSE 事件处理器
 */
import { Updater } from 'use-immer';
import { ChatMessage, SSEEvent, ThinkingStep } from '../types';
import { generateId } from '../utils';
import { EVENT_TYPES } from './constants';

export interface EventHandlerContext {
  setMessages: Updater<ChatMessage[]>;
  prevEventTypeRef: React.MutableRefObject<string | null>;
  conversationIdRef: React.MutableRefObject<string>;
  currentMessageIdRef: React.MutableRefObject<string>;
  onConversationCreated?: (conversationId: string) => void;
  onError?: (error: Error) => void;
  lastChatDone: () => void;
}

/**
 * 处理 thinking 事件
 */
export const handleThinkingEvent = (
  event: SSEEvent,
  context: EventHandlerContext
) => {
  const { setMessages, prevEventTypeRef } = context;

  setMessages((draft) => {
    const lastIndex = draft.length - 1;
    if (lastIndex < 0) return;

    const lastMsg = draft[lastIndex];
    if (!lastMsg.thinkingSteps) {
      lastMsg.thinkingSteps = [];
    }
    const steps = lastMsg.thinkingSteps;

    // 如果上一次也是 thinking，累积内容
    if (prevEventTypeRef.current === EVENT_TYPES.THINKING && steps.length > 0) {
      const lastStepIndex = steps.length - 1;
      steps[lastStepIndex].content += event.content || '';
      steps[lastStepIndex].running_time =
        typeof event.running_time === 'string'
          ? parseFloat(event.running_time)
          : event.running_time;
      steps[lastStepIndex].done = event.done || false;
      if (event.done) {
        steps[lastStepIndex].status = 'success';
      }
    } else {
      // 第一次 thinking，创建新步骤
      steps.push({
        chunk_id: event.chunk_id || generateId(),
        type: EVENT_TYPES.THINKING,
        content: event.content || '',
        status: event.done ? 'success' : 'running',
        running_time:
          typeof event.running_time === 'string'
            ? parseFloat(event.running_time)
            : event.running_time,
        done: event.done || false
      });
    }

    lastMsg.status = 'streaming';
  });
};

/**
 * 处理 ontology 事件
 */
export const handleOntologyEvent = (
  event: SSEEvent,
  context: EventHandlerContext
) => {
  const { setMessages } = context;

  console.log('[useXChat] ontology event:', event);

  setMessages((draft) => {
    const lastIndex = draft.length - 1;
    if (lastIndex < 0) return;

    const lastMsg = draft[lastIndex];
    if (!lastMsg.thinkingSteps) {
      lastMsg.thinkingSteps = [];
    }
    const steps = lastMsg.thinkingSteps;

    // 查找是否已存在相同 chunk_id 的步骤
    const stepIndex = steps.findIndex((s) => s.chunk_id === event.chunk_id);

    let contentData = event.content;
    if (typeof contentData === 'string') {
      try {
        contentData = JSON.parse(contentData);
        console.log('[useXChat] parsed ontology content:', contentData);
      } catch (e) {
        console.log('[useXChat] failed to parse ontology content:', e);
      }
    }

    const ontologyStep: ThinkingStep = {
      chunk_id: event.chunk_id || generateId(),
      type: EVENT_TYPES.ONTOLOGY,
      content: contentData,
      status: event.done ? 'success' : 'running',
      running_time:
        typeof event.running_time === 'string'
          ? parseFloat(event.running_time)
          : event.running_time,
      done: event.done || false
    };

    console.log('[useXChat] ontologyStep:', ontologyStep);

    if (stepIndex >= 0) {
      steps[stepIndex] = ontologyStep;
    } else {
      steps.push(ontologyStep);
    }

    lastMsg.status = 'streaming';
  });
};

/**
 * 处理 answer 事件
 */
export const handleAnswerEvent = (
  event: SSEEvent,
  context: EventHandlerContext
) => {
  const { setMessages } = context;

  setMessages((draft) => {
    const lastIndex = draft.length - 1;
    if (lastIndex < 0) return;

    const lastMsg = draft[lastIndex];
    lastMsg.content += event.content || '';
    lastMsg.status = 'streaming';
  });
};

/**
 * 从工具调用响应中提取本体操作信息
 */
const extractOntologyAction = (response: any): any | null => {
  try {
    let responseData = response;

    console.log('[extractOntologyAction] 原始 response:', response);
    console.log('[extractOntologyAction] response 类型:', typeof response);

    // 如果 response 是字符串，尝试解析
    if (typeof responseData === 'string') {
      responseData = JSON.parse(responseData);
      console.log(
        '[extractOntologyAction] 解析后的 responseData:',
        responseData
      );
    }

    // 检查是否包含本体操作数据
    if (
      responseData?.data?.action_type &&
      responseData?.data?.code &&
      responseData?.data?.name
    ) {
      const result = {
        action_type: responseData.data.action_type,
        code: responseData.data.code,
        name: responseData.data.name
      };
      console.log('[extractOntologyAction] 提取成功:', result);
      return result;
    }

    console.log(
      '[extractOntologyAction] 未找到本体操作数据，responseData.data:',
      responseData?.data
    );
    return null;
  } catch (e) {
    console.log('[extractOntologyAction] 提取失败:', e);
    return null;
  }
};

/**
 * 处理工具调用事件 (http, workflow, mcp, knowledge)
 */
export const handleToolCallEvent = (
  event: SSEEvent,
  context: EventHandlerContext
) => {
  const { setMessages } = context;
  const { type } = event;

  console.log('[useXChat] tool call event:', {
    type: event.type,
    chunk_id: event.chunk_id,
    has_content: !!event.content,
    content_type: typeof event.content,
    has_tool_name: !!(event as any).tool_name,
    has_arg: !!(event as any).arg,
    has_response: !!(event as any).response,
    done: event.done,
    running_time: event.running_time
  });

  setMessages((draft) => {
    const lastIndex = draft.length - 1;
    if (lastIndex < 0) return;

    const lastMsg = draft[lastIndex];
    if (!lastMsg.thinkingSteps) {
      lastMsg.thinkingSteps = [];
    }

    // 查找是否已存在相同 chunk_id 的步骤
    const stepIndex = lastMsg.thinkingSteps.findIndex(
      (s) => s.chunk_id === event.chunk_id
    );

    // 解析 content
    // 注意：后端可能将数据放在 event.content 中，也可能直接放在 event 对象上
    let contentData: any = event.content;

    // 如果 content 是字符串，尝试解析
    if (typeof contentData === 'string' && contentData) {
      try {
        contentData = JSON.parse(contentData);
        console.log('[useXChat] parsed tool content from string:', {
          tool_name: contentData.tool_name,
          has_arg: !!contentData.arg,
          has_response: !!contentData.response
        });
      } catch (e) {
        console.log('[useXChat] content parse failed, keep as string');
      }
    }
    // 如果 content 为空，但 event 对象上有 tool_name/arg/response，使用 event 对象
    else if (!contentData && (event as any).tool_name) {
      contentData = {
        tool_name: (event as any).tool_name,
        arg: (event as any).arg,
        response: (event as any).response,
        tool_call_id: (event as any).tool_call_id,
        tool_id: (event as any).tool_id
      };
      console.log('[useXChat] using tool data from event object:', {
        tool_name: contentData.tool_name,
        has_arg: !!contentData.arg,
        has_response: !!contentData.response
      });
    }

    // 提取本体操作信息（如果是 http 类型且有 response）
    console.log('[handleToolCallEvent] 检查本体操作提取条件:', {
      type,
      done: event.done,
      hasResponse: !!contentData?.response,
      responseType: typeof contentData?.response
    });

    if (type === 'http' && contentData?.response) {
      console.log(
        '[handleToolCallEvent] 开始提取本体操作，response:',
        contentData.response
      );
      const ontologyAction = extractOntologyAction(contentData.response);
      if (ontologyAction) {
        if (!lastMsg.ontologyActions) {
          lastMsg.ontologyActions = [];
        }
        // 添加工具名称
        ontologyAction.toolName = contentData.tool_name;
        // 检查是否已存在相同的操作（根据 code 判断）
        const existingIndex = lastMsg.ontologyActions.findIndex(
          (a) => a.code === ontologyAction.code
        );
        if (existingIndex >= 0) {
          lastMsg.ontologyActions[existingIndex] = ontologyAction;
        } else {
          lastMsg.ontologyActions.push(ontologyAction);
        }
        console.log(
          '[handleToolCallEvent] 本体操作已添加到消息:',
          ontologyAction
        );
        console.log(
          '[handleToolCallEvent] 当前消息的所有本体操作:',
          lastMsg.ontologyActions
        );
      } else {
        console.log('[handleToolCallEvent] 未提取到本体操作');
      }
    }

    if (stepIndex >= 0) {
      // 更新已存在的步骤
      const existingStep = lastMsg.thinkingSteps[stepIndex];

      console.log('[useXChat] updating existing step:', {
        stepIndex,
        old_content: existingStep.content,
        new_content: contentData,
        old_done: existingStep.done,
        new_done: event.done
      });

      // 如果新事件有 content，更新 content
      if (contentData !== undefined) {
        existingStep.content = contentData;
      }

      // 更新其他字段
      if (event.done !== undefined) {
        existingStep.done = event.done;
        existingStep.status = event.done ? 'success' : 'running';
      }
      if (event.running_time) {
        existingStep.running_time =
          typeof event.running_time === 'string'
            ? parseFloat(event.running_time)
            : event.running_time;
      }

      console.log('[useXChat] updated tool step:', {
        chunk_id: existingStep.chunk_id,
        type: existingStep.type,
        has_content: !!existingStep.content,
        content_preview: existingStep.content
          ? JSON.stringify(existingStep.content).substring(0, 100)
          : 'null',
        done: existingStep.done,
        status: existingStep.status
      });
    } else {
      // 创建新步骤
      const toolStep: ThinkingStep = {
        chunk_id: event.chunk_id || generateId(),
        type: type || 'http', // 提供默认值
        content: contentData,
        status: event.done ? 'success' : 'running',
        running_time:
          typeof event.running_time === 'string'
            ? parseFloat(event.running_time)
            : event.running_time,
        done: event.done || false
      };

      lastMsg.thinkingSteps.push(toolStep);
      console.log('[useXChat] created new tool step:', {
        chunk_id: toolStep.chunk_id,
        type: toolStep.type,
        has_content: !!toolStep.content,
        content_preview: toolStep.content
          ? JSON.stringify(toolStep.content).substring(0, 100)
          : 'null',
        done: toolStep.done,
        status: toolStep.status
      });
    }

    lastMsg.status = 'streaming';
  });
};

/**
 * 处理 done 事件
 */
export const handleDoneEvent = (
  event: SSEEvent,
  context: EventHandlerContext
) => {
  const {
    setMessages,
    conversationIdRef,
    currentMessageIdRef,
    onConversationCreated,
    lastChatDone
  } = context;

  if (event.conversation_id) {
    conversationIdRef.current = event.conversation_id;
    onConversationCreated?.(event.conversation_id);
  }
  if (event.message_id) {
    currentMessageIdRef.current = event.message_id;
  }

  setMessages((draft) => {
    const lastIndex = draft.length - 1;
    if (lastIndex >= 0) {
      draft[lastIndex].status = 'success';
      // 确保所有未完成的步骤都标记为完成
      const steps = draft[lastIndex].thinkingSteps;
      if (steps && steps.length > 0) {
        steps.forEach((step) => {
          if (!step.done) {
            step.done = true;
            step.status = 'success';
          }
        });
      }
    }
  });

  lastChatDone();
};

/**
 * 处理 error 事件
 */
export const handleErrorEvent = (
  event: SSEEvent,
  context: EventHandlerContext
) => {
  const { setMessages, onError, lastChatDone } = context;
  const errorMsg = event.error_detail || '发生未知错误';

  setMessages((draft) => {
    const lastIndex = draft.length - 1;
    if (lastIndex >= 0) {
      draft[lastIndex].content = errorMsg;
      draft[lastIndex].status = 'error';

      // 将所有未完成的思考步骤标记为失败
      const steps = draft[lastIndex].thinkingSteps;
      if (steps && steps.length > 0) {
        steps.forEach((step) => {
          if (!step.done) {
            step.done = true;
            step.status = 'error';
          }
        });
      }
    }
  });

  lastChatDone();
  onError?.(new Error(errorMsg));
};

/**
 * 主事件处理器 - 根据事件类型分发到对应的处理函数
 */
export const createEventProcessor = (context: EventHandlerContext) => {
  return (event: SSEEvent) => {
    const { type } = event;
    const { prevEventTypeRef } = context;

    // 根据事件类型分发
    if (type === EVENT_TYPES.THINKING) {
      handleThinkingEvent(event, context);
    } else if (type === EVENT_TYPES.ONTOLOGY) {
      handleOntologyEvent(event, context);
    } else if (type === EVENT_TYPES.ANSWER) {
      handleAnswerEvent(event, context);
    } else if (
      type === EVENT_TYPES.HTTP ||
      type === EVENT_TYPES.WORKFLOW ||
      type === EVENT_TYPES.MCP ||
      type === EVENT_TYPES.KNOWLEDGE
    ) {
      handleToolCallEvent(event, context);
    } else if (type === EVENT_TYPES.DONE) {
      handleDoneEvent(event, context);
    } else if (type === EVENT_TYPES.ERROR) {
      handleErrorEvent(event, context);
    }

    // 记录当前事件类型
    prevEventTypeRef.current = type || null;
  };
};
