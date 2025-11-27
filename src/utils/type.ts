export enum TransferMethod {
  all = 'all',
  local_file = 'local_file',
  remote_url = 'remote_url'
}

export type VisionFile = {
  id?: string;
  type: string;
  transfer_method: TransferMethod;
  url: string;
  upload_file_id: string;
  belongs_to?: string;
};

export type Emoji = {
  background: string;
  content: string;
};

export type ThoughtItem = {
  id: string;
  tool: string; // plugin or dataset. May has multi.
  thought: string;
  tool_input: string;
  message_id: string;
  observation: string;
  position: number;
  files?: string[];
  message_files?: VisionFile[];
  thinkStart?: Date;
  thinkEnd?: Date;
};

export type CitationItem = {
  content: string;
  data_source_type: string;
  dataset_name: string;
  dataset_id: string;
  document_id: string;
  document_name: string;
  hit_count: number;
  index_node_hash: string;
  segment_id: string;
  segment_position: number;
  score: number;
  word_count: number;
};

export type MessageEnd = {
  id: string;
  metadata: {
    retriever_resources?: CitationItem[];
    annotation_reply: {
      id: string;
      account: {
        id: string;
        name: string;
      };
    };
  };
};

export type MessageReplace = {
  id: string;
  task_id: string;
  answer: string;
  conversation_id: string;
};

export type AnnotationReply = {
  id: string;
  task_id: string;
  answer: string;
  conversation_id: string;
  annotation_id: string;
  annotation_author_name: string;
};

export type Annotation = {
  id: string;
  authorName: string;
  logAnnotation?: LogAnnotation;
  created_at?: number;
};

export type LogAnnotation = {
  content: string;
  account: {
    id: string;
    name: string;
    email: string;
  };
  created_at: number;
};

export type ChatItem = IChatItem;

export type IChatItem = {
  id: string;
  content: string;
  citation?: CitationItem[];
  /**
   * Specific message type
   */
  isAnswer: boolean;
  /**
   * The user feedback result of this message
   */
  feedback?: Feedbacktype;
  /**
   * The admin feedback result of this message
   */
  adminFeedback?: Feedbacktype;
  /**
   * Whether to hide the feedback area
   */
  feedbackDisabled?: boolean;
  /**
   * More information about this message
   */
  more?: MessageMore;
  annotation?: Annotation;
  useCurrentUserAvatar?: boolean;
  isOpeningStatement?: boolean;
  suggestedQuestions?: string[];
  log?: { role: string; text: string }[];
  agent_thoughts?: ThoughtItem[];
  message_files?: VisionFile[];
};

export type Feedbacktype = {
  rating: MessageRating;
  content?: string | null;
};

export type MessageRating = (typeof MessageRatings)[number];

export const MessageRatings = ['like', 'dislike', null] as const;

export type MessageMore = {
  time: string;
  tokens: number;
  latency: number | string;
};

export type ChatConfig = Omit<ModelConfig, 'model'> & {
  supportAnnotation?: boolean;
  appId?: string;
  supportFeedback?: boolean;
  supportCitationHitInfo?: boolean;
};

export enum PromptMode {
  simple = 'simple',
  advanced = 'advanced'
}

export type ChatPromptConfig = {
  prompt: PromptItem[];
};

export type PromptItem = {
  role?: PromptRole;
  text: string;
};

export enum PromptRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant'
}

export type CompletionPromptConfig = {
  prompt: PromptItem;
  conversation_histories_role: ConversationHistoriesRole;
};

export type ConversationHistoriesRole = {
  user_prefix: string;
  assistant_prefix: string;
};

export type TextTypeFormItem = {
  default: string;
  label: string;
  variable: string;
  required: boolean;
  max_length: number;
};

export type SelectTypeFormItem = {
  default: string;
  label: string;
  variable: string;
  required: boolean;
  options: string[];
};

/**
 * User Input Form Item
 */
export type UserInputFormItem =
  | {
      'text-input': TextTypeFormItem;
    }
  | {
      select: SelectTypeFormItem;
    }
  | {
      paragraph: TextTypeFormItem;
    };

