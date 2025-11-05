# RAG 分段列表功能 - 文档中心

欢迎来到RAG分段列表功能的文档中心！本文档集合提供了从快速开始到深入理解的完整指南。

## 📚 文档导航

### 🚀 快速开始
**推荐首先阅读**

- **[快速参考指南](./QUICK_REFERENCE.md)** ⭐
  - 快速访问5种场景
  - 常用操作和代码片段
  - 常见问题解答
  - 调试技巧

### 📖 详细教程

- **[完整实现教程](./RAG_SEGMENT_IMPLEMENTATION_GUIDE.md)**
  - 第一阶段：基础文本分段（从零开始）
  - 第二阶段：多场景支持
  - 技术栈和架构
  - 适合想要深入理解实现过程的开发者

- **[5种场景详解](./SCENE_DETAILS.md)**
  - 每种场景的功能描述
  - 页面布局和交互
  - 访问URL
  - Mock数据结构
  - 适合想要了解各场景特点的开发者

### 🏗️ 架构和设计

- **[架构设计文档](./ARCHITECTURE.md)**
  - 系统架构图
  - 数据流
  - 组件树
  - 状态管理设计
  - 性能优化策略
  - 扩展性设计
  - 适合想要理解系统设计的开发者

### ✅ 项目总结

- **[实现总结](./IMPLEMENTATION_SUMMARY.md)**
  - 项目完成情况
  - 实现的功能清单
  - 技术实现细节
  - 文件清单
  - 性能优化
  - 适合想要快速了解项目全貌的开发者

---

## 🎯 根据你的需求选择文档

### 我想快速上手
👉 阅读 [快速参考指南](./QUICK_REFERENCE.md)

### 我想了解5种场景
👉 阅读 [5种场景详解](./SCENE_DETAILS.md)

### 我想从零开始学习实现
👉 阅读 [完整实现教程](./RAG_SEGMENT_IMPLEMENTATION_GUIDE.md)

### 我想理解系统架构
👉 阅读 [架构设计文档](./ARCHITECTURE.md)

### 我想了解项目全貌
👉 阅读 [实现总结](./IMPLEMENTATION_SUMMARY.md)

### 我想添加新功能
👉 先阅读 [架构设计文档](./ARCHITECTURE.md)，然后参考 [快速参考指南](./QUICK_REFERENCE.md) 中的"常用操作"

---

## 🌟 核心特性

### 5种分段场景
1. **基础文本分段** - 简单的文本分段
2. **分层级分段** - 支持目录树和分层级显示
3. **图文混合分段** - 文本和图片混合，支持弹窗放大
4. **PPT展示** - 幻灯片展示和分段列表
5. **表格分段** - 表格查看和分段表格

### 技术栈
- React 18+
- TypeScript
- Zustand 4.5.2+
- Tailwind CSS 3+

### 关键功能
- ✅ 分段选中和高亮
- ✅ 分段内容编辑
- ✅ 自动保存
- ✅ 多场景支持
- ✅ 高性能设计
- ✅ 易于扩展

---

## 📁 项目结构

```
src/pages/ragDetail/
├── index.tsx                    # 主入口
├── types/                       # 类型定义
├── store/                       # 状态管理
├── api/                         # API接口
├── utils/                       # 工具函数
├── components/                  # React组件
│   ├── scenes/                  # 场景特定组件
│   └── ...                      # 通用组件
└── styles/                      # 样式文件

newDocs/
├── README.md                    # 本文件
├── QUICK_REFERENCE.md           # 快速参考
├── RAG_SEGMENT_IMPLEMENTATION_GUIDE.md
├── SCENE_DETAILS.md
├── ARCHITECTURE.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## 🔗 快速链接

### 访问场景
- [场景1：基础文本](http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=text-scene)
- [场景2：分层级分段](http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=hierarchical-scene)
- [场景3：图文混合](http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=image-text-scene)
- [场景4：PPT展示](http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=ppt-scene)
- [场景5：表格分段](http://localhost:3000/tenant/compute/modaforge/ragDetail?ragId=table-scene)

### 源代码
- [主入口](../src/pages/ragDetail/index.tsx)
- [类型定义](../src/pages/ragDetail/types/index.ts)
- [状态管理](../src/pages/ragDetail/store/ragDetailStore.ts)
- [Mock数据](../src/pages/ragDetail/utils/mockData.ts)

---

## 💡 常见问题

### Q: 如何切换场景？
A: 修改URL中的ragId参数。详见 [快速参考指南](./QUICK_REFERENCE.md#快速访问)

### Q: 如何添加新的分段类型？
A: 参考 [架构设计文档](./ARCHITECTURE.md#扩展性设计) 中的"添加新场景的步骤"

### Q: 如何集成真实API？
A: 参考 [快速参考指南](./QUICK_REFERENCE.md#常见问题) 中的相关问题

### Q: 如何优化性能？
A: 参考 [架构设计文档](./ARCHITECTURE.md#性能优化策略)

### Q: 如何测试？
A: 参考 [快速参考指南](./QUICK_REFERENCE.md#常见问题) 中的测试相关问题

---

## 📞 获取帮助

### 遇到问题？
1. 查看 [快速参考指南](./QUICK_REFERENCE.md) 中的常见问题
2. 查看源代码中的注释
3. 查看相关的详细文档

### 想要学习？
1. 从 [快速参考指南](./QUICK_REFERENCE.md) 开始
2. 阅读 [5种场景详解](./SCENE_DETAILS.md)
3. 深入学习 [完整实现教程](./RAG_SEGMENT_IMPLEMENTATION_GUIDE.md)

### 想要扩展？
1. 阅读 [架构设计文档](./ARCHITECTURE.md)
2. 参考 [快速参考指南](./QUICK_REFERENCE.md) 中的常用操作
3. 查看源代码实现

---

## 📝 文档版本

- **版本**: 1.0.0
- **最后更新**: 2024年
- **状态**: ✅ 完成

---

## 🎓 学习路径建议

### 初级开发者
1. 阅读 [快速参考指南](./QUICK_REFERENCE.md)
2. 访问各个场景，了解功能
3. 查看源代码中的注释

### 中级开发者
1. 阅读 [5种场景详解](./SCENE_DETAILS.md)
2. 阅读 [架构设计文档](./ARCHITECTURE.md)
3. 尝试添加新功能

### 高级开发者
1. 阅读 [完整实现教程](./RAG_SEGMENT_IMPLEMENTATION_GUIDE.md)
2. 深入研究源代码
3. 进行性能优化和扩展

---

## 🚀 下一步

- 集成真实API
- 添加搜索和过滤功能
- 实现虚拟滚动
- 添加更多交互功能
- 性能监控和优化

---

**祝你使用愉快！** 🎉

如有任何问题或建议，欢迎反馈。

