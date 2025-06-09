import React, { useState, useRef, useEffect } from 'react';
import { memo } from 'react';

const TextExpander = ({ text, lineClamp = 8 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseInt(
        getComputedStyle(contentRef.current).lineHeight,
        10
      );
      const maxHeight = lineHeight * lineClamp;
      const actualHeight = contentRef.current.scrollHeight;

      setShouldShowToggle(actualHeight > maxHeight);
    }
  }, [lineClamp, text]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <div
        ref={contentRef}
        className="break-words font-sans text-[12px] text-base leading-relaxed"
        style={
          !isExpanded && shouldShowToggle
            ? {
                display: '-webkit-box',
                WebkitLineClamp: lineClamp,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }
            : {}
        }
      >
        {text}
      </div>
      {shouldShowToggle && (
        <button
          onClick={toggleExpand}
          className="mt-2 text-[#438DFB] transition-colors duration-200 focus:outline-none"
        >
          {isExpanded ? '收起' : '展开全部'}
        </button>
      )}
    </div>
  );
};

export default memo(TextExpander);
