import React from 'react';

export default function InfoModal({
  params, // { a: xx, b: xx, c: xx, d: xx }
  title,
  content,
  onOk
}) {
  // 计算百分比还原（假设 a+b+c+d 总和为 100%）
  const total =
    (params?.a ?? 0) + (params?.b ?? 0) + (params?.c ?? 0) + (params?.d ?? 0);
  const getPercent = (val) =>
    total > 0 ? ((val / total) * 100).toFixed(2) + '%' : '0%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-2 text-xl font-bold">{title}</div>
        <div className="mb-4 text-gray-600">{content}</div>
        <div className="mb-6 space-y-2">
          {Object.entries(params || {}).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize">{key}：</span>
              <span>
                {val}（<span className="text-blue-600">{getPercent(val)}</span>
                ）
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow transition hover:bg-blue-700"
            onClick={onOk}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
