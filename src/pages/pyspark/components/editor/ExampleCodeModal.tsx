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
#  欢迎使用多模态数据治理平台 - PySpark 开发示例代码
# ==============================================================================
# 
#  本示例将引导您完成一个完整的文本数据处理流程：
#
#  1. 读取源数据   ->  从数据目录中加载一篇原始的文本文档。
#  2. 文本切片     ->  将长文本智能切分为独立的句子，保留语义完整性。
#  3. 数据清洗     ->  对切分后的句子进行基础清洗。
#  4. 数据增强     ->  利用大语言模型(LLM)为每个句子生成一个相关问题，构建Q&A对。
#  5. 保存数据集   ->  将处理好的高质量Q&A数据集保存，供后续模型训练使用。
#
#  您可以直接点击上方的 [▷ 运行] 按钮运行该示例笔记。
#
# ==============================================================================


# 读取文本文件并解析成DataFrame
from model.schema import reader_schema
from core.operator.base.read import SparkRead
from core.operator.map.read_text import ReadMap as rt

payload = {'file_uuids': ['e0200e86-b028-4e01-b862-cf821e37e15b']}
# 读取数据集的指定文件 dataset
# 读取源目录的指定文件 src
# 读取目标目录的指定文件 dst
df = SparkRead.operator_reader(spark, payload, rt.read_text_map, reader_schema, "src")
df.show() 

# 按段落对文本进行切片
from model.schema import chunk_schema
from core.operator.atom.chunks.paragraph_chunk import paragraph_chunk_batch

rdd = paragraph_chunk_batch(df.rdd)
df = spark.createDataFrame(rdd, chunk_schema)
df.show()


# 过滤掉文本长度小于10个字符的数据
from core.operator.atom.clean.data_filter import data_filter

df = data_filter(df.rdd, 10).toDF(df.schema)
df.show()

# 根据生成策略对数据进行分批
from core.operator.atom.augment.generation_strategy import generation_strategy

# n_generate=10，需要生成的样本数
df, n = generation_strategy(df, 20)  # 返回的n指单次请求大模型生成的数据条数，取值[1-5]
df.show()

# 调用大模型执行增强任务
from core.operator.atom.llm_generate import llm_generate
from pyspark.sql.types import StringType

# 执行增强任务 (通用生成)
task_type = "textConversation"
# userDefined自定义提示词；generationCount单次请求大模型生成的数据条数，取值[1-5]，默认是3
parameters = {"userDefined": None, "generationCount":n}

# 添加新生成的字段
df.schema.add("augment", StringType(), True)
df.schema.add("instruction", StringType(), True)
df.schema.add("context", StringType(), True)
schema = df.schema.add("response", StringType(), True)

df = llm_generate(df.rdd, task_type, parameters, url=None).toDF(schema)
df = df.select("instruction","context","response")
df.show()

# 将DataFrame保存为平台数据集
from core.operator.base.write import SparkWrite

# 选择单列
# df = df.select("content")
# 选择多列
# df = df.select("content","augment")
df = SparkWrite.df_save_dataset(df)
df.show()`;

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