export enum AgentStrategy {
  functionCall = 'function_call',
  react = 'react'
}

export type AnnotationReplyConfig = {
  id: string;
  enabled: boolean;
  score_threshold: number;
  embedding_model: {
    embedding_provider_name: string;
    embedding_model_name: string;
  };
};

export enum CollectionType {
  all = 'all',
  builtIn = 'builtin',
  custom = 'api',
  model = 'model'
}

export type AgentTool = {
  provider_id: string;
  provider_type: CollectionType;
  provider_name: string;
  tool_name: string;
  tool_parameters: Record<string, any>;
  enabled: boolean;
  isDeleted?: boolean;
  notAuthor?: boolean;
};

export type ToolItem = AgentTool;

export enum ModelModeType {
  'chat' = 'chat',
  'completion' = 'completion',
  'unset' = ''
}

export type ModelConfig = {
  opening_statement: string;
  suggested_questions?: string[];
  pre_prompt: string;
  prompt_type: PromptMode;
  chat_prompt_config: ChatPromptConfig | {};
  completion_prompt_config: CompletionPromptConfig | {};
  user_input_form: UserInputFormItem[];
  dataset_query_variable?: string;
  more_like_this: {
    enabled: boolean;
  };
  suggested_questions_after_answer: {
    enabled: boolean;
  };
  speech_to_text: {
    enabled: boolean;
  };
  text_to_speech: {
    enabled: boolean;
    voice?: string;
    language?: string;
  };
  retriever_resource: {
    enabled: boolean;
  };
  sensitive_word_avoidance: {
    enabled: boolean;
  };
  annotation_reply?: AnnotationReplyConfig;
  agent_mode: {
    enabled: boolean;
    strategy?: AgentStrategy;
    tools: ToolItem[];
  };
  model: {
    /** LLM provider, e.g., OPENAI */
    provider: string;
    /** Model name, e.g, gpt-3.5.turbo */
    name: string;
    mode: ModelModeType;
    /** Default Completion call parameters */
    completion_params: {
      /** Maximum number of tokens in the answer message returned by Completion */
      max_tokens: number;
      /**
       * A number between 0 and 2.
       * The larger the number, the more random the result;
       * otherwise, the more deterministic.
       * When in use, choose either `temperature` or `top_p`.
       * Default is 1.
       */
      temperature: number;
      /**
       * Represents the proportion of probability mass samples to take,
       * e.g., 0.1 means taking the top 10% probability mass samples.
       * The determinism between the samples is basically consistent.
       * Among these results, the `top_p` probability mass results are taken.
       * When in use, choose either `temperature` or `top_p`.
       * Default is 1.
       */
      top_p: number;
      /** When enabled, the Completion Text will concatenate the Prompt content together and return it. */
      echo: boolean;
      /**
       * Specify up to 4 to automatically stop generating before the text specified in `stop`.
       * Suitable for use in chat mode.
       * For example, specify "Q" and "A",
       * and provide some Q&A examples as context,
       * and the model will give out in Q&A format and stop generating before Q&A.
       */
      stop: string[];
      /**
       * A number between -2.0 and 2.0.
       * The larger the value, the less the model will repeat topics and the more it will provide new topics.
       */
      presence_penalty: number;
      /**
       * A number between -2.0 and 2.0.
       * A lower setting will make the model appear less cultured,
       * always repeating expressions.
       * The difference between `frequency_penalty` and `presence_penalty`
       * is that `frequency_penalty` penalizes a word based on its frequency in the training data,
       * while `presence_penalty` penalizes a word based on its occurrence in the input text.
       */
      frequency_penalty: number;
    };
  };
  dataset_configs: DatasetConfigs;
  file_upload?: {
    image: VisionSettings;
  };
  files?: VisionFile[];
};

export type DatasetConfigs = {
  retrieval_model: RETRIEVE_TYPE;
  reranking_model: {
    reranking_provider_name: string;
    reranking_model_name: string;
  };
  top_k: number;
  score_threshold_enabled: boolean;
  score_threshold: number;
  datasets: {
    datasets: {
      dataset: {
        enabled: boolean;
        id: number;
      };
    }[];
  };
};

