import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Button,
  Checkbox,
  Input,
  Message,
  Modal,
  Radio,
  Space,
  Spin,
  Typography
} from '@arco-design/web-react';
import { IconDelete, IconSend } from '@arco-design/web-react/icon';
import type { ThinkingProgressCallbacks } from '@/pages/applicationScene/types';
import type {
  GeneratedRichRelation,
  ImplicitRelationKnowledge,
  InferenceRule
} from '../types';
import {
  executeImplicitRelationChatQuery,
  type ImplicitRelationDataSource
} from '../services/implicitRelationChatQuery';
import { resolveRuleDescription } from '../services/ruleDescription';
import {
  buildKnowledgeBaseOptions,
  loadOntologySceneOptions,
  resolveSceneNameMap,
  type KnowledgeBaseOption,
  type OntologySceneOption
} from '../services/testDataSources';
import styles from './ImplicitRelationTestModal.module.scss';

const { Text } = Typography;
const { TextArea } = Input;

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingProcess?: string;
  isThinking?: boolean;
}

interface ImplicitRelationTestModalProps {
  visible: boolean;
  sceneId?: number;
  knowledge: ImplicitRelationKnowledge;
  initialRuleIds?: string[];
  initialRelationIds?: string[];
  /** global：先配置数据源/关系/规则；item：行内测试直接进入对话 */
  entryMode?: 'global' | 'item';
  onClose: () => void;
}

type TestStep = 'config' | 'chat';

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const QUICK_PROMPTS = [
  '查询图谱中有哪些对象类型实例',
  '统计各对象类型的实例数量',
  '有哪些与车辆相关的实例'
];

