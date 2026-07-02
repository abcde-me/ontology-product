/** GetTemplateFile 入参 file_name 与模板类型 */
export type OntologyCsvTemplateName = 'object_type' | 'link_type';

/** 旧版竖式模板表头（兼容历史文件） */
export const LEGACY_ONTOLOGY_CSV_TEMPLATE_HEADERS = [
  'field_id',
  'field_comment',
  'field_type'
] as const;

export interface OntologyCsvTemplateColumn {
  name: string;
  type: string;
  comment: string;
}

export interface OntologyCsvTemplateSampleRow {
  values: string[];
}

export interface OntologyCsvTemplateDefinition {
  columns: OntologyCsvTemplateColumn[];
  samples: OntologyCsvTemplateSampleRow[];
}

export interface ParsedOntologySchemaCsv {
  columnList: string[];
  commentList: string[];
  typeList: string[];
  path: string;
  instances: Record<string, unknown>[];
}

const FIELD_NAME_PATTERN = /^[A-Za-z_][\w]*$/;

const buildInstancesFromDataRows = (
  columnNames: string[],
  dataRows: string[][]
): Record<string, unknown>[] =>
  dataRows
    .map((row) => {
      const record: Record<string, unknown> = {};
      columnNames.forEach((columnName, index) => {
        record[columnName] = row[index] ?? '';
      });
      return record;
    })
    .filter((record) =>
      Object.values(record).some((value) => String(value ?? '').trim() !== '')
    );

/**
 * 标准导入模板（横向）：
 * - 第 1 行：英文名称
 * - 第 2 行：字段类型
 * - 第 3 行：字段注释
 * - 第 4 行起：数据实例
 */
export const ONTOLOGY_CSV_TEMPLATE_DEFINITIONS: Record<
  OntologyCsvTemplateName,
  OntologyCsvTemplateDefinition
> = {
  object_type: {
    columns: [
      { name: 'id', type: 'int', comment: 'id' },
      { name: 'username', type: 'varchar(50)', comment: '用户名' },
      { name: 'age', type: 'int', comment: '年龄' },
      { name: 'city', type: 'varchar(50)', comment: '城市' },
      { name: 'occupation', type: 'varchar(50)', comment: '职业' }
    ],
    samples: [
      { values: ['1', '张三', '28', '北京', '程序员'] },
      { values: ['2', '李四', '32', '上海', '产品经理'] },
      { values: ['3', '王五', '25', '广州', '设计师'] }
    ]
  },
  link_type: {
    columns: [
      { name: 'source_id', type: 'varchar(500)', comment: '源对象ID' },
      { name: 'target_id', type: 'varchar(500)', comment: '目标对象ID' },
      { name: 'update_time', type: 'datetime(6)', comment: '更新时间' }
    ],
    samples: [
      { values: ['user-001', 'product-001', '2024-01-01 10:00:00'] },
      { values: ['user-002', 'product-002', '2024-01-02 11:00:00'] }
    ]
  }
};

const escapeCsvCell = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const buildCsvLine = (cells: string[]) => cells.map(escapeCsvCell).join(',');

export const buildOntologyCsvTemplate = (
  fileName: OntologyCsvTemplateName
): string => {
  const definition = ONTOLOGY_CSV_TEMPLATE_DEFINITIONS[fileName];
  const lines = [
    buildCsvLine(definition.columns.map((column) => column.name)),
    buildCsvLine(definition.columns.map((column) => column.type)),
    buildCsvLine(definition.columns.map((column) => column.comment)),
    ...definition.samples.map((sample) => buildCsvLine(sample.values))
  ];

  return `${lines.join('\n')}\n`;
};

export const getOntologyCsvTemplate = (
  fileName: OntologyCsvTemplateName
): string => buildOntologyCsvTemplate(fileName);

export const getOntologyCsvTemplateDefinition = (
  fileName: OntologyCsvTemplateName
): OntologyCsvTemplateDefinition => ONTOLOGY_CSV_TEMPLATE_DEFINITIONS[fileName];

/** 本地/占位 Schema 路径（后端无法解析，不可用于正式保存） */
export const isDevSchemaFilePath = (filePath?: string | null) =>
  Boolean(filePath?.trim().startsWith('dev://'));

