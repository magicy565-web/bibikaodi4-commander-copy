# Commander Phone — V0 设计开发文档

**版本**：v1.0 | **日期**：2026-03-06 | **目标上线**：2026-03-12

---

## 一、项目背景与分工

Commander Phone 是一款专为中小企业老板设计的 AI 外贸赋能 App，运行在定制 Android 手机上，帮助传统工厂/外贸部门通过一台手机接入 AI 能力。3 月 12 日需要向 BOSS 演示"**智能托管工厂数据 + 自动获客**"的完整闭环。

### 分工边界

| 角色 | 负责范围 | 不负责 |
|------|----------|--------|
| **V0（Claude Opus）** | 所有屏幕的 UI 组件、视觉设计、交互动画、布局结构 | 路由逻辑、后端 API、状态管理 |
| **Manus** | 路由配置、后端 AI 服务、全局状态（store）、数据联调 | 视觉细节、动画曲线、组件样式 |

**核心原则**：V0 输出的每个组件都是**纯展示组件（Presentational Component）**，所有数据通过 `props` 传入，所有事件通过回调函数 `onXxx` 向上传递，组件内部不直接调用 `router`、`store` 或 `fetch`。

---

## 二、技术栈约束

V0 生成的代码必须严格遵守以下约束，否则 Manus 无法直接集成：

```
框架：React Native 0.81 + Expo SDK 54
路由：expo-router v6（文件系统路由）
样式：NativeWind v4（Tailwind CSS for React Native）
动画：moti（MotiView / MotiText / AnimatePresence）
图标：lucide-react-native（统一使用，不用 @expo/vector-icons）
渐变：expo-linear-gradient（LinearGradient）
SVG：react-native-svg（Svg / Circle / Path 等）
手势：react-native-gesture-handler
触觉：expo-haptics
安全区：react-native-safe-area-context（SafeAreaView）
```

**禁止使用**：
- `StyleSheet.create()` 以外的内联 style 对象（除非 NativeWind 无法覆盖）
- `framer-motion` 直接导入（已通过 pnpm overrides 锁定到 v11，moti 内部使用）
- `react-native-animatable`
- 任何 CSS-in-JS 库（styled-components 等）

---

## 三、设计系统

### 3.1 颜色系统（`constants/theme.ts` 中的 `C` 对象）

```typescript
export const C = {
  // 背景层级
  bg: '#000000',           // 最底层背景（纯黑）
  bgCard: '#111118',       // 卡片背景
  bgGlass: 'rgba(255,255,255,0.04)',  // 毛玻璃效果

  // 文字层级
  t1: 'rgba(255,255,255,0.92)',  // 主要文字
  t2: 'rgba(255,255,255,0.52)',  // 次要文字
  t3: 'rgba(255,255,255,0.26)',  // 辅助文字/占位符

  // 强调色
  P: '#7C3AED',     // 主紫色（Primary）
  PL: '#A78BFA',    // 浅紫色（Primary Light）
  amber: '#F59E0B', // 琥珀色（警告/机会）
  green: '#10B981', // 绿色（成功/在线）
  blue: '#60A5FA',  // 蓝色（信息/链接）
  red: '#F87171',   // 红色（错误/高优先级）
  teal: '#2DD4BF',  // 青色（特殊标记）
  orange: '#f97316',// 橙色
  cyan: '#06b6d4',  // 青蓝色

  // 边框
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',
};
```

### 3.2 动画配置（`SPRING` 系列）

```typescript
// 标准弹簧（按钮、卡片出现）
export const SPRING = { type: 'spring', stiffness: 400, damping: 28 };

// 柔和弹簧（列表项、面板展开）
export const SPRING_GENTLE = { type: 'spring', stiffness: 260, damping: 30 };

// 弹性弹簧（强调动作、成功反馈）
export const SPRING_BOUNCY = { type: 'spring', stiffness: 380, damping: 22 };
```

### 3.3 设计语言

整体风格参考 **Apple Watch Ultra** 表盘设计：