export default function ImplicitRelationTestModal({
  visible,
  sceneId,
  knowledge,
  initialRuleIds = [],
  initialRelationIds = [],
  entryMode = 'global',
  onClose
}: ImplicitRelationTestModalProps) {
  const [step, setStep] = useState<TestStep>('config');
  const [dataSource, setDataSource] =
    useState<ImplicitRelationDataSource>('ontologyScene');
  const [sourceLoading, setSourceLoading] = useState(false);
  const [ontologyScenes, setOntologyScenes] = useState<OntologySceneOption[]>(
    []
  );
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseOption[]>(
    []
  );
  const [selectedSceneIds, setSelectedSceneIds] = useState<number[]>([]);
  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = useState<
    string[]
  >([]);
  const [selectedRelationIds, setSelectedRelationIds] = useState<string[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enabledRelations = useMemo(
    () => knowledge.richRelations.filter((item) => item.enabled !== false),
    [knowledge.richRelations]
  );

  const enabledRules = useMemo(
    () => knowledge.inferenceRules.filter((item) => item.enabled !== false),
    [knowledge.inferenceRules]
  );

  const sceneNameMap = useMemo(
    () => resolveSceneNameMap(ontologyScenes),
    [ontologyScenes]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    let cancelled = false;

    const loadSources = async () => {
      setSourceLoading(true);
      try {
        const scenes = await loadOntologySceneOptions();
        if (cancelled) {
          return;
        }

        setOntologyScenes(scenes);
        setKnowledgeBases(buildKnowledgeBaseOptions(scenes));

        const defaultSceneIds = sceneId
          ? [sceneId]
          : scenes[0]?.id
            ? [scenes[0].id]
            : [];
        setSelectedSceneIds(defaultSceneIds);

        const defaultKnowledgeIds = sceneId
          ? [`implicitRelation:${sceneId}`]
          : scenes[0]?.id
            ? [`implicitRelation:${scenes[0].id}`]
            : [];
        setSelectedKnowledgeBaseIds(defaultKnowledgeIds);
      } catch (error) {
        if (!cancelled) {
          Message.error('加载数据源失败');
        }
      } finally {
        if (!cancelled) {
          setSourceLoading(false);
        }
      }
    };

    void loadSources();

    setStep(entryMode === 'global' ? 'config' : 'chat');
    setSelectedRelationIds(
      entryMode === 'item'
        ? initialRelationIds.length
          ? initialRelationIds
          : enabledRelations.map((item) => item.id)
        : initialRelationIds
    );
    setSelectedRuleIds(
      entryMode === 'item'
        ? initialRuleIds.length
          ? initialRuleIds
          : enabledRules.map((item) => item.id)
        : initialRuleIds
    );
    setDataSource('ontologyScene');
    setInput('');
    setMessages([]);

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    sceneId,
    entryMode,
    initialRelationIds,
    initialRuleIds,
    enabledRelations,
    enabledRules
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const selectedRelations = useMemo(
    () =>
      knowledge.richRelations.filter((item) =>
        selectedRelationIds.includes(item.id)
      ),
    [knowledge.richRelations, selectedRelationIds]
  );

  const selectedRules = useMemo(
    () =>
      knowledge.inferenceRules.filter((item) =>
        selectedRuleIds.includes(item.id)
      ),
    [knowledge.inferenceRules, selectedRuleIds]
  );

  const appendMessage = useCallback((message: AssistantMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const createThinkingProgress = useCallback(
    (messageId: string): ThinkingProgressCallbacks => ({
      onThinkingLine: (line: string) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  thinkingProcess: message.thinkingProcess
                    ? `${message.thinkingProcess}\n${line}`
                    : line
                }
              : message
          )
        );
      }
    }),
    []
  );

  const finalizeAssistantMessage = useCallback(
    (messageId: string, content: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content,
                isThinking: false
              }
            : message
        )
      );
    },
    []
  );

  const validateConfig = () => {
    if (!selectedRuleIds.length) {
      Message.warning('请至少选择一条推理规则');
      return false;
    }

    if (dataSource === 'ontologyScene' && !selectedSceneIds.length) {
      Message.warning('请至少选择一个本体场景库');
      return false;
    }

    if (dataSource === 'knowledgeBase' && !selectedKnowledgeBaseIds.length) {
      Message.warning('请至少选择一个知识库');
      return false;
    }

    if (!selectedRelationIds.length) {
      Message.warning('请至少选择一条补充链接/关系');
      return false;
    }

    return true;
  };

  const handleStartChat = () => {
    if (!validateConfig()) {
      return;
    }
    setStep('chat');
  };

  const handleSubmit = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) {
      return;
    }

    if (!validateConfig()) {
      return;
    }

    setInput('');
    appendMessage({
      id: createMessageId(),
      role: 'user',
      content: text
    });

    const assistantMessageId = createMessageId();
    appendMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thinkingProcess: '',
      isThinking: true
    });

    setLoading(true);
    const progress = createThinkingProgress(assistantMessageId);

    try {
      const { content } = await executeImplicitRelationChatQuery({
        query: text,
        selectedRules,
        selectedRichRelations: selectedRelations,
        dataSource,
        ontologySceneIds: selectedSceneIds,
        knowledgeBaseIds: selectedKnowledgeBaseIds,
        sceneNameMap,
        progress
      });

      progress.onThinkingLine?.('▸ 回答生成完成');
      finalizeAssistantMessage(assistantMessageId, content);
    } catch (error) {
      console.error(error);
      finalizeAssistantMessage(
        assistantMessageId,
        error instanceof Error ? error.message : '查询失败，请稍后重试'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleScene = (sceneIdValue: number, checked: boolean) => {
    setSelectedSceneIds((prev) =>
      checked
        ? [...new Set([...prev, sceneIdValue])]
        : prev.filter((id) => id !== sceneIdValue)
    );
  };

  const toggleKnowledgeBase = (knowledgeBaseId: string, checked: boolean) => {
    setSelectedKnowledgeBaseIds((prev) =>
      checked
        ? [...new Set([...prev, knowledgeBaseId])]
        : prev.filter((id) => id !== knowledgeBaseId)
    );
  };

  const toggleRelation = (relationId: string, checked: boolean) => {
    setSelectedRelationIds((prev) =>
      checked
        ? [...new Set([...prev, relationId])]
        : prev.filter((id) => id !== relationId)
    );
  };

  const toggleRule = (ruleId: string, checked: boolean) => {
    setSelectedRuleIds((prev) =>
      checked
        ? [...new Set([...prev, ruleId])]
        : prev.filter((id) => id !== ruleId)
    );
  };

  const renderSectionActions = (
    allIds: string[],
    selectedIds: string[],
    onChange: (ids: string[]) => void
  ) =>
    entryMode === 'global' && step === 'config' ? (
      <Space size={4}>
        <Button
          type="text"
          size="mini"
          disabled={!allIds.length}
          onClick={() => onChange(allIds)}
        >
          全选
        </Button>
        <Button
          type="text"
          size="mini"
          disabled={!selectedIds.length}
          onClick={() => onChange([])}
        >
          清空
        </Button>
      </Space>
    ) : null;

  const renderRelationLabel = (relation: GeneratedRichRelation) => (
    <span>
      <Text bold>{relation.name}</Text>
      <br />
      <Text type="secondary" style={{ fontSize: 12 }}>
        {relation.description}
      </Text>
    </span>
  );

  const renderRuleLabel = (rule: InferenceRule) => (
    <span>
      <Text>{resolveRuleDescription(rule)}</Text>
    </span>
  );

  const renderSceneLabel = (scene: OntologySceneOption) => (
    <span>
      <Text>
        {scene.name}（对象 {scene.objectCount} · 链接 {scene.linkCount}）
      </Text>
    </span>
  );

  const renderKnowledgeBaseLabel = (item: KnowledgeBaseOption) => (
    <span>
      <Text bold>{item.name}</Text>
      <br />
      <Text type="secondary" style={{ fontSize: 12 }}>
        {item.description}
      </Text>
    </span>
  );

  const relationOptionIds = enabledRelations.map((item) => item.id);
  const ruleOptionIds = enabledRules.map((item) => item.id);

  const renderConfigPanel = (layout: 'sidebar' | 'full') => (
    <div
      className={
        layout === 'full' ? styles.configPanelFull : styles.configPanel
      }
    >
      <div className={styles.configSection}>
        <div className={styles.configTitle}>数据源</div>
        <Radio.Group
          value={dataSource}
          onChange={(value) =>
            setDataSource(value as ImplicitRelationDataSource)
          }
        >
          <Radio value="ontologyScene">本体场景库</Radio>
          <Radio value="knowledgeBase">知识库</Radio>
        </Radio.Group>
        <div className={styles.configHint}>
          {dataSource === 'ontologyScene'
            ? '选择一个或多个本体场景库，检索其中的对象类型实例。'
            : '选择一个或多个知识库，结合关联场景库进行查询。'}
        </div>
      </div>

      {sourceLoading ? (
        <div className={styles.sourceLoading}>
          <Spin size={16} />
          <Text type="secondary">正在加载数据源…</Text>
        </div>
      ) : dataSource === 'ontologyScene' ? (
        <div className={styles.configSection}>
          <div className={styles.configTitleRow}>
            <div className={styles.configTitle}>
              选择场景库（{selectedSceneIds.length}/{ontologyScenes.length}）
            </div>
            {renderSectionActions(
              ontologyScenes.map((scene) => String(scene.id)),
              selectedSceneIds.map(String),
              (ids) => setSelectedSceneIds(ids.map(Number))
            )}
          </div>
          <div
            className={
              layout === 'full'
                ? styles.checkboxGroupLarge
                : styles.checkboxGroup
            }
          >
            {ontologyScenes.length ? (
              ontologyScenes.map((scene) => (
                <Checkbox
                  key={scene.id}
                  className={styles.checkboxItem}
                  checked={selectedSceneIds.includes(scene.id)}
                  onChange={(checked) => toggleScene(scene.id, checked)}
                >
                  {renderSceneLabel(scene)}
                </Checkbox>
              ))
            ) : (
              <Text type="secondary">暂无可选场景库</Text>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.configSection}>
          <div className={styles.configTitleRow}>
            <div className={styles.configTitle}>
              选择知识库（{selectedKnowledgeBaseIds.length}/
              {knowledgeBases.length}）
            </div>
            {renderSectionActions(
              knowledgeBases.map((item) => item.id),
              selectedKnowledgeBaseIds,
              setSelectedKnowledgeBaseIds
            )}
          </div>
          <div
            className={
              layout === 'full'
                ? styles.checkboxGroupLarge
                : styles.checkboxGroup
            }
          >
            {knowledgeBases.length ? (
              knowledgeBases.map((item) => (
                <Checkbox
                  key={item.id}
                  className={styles.checkboxItem}
                  checked={selectedKnowledgeBaseIds.includes(item.id)}
                  onChange={(checked) => toggleKnowledgeBase(item.id, checked)}
                >
                  {renderKnowledgeBaseLabel(item)}
                </Checkbox>
              ))
            ) : (
              <Text type="secondary">暂无可选知识库</Text>
            )}
          </div>
        </div>
      )}

      <div className={styles.configSection}>
        <div className={styles.configTitleRow}>
          <div className={styles.configTitle}>
            补充链接/关系（{selectedRelationIds.length}/
            {enabledRelations.length}）
          </div>
          {renderSectionActions(
            relationOptionIds,
            selectedRelationIds,
            setSelectedRelationIds
          )}
        </div>
        <div
          className={
            layout === 'full' ? styles.checkboxGroupLarge : styles.checkboxGroup
          }
        >
          {enabledRelations.length ? (
            enabledRelations.map((relation) => (
              <Checkbox
                key={relation.id}
                className={styles.checkboxItem}
                checked={selectedRelationIds.includes(relation.id)}
                onChange={(checked) => toggleRelation(relation.id, checked)}
              >
                {renderRelationLabel(relation)}
              </Checkbox>
            ))
          ) : (
            <Text type="secondary">暂无已启用的补充关系</Text>
          )}
        </div>
      </div>

      <div className={styles.configSection}>
        <div className={styles.configTitleRow}>
          <div className={styles.configTitle}>
            推理规则（{selectedRuleIds.length}/{enabledRules.length}）
          </div>
          {renderSectionActions(
            ruleOptionIds,
            selectedRuleIds,
            setSelectedRuleIds
          )}
        </div>
        <div
          className={
            layout === 'full' ? styles.checkboxGroupLarge : styles.checkboxGroup
          }
        >
          {enabledRules.length ? (
            enabledRules.map((rule) => (
              <Checkbox
                key={rule.id}
                className={styles.checkboxItem}
                checked={selectedRuleIds.includes(rule.id)}
                onChange={(checked) => toggleRule(rule.id, checked)}
              >
                {renderRuleLabel(rule)}
              </Checkbox>
            ))
          ) : (
            <Text type="secondary">暂无已启用的推理规则</Text>
          )}
        </div>
      </div>
    </div>
  );

  const modalTitle =
    entryMode === 'global' && step === 'config'
      ? '隐性关系测试 · 配置'
      : '隐性关系测试';

  const showConfigOnly = entryMode === 'global' && step === 'config';

  return (
    <Modal
      title={modalTitle}
      visible={visible}
      onCancel={onClose}
      footer={
        showConfigOnly ? (
          <Space>
            <Button type="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="primary"
              loading={sourceLoading}
              onClick={handleStartChat}
            >
              开始对话
            </Button>
          </Space>
        ) : null
      }
      autoFocus={false}
      unmountOnExit
      style={{ width: showConfigOnly ? 720 : 980 }}
    >
      {showConfigOnly ? (
        renderConfigPanel('full')
      ) : (
        <div className={styles.modalBody}>
          {renderConfigPanel('sidebar')}

          <div className={styles.chatPanel}>
            <div className={styles.chatHeader}>
              <Space>
                {entryMode === 'global' ? (
                  <Button
                    type="text"
                    size="mini"
                    onClick={() => setStep('config')}
                  >
                    ← 返回配置
                  </Button>
                ) : null}
                <Text bold>对话查询</Text>
              </Space>
              <Button
                type="text"
                size="mini"
                icon={<IconDelete />}
                disabled={!messages.length || loading}
                onClick={() => setMessages([])}
              >
                清空
              </Button>
            </div>

            <div className={styles.chatMessages}>
              <div className={styles.messageList}>
                {!messages.length ? (
                  <Text type="secondary">
                    选择数据源、补充关系与推理规则后，输入自然语言查询实例信息。
                  </Text>
                ) : null}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === 'user'
                        ? styles.messageUser
                        : styles.messageBot
                    }
                  >
                    {message.thinkingProcess ? (
                      <details
                        className={styles.thinkingDetails}
                        open={message.isThinking}
                      >
                        <summary className={styles.thinkingSummary}>
                          思考过程
                          {message.isThinking ? (
                            <span className={styles.thinkingStatus}>
                              进行中…
                            </span>
                          ) : null}
                        </summary>
                        <pre className={styles.thinkingContent}>
                          {message.thinkingProcess}
                        </pre>
                      </details>
                    ) : null}
                    {message.content ? (
                      <pre className={styles.messageContent}>
                        {message.content}
                      </pre>
                    ) : message.isThinking ? (
                      <Text type="secondary">正在分析查询…</Text>
                    ) : null}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className={styles.chatFooter}>
              <div className={styles.quickPrompts}>
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    size="mini"
                    type="outline"
                    disabled={loading}
                    onClick={() => void handleSubmit(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
              <div className={styles.inputRow}>
                <TextArea
                  value={input}
                  placeholder="输入查询，例如：查询与维修工单相关的实例"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  disabled={loading}
                  onChange={setInput}
                  onPressEnter={(event) => {
                    if (event.shiftKey) {
                      return;
                    }
                    event.preventDefault();
                    void handleSubmit();
                  }}
                />
                <Button
                  type="primary"
                  icon={<IconSend />}
                  loading={loading}
                  disabled={!input.trim()}
                  onClick={() => void handleSubmit()}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
