import React from 'react';
import { Modal, Button, Typography } from '@arco-design/web-react';
import './ExampleCodeModal.scss';

const { Title, Paragraph, Text } = Typography;

interface ExampleCodeModalProps {
  visible: boolean;
  onCancel: () => void;
  onCopyCode: (code: string) => void;
}

const ExampleCodeModal: React.FC<ExampleCodeModalProps> = ({
  visible,
  onCancel,
  onCopyCode
}) => {
  const exampleCode = `
# ==============================================================================
#  欢迎使用多模态数据治理平台 - PySpark 开发示例代码
# ==============================================================================
# 
#  场景：知识库加工
#
#  1. 数据导入     ->  从数据目录中加载一篇原始的文本文档。
#  2. 文档解析     ->  将文档解析为元素（将文档解析为图片、文本、表格、公式等基本元素）
#  3. 文档分段     ->  基于策略将元素分成多个分片，并进行AI增强
#  4. 向量化       ->  将知识库分块的数据进行向量化，用于最终的知识库检索
#  5. 保存数据集   ->  将处理好的知识库保存，供后续问答等应用使用。
# ==============================================================================


# -----------------------------数据导入---------------------------------

# 导入算子并加载为DataFrame
from core.operator.rag.load_data import load_operator

# [必填] 文件或文件夹路径列表 uuid
path_id = ["742b363437564412becb88289e0e3918"]

# [可选, 默认True] 是否递归扫描子文件夹，默认仅支持3层递归深度
# recursive = False

# [可选, 默认全部支持] 允许加载的文件扩展名白名单
# file_extensions = ["txt", "pdf"]

df = load_operator(spark, path_id, recursive=True, file_extensions=None)


# -----------------------------文档解析------------------------------

from core.operator.rag.parse_documents import parse_documents

# [必填, 默认 'balanced'] 解析的预设模式
# parsing_profile取值说明：
#   - fast: 极速纯文本模式，仅执行最基础的文本层提取，不进行版面分析或多模态内容处理
#   - balanced: 平衡模式（推荐），启用完整的版面分析，能精确识别标题、段落、列表，并提取表格和图片
#   - quality: 全面深度解析模式，启用所有高级功能，包括公式识别和VLM图片语义理解
#   - custom: 自定义模式，所有预设将被忽略，用户需手动配置下方所有详细参数
parsing_profile = "custom"

# 当 parsing_profile 取值为"custom"时，custom_parameters 必填
# text_settings (仅当 parsing_profile = custom 时手动设置)
#   - method：[条件必填, 默认 'text_layer_only'] 
#       - text_layer_only(速度最快) 仅从文本层提取，永不使用OCR
#       - use_ocr: 优先从文本提取，同时使用OCR识别
#       - use_vlm_ocr：会同时调用视觉语言模型和ocr进行内容识别
#   - ocr_languages：[可选, 默认 ["chi_sim", "eng"]] 当触发OCR时，指定要识别的语言列表
# extract_rules 定义提取的文档元素【必选】
#   - extract_tables：[可选] output_format: string [默认 'markdown'] 表格结构化的输出格式，可选 'markdown', 'image'
#   - extract_formulas：[可选] output_format：LaTex或image
#   - extract_images：[可选, 默认 True] 将文档中的图片提取为图片
custom_parameters = {
    "parsing_profile": "custom",
    "text_settings": {
        "method": "text_layer_only",
        "ocr_languages": ["chi_sim", "eng"]
    },
    "extract_rules": {
        "extract_tables": {"enabled": True, "output_format": "image"},
        "extract_formulas": {"enabled": True, "output_format": "image"},
        "extract_images": {"enabled": True}
    }
}

df = parse_documents(df, parsing_profile, custom_parameters)


# -----------------------------文档分块------------------------------
from core.operator.rag.chunk import chunk

# 方式2：使用自定义模式（高级用户）
# 自定义模式，允许用户手动选择具体的分块方法，并对所有尺寸进行微调
strategy_mode = "custom"

# chunk_rule: [条件必填, 默认 'by_chapter'] 指定具体的分块方法
#   - by_character_length：固定长度切分
#   - by_delimiter：按分隔符切分，默认 \\n\\n，支持用户指定
#   - by_sentence：按句子切分
#   - by_chapter：按章节切分
#   - recursive：按递归切分
#   - semantic：按语义相似度切分
# size_control: 
#   - target_size: 目标块大小，默认600字符
#   - max_size: 最大块大小，硬性限制，默认800字符
#   - overlap: 块间重叠，默认50字符
custom_parameters_chunk = {
    "chunk_rule": {"rule": "by_chapter", "delimiter": ""},
    "size_control": {
        "target_size": 600,
        "max_size": 800,
        "overlap": 50
    },
    "ai_enhancements": {
        # [可选, 默认 False] 大模型针对分块内容进行的AI总结
        "enable_summary": False,
        # [可选, 默认 False] 大模型针对分块内容生成的假设性问答
        "enable_question_answer": False,
        # [可选, 默认 False] 是否启用实体抽取，开启后会从每个知识块中识别并提取出关键实体与实体间关系，用于增强检索的精确度
        "enable_entity_extraction": False,
        # 标签，用户输入标签名称列表（标签名称需来自标签管理公共服务中的标签名称，否则不会实际生效），用于过滤检索
        "label_list": []
    }
}
df, custom_parameters_chunk_save = chunk(df, strategy_mode, custom_parameters_chunk)


# -----------------------------向量化---------------------------------

from core.operator.atom.rag_embedding.embedding import Embedding

# [必填] 指定需要进行向量化的元数据字段列表
# 如["content"]或["content", "extra_data"]
# content切片内容；extra_data切片增强的内容
fields_to_embed = ["content", "extra_data"]

# [必填] 嵌入模型标识符，需确保该模型已在平台中配置
embedding_model_name = "text-embedding-model"

# 该算子会将fields_to_embed中指定的字段拼接后进行向量化，生成的向量存储在vector列中
df = Embedding.generate_embeddings(df, fields_to_embed, embedding_model_name)


# -----------------------------数据保存---------------------------------

# 场景1：将DataFrame保存为平台知识库
from core.operator.base.save_dataset import SaveDataSet

name = "示例知识库"
chunk_rule = custom_parameters_chunk_save['chunk_rule']['rule']
# scene场景名称支持：RAG知识库
# 用户设置的场景未匹配到时，自动设置成其他
df = SaveDataSet.pyspark_save_rag(df,name, path_id, chunk_rule, description="", scene="RAG知识库", tag_names=[])


`;

  return (
    <Modal
      title="示例代码"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      className="example-code-modal"
      style={{ width: 900 }}
      closable
    >
      <div className="example-modal-content">
        <div className="example-intro">{exampleCode}</div>

        <div className="modal-footer">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => onCopyCode(exampleCode)}>
            复制并关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExampleCodeModal;