- **背景**：纯黑 `#000000`，绝不使用深灰
- **卡片**：`#111118` 底色 + `rgba(255,255,255,0.08)` 边框，轻微圆角 `rounded-2xl`（16px）
- **文字**：三层透明度体系（92% / 52% / 26%），不使用纯白
- **强调**：紫色 `#7C3AED` 为主色，配合 LinearGradient 光晕效果
- **数字**：关键数据使用超大字号（48-72px），`font-weight: 700`，营造"仪表盘感"
- **间距**：屏幕边距 16px，卡片内边距 16-20px，元素间距 8-12px

---

## 四、屏幕清单与设计要求

### Screen 1：登录页（`app/login.tsx`）

**现状**：已有基础实现，需要 V0 升级视觉效果。

**设计要求**：
- 全屏纯黑背景，顶部 1/3 区域有紫色径向渐变光晕（`LinearGradient`）
- App 图标（64×64，圆角 16px，紫色背景 + 闪电图标）居中显示
- "Commander" 大标题（32px，白色，`font-bold`）
- "你的 AI 外贸指挥官" 副标题（14px，`C.t2`）
- 登录表单卡片：`bgCard` 背景，圆角 20px，内边距 24px
  - 手机号输入框（带国旗前缀 🇨🇳 +86）
  - 密码输入框（带眼睛图标切换显示）
  - "登录" 按钮（全宽，紫色渐变背景，16px 圆角）
- 底部提示："演示账号：任意手机号 + 密码即可登录"（`C.t3`，12px）
- "Powered by RealSourcing AI"（`C.t3`，11px）

**Props 接口**：
```typescript
interface LoginScreenProps {
  onLogin: (phone: string, password: string) => void;
  isLoading?: boolean;
}
```

---

### Screen 2：主页 Watch Face（`app/(tabs)/index.tsx`）

**现状**：bibikaodi4 v0 已有完整实现，需要将数据替换为外贸场景。

**设计要求**：
- **顶部状态栏**（不占 SafeArea）：左侧"AI 指挥中心运行中"绿点状态，右侧时间
- **Hero 区域**（屏幕上半部分）：
  - 超大时钟（48px，`C.t1`，`font-bold`）
  - 日期副标题（`C.t2`，14px）
  - 三个核心 KPI 横排：今日询盘数 / 待处理决策 / AI 处理中任务
  - 每个 KPI：数字（36px，对应颜色）+ 标签（10px，`C.t2`）
- **数字员工动态**（中间区域）：
  - 标题："数字员工动态"（`C.t2`，12px，大写）
  - 3-4 条员工任务卡片，横向滚动（`ScrollView horizontal`）
  - 每张卡片：员工头像（emoji）+ 员工名 + 当前任务 + 进度条
- **快速操作区**（底部）：
  - 2×2 网格，4 个快速入口：扫描市场 / 跟进买家 / 生成报价 / 查看决策
  - 每个入口：图标 + 标签，点击跳转对应页面

**Props 接口**：
```typescript
interface HomeScreenProps {
  currentTime: string;           // "14:32"
  currentDate: string;           // "3月6日 周四"
  kpi: {
    inquiries: number;           // 今日询盘数
    pendingDecisions: number;    // 待处理决策
    activeTasks: number;         // AI 处理中任务
  };
  agentActivities: AgentActivity[];
  onQuickAction: (action: 'market' | 'buyer' | 'quote' | 'decision') => void;
}
```

---

### Screen 3：决策流（`app/(tabs)/decision-feed.tsx`）

**现状**：bibikaodi4 v0 已有完整实现，需要确认外贸场景数据格式。

