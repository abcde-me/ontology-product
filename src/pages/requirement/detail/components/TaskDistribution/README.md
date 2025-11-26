# 任务分配模块使用说明

## 📋 模块概述

这是一个用于数据标注需求的任务分配模块，支持：

- 🎯 多任务包分配
- 👥 多角色配置（标注人员 + N轮质检人员）
- 🏢 部门/个人灵活选择
- ⚡ 批量分配功能
- ✅ 表单验证和错误提示

## 🚀 快速开始

### 1. 基本用法

```tsx
import { TaskDistributionPanel } from './components/TaskDistribution';

function YourComponent() {
  const [taskPackages, setTaskPackages] = useState<TaskPackage[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  return (
    <TaskDistributionPanel
      taskPackages={taskPackages}
      onUpdate={setTaskPackages}
      validationErrors={errors}
      disabled={false}
    />
  );
}
```

### 2. 动态生成任务包

```tsx
import { generateTaskPackages } from './components/TaskDistribution';

// 监听表单变化，动态生成任务包
useEffect(() => {
  const splitCount = 3; // 拆分3个任务包
  const qualityRounds = 2; // 2轮质检
  const totalDataAmount = 1000; // 总数据量1000条

  const packages = generateTaskPackages(
    splitCount,
    qualityRounds,
    totalDataAmount
  );
  setTaskPackages(packages);
}, [splitCount, qualityRounds, totalDataAmount]);
```

### 3. 表单验证

```tsx
import { validateTaskAssignment } from './components/TaskDistribution';

const handleSubmit = () => {
  const errors = validateTaskAssignment(taskPackages);

  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    Message.error('请完成所有必填的人员分配');
    return;
  }

  // 继续提交...
};
```

### 4. 格式化提交数据

```tsx
import { formatSubmitData } from './components/TaskDistribution';

const submitData = formatSubmitData(taskPackages, timeoutRelease);

// submitData 格式：
// {
//   timeout_release: 30,
//   task_packages: [
//     {
//       task_b_id: "任务包1",
//       data_amount: 334,
//       assignments: [
//         {
//           role_type: "labeler",
//           assign_type: "department",
//           org_ids: ["dept1", "dept2"],
//           user_ids: []
//         },
//         ...
//       ]
//     },
//     ...
//   ]
// }
```

## 📦 文件结构

```
TaskDistribution/
├── index.tsx                   # 模块入口
├── types.ts                    # TypeScript类型定义
├── constants.ts                # 常量定义
├── utils.ts                    # 工具函数
├── TaskDistributionPanel.tsx   # 主面板组件
├── TaskPackageCard.tsx         # 任务包卡片组件
├── RoleAssignmentCard.tsx      # 角色分配卡片组件
├── BatchAssignModal.tsx        # 批量分配弹窗
├── styles.scss                 # 样式文件
└── README.md                   # 使用说明
```

## 🎨 组件层级

```
TaskDistributionPanel (主面板)
├── 批量分配按钮
├── TaskPackageCard (任务包卡片) × N
│   ├── 任务包ID
│   ├── 数据量
│   └── RoleAssignmentCard (角色分配卡片) × M
│       ├── 角色标识
│       ├── 部门/个人选择
│       ├── 选择按钮
│       ├── 已选数量
│       └── 错误提示
└── BatchAssignModal (批量分配弹窗)
```

## 🔧 核心API

### generateTaskPackages

生成任务包列表

```tsx
function generateTaskPackages(
  splitCount: number, // 拆分任务包数量
  qualityRounds: number, // 质检轮次 (0/1/2/3)
  totalDataAmount: number // 总数据量
): TaskPackage[];
```

### validateTaskAssignment

验证任务分配

```tsx
function validateTaskAssignment(taskPackages: TaskPackage[]): ValidationErrors;
```

返回错误映射表，key为 `${taskId}-${roleType}`，value为错误信息。

### formatSubmitData

格式化提交数据

```tsx
function formatSubmitData(
  taskPackages: TaskPackage[],
  timeoutRelease: number
): {
  timeout_release: number;
  task_packages: Array<{...}>;
}
```

## 📝 类型定义

### TaskPackage

```typescript
interface TaskPackage {
  taskId: string; // 任务ID (1, 2, 3...)
  taskBId: string; // 任务包ID (任务包1, 任务包2...)
  dataAmount: number; // 数据量
  roles: RoleAssignment[]; // 角色列表
}
```

### RoleAssignment

```typescript
interface RoleAssignment {
  roleType: 'labeler' | 'inspector_1' | 'inspector_2' | 'inspector_3';
  roleName: string;
  assignType: 'department' | 'person';
  selectedDepartments: string[];
  selectedPersons: string[];
  selectedCount: number;
  error?: string;
}
```

## ⚠️ 注意事项

1. **数据依赖**：必须先选择标注数据和设置拆分数量，才能生成任务包
2. **质检轮次**：质检轮次变化时，任务包结构会重新生成
3. **必填验证**：标注人员为必填，质检人员根据轮次决定是否必填
4. **数据计算**：最后一个任务包会包含除法的余数数据

## 🎯 使用示例

### 场景1：创建需求时使用

```tsx
// 1. 用户选择数据集（1000条）
// 2. 设置拆分任务包数（3个）
// 3. 设置质检轮次（1轮）
// 4. 系统自动生成：
//    - 任务包1: 334条，角色：标注人员 + 1轮质检人员
//    - 任务包2: 333条，角色：标注人员 + 1轮质检人员
//    - 任务包3: 333条，角色：标注人员 + 1轮质检人员
// 5. 用户为每个角色选择部门或个人
// 6. 提交发布
```

### 场景2：批量分配

```tsx
// 1. 点击"批量分配"按钮
// 2. 选择多个工序（如：任务包1~标注人员、任务包2~标注人员）
// 3. 选择分配类型（部门/个人）
// 4. 选择具体的部门或人员
// 5. 确认后，选中的工序都会应用相同的人员配置
```

## 🐛 常见问题

### Q: 任务包列表为空？

A: 请确保已选择标注数据并设置了拆分任务包数量。

### Q: 修改任务包数量后，已配置的人员分配丢失？

A: 这是预期行为。减少任务包数会保留前N个包的数据，增加会为新包创建空配置。

### Q: 如何判断哪些角色是必填的？

A: 标注人员始终必填，质检人员根据质检轮次配置决定。

## 📞 技术支持

如有问题，请联系开发团队或查看[实现方案文档](../../../../../../任务分配模块实现方案.md)。