export enum RETRIEVE_TYPE {
  oneWay = 'single',
  multiWay = 'multiple'
}

export type VisionSettings = {
  enabled: boolean;
  number_limits: number;
  detail: Resolution;
  transfer_methods: TransferMethod[];
  image_file_size_limit?: number | string;
};

export enum Resolution {
  low = 'low',
  high = 'high'
}

export type EnableType = {
  enabled: boolean;
};

export type OnSend = (message: string, files?: VisionFile[]) => void;

export type VisionConfig = VisionSettings;

export type Inputs = Record<string, string | number | object>;

export type PromptVariable = {
  key: string;
  name: string;
  type: string; // "string" | "number" | "select",
  default?: string | number;
  required?: boolean;
  options?: string[];
  max_length?: number;
  is_context_var?: boolean;
  enabled?: boolean;
  config?: Record<string, any>;
  icon?: string;
  icon_background?: string;
};

export type Feedback = {
  rating: 'like' | 'dislike' | null;
};

// 工具
export type Collection = {
  id: string;
  name: string;
  author: string;
  description: TypeWithI18NUnderline;
  icon: string | { background: string; content: string };
  label: TypeWithI18NUnderline;
  type: CollectionType;
  team_credentials: Record<string, any>;
  is_team_authorization: boolean;
  allow_delete: boolean;
};

export type Tool = {
  name: string;
  author: string;
  label: TypeWithI18NUnderline;
  description: TypeWithI18NUnderline;
  parameters: ToolParameter[];
  provider_id: string;
};

export type ToolParameter = {
  name: string;
  label: TypeWithI18NUnderline;
  human_description: TypeWithI18NUnderline;
  type: string;
  required: boolean;
  default: string;
  options?: {
    label: TypeWithI18NUnderline;
    value: string;
  }[];
};

export type TypeWithI18N<T = string> = {
  'en-US': T;
  'zh-Hans': T;
  [key: string]: T;
};

export type TypeWithI18NUnderline<T = string> = {
  en_US: T;
  zh_Hans: T;
  [key: string]: T;
};

export type ToolInfoInThought = {
  name: string;
  input: string;
  output: string;
  isFinished: boolean;
};

export type InstalledApp = {
  app: AppBasicInfo;
  id: string;
  uninstallable: boolean;
  is_pinned: boolean;
  /**创建者用户id */
  app_owner_tenant_id: string;
  /**创建者用户名 */
  publish_user?: string;
};

export type AppBasicInfo = {
  id: string;
  name: string;
  mode: AppMode;
  icon: string;
  icon_background: string;
  is_agent: boolean;
  site?: SiteConfig;
  model_config: ModelConfig;
};

export type AppMode = 'chat' | 'completion';

export type Callback = {
  onSuccess: () => void;
};

export type AppData = {
  app_id: string;
  can_replace_logo?: boolean;
  custom_config?: Record<string, any>;
  enable_site?: boolean;
  end_user_id?: string;
  site: SiteInfo;
  icon?: string;
};

export type SiteInfo = {
  title: string;
  icon_background?: string;
  description?: string;
  default_language?: string;
  prompt_public?: boolean;
  copyright?: string;
  privacy_policy?: string;
};

export type ConversationItem = {
  id: string;
  name: string;
  inputs: Record<string, any> | null;
  introduction: string;
};

export type AppConversationData = {
  data: ConversationItem[];
  has_more: boolean;
  limit: number;
};

export type AppMeta = {
  tool_icons: Record<string, string>;
};

export enum ModelStatusEnum {
  active = 'active',
  noConfigure = 'no-configure',
  quotaExceeded = 'quota-exceeded',
  noPermission = 'no-permission'
}

export enum ModelTypeEnum {
  textGeneration = 'llm',
  textEmbedding = 'text-embedding',
  rerank = 'rerank',
  speech2text = 'speech2text',
  moderation = 'moderation',
  tts = 'tts'
}