**设计要求**：
- **顶部**：标题"决策中心"+ 待处理数量 Badge（红色圆点）
- **决策卡片**（全屏宽，垂直滚动）：
  - 卡片头部：紧急程度色条（左侧 3px 竖线：红/橙/绿）+ 类型标签 + 时间戳
  - 标题（`C.t1`，16px，`font-semibold`）
  - 摘要（`C.t2`，14px，最多 2 行）
  - 关键指标横排（最多 3 个）：标签 + 数值 + 趋势箭头
  - AI 推理（可折叠，`C.t3`，12px，斜体）
  - 操作区：**"执行方案"**（紫色渐变按钮）+ **"暂缓"**（透明边框按钮）
- **空状态**：居中图标 + "今日决策已全部处理" + 绿色勾

**外贸场景决策类型**：
```
opportunity  → 橙色  → "发现高意向买家"
lead         → 蓝色  → "新询盘需要回复"
content      → 紫色  → "产品图册需要优化"
optimization → 绿色  → "报价策略优化建议"
alert        → 红色  → "买家 7 天未回复"
```

**Props 接口**：
```typescript
interface DecisionFeedProps {
  decisions: DecisionCard[];
  onExecute: (decisionId: string) => void;
  onDefer: (decisionId: string) => void;
}
```

---

### Screen 4：资产库（`app/(tabs)/asset-vault.tsx`）

**现状**：bibikaodi4 v0 已有完整实现，需要确认工厂场景数据。

**设计要求**：
- **顶部 Hero**：整体激活分（大圆弧进度环，SVG 实现）+ 资产统计（已激活/训练中/待处理）
- **上传区域**（LinearGradient 边框，虚线效果）：
  - 上传图标 + "上传工厂资料" 文字
  - 支持格式标签：PDF / Excel / 图片 / 视频
  - 点击触发上传 Modal
- **资产列表**（`FlatList`，垂直滚动）：
  - 每条资产：文件类型图标 + 文件名 + 大小 + 状态
  - 状态样式：
    - `active`：绿色"已激活"+ 激活分（0-100）+ 圆弧进度环
    - `training`：紫色"训练中"+ 进度条（动画）
    - `pending`：灰色"待处理"+ "开始训练"按钮
- **上传 Modal**：
  - 底部弹出（`Modal` + `MotiView`）
  - 文件名输入框 + 类型选择（4 个图标按钮）+ 确认上传

**外贸场景资产类型**：
```
product   → Package 图标 → 蓝色  → "产品规格书 / 产品图册"
document  → FileText 图标 → 绿色 → "商务合同模板 / 认证文件"
case      → Zap 图标 → 橙色     → "成功案例 / 客户证言"
media     → Film 图标 → 紫色    → "工厂视频 / 展会照片"
```

**Props 接口**：
```typescript
interface AssetVaultProps {
  assets: Asset[];
  overallScore: number;           // 0-100，整体激活分
  onUpload: (name: string, type: AssetType) => void;
  onStartTraining: (assetId: string) => void;
}
```

---

### Screen 5：AI 对话（`app/(tabs)/commander-chat.tsx`）

**现状**：bibikaodi4 v0 已有完整实现，是演示核心页面。

**设计要求**：
- **顶部**：标题"Commander AI"+ 在线状态绿点 + 清空对话按钮
- **对话区域**（`ScrollView`，自动滚动到底部）：
  - **用户消息**：右对齐，紫色渐变气泡，白色文字
  - **AI 消息**：左对齐，`bgCard` 背景气泡，`C.t1` 文字
  - **打字机效果**：AI 回复逐字显示（`isTyping` 状态时显示三点动画）
  - **ActionCard**（AI 方案卡片，嵌入在 AI 消息气泡下方）：
    - 标题 + 类型标签
    - 执行员工（头像 emoji + 名字）
    - 预计时间 + 预估价值
    - 操作按钮："确认执行"（绿色）+ "修改方案"（透明）+ "忽略"（红色文字）
- **快捷操作栏**（输入框上方，横向滚动）：
  - 4 个快捷指令按钮：扫描市场 / 跟进买家 / 优化图册 / 生成报价
- **输入区域**：
  - 文本输入框（`bgCard` 背景，圆角 24px）
  - 发送按钮（紫色圆形，`Send` 图标）
  - `+` 按钮（附件/语音，暂时禁用）

