# Daily Project Report

**Generated:** 2026-05-28

## 1. Project Overview

Skola 是一个现代化的开源间隔重复学习应用，专注于精美的设计、本地优先架构和周到的用户体验。

### 核心技术栈：
- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **Dexie.js** - IndexedDB 封装
- **FSRS.js** - 间隔重复调度算法
- **Tauri** - 桌面应用支持
- **Biome** - Lint/格式化工具

---

## 2. Similar Open-Source Projects & Learnings

### 2.1 Anki & AnkiDroid
- **Advantages:** 生态系统庞大、插件丰富、成熟的社区
- **What Skola Can Learn:** 
  - 支持更多卡片格式导入导出
  - 社区共享牌组市场
  - 强大的自定义模板系统

### 2.2 RemNote
- **Advantages:** 笔记与闪卡结合、知识图谱、协作功能
- **What Skola Can Learn:**
  - 双向链接功能（Linked Notes 已初具雏形）
  - 知识图谱可视化
  - 更多协作学习特性

### 2.3 Logseq & Obsidian
- **Advantages:** 本地优先、Markdown 优先、强大的插件生态
- **What Skola Can Learn:**
  - 更强大的 Markdown 编辑器
  - 插件系统架构
  - 本地文件同步方案

### 2.4 Quizlet
- **Advantages:** 优秀的学习模式多样性、美观的界面
- **What Skola Can Learn:**
  - 多种学习模式（匹配、测试、拼写）
  - 游戏化元素（排行榜、成就系统）
  - 更丰富的媒体支持

---

## 3. Current Code Quality Status

### 3.1 Lint Issues (Based on Previous Report)
- **9 Errors** - 主要是格式化问题
- **18 Warnings** - 包含可访问性(a11y)问题
- **Key Files with Issues:**
  - `src/app/quiz/QuizView.tsx`
  - `src/app/quiz/quizData.ts`
  - `src/components/ui/Combobox.tsx`
  - `src/components/ui/NavItem.tsx`

### 3.2 TypeScript Error
**Location:** `src/app/flash/FlashView.tsx:153`
**Issue:** Type mismatch between `CardState` and `FlashCard`
**Root Cause:** 在 `answerCard` 函数中，重新构建 deck 时没有正确保持类型一致性

### 3.3 Git Status (From Previous Report)
- **Branch:** master
- **Status:** Clean working tree, 1 commit ahead of origin

---

## 4. Improvement Suggestions

### 4.1 High Priority - Code Quality

1. **Fix Type Error in FlashView.tsx**
   - 确保类型一致性，可能需要创建统一的 Card 接口
   - 添加类型守卫或类型断言来解决兼容性问题

2. **Run Code Formatting**
   - 执行 `pnpm format` 自动修复 9 个格式化错误

3. **Fix Accessibility Issues**
   - 在 Combobox 和 NavItem 组件中添加键盘事件处理
   - 确保所有交互元素都有适当的 ARIA 属性

### 4.2 Medium Priority - Features

1. **Enhanced Statistics View**
   - 重新启用统计视图，使用轻量级图表库（如 Recharts 或 Chart.js）
   - 添加学习热图、进度趋势图
   - 卡片难度分布可视化

2. **Bulk Operations**
   - 批量编辑、移动、删除卡片
   - 批量导入导出功能
   - 标签系统用于组织卡片

3. **Image Occlusion**
   - 实现图像遮挡卡片类型
   - 支持图片上传和标注工具

4. **Audio Support**
   - 添加音频录制和播放功能
   - 支持 TTS（文本到语音）

### 4.3 Low Priority - UX/UI Improvements

1. **Dark/Light Theme Toggle**
   - 完善深色/浅色主题切换
   - 添加系统主题自动检测

2. **Gesture Support**
   - 改进移动端手势（滑动、长按等）
   - 更好的触摸反馈

3. **Export/Import Enhancements**
   - 支持 Anki .apkg 格式导入
   - 导出为 Markdown 或 PDF

4. **Gamification Elements**
   - 学习 streaks（连续天数）
   - 成就系统
   - 学习时间统计

---

## 5. Architecture Recommendations

### 5.1 Component Architecture
- **Consider Radix UI Primitives** - 更健壮的可访问性基础
- **Storybook Integration** - 组件文档和测试
- **Unit Testing with Vitest + React Testing Library** - 提高测试覆盖率

### 5.2 State Management
- 评估是否需要引入 Zustand 或 Jotai 来简化状态管理
- 当前的 Dexie + React Hooks 方案工作良好，但复杂组件可能受益

### 5.3 Performance Optimization
- 实现虚拟滚动（Virtual Scrolling）用于大量卡片列表
- Code Splitting - 按需加载路由和组件
- 图片懒加载和优化

### 5.4 Developer Experience
- 添加 E2E 测试（Playwright）
- 改进错误边界和用户友好的错误提示
- 添加性能监控和分析工具

---

## 6. Daily Action Items

1. [ ] 修复 FlashView.tsx 中的类型错误
2. [ ] 运行 `pnpm format` 修复格式化问题
3. [ ] 审查并修复可访问性警告
4. [ ] 考虑推送本地提交到 origin

---

## 7. Summary

Skola 是一个设计精美的学习应用，具有坚实的技术基础。继续保持：
- ✅ 本地优先架构
- ✅ 美观的 UI 设计
- ✅ 类型安全的 TypeScript 实现
- ✅ 优秀的间隔重复算法实现

通过借鉴类似开源项目的优势，并逐步完善缺失的功能，Skola 可以成为 Anki 等现有工具的有力替代品。