/** 图谱快速创建时写入的占位路径（不含真实 Schema，需重新上传或智能生成） */
export const isGraphObjectTypePlaceholderFilePath = (
  filePath?: string | null
) => Boolean(filePath?.trim().startsWith('dev://graph-object-type/'));

/** 图谱快速创建等场景使用的最小对象类型 Schema CSV */
export const buildMinimalObjectTypeSchemaCsv = () =>
  `${buildCsvLine(['id'])}\n${buildCsvLine(['int'])}\n${buildCsvLine(['主键'])}\n${buildCsvLine(['1'])}\n`;

export const createObjectTypeSchemaFile = (
  fileName: string,
  content = buildMinimalObjectTypeSchemaCsv()
) =>
  new File(['\uFEFF', content], fileName, {
    type: 'text/csv;charset=utf-8'
  });

/** 将模板定义转为标准横向 CSV 文本（含实例数据行） */
export const buildOntologyCsvTemplateFromDefinition = (
  definition: OntologyCsvTemplateDefinition
): string => {
  const lines = [
    buildCsvLine(definition.columns.map((column) => column.name)),
    buildCsvLine(definition.columns.map((column) => column.type)),
    buildCsvLine(definition.columns.map((column) => column.comment)),
    ...definition.samples.map((sample) => buildCsvLine(sample.values))
  ];

  return `${lines.join('\n')}\n`;
};

/** 将解析后的 Schema（含实例）还原为标准横向 CSV 文本 */
export const buildOntologySchemaCsvFromParsed = (
  parsed: Pick<
    ParsedOntologySchemaCsv,
    'columnList' | 'commentList' | 'typeList' | 'instances'
  >
): string => {
  const commentList =
    parsed.commentList.length === parsed.columnList.length
      ? parsed.commentList
      : parsed.columnList;
  const typeList =
    parsed.typeList.length === parsed.columnList.length
      ? parsed.typeList
      : parsed.columnList.map(() => 'varchar(255)');

  const lines = [
    buildCsvLine(parsed.columnList),
    buildCsvLine(typeList),
    buildCsvLine(commentList),
    ...parsed.instances.map((instance) =>
      buildCsvLine(
        parsed.columnList.map((column) => String(instance[column] ?? ''))
      )
    )
  ];

  return `${lines.join('\n')}\n`;
};

/** 将模板定义转为建模步骤可用的解析结果（与上传 CSV 结构一致） */
export const templateDefinitionToParsedSchema = (
  definition: OntologyCsvTemplateDefinition,
  fileName: OntologyCsvTemplateName = 'object_type'
): ParsedOntologySchemaCsv => {
  const columnList = definition.columns.map((column) => column.name);
  const typeList = definition.columns.map((column) => column.type);
  const commentList = definition.columns.map((column) => column.comment);
  const instances = buildInstancesFromDataRows(
    columnList,
    definition.samples.map((sample) => sample.values)
  );

  return {
    columnList,
    commentList,
    typeList,
    instances,
    path: `dev://ontology-schema/${fileName}/${Date.now()}.csv`
  };
};

const formatTemplateTimestamp = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

export const getOntologyCsvTemplateFileName = (
  fileName: OntologyCsvTemplateName,
  date = new Date()
) => `${fileName}_template_${formatTemplateTimestamp(date)}.csv`;

const normalizeCell = (value: string) => value.replace(/^\uFEFF/, '').trim();

const parseCsvContent = (content: string): string[][] => {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);

  return lines
    .map((line) => {
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];

        if (char === '"') {
          if (inQuotes && line[index + 1] === '"') {
            current += '"';
            index += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (char === ',' && !inQuotes) {
          cells.push(normalizeCell(current));
          current = '';
          continue;
        }

        current += char;
      }

      cells.push(normalizeCell(current));
      return cells;
    })
    .filter((cells) => cells.some((cell) => cell !== ''));
};

const isLegacyVerticalTemplate = (rows: string[][]) =>
  normalizeCell(rows[0]?.[0] || '') === LEGACY_ONTOLOGY_CSV_TEMPLATE_HEADERS[0];