**Props 接口**：
```typescript
interface CommanderChatProps {
  messages: Message[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onConfirmPlan: (planId: string) => void;
  onDismissPlan: (planId: string) => void;
  onModifyPlan: (planId: string, modification: string) => void;
  onQuickAction: (action: string) => void;
}
```

---

### Screen 6：数字员工（`app/(tabs)/digital-agents.tsx`）

**现状**：bibikaodi4 v0 已有完整实现，展示 AI 团队执行任务的状态。

**设计要求**：
- **Hero 仪表盘**（顶部，Apple Watch Ultra 风格）：
  - 大圆弧进度环（SVG + Reanimated 动画）
  - 中心显示：工作中员工数 / 总员工数
  - 环外：绿色光晕效果（有任务运行时）
- **员工卡片列表**（`FlatList`，垂直滚动）：
  - 每张卡片：员工头像（emoji，40px 圆形背景）+ 名字 + 专长标签
  - 当前任务（`C.t2`，13px）+ 进度条（动画）
  - 状态标签：运行中（绿色脉冲点）/ 待命（灰色）/ 暂停（橙色）
  - 操作按钮：暂停/继续（`Pause`/`Play` 图标）
- **任务完成记录**（底部，折叠区域）：
  - 最近 3 条已完成任务，显示任务名 + 完成时间 + 结果摘要

**4 个数字员工**：
```
Scout · 市场猎手  → 🔍 → 蓝色  → 专长：市场调研、买家挖掘
Sage  · 策略顾问  → 🧠 → 紫色  → 专长：报价策略、风险评估
Rex   · 跟进专员  → ⚡ → 橙色  → 专长：询盘回复、客户跟进
Muse  · 内容创作  → 🎨 → 粉色  → 专长：图册设计、社媒内容
```

**Props 接口**：
```typescript
interface DigitalAgentsProps {
  agents: Agent[];
  tasks: Task[];
  workingCount: number;
  onToggleAgent: (agentId: string) => void;
  onViewTask: (taskId: string) => void;
}
```

---

### Screen 7：设置页（`app/(tabs)/settings.tsx`）

**现状**：已有基础实现，暂时保留，不需要 V0 重新设计。

---

## 五、关键交互流程（演示脚本）

以下是 3 月 12 日演示的核心流程，V0 设计必须确保这个路径流畅无阻：

```
1. 打开 App → 登录页（输入任意手机号/密码）→ 主页 Watch Face
   ↓
2. 主页 → 点击"查看决策"→ 决策流页面
   ↓
3. 决策流 → 看到"澳大利亚买家 Ahmed 询盘待回复"→ 点击"执行方案"
   ↓
4. 跳转到 AI 对话页 → AI 自动生成英文回复草稿 → 确认执行
   ↓
5. 跳转到数字员工页 → 看到 Rex 正在执行"回复 Ahmed 询盘"→ 进度 100%
   ↓
6. 返回主页 → KPI 数据更新（今日处理询盘 +1）
```

---

## 六、V0 Claude Opus 提示词

以下是直接可以粘贴到 V0（使用 Claude Opus 4.5 模型）的提示词，按屏幕分别使用：

---

### 提示词 A：设计系统基础组件库

