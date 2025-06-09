import type {
  AnnotationReply,
  MessageEnd,
  MessageReplace,
  ThoughtItem
} from './type';
import type { VisionFile } from './type';
import { Message } from '@arco-design/web-react';
import { getToken } from '@/utils/request'

const ContentType = {
  json: 'application/json',
  stream: 'text/event-stream',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  download: 'application/octet-stream', // for download
  upload: 'multipart/form-data' // for upload
};

const baseOptions = {
  method: 'GET',
  mode: 'cors',
  credentials: 'include', // always send cookies、HTTP Basic authentication.
  headers: new Headers({
    'Content-Type': ContentType.json,
    ...getToken()
  }),
  redirect: 'follow'
};

export type IOnDataMoreInfo = {
  conversationId?: string;
  taskId?: string;
  messageId: string;
  errorMessage?: string;
  errorCode?: string;
};

export type IOnData = (
  message: string,
  isFirstMessage: boolean,
  moreInfo: IOnDataMoreInfo
) => void;
export type IOnThought = (though: ThoughtItem) => void;
export type IOnFile = (file: VisionFile) => void;
export type IOnMessageEnd = (messageEnd: MessageEnd) => void;
export type IOnMessageReplace = (messageReplace: MessageReplace) => void;
export type IOnAnnotationReply = (messageReplace: AnnotationReply) => void;
export type IOnCompleted = (hasError?: boolean) => void;
export type IOnError = (msg: string, code?: string) => void;

type IOtherOptions = {
  isPublicAPI?: boolean;
  bodyStringify?: boolean;
  needAllResponseContent?: boolean;
  deleteContentType?: boolean;
  onData?: IOnData; // for stream
  onThought?: IOnThought;
  onFile?: IOnFile;
  onMessageEnd?: IOnMessageEnd;
  onMessageReplace?: IOnMessageReplace;
  onError?: IOnError;
  onCompleted?: IOnCompleted; // for stream
  getAbortController?: (abortController: AbortController) => void;
};

type FetchOptionType = Omit<RequestInit, 'body'> & {
  params?: Record<string, any>;
  body?: BodyInit | Record<string, any> | null;
};

function unicodeToChar(text: string) {
  if (!text) return '';

  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
}

export function format(text: string) {
  let res = text.trim();
  if (res.startsWith('\n')) res = res.replace('\n', '');

  return res.replaceAll('\n', '<br/>').replaceAll('```', '');
}

const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
  onThought?: IOnThought,
  onMessageEnd?: IOnMessageEnd,
  onMessageReplace?: IOnMessageReplace,
  onFile?: IOnFile
) => {
  if (!response.ok) throw new Error('Network response was not ok');

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let bufferObj: Record<string, any>;
  let isFirstMessage = true;
  function read() {
    let hasError = false;
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted && onCompleted();
        return;
      }
      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split('\n');
      // console.log('lines:', lines);
      try {
        lines.forEach((message) => {
          if (message.startsWith('data: ')) {
            // check if it starts with data:
            try {
              bufferObj = JSON.parse(message.substring(6)) as Record<
                string,
                any
              >; // remove data: and parse as json
              // console.log('answer:', bufferObj.answer);
            } catch (e) {
              // mute handle message cut off
              onData('', isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id
              });
              return;
            }
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData('', false, {
                conversationId: undefined,
                messageId: '',
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code
              });
              hasError = true;
              onCompleted?.(true);
              return;
            }
            if (
              bufferObj.event === 'message' ||
              bufferObj.event === 'agent_message'
            ) {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id
              });
              isFirstMessage = false;
            } else if (bufferObj.event === 'agent_thought') {
              onThought?.(bufferObj as ThoughtItem);
            } else if (bufferObj.event === 'message_file') {
              onFile?.(bufferObj as VisionFile);
            } else if (bufferObj.event === 'message_end') {
              onMessageEnd?.(bufferObj as MessageEnd);
            } else if (bufferObj.event === 'message_replace') {
              onMessageReplace?.(bufferObj as MessageReplace);
            }
          }
        });
        buffer = lines[lines.length - 1];
      } catch (e) {
        onData('', false, {
          conversationId: undefined,
          messageId: '',
          errorMessage: `${e}`
        });
        hasError = true;
        onCompleted?.(true);
        return;
      }
      if (!hasError) read();
    });
  }
  read();
};

export const ssePost = (
  url: string,
  fetchOptions: FetchOptionType,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onMessageEnd,
    onMessageReplace,
    onError,
    getAbortController
  }: IOtherOptions
) => {
  const abortController = new AbortController();

  const options = Object.assign(
    {},
    baseOptions,
    {
      method: 'POST',
      signal: abortController.signal
    },
    fetchOptions
  );

  const contentType = options.headers.get('Content-Type');
  if (!contentType) options.headers.set('Content-Type', ContentType.json);

  getAbortController?.(abortController);

  const urlWithPrefix = `${url.startsWith('/') ? url : `/${url}`}`;

  const { body } = options;
  if (body) options.body = JSON.stringify(body);

  globalThis
    .fetch(urlWithPrefix, options as RequestInit)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        res.json().then((data: any) => {
          Message.error(data.message || 'Server Error');
        });
        onError?.('Server Error');
        return;
      }
      return handleStream(
        res,
        (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
          if (moreInfo.errorMessage) {
            onError?.(moreInfo.errorMessage, moreInfo.errorCode);
            if (
              moreInfo.errorMessage !==
              'AbortError: The user aborted a request.'
            )
              Message.error(moreInfo.errorMessage);
            return;
          }
          onData?.(str, isFirstMessage, moreInfo);
        },
        onCompleted,
        onThought,
        onMessageEnd,
        onMessageReplace,
        onFile
      );
    })
    .catch((e) => {
      if (e.toString() !== 'AbortError: The user aborted a request.') {
        Message.error(e);
        console.error(e);
      }
      onError?.(e);
    });
};
