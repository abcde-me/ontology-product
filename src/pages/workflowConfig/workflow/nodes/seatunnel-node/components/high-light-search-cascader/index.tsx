import React, { useEffect, useMemo, useState } from 'react';
import { Cascader, CascaderProps } from '@arco-design/web-react';

function highlight(label: string, keyword?: string) {
  if (!keyword) return label;

  const reg = new RegExp(`(${keyword})`, 'ig');
  const parts = label.split(reg);

  return (
    <>
      {parts.map((part, index) =>
        reg.test(part) ? (
          <span key={index} className={'text-[#FF981A]'}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

type CascaderOption = {
  label: React.ReactNode;
  value: React.Key;
  children?: CascaderOption[];
};

function filterCascaderOptions(
  options: CascaderOption[],
  keyword: string
): CascaderOption[] {
  const lower = keyword.toLowerCase();

  const dfs = (nodes: CascaderOption[]): CascaderOption[] => {
    const res: CascaderOption[] = [];

    for (const node of nodes) {
      const labelText = String(node.label).toLowerCase();

      // 递归过滤子节点
      const filteredChildren = node.children ? dfs(node.children) : [];

      // 命中条件：自己命中 或 子节点命中
      if (labelText.includes(lower) || filteredChildren.length > 0) {
        res.push({
          ...node,
          children: filteredChildren.length ? filteredChildren : node.children
        });
      }
    }

    return res;
  };

  return dfs(options);
}

export const HighLightSearchCascader = (props: CascaderProps) => {
  const [searchWords, setSearchWords] = useState<string>();
  const [currentOptions, setCurrentOptions] = useState<any[]>();
  const { options, ...otherProps } = props;
  useEffect(() => {
    /**
     * 检测当前是否存在搜索词
     * 存在则返回所有的包含搜索词的option
     * 不存在则返回初始options
     */
    if (!searchWords) return setCurrentOptions(options);
    setCurrentOptions(filterCascaderOptions(options as any, searchWords));
  }, [options, searchWords]);
  return (
    <Cascader
      {...otherProps}
      options={currentOptions}
      onSearch={setSearchWords}
      showSearch
      renderFormat={(valueShow) => `${valueShow.join(' > ')}`}
      renderOption={(option, level) => {
        return highlight(option.label, searchWords);
      }}
    />
  );
};
