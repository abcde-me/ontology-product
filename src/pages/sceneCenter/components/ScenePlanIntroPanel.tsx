import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import {
  Button,
  Empty,
  Message,
  Space,
  Typography
} from '@arco-design/web-react';
import { IconEdit, IconSave } from '@arco-design/web-react/icon';
import MarkdownContent, {
  isEmptyMarkdownContent
} from '@/components/MarkdownContent';
import MarkdownEditor from '@/components/MarkdownEditor';
import type { ScenePlanIntroPageKey } from '@/types/scenePlanIntro';
import {
  getScenePlanIntro,
  saveScenePlanIntro
} from '@/utils/devScenePlanIntroStore';
import styles from './ScenePlanIntroPanel.module.scss';

const { Text } = Typography;

export interface ScenePlanIntroPanelHandle {
  save: () => void;
}

interface ScenePlanIntroPanelProps {
  sceneId: number;
  pageKey: ScenePlanIntroPageKey;
  /** 模块标题，默认「场景方案介绍」 */
  title?: string;
  /** 仅编辑模式：不展示只读预览，编辑与保存在同一模块内完成 */
  editableOnly?: boolean;
  /** 操作按钮样式，默认 primary */
  actionButtonType?: 'primary' | 'outline' | 'default';
  /** simple：标题 + 输入框，无内层表头/边框 */
  layout?: 'panel' | 'simple';
  /** 编辑区最小高度（px） */
  editorMinHeight?: number;
  /** 隐藏重置/保存等操作按钮，由外部统一保存 */
  hideActions?: boolean;
}

const ScenePlanIntroPanel = forwardRef<
  ScenePlanIntroPanelHandle,
  ScenePlanIntroPanelProps
>(function ScenePlanIntroPanel(
  {
    sceneId,
    pageKey,
    title = '场景方案介绍',
    editableOnly = false,
    actionButtonType = 'primary',
    layout = 'panel',
    editorMinHeight,
    hideActions = false
  },
  ref
) {
  const [editing, setEditing] = useState(editableOnly);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState('');
  const [updateTime, setUpdateTime] = useState<string>();

  useEffect(() => {
    const intro = getScenePlanIntro(pageKey, sceneId);
    setSaved(intro.content);
    setDraft(intro.content);
    setUpdateTime(intro.updateTime);
    setEditing(editableOnly);
  }, [pageKey, sceneId, editableOnly]);

  const isEmpty = useMemo(() => isEmptyMarkdownContent(saved), [saved]);

  const persistDraft = (options?: { silent?: boolean }) => {
    const result = saveScenePlanIntro(pageKey, sceneId, draft);
    setSaved(result.content);
    setUpdateTime(result.updateTime);
    if (!editableOnly) {
      setEditing(false);
    }
    if (!options?.silent) {
      Message.success(`${title}已保存`);
    }
  };

  const handleSave = () => {
    persistDraft();
  };

  useImperativeHandle(
    ref,
    () => ({
      save: () => persistDraft({ silent: true })
    }),
    [draft, pageKey, sceneId, title, editableOnly]
  );

  const handleCancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  const handleReset = () => {
    setDraft(saved);
  };

  const primaryBtnType = actionButtonType === 'outline' ? 'outline' : 'primary';
  const secondaryBtnType =
    actionButtonType === 'outline' ? 'outline' : 'default';

  const renderActions = () => {
    if (editableOnly) {
      return (
        <Space>
          {updateTime && (
            <Text type="secondary" className="text-[12px]">
              最近更新：{new Date(updateTime).toLocaleString()}
            </Text>
          )}
          <Button type={secondaryBtnType} onClick={handleReset}>
            重置
          </Button>
          <Button
            type={primaryBtnType}
            icon={<IconSave />}
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      );
    }

    return (
      <Space>
        {updateTime && !editing && (
          <Text type="secondary" className="text-[12px]">
            最近更新：{new Date(updateTime).toLocaleString()}
          </Text>
        )}
        {editing ? (
          <>
            <Button type={secondaryBtnType} onClick={handleCancel}>
              取消
            </Button>
            <Button
              type={primaryBtnType}
              icon={<IconSave />}
              onClick={handleSave}
            >
              保存
            </Button>
          </>
        ) : (
          <Button
            type={primaryBtnType}
            icon={<IconEdit />}
            onClick={() => setEditing(true)}
          >
            编辑
          </Button>
        )}
      </Space>
    );
  };

  const resolvedEditorMinHeight =
    editorMinHeight ?? (layout === 'simple' ? 120 : 360);

  const renderBody = () => {
    if (editableOnly || editing) {
      return (
        <MarkdownEditor
          value={draft}
          onChange={setDraft}
          minHeight={resolvedEditorMinHeight}
        />
      );
    }

    if (isEmpty) {
      return <Empty description="暂无内容" className="py-16" />;
    }

    return <MarkdownContent content={saved} className={styles.preview} />;
  };

  const isSimple = layout === 'simple';

  return (
    <div className={isSimple ? styles.panelSimple : styles.panel}>
      <div className={isSimple ? styles.headerSimple : styles.header}>
        <div className={isSimple ? styles.titleSimple : styles.title}>
          {title}
        </div>
        {!hideActions ? renderActions() : null}
      </div>

      <div className={isSimple ? styles.bodySimple : styles.body}>
        {renderBody()}
      </div>
    </div>
  );
});

export default ScenePlanIntroPanel;