```
你是一名专精 React Native + Expo 的 UI 工程师，正在为"Commander Phone"——一款面向中小企业老板的 AI 外贸指挥官 App——构建设计系统。

## 技术约束
- React Native 0.81 + Expo SDK 54
- NativeWind v4（Tailwind CSS）
- moti（MotiView / AnimatePresence）
- lucide-react-native（图标）
- expo-linear-gradient（LinearGradient）
- react-native-svg（SVG 图形）
- expo-haptics（触觉反馈）

## 设计系统
颜色常量从 `@/constants/theme` 导入 `C`：
- bg: '#000000'（纯黑背景）
- bgCard: '#111118'（卡片背景）
- t1: 'rgba(255,255,255,0.92)'（主文字）
- t2: 'rgba(255,255,255,0.52)'（次文字）
- t3: 'rgba(255,255,255,0.26)'（辅助文字）
- P: '#7C3AED'（主紫色）
- PL: '#A78BFA'（浅紫色）
- green: '#10B981'，amber: '#F59E0B'，red: '#F87171'，blue: '#60A5FA'
- border: 'rgba(255,255,255,0.08)'

动画常量：SPRING = { type: 'spring', stiffness: 400, damping: 28 }

## 设计风格
Apple Watch Ultra 表盘风格：纯黑背景、超大数字、毛玻璃卡片、紫色渐变光晕、弹簧动画。

## 任务
请生成以下基础组件，每个组件都是纯展示组件（Presentational Component），数据通过 props 传入：

1. **GlassCard** — 毛玻璃卡片容器
   Props: { children, style?, onPress? }
   样式：bgCard 背景 + border 边框 + rounded-2xl + 轻微阴影

2. **KPIBadge** — KPI 数字徽章
   Props: { value: number | string, label: string, color: string, size?: 'sm' | 'lg' }
   样式：大号数字（36px lg / 24px sm）+ 小标签，MotiView 入场动画

3. **AgentAvatar** — 数字员工头像
   Props: { emoji: string, name: string, color: string, isActive?: boolean }
   样式：圆形背景（对应颜色 10% 透明度）+ emoji + 绿色脉冲点（isActive 时）

4. **ProgressRing** — 圆弧进度环（SVG）
   Props: { progress: number (0-100), size?: number, color: string, strokeWidth?: number }
   使用 react-native-svg 的 Circle + strokeDashoffset 实现

5. **ActionButton** — 操作按钮
   Props: { label: string, variant: 'primary' | 'secondary' | 'danger', onPress: () => void, disabled?: boolean }
   primary：紫色 LinearGradient 背景
   secondary：透明背景 + border 边框
   danger：透明背景 + 红色文字

所有组件必须：
- 使用 NativeWind className 而不是 StyleSheet
- Pressable 使用 style prop（不用 className，避免 NativeWind 的 Pressable bug）
- 包含 MotiView 入场动画（from opacity 0 animate opacity 1）
- 导出 TypeScript 类型定义
```

---

### 提示词 B：主页 Watch Face 屏幕

```
你是一名专精 React Native + Expo 的 UI 工程师，正在为"Commander Phone"构建主页 Watch Face 屏幕。

## 技术约束（同上，此处省略，请参考提示词 A）

## 屏幕功能
这是 App 的首页（app/(tabs)/index.tsx），模拟 Apple Watch Ultra 表盘风格，展示外贸老板最关心的实时数据。

## 组件结构
```tsx
// 这是纯展示组件，所有数据通过 props 传入
// 路由跳转通过 onQuickAction 回调传出
// 不在组件内部调用 router、store 或 fetch

interface HomeScreenViewProps {
  currentTime: string;        // "14:32"
  currentDate: string;        // "3月6日 周四"
  isAIOnline: boolean;
  kpi: {
    inquiries: number;        // 今日询盘（绿色）
    decisions: number;        // 待处理决策（橙色，带红点）
    activeTasks: number;      // AI 处理中（蓝色）
  };
  agentActivities: Array<{
    id: string;
    emoji: string;
    name: string;
    task: string;
    progress: number;         // 0-100
    color: string;
  }>;
  onQuickAction: (type: 'market' | 'buyer' | 'decision' | 'chat') => void;
}
```

## 布局要求
1. 全屏纯黑背景（#000000）
2. 顶部状态行：左侧绿点 + "AI 指挥中心运行中"，右侧当前时间
3. Hero 区域（屏幕上 40%）：
   - 超大时钟数字（56px，font-bold，白色）
   - 日期（14px，C.t2）
   - 三个 KPI 横排，用竖线分隔
4. 数字员工动态（中间 30%）：
   - 标题行："数字员工动态"+ 右侧"全部"链接
   - 横向滚动卡片（每张 160px 宽）
   - 每张：员工头像 emoji + 名字 + 任务文字 + 进度条
5. 快速操作（底部 30%）：
   - 标题："快速指令"
   - 2×2 网格，4 个操作按钮
   - 每个：LinearGradient 背景 + 图标 + 标签

## 动画要求
- 整体页面：MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}
- KPI 数字：延迟 200ms 入场
- 员工卡片：staggered 入场（每张延迟 100ms）
- 时钟：每秒更新（useEffect + setInterval）

请生成完整的 HomeScreenView 组件代码，包含所有子组件定义。
```

