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
  const exampleCode = `# ==============================================================================
#  欢迎使用多模态数据治理平台 - PySpark 开发示例代码 (定制版)
# ==============================================================================
# 
#  本示例将引导您完成一个完整的文本数据处理流程：
#
#  1. 读取源数据   ->  从数据目录中加载一篇原始的文本文档。
#  2. 文本切片     ->  将长文本智能切分为独立的句子，保留语义完整性。
#  3. 数据清洗     ->  对切分后的句子进行统一大小写的基础清洗。
#  4. 数据增强     ->  利用大语言模型(LLM)为每个句子生成一个相关问题，构建Q&A对。
#  5. 保存数据集   ->  将处理好的高质量Q&A数据集保存，供后续模型训练使用。
#
#  您可以直接点击上方的 [▷ 运行] 按钮运行该示例笔记。
#
# ==============================================================================


# ------------------------------------------------------------------------------
#  第一步：读取源数据
# ------------------------------------------------------------------------------
#  说明：我们首先使用 "读取文本文件并解析" 算子，加载指定的原始文本文件。
#         这是所有数据处理流水线的起点。
#         您需要将 'file_uuids' 中的示例ID替换为您自己上传的文件ID。
# ------------------------------------------------------------------------------

# 导入平台封装的读取模块
from model.schema import reader_schema
from core.operator.base.read import SparkRead
from core.operator.map.read_text import ReadMap as rt

print("--> 步骤 1: 开始读取原始文本文件...")

# 配置需要读取的文件ID (payload)
payload = {'file_uuids': ['918adb9e-8a3b-4601-821e-a2215095adc4']} # <-- 请替换为您自己的文件UUID

# 执行读取操作，返回一个包含文件内容的 DataFrame
raw_df = SparkRead.operator_reader(spark, payload, rt.read_text_map, reader_schema, "src")

print("    原始数据加载成功！")
raw_df.show(5, truncate=True)


# ------------------------------------------------------------------------------
#  第二步：文本切片
# ------------------------------------------------------------------------------
#  说明：长文本不适合直接处理，我们使用 "句子切片" 算子将其分割成语义完整的单元。
#         这比简单的定长切片更能保留上下文信息。
# ------------------------------------------------------------------------------

# 导入句子切片模块和数据结构(schema)
from model.schema import chunk_schema
from core.operator.atom.chunks.sentence_chunk import sentence_chunk_batch

print("\n--> 步骤 2: 开始进行句子切片...")

# 对原始 DataFrame 的 RDD 执行句子切片操作
chunked_rdd = sentence_chunk_batch(raw_df.rdd)

# 将切片后的 RDD 转换回 DataFrame
chunked_df = spark.createDataFrame(chunked_rdd, chunk_schema)

print(f"    文本切片完成！原始1篇文档被切分为 {chunked_df.count()} 个句子。")
chunked_df.show(10, truncate=True)


# ------------------------------------------------------------------------------
#  第三步：数据清洗
# ------------------------------------------------------------------------------
#  说明：为了提升数据质量，我们进行一项基础清洗：
#         将所有英文字母转换为小写，便于后续模型统一处理。
# ------------------------------------------------------------------------------

# 导入清洗算子模块
from core.operator.atom.clean.convert_lower import convert_lower

print("\n--> 步骤 3: 开始数据清洗...")

# 将所有文本转换为小写
cleaned_df = convert_lower(chunked_df.rdd).toDF(chunked_df.schema)
print(f"    文本已全部转换为小写。共 {cleaned_df.count()} 条数据进入下一步。")
cleaned_df.show(10, truncate=True)


# ------------------------------------------------------------------------------
#  第四步：LLM 数据增强
# ------------------------------------------------------------------------------
#  说明：这是最关键的一步。我们调用 "通用生成" (textConversation) 任务，
#         让AI为每一句陈述生成一个相关的问题，构建成Q&A数据集。
# ------------------------------------------------------------------------------

# 导入大模型生成算子和数据类型模块
from core.operator.atom.llm_generate import llm_generate
from pyspark.sql.types import StringType

print("\n--> 步骤 4: 调用大模型进行数据增强...")

# 配置任务类型为 "通用生成" (textConversation)，更符合生成式任务的语义
task_type = "textConversation"

# 设置算子参数
# userDefined: 此处为None，使用平台内置的通用生成Prompt。
# generationCount: 为每条输入数据生成1个结果。
parameters = {"userDefined": None, "generationCount":1}

# 为DataFrame动态添加新列的定义，以匹配'textConversation'算子输出的Schema
# 算子会生成'instruction', 'context', 和 'response'三列
temp_schema = cleaned_df.schema
temp_schema.add("augment", StringType(), True)
temp_schema.add("instruction", StringType(), True)
temp_schema.add("context", StringType(), True)
final_schema = temp_schema.add("response", StringType(), True)

# 执行LLM生成操作，并将结果转换为DataFrame
generated_df = llm_generate(cleaned_df.rdd, task_type, parameters, url=None).toDF(final_schema)

# 将输出整理成标准的Q&A格式：'question' 和 'answer'
# 'response' 列是生成的问题，'context' 列是原始的句子（答案）
qa_df = generated_df.select(
    generated_df.response.alias("question"), 
    generated_df.context.alias("answer")
)

print("    数据增强完成！成功为每个句子生成了对应的问题。")
qa_df.show(10, truncate=False, vertical=True)


# ------------------------------------------------------------------------------
#  第五步：保存处理成果
# ------------------------------------------------------------------------------
#  说明：我们将最终生成的Q&A数据集保存到平台的数据集管理中，以便随时复用。
# ------------------------------------------------------------------------------

# 导入数据保存模块
from core.operator.base.write import SparkWrite

print("\n--> 步骤 5: 开始保存处理后的数据集...")

# 执行保存操作
final_df = SparkWrite.df_save_dataset(qa_df)

print("==============================================================================")
print("🎉 恭喜！所有步骤已成功完成！")
print("一份高质量的Q&A数据集已生成，您可以点击【导出数据集】按钮将数据创建为平台的数据集，之后您可以在左侧'数据集管理'中查看。")
print("==============================================================================")
final_df.show(1, truncate=False, vertical=True)`;

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