export enum ConfigurateMethodEnum {
  predefinedModel = 'predefined-model',
  customizableModel = 'customizable-model',
  fetchFromRemote = 'fetch-from-remote'
}

export enum FormTypeEnum {
  textInput = 'text-input',
  textNumber = 'number-input',
  secretInput = 'secret-input',
  select = 'select',
  radio = 'radio'
}

export type FormShowOnObject = {
  variable: string;
  value: string;
};

export type CredentialFormSchemaBase = {
  variable: string;
  label: TypeWithI18N;
  type: FormTypeEnum;
  required: boolean;
  default?: string;
  tooltip?: TypeWithI18N;
  show_on: FormShowOnObject[];
  url?: string;
};
export type CredentialFormSchemaTextInput = CredentialFormSchemaBase & {
  max_length?: number;
  placeholder?: TypeWithI18N;
};
export type CredentialFormSchemaNumberInput = CredentialFormSchemaBase & {
  min?: number;
  max?: number;
  placeholder?: TypeWithI18N;
};
export type CredentialFormSchemaSelect = CredentialFormSchemaBase & {
  options: FormOption[];
  placeholder?: TypeWithI18N;
};
export type CredentialFormSchemaRadio = CredentialFormSchemaBase & {
  options: FormOption[];
};
export type CredentialFormSchemaSecretInput = CredentialFormSchemaBase & {
  placeholder?: TypeWithI18N;
};
export type CredentialFormSchema =
  | CredentialFormSchemaTextInput
  | CredentialFormSchemaSelect
  | CredentialFormSchemaRadio
  | CredentialFormSchemaSecretInput;

export type FormOption = {
  label: TypeWithI18N;
  value: string;
  show_on: FormShowOnObject[];
};

export enum ModelFeatureEnum {
  toolCall = 'tool-call',
  multiToolCall = 'multi-tool-call',
  agentThought = 'agent-thought',
  vision = 'vision'
}

export type ModelItem = {
  model: string;
  label: TypeWithI18N;
  model_type: ModelTypeEnum;
  features?: ModelFeatureEnum[];
  fetch_from: ConfigurateMethodEnum;
  status: ModelStatusEnum;
  model_properties: Record<string, string | number>;
  deprecated?: boolean;
};

export type Model = {
  provider: string;
  icon_large: TypeWithI18N;
  icon_small: TypeWithI18N;
  label: TypeWithI18N;
  models: ModelItem[];
  status: ModelStatusEnum;
};

export type ModelProvider = {
  provider: string;
  label: TypeWithI18N;
  description?: TypeWithI18N;
  help: {
    title: TypeWithI18N;
    url: TypeWithI18N;
  };
  icon_small: TypeWithI18N;
  icon_large: TypeWithI18N;
  background?: string;
  supported_model_types: ModelTypeEnum[];
  configurate_methods: ConfigurateMethodEnum[];
  provider_credential_schema: {
    credential_form_schemas: CredentialFormSchema[];
  };
  model_credential_schema: {
    model: {
      label: TypeWithI18N;
      placeholder: TypeWithI18N;
    };
    credential_form_schemas: CredentialFormSchema[];
  };
  preferred_provider_type: PreferredProviderTypeEnum;
  custom_configuration: {
    status: CustomConfigurationStatusEnum;
  };
  system_configuration: {
    enabled: boolean;
    current_quota_type: CurrentSystemQuotaTypeEnum;
    quota_configurations: QuotaConfiguration[];
  };
};
export enum CustomConfigurationStatusEnum {
  active = 'active',
  noConfigure = 'no-configure'
}

export enum QuotaUnitEnum {
  times = 'times',
  tokens = 'tokens',
  credits = 'credits'
}

export type QuotaConfiguration = {
  quota_type: CurrentSystemQuotaTypeEnum;
  quota_unit: QuotaUnitEnum;
  quota_limit: number;
  quota_used: number;
  last_used: number;
  is_valid: boolean;
};

export enum CurrentSystemQuotaTypeEnum {
  trial = 'trial',
  free = 'free',
  paid = 'paid'
}