---

### 提示词 C：决策流屏幕

```
你是一名专精 React Native + Expo 的 UI 工程师，正在为"Commander Phone"构建决策流屏幕（app/(tabs)/decision-feed.tsx）。

## 屏幕功能
展示 AI 生成的外贸决策卡片列表，老板可以一键"执行方案"或"暂缓"。这是演示"AI 自动获客"的核心页面。

## 决策卡片数据结构
```typescript
interface DecisionCard {
  id: string;
  type: 'opportunity' | 'lead' | 'content' | 'optimization' | 'alert';
  title: string;           // "澳大利亚买家 Ahmed 询盘待回复"
  summary: string;         // 2-3 句话的摘要
  source: string;          // "Alibaba / 邮件 / LinkedIn"
  urgency: 'low' | 'medium' | 'high';
  estimatedValue?: string; // "$12,000"
  metrics?: Array<{
    label: string;         // "意向度"
    value: string;         // "92%"
    trend?: 'up' | 'down';
  }>;
  aiReasoning?: string;    // AI 推理说明（可折叠）
  suggestedAction?: string;// "立即回复，提供样品报价"
  createdAt: string;       // "2分钟前"
}
```

## 类型与颜色映射
- opportunity → C.amber（橙色）→ "商机"
- lead → C.blue（蓝色）→ "询盘"
- content → C.P（紫色）→ "内容"
- optimization → C.green（绿色）→ "优化"
- alert → C.red（红色）→ "预警"

## 布局要求
1. 顶部：标题"决策中心"（20px，font-bold）+ 右侧待处理数量 Badge（红色圆形）
2. FlatList（垂直滚动，keyExtractor 用 id）
3. 每张决策卡片（GlassCard 风格）：
   - 左侧 3px 竖线（urgency 颜色：high=red，medium=amber，low=green）
   - 右上角：类型标签（小胶囊，对应颜色背景 20% 透明度）+ 时间戳
   - 标题（16px，C.t1，font-semibold，最多 2 行）
   - 摘要（14px，C.t2，最多 3 行）
   - 指标横排（最多 3 个，每个：标签 + 数值 + 趋势箭头）
   - 预估价值（右对齐，C.amber，font-bold）
   - AI 推理（可折叠，点击展开，C.t3，12px，斜体）
   - 操作按钮行：
     - "执行方案"（flex-1，紫色渐变，onExecute 回调）
     - "暂缓"（80px，透明边框，onDefer 回调）
4. 空状态：居中 CheckCircle 图标（绿色，48px）+ "今日决策已全部处理" + "明天继续加油 💪"

## Props 接口
```typescript
interface DecisionFeedViewProps {
  decisions: DecisionCard[];
  onExecute: (decisionId: string) => void;
  onDefer: (decisionId: string) => void;
}
```

请生成完整的 DecisionFeedView 组件，包含所有子组件。
```

---

### 提示词 D：AI 对话屏幕（核心演示页面）

