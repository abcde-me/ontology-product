import MarkdownBase from '@/components/markdownBase';
import {
  Empty,
  Input,
  Message,
  Pagination,
  Spin,
  Switch,
  Tooltip
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircle,
  IconCloseCircleFill,
  IconDelete,
  IconEdit
} from '@arco-design/web-react/icon';
import React, { useEffect, useRef, useState } from 'react';
import TextTruncate from '../TextTruncate';
import brother from '../brother';
import { apiHierarchicalCatalogEdit } from '@/api/datasetsV2';
import TagContent from '../tagContent';

interface FileSublevel {
  segmentationlist: any;
  segmentationlistId: string;
  hoveredIndex: any;
  pagination: any;
  filedetail: any;
  funcSegmentation;
  setHoveredIndex;
  addModelOpenManage;
  segmentationOperation;
  handleChangeChild;
  onChangeSup;
  handlePaginationChange;
  onInit;
  docOperation;
}

const FileSublevel: React.FC<FileSublevel> = ({
  segmentationlist,
  segmentationlistId,
  funcSegmentation,
  pagination,
  setHoveredIndex,
  hoveredIndex,
  addModelOpenManage,
  segmentationOperation,
  handleChangeChild,
  onChangeSup,
  handlePaginationChange,
  filedetail,
  onInit,
  docOperation
}) => {
  const [inputValue, setinputValue] = useState('');
  const [hoveredInputIndex, setHoveredInputIndex] = useState(null); // 用于保存当前悬浮的索引
  const [editType, setEditType] = useState();
  const messType = useRef(false);
  const containerRef = useRef<any>([]);

  useEffect(() => {
    brother.on('setSonTreeData', (item) => {
      setEditType(item.indexing_status);

      if (messType.current == true && item.indexing_status == 'completed') {
        Message.success({
          id: '1',
          content: '修改成功'
        });
        messType.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (segmentationlistId && containerRef.current) {
      const index = segmentationlist.findIndex(
        (item) =>
          item.id === segmentationlistId || item.title_id === segmentationlistId
      );
      scrollToTop(index);
    }
  }, [segmentationlistId]);

  // 用来让某个 div 滑动到顶部的函数
  const scrollToTop = (index) => {
    // 获取当前索引对应的 div
    const targetDiv = containerRef.current[index];
    if (targetDiv) {
      targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const onClickInput = (index, value) => {
    setHoveredInputIndex(index);
    setinputValue(value);
  };
  const handleChange = (value) => {
    setinputValue(value);
  };
  const onBlurFunc = async (value, item) => {
    const params = {
      catalogs: [
        {
          title_id: item.title_id,
          title: value
        }
      ]
    };
    await apiHierarchicalCatalogEdit(item.dataset_id, item.document_id, params);
    await onInit();
    Message.info({
      content: '修改已提交，请等待向量化完成...',
      id: '1',
      duration: 0
    });
    messType.current = true;
    setHoveredInputIndex(null);
  };
  const handleMouseEnter = (index) => {
    // 当 docOperation.type 为 true 时，不设置 hoveredIndex，直接置为 null
    if (docOperation.indexing_status !== 'completed') {
      setHoveredIndex(null);
    } else {
      setHoveredIndex(index);
    }
  };
  const getTagStatus = (status, taglist) => {
    if (status === 0 || status === 3) {
      return <TagContent tagList={taglist ? taglist : []} />;
    } else if (status === 2 || status === 1) {
      return <Spin />;
    } else if (status === 4) {
      return (
        <Tooltip content="切片标签生成失败">
          <IconCloseCircle style={{ color: 'red' }} />
        </Tooltip>
      );
    }
    return null;
  };
  return (
    <div className="Filesegmentationscoll">
      {segmentationlist.length > 0 ? (
        <div>
          {segmentationlist.map((e, index) => {
            let leftMarginClass;
            if (e.level) {
              leftMarginClass = (e.level - 1) * 12;
            } else {
              leftMarginClass = 0;
            }

            return (
              <div
                key={index}
                ref={(el) => (containerRef.current[index] = el)}
                style={{ marginLeft: `${leftMarginClass}px` }}
              >
                {e.title ? (
                  filedetail?.process_rule?.mode == 'split_by_title' ? (
                    <div
                      className={` font-pingfang text-14 text-dark-gray leading-22 flex h-[32px] items-center font-semibold `}
                      onClick={() => onClickInput(index, e.title)} // 点击事件 // 点击切换选中状态
                    >
                      {hoveredInputIndex === index &&
                      editType == 'completed' ? (
                        <Input
                          value={inputValue}
                          onChange={(value) => handleChange(value)}
                          onBlur={(i) => onBlurFunc(i.target.value, e)}
                        />
                      ) : (
                        <TextTruncate
                          text={e.title}
                          clientHeight={2}
                        ></TextTruncate>
                      )}
                    </div>
                  ) : null
                ) : null}
                <div
                  key={index}
                  className={`segmentation-box mt-[8px] ${segmentationlistId === e.id ? 'highlight-blue' : ''} `}
                  onClick={() => funcSegmentation(e)}
                >
                  <div className="segmentation-header">
                    <div className="s-l flex items-center">
                      <span>
                        切片数：
                        {(pagination.page - 1) * pagination.limit + (index + 1)}
                        /{pagination.total}
                      </span>
                      <span className="sp">字符数：{e.word_count}</span>
                      <div className="ml-2 w-[220px]">
                        {getTagStatus(e.tag_status, e.tags)}{' '}
                      </div>
                    </div>

                    <div
                      // className='s-rr'
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={hoveredIndex === index ? 's-rr' : 's-r'}
                    >
                      {hoveredIndex != index ? (
                        <div className="s-r-t">
                          {e.enabled == true ? (
                            <>
                              <IconCheckCircleFill
                                style={{ color: '#0AB58D' }}
                              />
                              <span className="ml-2">启用</span>
                            </>
                          ) : (
                            <>
                              <IconCloseCircleFill style={{ color: 'red' }} />
                              <span className="ml-2">禁用</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="s-r-f">
                          <Tooltip content="编辑切片">
                            <IconEdit
                              className="ml-3 h-4 w-4"
                              onClick={() => addModelOpenManage('edit', e)}
                            />
                          </Tooltip>
                          <Tooltip content="删除切片">
                            <IconDelete
                              className="ml-3 h-4 w-4"
                              onClick={() => segmentationOperation(e, 'delete')}
                            />
                          </Tooltip>

                          <Switch
                            checked={e.enabled}
                            onChange={() => handleChangeChild(e)}
                            className="btnCs"
                            checkedText="启用"
                            uncheckedText="禁用"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="segmentation-content">
                    <MarkdownBase
                      content={e.content}
                      onChangeSup={onChangeSup}
                    ></MarkdownBase>
                  </div>
                </div>
              </div>
            );
          })}
          {filedetail?.process_rule?.mode !== 'split_by_title' ? (
            <Pagination
              size={'mini'}
              total={pagination.total}
              current={pagination.page}
              pageSize={pagination.limit}
              showTotal
              showJumper
              sizeCanChange
              onChange={handlePaginationChange}
            />
          ) : null}
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
};
export default FileSublevel;
