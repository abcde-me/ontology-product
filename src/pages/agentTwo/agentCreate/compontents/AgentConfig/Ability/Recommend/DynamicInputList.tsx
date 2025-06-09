import React, { useState } from 'react';
import { Input, Button } from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import { useDebounce } from 'ahooks';
import { useAgentEditor } from '../../../AgentProvider/Context';
import { useParams } from '@/hooks/useParmas';
type InputItem = {
  value: string;
  id: string;
};

const MAX = 3;
const DEBOUNCE_DELAY = 300;

const DynamicInputList: React.FC = () => {
  const id = useParams('id');
  const agent = useAgentEditor();
  const { recommend = [], recommendStatus } = agent.abilityStore.useGetState();
  const [inputs, setInputs] = useState<InputItem[]>(
    recommend.length ? recommend : [{ value: '', id: Date.now().toString() }]
  );

  // 只对最后一个输入框做防抖
  const lastInput = inputs?.[inputs.length - 1];
  const lastValue = lastInput?.value || '';
  const debouncedLastValue = useDebounce(lastValue, { wait: DEBOUNCE_DELAY });

  React.useEffect(() => {
    if (recommend && recommend.length) {
      setInputs(recommend);
    }
  }, [recommend]);

  // 监听防抖后的 value，决定是否添加新输入框
  React.useEffect(() => {
    if (debouncedLastValue && inputs?.length < MAX) {
      setInputs((prev) => {
        // 防止重复添加
        if (prev?.length < MAX && prev[prev.length - 1]?.value) {
          return [
            ...prev,
            { value: '', id: Date.now().toString() + Math.random() }
          ];
        }
        return prev;
      });
    }
  }, [debouncedLastValue]);

  // 处理输入变化
  const handleChange = (idx: number, v: string) => {
    if (!inputs) return;
    setInputs((current) => {
      const newInputs = [...current];
      newInputs[idx].value = v;
      agent.abilityStore.setRecommend(newInputs);
      agent.infoStore.updateAgentConfigData(id);
      return newInputs;
    });
  };

  // 删除输入框
  const handleRemove = (idx: number) => {
    if (!inputs || inputs.length <= 1) return;
    const newInputs = inputs.filter((_, i) => i !== idx);
    // 保证最后一个是空输入框
    if (
      newInputs?.length < MAX &&
      (newInputs.length === 0 || newInputs[newInputs.length - 1]?.value !== '')
    ) {
      newInputs.push({ value: '', id: Date.now().toString() });
    }
    setInputs(newInputs);
    agent.abilityStore.setRecommend(newInputs);
    agent.infoStore.updateAgentConfigData(id);
  };

  if (!inputs?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {inputs.map((item, idx) => {
        const canDelete =
          item?.value?.length > 0 &&
          !(idx === inputs.length - 1 && item.value === '') &&
          inputs.length > 1;
        return (
          <div
            key={item.id}
            className="relative flex items-center rounded border border-gray-200 bg-white"
          >
            <Input
              className="flex-1 border-none shadow-none"
              value={item.value}
              onChange={(v) => handleChange(idx, v)}
              placeholder="请输入内容"
              maxLength={50}
            />
            <Button
              icon={
                <IconClose className="cursor-pointer text-gray-400 transition-colors group-hover:text-blue-600" />
              }
              size="mini"
              type="text"
              disabled={!canDelete}
              onClick={() => handleRemove(idx)}
              className="group"
            />
            {recommendStatus && (
              <div
                className="absolute inset-0 z-10 cursor-not-allowed rounded bg-gray-100 bg-opacity-60"
                style={{ pointerEvents: 'auto' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicInputList;