```
你是一名专精 React Native + Expo 的 UI 工程师，正在为"Commander Phone"构建 AI 对话屏幕（app/(tabs)/commander-chat.tsx）。这是 3 月 12 日演示的核心页面，必须视觉效果出色。

## 屏幕功能
老板通过自然语言指挥 AI 员工执行外贸任务。AI 回复包含可执行的"方案卡片"（ActionCard），老板确认后任务自动下发给对应数字员工。

## 消息数据结构
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plan?: {
    id: string;
    type: string;
    title: string;
    suggestedAction: string;
    agentId: string;
    agentName: string;         // "Rex · 跟进专员"
    estimatedTime: string;     // "15 分钟"
    estimatedValue?: string;   // "$12,000"
    reasoning: string;
  };
  planStatus?: 'pending' | 'confirmed' | 'dismissed';
  isTyping?: boolean;
}
```

## 布局要求
1. 顶部导航栏：
   - 左侧：返回按钮（chevron-left）
   - 中间：头像（紫色渐变圆形 + ⚡图标）+ "Commander AI" + 绿点"在线"
   - 右侧：清空按钮（Trash2 图标）

2. 对话区域（flex-1，ScrollView，ref 自动滚动到底部）：
   - 用户消息：右对齐，紫色渐变气泡（`#7C3AED → #5B21B6`），白色文字，圆角 18px（右下角 4px）
   - AI 消息：左对齐，bgCard 背景气泡，C.t1 文字，圆角 18px（左下角 4px）
   - 打字机动画：isTyping 时显示三个点的跳动动画（MotiView）
   - ActionCard（嵌入 AI 消息下方，独立卡片）：
     - 顶部：类型标签 + 标题
     - 中间：执行员工（emoji + 名字）+ 预计时间 + 预估价值
     - AI 推理（C.t3，12px）
     - 操作按钮行（planStatus === 'pending' 时显示）：
       - "✓ 确认执行"（绿色渐变，onConfirmPlan）
       - "✎ 修改"（透明边框，onModifyPlan）
       - "✕"（红色文字，onDismissPlan）
     - 已确认状态：绿色"已下发执行"标签 + 勾图标
     - 已忽略状态：灰色"已忽略"标签

3. 快捷操作栏（输入框上方，横向 ScrollView）：
   - 4 个快捷按钮：🔍扫描市场 / 👤跟进买家 / 🎨优化图册 / 💰生成报价
   - 每个：小胶囊样式，bgCard 背景，C.t2 文字

4. 输入区域（底部，SafeArea 内）：
   - 左侧：+ 按钮（bgCard 圆形，C.t2 颜色）
   - 中间：TextInput（flex-1，bgCard 背景，圆角 24px，C.t1 文字）
   - 右侧：发送按钮（紫色圆形，Send 图标，有内容时高亮）

## Props 接口
```typescript
interface CommanderChatViewProps {
  messages: Message[];
  isTyping: boolean;
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onConfirmPlan: (planId: string) => void;
  onDismissPlan: (planId: string) => void;
  onModifyPlan: (planId: string) => void;
  onQuickAction: (action: string) => void;
  onClear: () => void;
}
```

## 特别要求
- ActionCard 的确认/忽略状态切换必须有 MotiView 动画
- 发送消息后输入框自动清空，ScrollView 自动滚动到底部
- 键盘弹出时，输入区域随键盘上移（KeyboardAvoidingView）
- 所有 Pressable 使用 style prop（不用 className）

请生成完整的 CommanderChatView 组件，包含所有子组件和 ActionCard 组件。
```

---

### 提示词 E：资产库屏幕

```
你是一名专精 React Native + Expo 的 UI 工程师，正在为"Commander Phone"构建资产库屏幕（app/(tabs)/asset-vault.tsx）。

## 屏幕功能
展示工厂上传的产品资料、合同模板、案例文档等，AI 自动"训练"这些资料形成知识库，提升 AI 回复询盘的精准度。

## 数据结构
```typescript
interface Asset {
  id: string;
  name: string;
  type: 'product' | 'document' | 'case' | 'media';
  status: 'active' | 'training' | 'pending';
  uploadDate: string;
  size: string;
  activationScore: number;    // 0-100，激活分
  trainingProgress: number;   // 0-100，仅 training 状态使用
}
```

