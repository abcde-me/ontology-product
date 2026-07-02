import { useEffect } from 'react';
import { useGraphDeleteActions } from '../hooks/useGraphDeleteActions';
import graphStyles from '../index.module.scss';

const isInputTarget = (target: EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
};

const isGraphTarget = (target: EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(`.${graphStyles['ai-workflow']}`) ||
      target.closest('#aiWorkflowContainer')
  );
};

export default function GraphDeleteKeyHandler() {
  const { confirmDeleteSelection, getDeleteNodeTargets, getDeleteLinkTargets } =
    useGraphDeleteActions();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      if (isInputTarget(event.target)) {
        return;
      }

      const hasDeleteTargets =
        getDeleteNodeTargets().length > 0 || getDeleteLinkTargets().length > 0;

      if (!isGraphTarget(event.target) && !hasDeleteTargets) {
        return;
      }

      if (!hasDeleteTargets) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      confirmDeleteSelection();
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [confirmDeleteSelection, getDeleteLinkTargets, getDeleteNodeTargets]);

  return null;
}