export enum PreferredProviderTypeEnum {
  system = 'system',
  custom = 'custom'
}

export type IconBaseProps = {
  data: IconData;
  className?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
  style?: React.CSSProperties;
};
export type IconData = {
  name: string;
  icon: AbstractNode;
};

export type AbstractNode = {
  name: string;
  attributes: {
    [key: string]: string;
  };
  children?: AbstractNode[];
};

export type ModelParameterRule = {
  default?: number | string | boolean | string[];
  help?: TypeWithI18N;
  label: TypeWithI18N;
  min?: number;
  max?: number;
  name: string;
  precision?: number;
  required: false;
  type: string;
  use_template?: string;
  options?: string[];
  tagPlaceholder?: TypeWithI18N;
};

export type DataSet = {
  id: number;
  name: string;
  icon: string;
  icon_background: string;
  description: string;
  permission: 'only_me' | 'all_team_members';
  data_source_type: DataSourceType;
  indexing_technique: 'high_quality' | 'economy';
  created_by: string;
  created_at: number;
  updated_by: string;
  updated_at: number;
  app_count: number;
  document_count: number;
  word_count: number;
  embedding_model: string;
  embedding_model_provider: string;
  embedding_available: boolean;
  retrieval_model_dict: RetrievalConfig;
  retrieval_model: RetrievalConfig;
};

export enum RETRIEVE_METHOD {
  semantic = 'semantic_search',
  fullText = 'full_text_search',
  hybrid = 'hybrid_search',
  invertedIndex = 'invertedIndex'
}

export type RetrievalConfig = {
  search_method: RETRIEVE_METHOD;
  reranking_enable: boolean;
  reranking_model: {
    reranking_provider_name: string;
    reranking_model_name: string;
  };
  top_k: number;
  score_threshold_enabled: boolean;
  score_threshold: number;
};

export enum DataSourceType {
  FILE = 'upload_file',
  NOTION = 'notion_import',
  WEB = 'web_import'
}

/**
 * App
 */
export type App = {
  /** App ID */
  id: string;
  /** Name */
  name: string;

  /** Icon */
  icon: string;
  /** Icon Background */
  icon_background: string;

  /** Mode */
  mode: AppMode;
  is_agent: boolean;
  /** Enable web app */
  enable_site: boolean;
  /** Enable web API */
  enable_api: boolean;
  /** API requests per minute, default is 60 */
  api_rpm: number;
  /** API requests per hour, default is 3600 */
  api_rph: number;
  /** Whether it's a demo app */
  is_demo: boolean;
  /** Model configuration */
  model_config: ModelConfig;
  app_model_config: ModelConfig;
  /** Timestamp of creation */
  created_at: number;
  /** Web Application Configuration */
  site: SiteConfig;
  /** api site url */
  api_base_url: string;
};

/**
 * Web Application Configuration
 */
export type SiteConfig = {
  /** Application URL Identifier: `http://dify.app/{access_token}` */
  access_token: string;
  /** Public Title */
  title: string;
  /** Application Description will be shown in the Client  */
  description: string;
  /** Author */
  author: string;
  /** User Support Email Address */
  support_email: string;
  /**
   * Default Language, e.g. zh-Hans, en-US
   * Use standard RFC 4646, see https://www.ruanyifeng.com/blog/2008/02/codes_for_language_names.html
   */
  default_language: Language;
  /**  Custom Domain */
  customize_domain: string;
  /** Theme */
  theme: string;
  /** Custom Token strategy Whether Terminal Users can choose their OpenAI Key */
  customize_token_strategy: 'must' | 'allow' | 'not_allow';
  /** Is Prompt Public */
  prompt_public: boolean;
  /** Web API and APP Base Domain Name */
  app_base_url: string;
  /** Copyright */
  copyright: string;
  /** Privacy Policy */
  privacy_policy: string;

  icon: string;
  icon_background: string;
};

export const languages = [
  {
    value: 'en-US',
    name: 'English(United States)',
    example: 'Hello, Dify!',
    supported: true
  },
  {
    value: 'zh-Hans',
    name: '简体中文',
    example: '你好，Dify！',
    supported: true
  }
];