## 类型与图标映射
- product → Package（蓝色 C.blue）→ "产品资料"
- document → FileText（绿色 C.green）→ "文档合同"
- case → Zap（橙色 C.amber）→ "成功案例"
- media → Film（紫色 C.P）→ "媒体素材"

## 布局要求
1. 顶部 Hero（高度 160px）：
   - 大圆弧进度环（SVG，直径 100px，紫色，显示整体激活分）
   - 右侧三个统计数字：已激活 / 训练中 / 待处理
   - 标题："知识库健康度"

2. 上传区域（虚线边框卡片，LinearGradient 紫色边框效果）：
   - Upload 图标（32px，C.PL）
   - "上传工厂资料" 主文字
   - "PDF / Excel / 图片 / 视频" 副文字（C.t3）
   - 点击触发 onUpload 回调

3. 资产列表（FlatList）：
   - 每条资产：
     - 左侧：文件类型图标（40px 圆形背景，对应颜色 15% 透明度）
     - 中间：文件名（C.t1，14px）+ 大小 + 上传日期（C.t3，12px）
     - 右侧（根据状态）：
       - active：ProgressRing（40px）+ 激活分数字
       - training：进度条（动画，紫色）+ 百分比
       - pending："开始训练"按钮（小胶囊，紫色边框）

4. 上传 Modal（底部弹出）：
   - 暗色遮罩 + MotiView 从底部滑入
   - 标题："添加新资产"
   - 文件名输入框
   - 类型选择（4 个图标按钮，选中时紫色高亮）
   - "确认上传"按钮（全宽，紫色渐变）

## Props 接口
```typescript
interface AssetVaultViewProps {
  assets: Asset[];
  overallScore: number;
  isModalVisible: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onUpload: (name: string, type: AssetType) => void;
  onStartTraining: (assetId: string) => void;
}
```

请生成完整的 AssetVaultView 组件。
```

---

## 七、Manus 集成说明

V0 生成组件后，Manus 负责以下集成工作：

### 7.1 路由集成

```typescript
// app/(tabs)/index.tsx — Manus 负责
import { HomeScreenView } from '@/components/views/HomeScreenView';
import { useStore } from '@/constants/store';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { state } = useStore();
  
  return (
    <HomeScreenView
      currentTime={new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
      currentDate={...}
      kpi={{ inquiries: state.todayInquiries, decisions: state.decisions.length, activeTasks: state.activeTasks }}
      agentActivities={state.tasks.filter(t => t.status === 'running')}
      onQuickAction={(type) => {
        if (type === 'decision') router.push('/(tabs)/decision-feed');
        if (type === 'chat') router.push('/(tabs)/commander-chat');
      }}
    />
  );
}
```

### 7.2 AI 服务集成

```typescript
// Manus 提供的 AI 服务接口（services/ai.ts 已实现）
import { callCommanderAI } from '@/services/ai';

// V0 组件通过 onSend 回调触发
const handleSend = async (text: string) => {
  const result = await callCommanderAI(text, state.assets);
  // 更新 messages 状态
};
```

### 7.3 状态管理

全局状态由 `constants/store.tsx` 的 `useStore()` 提供，V0 组件不直接访问 store，所有数据由 Manus 从 store 中提取后通过 props 传入。

---

## 八、交付标准

V0 每次交付的组件必须满足：

1. **零路由依赖**：组件内不出现 `router.push`，改用 `onXxx` 回调
2. **零 store 依赖**：组件内不出现 `useStore()`，数据全部来自 props
3. **TypeScript 完整**：所有 props 有完整的 interface 定义
4. **可独立渲染**：提供 mock data 示例，可以在 Storybook 或独立页面中预览
5. **NativeWind 优先**：样式优先使用 `className`，仅在 NativeWind 无法表达时使用 `style`
6. **Pressable 规范**：所有 Pressable 使用 `style` prop，不用 `className`

---

*文档维护：Manus AI | 最后更新：2026-03-06*
