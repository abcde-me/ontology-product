import React from 'react';
import TextTruncate from '@/pages/dataMarket/components/components/TextTruncate';
import { Popover, Button } from '@arco-design/web-react';
function TagContent(props) {
  const { tagList } = props;
  return (
    <div className="flex items-center">
      {tagList &&
        tagList
          .flatMap((item) =>
            item.values.map((value) => `${item.key_name}:${value.value}`)
          )
          .slice(0, 3)
          .map((tagText, index) => {
            return (
              <div
                key={index}
                className="mr-2 rounded-[4px] bg-[#E7ECF0] p-[1px_4px]"
              >
                <TextTruncate text={tagText} maxW="85px"></TextTruncate>
              </div>
            );
          })}
      {tagList &&
        tagList.flatMap((item) =>
          item.values.map((value) => `${item.key_name}:${value.value}`)
        ).length > 3 && (
          <Popover
            content={
              <div className="flex w-[300px] flex-wrap items-center">
                {tagList
                  .flatMap((item) =>
                    item.values.map(
                      (value) => `${item.key_name}:${value.value}`
                    )
                  )
                  .slice(3)
                  .map((tagText, index) => (
                    <div
                      key={index}
                      className="mb-2 mr-2 rounded-[4px] bg-[#E7ECF0] p-[1px_4px]"
                    >
                      <TextTruncate text={tagText} maxW="90px" />
                    </div>
                  ))}
              </div>
            }
          >
            <div className="mr-6 flex h-[20px] max-w-[40px] cursor-pointer items-center justify-center rounded-[4px] bg-[#E7ECF0] p-[1px_4px] text-xs">
              +
              {tagList.flatMap((item) =>
                item.values.map((value) => `${item.key_name}:${value.value}`)
              ).length - 3}
            </div>
          </Popover>
        )}
    </div>
  );
}

export default TagContent;