export type Language = (typeof LanguagesSupported)[number];
export const LanguagesSupported = languages
  .filter((item) => item.supported)
  .map((item) => item.value);
export enum AuthType {
  none = 'none',
  apiKey = 'api_key'
}
export enum AuthHeaderPrefix {
  basic = 'basic',
  bearer = 'bearer',
  custom = 'custom'
}

export type Credential = {
  auth_type: AuthType;
  api_key_header?: string;
  api_key_value?: string;
  api_key_header_prefix?: AuthHeaderPrefix;
};

export type CustomCollectionBackend = {
  provider: string;
  original_provider?: string;
  credentials: Credential;
  icon: { background: string; content: string };
  schema_type: string;
  schema: string;
  privacy_policy: string;
  tools?: ParamItem[];
  name: string;
  type: CollectionType;
  author: string;
  label: TypeWithI18NUnderline;
};

export type ParamItem = {
  name: string;
  label: TypeWithI18N;
  human_description: TypeWithI18N;
  type: string;
  required: boolean;
  default: string;
  min?: number;
  max?: number;
  options?: {
    label: TypeWithI18N;
    value: string;
  }[];
};

export type DebugToolData = {
  provider_name: string;
  tool_name: string;
  credentials: Credential;
  schema_type: string;
  schema: string;
  parameters: Record<string, string>;
};

export type ToolCredential = {
  name: string;
  label: TypeWithI18N;
  help: TypeWithI18N;
  placeholder: TypeWithI18N;
  type: string;
  required: boolean;
  default: string;
  options?: {
    label: TypeWithI18N;
    value: string;
  }[];
};

export type FormValue = Record<string, any>;

export enum FileType {
  doc = 'doc',
  docx = 'docx',
  word = 'word',
  jpg = 'jpg',
  png = 'png',
  jpeg = 'jpeg',
  xls = 'xls',
  xlsx = 'xlsx',
  m4a = 'm4a',
  mp4 = 'mp4',
  pdf = 'pdf',
  ppt = 'ppt',
  pptx = 'pptx',
  text = 'text',
  txt = 'txt',
  wav = 'wav',
  exe = 'exe',
  bucket = 'bucket',
  dmg = 'dmg',
  torrent = 'torrent',
  apk = 'apk',
  rar = 'rar',
  epub = 'epub',
  json = 'json',
  jsonl = 'jsonl',
  markdown = 'markdown',
  md = 'md',
  mp3 = 'mp3',
  flv = 'flv',
  ogg = 'ogg',
  aac = 'aac',
  webm = 'webm',
  mov = 'mov',
  mkv = 'mkv',
  avi = 'avi',
  wmv = 'wmv',
  flac = 'flac',
  file = 'file',
  database = 'database'
}

export enum FileTypeLarge {
  doc = 'DOC',
  docx = 'DOCX',
  word = 'WORD',
  jpg = 'JPG',
  png = 'PNG',
  jpeg = 'JPEG',
  xls = 'XLS',
  xlsx = 'XLSX',
  m4a = 'M4A',
  mp4 = 'MP4',
  pdf = 'PDF',
  ppt = 'PPT',
  pptx = 'PPTX',
  text = 'TEXT',
  txt = 'TXT',
  wav = 'WAV',
  exe = 'EXE',
  bucket = 'BUCKET',
  dmg = 'DMG',
  torrent = 'TORRENT',
  apk = 'APK',
  rar = 'RAR',
  epub = 'EPUB',
  json = 'JSON',
  jsonl = 'JSONL',
  markdown = 'MARKDOWN',
  md = 'MD',
  mp3 = 'MP3',
  flv = 'FLV',
  ogg = 'OGG',
  aac = 'AAC',
  webm = 'WEBM',
  mov = 'MOV',
  mkv = 'MKV',
  avi = 'AVI',
  wmv = 'WMV',
  flac = 'FLAC',
  file = 'FILE',
  database = 'DATABASE'
}