const parseLegacyVerticalTemplate = (
  rows: string[][],
  fileName: OntologyCsvTemplateName
): ParsedOntologySchemaCsv => {
  const columnList: string[] = [];
  const commentList: string[] = [];
  const typeList: string[] = [];

  rows.slice(1).forEach((cells, index) => {
    if (cells.length < 3) {
      throw new Error(`第 ${index + 2} 行字段不完整，请使用标准导入模板`);
    }

    const [fieldName, fieldComment, fieldType] = cells;

    if (!FIELD_NAME_PATTERN.test(fieldName)) {
      throw new Error(
        `第 ${index + 2} 行英文名称「${fieldName}」格式不正确，仅支持字母、数字、下划线，且不能以数字开头`
      );
    }

    if (!fieldComment) {
      throw new Error(`第 ${index + 2} 行字段注释不能为空`);
    }

    if (!fieldType) {
      throw new Error(`第 ${index + 2} 行字段类型不能为空`);
    }

    columnList.push(fieldName);
    commentList.push(fieldComment);
    typeList.push(fieldType);
  });

  if (!columnList.length) {
    throw new Error('请按照标准导入模板至少填写一行属性定义');
  }

  return {
    columnList,
    commentList,
    typeList,
    instances: [],
    path: `dev://ontology-schema/${fileName}/${Date.now()}.csv`
  };
};

const parseHorizontalTemplateRows = (
  rows: string[][],
  fileName: OntologyCsvTemplateName
): ParsedOntologySchemaCsv => {
  if (rows.length < 3) {
    throw new Error(
      '请使用标准导入模板：第 1 行英文名称、第 2 行字段类型、第 3 行字段注释，第 4 行起为数据实例'
    );
  }

  const [nameRow, typeRow, commentRow] = rows;
  const columnCount = nameRow.length;

  if (columnCount === 0) {
    throw new Error('第 1 行英文名称不能为空');
  }

  if (typeRow.length !== columnCount || commentRow.length !== columnCount) {
    throw new Error('第 1-3 行列数需保持一致，请使用标准导入模板');
  }

  const columnList: string[] = [];
  const typeList: string[] = [];
  const commentList: string[] = [];

  nameRow.forEach((fieldName, index) => {
    const fieldType = typeRow[index];
    const fieldComment = commentRow[index];

    if (!fieldName) {
      throw new Error(`第 1 行第 ${index + 1} 列英文名称不能为空`);
    }

    if (!FIELD_NAME_PATTERN.test(fieldName)) {
      throw new Error(
        `第 1 行第 ${index + 1} 列英文名称「${fieldName}」格式不正确，仅支持字母、数字、下划线，且不能以数字开头`
      );
    }

    if (!fieldType) {
      throw new Error(`第 2 行第 ${index + 1} 列字段类型不能为空`);
    }

    if (!fieldComment) {
      throw new Error(`第 3 行第 ${index + 1} 列字段注释不能为空`);
    }

    columnList.push(fieldName);
    typeList.push(fieldType);
    commentList.push(fieldComment);
  });

  const instances = buildInstancesFromDataRows(columnList, rows.slice(3));

  return {
    columnList,
    commentList,
    typeList,
    instances,
    path: `dev://ontology-schema/${fileName}/${Date.now()}.csv`
  };
};

export const parseOntologySchemaCsvContent = (
  content: string,
  fileName: OntologyCsvTemplateName
): ParsedOntologySchemaCsv => {
  const rows = parseCsvContent(content);

  if (!rows.length) {
    throw new Error('请按照标准导入模板填写后再上传');
  }

  if (isLegacyVerticalTemplate(rows)) {
    return parseLegacyVerticalTemplate(rows, fileName);
  }

  return parseHorizontalTemplateRows(rows, fileName);
};

export const parseOntologySchemaCsvFile = async (
  file: File,
  fileName: OntologyCsvTemplateName
): Promise<ParsedOntologySchemaCsv> => {
  const content = await file.text();
  return parseOntologySchemaCsvContent(content, fileName);
};

export const encodeCsvTemplateBase64 = (content: string): string => {
  const withBom = `\uFEFF${content}`;
  const bytes = new TextEncoder().encode(withBom);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

export const downloadCsvTemplate = (content: string, fileName: string) => {
  const blob = new Blob(['\uFEFF', content], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export const downloadBase64CsvTemplate = (
  base64Data: string,
  fileName: string
) => {
  const base64String = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data;
  const binary = atob(base64String);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};
