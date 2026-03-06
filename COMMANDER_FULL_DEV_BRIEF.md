# Commander Phone — 大型开发完整文档
# 卡贝奇 KABEQ 外贸 AI 指挥官 · MVP 3月12日演示版

> **版本**：v2.0 · 2026-03-06  
> **分工**：V0 Max（Claude Opus 4.5）负责所有 UI 组件和交互动效；Manus 负责后端集成、AI LLM 植入、路由注册、Store 数据绑定。  
> **演示目标**：一对一向外贸老板证明"这台手机让你的工厂真正接入了 AI"，解决主动开发客户和管理外贸客户两大痛点。

---

## 一、项目现状总览

### 1.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | React Native 0.81 + Expo SDK 54 | 目标平台：Android（BOSS 演示机） |
| 路由 | expo-router 6（文件路由） | `app/(tabs)/` 为 Tab 页，`app/` 为独立页 |
| 样式 | NativeWind 4 + inline styles | 页面内容用 inline styles，布局用 NativeWind |
| 动画 | moti + react-native-reanimated 4 | moti 用于卡片动效，reanimated 用于手势 |
| 图标 | lucide-react-native + @expo/vector-icons | Tab 图标用 lucide，页面内容可混用 |
| 状态 | React Context + useReducer（constants/store.tsx） | 全局 store，无需 zustand |
| AI | services/ai.ts → server/routers.ts → invokeLLM | 后端已就绪，前端待接入 |
| 图表 | **待安装** react-native-gifted-charts | V0 设计完成后 Manus 统一安装 |

### 1.2 颜色系统（`constants/theme.ts` 的 `C` 对象）

```typescript
C.bg        = '#000000'                    // 纯黑背景
C.bgCard    = '#111118'                    // 卡片背景
C.bgGlass   = 'rgba(255,255,255,0.04)'    // 毛玻璃卡片
C.t1        = 'rgba(255,255,255,0.92)'    // 主文字
C.t2        = 'rgba(255,255,255,0.52)'    // 次要文字
C.t3        = 'rgba(255,255,255,0.26)'    // 辅助文字
C.P         = '#7C3AED'                    // 紫色主色
C.PL        = '#A78BFA'                    // 紫色浅色
C.blue      = '#60A5FA'                    // 蓝色
C.green     = '#10B981'                    // 绿色/成功
C.amber     = '#F59E0B'                    // 琥珀/警告
C.red       = '#F87171'                    // 红色/危险
C.border    = 'rgba(255,255,255,0.08)'    // 边框
```

### 1.3 动画配置（`constants/theme.ts` 的 `SPRING` 对象）

```typescript
SPRING        = { type: 'spring', stiffness: 400, damping: 28 }   // 标准弹簧
SPRING_GENTLE = { type: 'spring', stiffness: 260, damping: 30 }   // 柔和弹簧
SPRING_BOUNCY = { type: 'spring', stiffness: 380, damping: 22 }   // 弹性弹簧
```

### 1.4 当前页面状态

| 页面 | 文件路径 | 状态 | V0 任务 |
|------|----------|------|---------|
| 主页 Watch Face | `(tabs)/index.tsx` | 可用，需升级图表 | **重设计** |
| 决策流 | `(tabs)/decision-feed.tsx` | 可用，需升级视觉 | **升级卡片** |
| CRM 列表 | `(tabs)/crm.tsx` | V0 Round 1 已集成 | 无 |
| AI 对话 | `(tabs)/commander-chat.tsx` | 可用，待 LLM 接入 | 无 |
| 设置 | `(tabs)/settings.tsx` | 可用 | 无 |
| CRM 详情 | `crm/[id].tsx` | V0 Round 1 已集成 | 无 |
| 资产库 | `asset-vault.tsx` | 可用 | 无 |
| 数字员工 | `digital-agents.tsx` | 可用 | 无 |
| 登录页 | `login.tsx` | 旧版，需替换 | **新建替换** |
| 市场情报详情 | `market-intel/[id].tsx` | **不存在** | **新建** |
| 资产能力包 | `asset-package.tsx` | **不存在** | **新建** |

---

## 二、V0 Max 开发任务（5个页面）

> **V0 通用规则**（每个提示词都必须遵守）：
> - 不引入任何新 npm 包，只用已有的：`moti`、`lucide-react-native`、`@expo/vector-icons/MaterialCommunityIcons`、`expo-linear-gradient`、`react-native-svg`、`react-native-gifted-charts`、`expo-router`、`react-native-safe-area-context`
> - 不写 store 引用（不 import useStore），所有数据用本地 const 数组
> - 不写 API 调用（不用 fetch/axios/trpc）
> - Pressable 必须用 `style` prop，不用 `className`
> - SafeAreaView 从 `react-native-safe-area-context` 导入
> - 不用 `StyleSheet.create`，全部 inline styles
> - TypeScript strict 模式

---

### 任务 A：主页 Watch Face 升级（`app/(tabs)/index.tsx`）

**目标**：让首页成为真正的"AI 指挥中心仪表盘"，BOSS 一眼看到今日业务全貌。

```
You are upgrading the home screen (Watch Face) of "Commander Phone" — an AI foreign trade app for furniture factory bosses.
Keep the existing Apple Watch Ultra aesthetic but add rich data visualization and two new entry sections.

## Design System
Import C from '@/constants/theme' for all colors. Use these values:
- bg: '#000000', bgGlass: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)'
- t1: 'rgba(255,255,255,0.92)', t2: 'rgba(255,255,255,0.52)', t3: 'rgba(255,255,255,0.26)'
- blue: '#60A5FA', green: '#10B981', amber: '#F59E0B', red: '#F87171', P: '#7C3AED', PL: '#A78BFA'

## Screen Sections (top to bottom, inside ScrollView)

### Section 1: Watch Face Header (existing, keep)
- Real-time clock: HH:MM in 72px fontWeight 100 white, with seconds in 20px muted
- Date + greeting: "早上好，老板" in 16px white
- Background: subtle radial glow (blue rgba(96,165,250,0.06) at top center)

### Section 2: KPI Ring Dashboard (NEW — replace existing stats row)
Use react-native-gifted-charts PieChart to create 3 donut rings in a horizontal row.
Each ring is inside a glass card (80px × 80px, borderRadius 12):

Ring 1 — 今日询盘 (blue #60A5FA):
- PieChart: radius 32, innerRadius 24, data=[{value:8,color:'#60A5FA'},{value:2,color:'rgba(255,255,255,0.08)'}]
- Center text: "8" (18px, fontWeight 100, white)
- Below ring: "今日询盘" (9px, muted)

Ring 2 — 成交率 (green #10B981):
- PieChart: radius 32, innerRadius 24, data=[{value:73,color:'#10B981'},{value:27,color:'rgba(255,255,255,0.08)'}]
- Center text: "73%" (14px, fontWeight 100, white)
- Below ring: "成交率" (9px, muted)

Ring 3 — 响应速度 (amber #F59E0B):
- PieChart: radius 32, innerRadius 24, data=[{value:94,color:'#F59E0B'},{value:6,color:'rgba(255,255,255,0.08)'}]
- Center text: "4min" (12px, fontWeight 100, white)
- Below ring: "平均响应" (9px, muted)

### Section 3: Revenue Trend (NEW)
Glass card (full width) titled "本月营收趋势" with a LineChart from react-native-gifted-charts:
- Data: [42, 58, 51, 67, 73, 89, 95, 88, 102, 118, 124, 138] (in $K, representing Jan-Dec)
- areaChart: true, color: '#60A5FA', startFillColor: 'rgba(96,165,250,0.3)', endFillColor: 'rgba(96,165,250,0)'
- hideDataPoints: false, dataPointsColor: '#60A5FA', dataPointsRadius: 3
- hideYAxisText: true, hideXAxisText: false (show month labels: Jan-Dec abbreviated)
- backgroundColor: 'transparent', rulesColor: 'rgba(255,255,255,0.05)'
- Width: screenWidth - 48, height: 80
- Below chart: "↑ 本月 $138K · 同比 +23%" in green 12px

### Section 4: Asset Health (NEW entry to asset-vault)
Glass card with:
- Header row: "资产能力包" title (14px, fontWeight 600) + "查看全部 →" pressable (12px, blue, navigates to /asset-vault)
- 4 asset status pills in a row (each pill: icon + name + colored dot):
  - ✅ 产品图册 (green dot, "156款")
  - ✅ 工厂视频 (green dot, "8个")  
  - ✅ 质量认证 (green dot, "12项")
  - 🔄 市场案例 (amber dot, "更新中")
- Bottom: thin progress bar (87% blue, height 3, borderRadius 2) + "综合能力 87分" label

### Section 5: Digital Team Status (NEW entry to digital-agents)
Glass card with:
- Header: "数字员工" (14px, fontWeight 600) + "3人在线" badge (green pill, 10px) + "查看全部 →" (blue, navigates to /digital-agents)
- 3 agent rows (compact, height 44px each):
  Each row: colored avatar circle (32px) + name + current task (truncated) + status dot
  - Scout 🔵: "扫描迪拜市场机会" · green pulse dot
  - Rex 🟣: "开发 Ahmed Al-Rashid" · green pulse dot  
  - Echo 🟢: "回复 Priya 询盘" · green pulse dot
- Pulse dots: MotiView animate={{ scale: [1, 1.3, 1] }} transition={{ loop: true, duration: 1600 }}

### Section 6: Urgent Decision Banner (NEW)
If there are urgent decisions, show a full-width amber banner card:
- Left: amber lightning bolt icon (Zap from lucide, 18px)
- Text: "Ahmed 询盘待回复 · 斋月季窗口仅剩 23 天" (14px, white)
- Right: "立即处理 →" (amber, 12px, navigates to /(tabs)/decision-feed)
- Background: rgba(245,158,11,0.1), border: rgba(245,158,11,0.3)
- MotiView: animate={{ opacity: [1, 0.7, 1] }} transition={{ loop: true, duration: 2000 }}

## Technical Requirements
- File: app/(tabs)/index.tsx (REPLACE existing)
- Import PieChart, LineChart from 'react-native-gifted-charts'
- Import C, SPRING from '@/constants/theme'
- Import router from 'expo-router'
- Import MotiView from 'moti'
- Import lucide icons: Zap, ChevronRight, TrendingUp
- useState for clock (setInterval every second)
- Dimensions.get('window').width for chart sizing
- All sections wrapped in ScrollView
- Staggered MotiView entrance: each section from={{ opacity:0, translateY:20 }} with delay: index*80
- NO store imports, NO API calls, all data as local const
- TypeScript strict, NO StyleSheet.create
```

---

### 任务 B：决策流卡片视觉升级（`app/(tabs)/decision-feed.tsx`）

**目标**：升级决策卡片的视觉层次，让每张卡片更有"AI 分析报告"的质感。

```
You are upgrading the visual design of the Decision Feed screen in "Commander Phone".
The existing screen has working gesture logic (swipe left/right) — DO NOT change any gesture or business logic.
Only upgrade the visual design of the DecisionCard component and the screen header.

## What to Keep (DO NOT MODIFY)
- All gesture handling (GestureDetector, Gesture, useSharedValue, useAnimatedStyle)
- All navigation logic (router.push)
- All store interactions (useStore)
- MOCK_CARDS data array
- All TypeScript interfaces

## What to Upgrade (VISUAL ONLY)

### Card Visual Upgrade
The existing card is a simple glass rectangle. Upgrade to:

**Card Background**: 
- Base: rgba(255,255,255,0.03) 
- Top edge highlight: 1px gradient line from rgba(255,255,255,0.15) to transparent (use a thin View, height 1, at top of card)
- Left colored strip: 4px wide, full card height, color based on urgency (red=high, amber=medium, blue=low)
- Card borderRadius: 20

**Card Header Row**:
- Left: urgency icon in colored circle (32px circle, 16px icon):
  - high urgency: red circle + AlertCircle icon
  - medium urgency: amber circle + Clock icon  
  - low urgency: blue circle + TrendingUp icon
- Center: card title (15px, fontWeight 600, white, flex:1, marginHorizontal 10)
- Right: estimated value badge (glass pill, blue text, 11px, fontWeight 700)

**Metrics Row** (horizontal, 3 metrics):
Each metric: glass mini-card (flex:1, padding 8, borderRadius 10):
- Value: 16px, fontWeight 100, colored (blue/green/amber based on trend)
- Label: 9px, muted, marginTop 2
- Trend arrow: ↑ green or ↓ red (10px) if trend exists

**AI Reasoning Section** (collapsible, show/hide with chevron):
- Header: "AI 分析" label (11px, muted) + Sparkles icon (12px, purple) + ChevronDown/Up
- Content (when expanded): italic text, 12px, rgba(255,255,255,0.6), lineHeight 18
- Background: rgba(124,58,237,0.08), borderRadius 10, padding 10

**Action Row** (bottom of card):
- Left: "忽略" button (glass, X icon, 12px, muted) — existing swipe-left action
- Right: "执行方案" button (blue gradient, Zap icon, 12px, white, fontWeight 600) — existing swipe-right action
- Both buttons: height 40, borderRadius 12, flex:1, marginHorizontal 4

**Swipe Hint** (below card, centered):
"← 忽略  |  执行 →" in 11px muted text, only show when card is not being swiped

### Screen Header Upgrade
- Title "AI 决策中心" (24px, fontWeight 100, white)
- Subtitle "今日 3 条待处理" (13px, muted)
- Right: filter icon button (glass circle, SlidersHorizontal icon)
- Below header: horizontal stats bar with 3 glass pills:
  "🔴 紧急 1" | "🟡 跟进 1" | "🔵 机会 1"

## Technical Requirements
- Modify existing file: app/(tabs)/decision-feed.tsx
- Only change visual JSX and styles, preserve all logic
- Import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons' for additional icons if needed
- Use LinearGradient from expo-linear-gradient for button gradients
- All new animations via MotiView (not Animated API)
- NO new data, NO new state, NO new functions
```

---

### 任务 C：登录页重设计（`app/login.tsx`）

**目标**：替换旧版登录页，第一印象必须精致，演示时有"这是专属系统"的感觉。

```
You are redesigning the login screen for "Commander Phone" — an AI foreign trade command center for factory bosses.
Replace the existing login.tsx completely. This is the first screen users see — it must feel premium and exclusive.

## Design System
- Background: #000000 with radial gradient glow (rgba(96,165,250,0.08) at top center, 300px radius)
- Glass cards: rgba(255,255,255,0.04) bg, rgba(255,255,255,0.08) border
- Primary blue: #60A5FA, Purple: #7C3AED
- All text: white or rgba(255,255,255,0.5) muted
- NO StyleSheet.create, inline styles only
- MotiView for entrance animations, lucide-react-native icons

## Screen Layout

### Background Layer
- Full screen black View
- Centered radial glow: use expo-linear-gradient with radial-like effect (large circle, transparent edges)
  Colors: ['rgba(96,165,250,0.12)', 'rgba(96,165,250,0.04)', 'transparent']
  Position: top center, size 400×400

### Top Brand Section (paddingTop: 80, alignItems: center)
Logo container (MotiView, entrance from={{ opacity:0, scale:0.8 }}, delay 0):
- Outer glow ring: 96px circle, borderWidth 1, borderColor rgba(96,165,250,0.3), shadowColor #60A5FA, shadowRadius 20, shadowOpacity 0.5
- Inner circle: 80px, LinearGradient ['#1e3a5f', '#0f1f3d'], borderRadius 40
- Center: "C" letter, 40px, fontWeight 100, color #60A5FA, letterSpacing 2

App name (MotiView, delay 150):
- "COMMANDER" in 22px, fontWeight 100, letterSpacing 10, white
- Underline: 40px wide, 1px, LinearGradient [transparent, #60A5FA, transparent]

Tagline (MotiView, delay 250):
- "你的 AI 外贸指挥官" in 13px, rgba(255,255,255,0.45), letterSpacing 3
- "KABEQ · 卡贝奇专属版" in 10px, rgba(255,255,255,0.25), marginTop 6, letterSpacing 2

### Login Form Card (MotiView, from={{ opacity:0, translateY:40 }}, delay 400)
Glass card: marginHorizontal 24, borderRadius 24, padding 28, borderWidth 1

Section label: "登录指挥中心" in 10px, rgba(255,255,255,0.35), letterSpacing 3, marginBottom 24

Phone/Email Input:
- Container: height 52, borderRadius 14, backgroundColor rgba(255,255,255,0.06), borderWidth 1, borderColor rgba(255,255,255,0.1), flexDirection row, alignItems center, paddingHorizontal 16, gap 12
- Left: Mail icon (16px, rgba(255,255,255,0.35))
- TextInput: flex 1, color white, fontSize 15, placeholder "邮箱 / 手机号", placeholderTextColor rgba(255,255,255,0.25)
- On focus: borderColor changes to rgba(96,165,250,0.5) (use useState for focus state)

Password Input (same style, marginTop 12):
- Left: Lock icon
- Right: Eye/EyeOff toggle (useState for showPassword)
- TextInput: secureTextEntry={!showPassword}

Demo Quick-Fill Row (marginTop 12, flexDirection row, alignItems center):
- Text: "演示账号" in 11px, rgba(255,255,255,0.3)
- Pressable: "demo@kabeq.com / demo123" in 11px, #60A5FA, marginLeft 8
- On press: fill both inputs with demo credentials + hapticLight()

Login Button (marginTop 24):
- Height 54, borderRadius 16, overflow hidden
- LinearGradient: ['#3B82F6', '#1D4ED8'], start {x:0,y:0}, end {x:1,y:0}
- Inner: flexDirection row, alignItems center, justifyContent center, gap 10
- Text: "进入指挥中心" in 16px, fontWeight 600, white
- Right: ArrowRight icon (white, 18px)
- Loading state: ActivityIndicator (white) replaces text
- Press: scale 0.97 via Pressable style prop + hapticLight()
- On press: setLoading(true), setTimeout 1500ms, then router.replace('/(tabs)')

### Bottom Section (MotiView, delay 600)
Divider: flexDirection row, alignItems center, marginHorizontal 24, marginTop 24
- Left/right lines: flex 1, height 1, backgroundColor rgba(255,255,255,0.08)
- Center: "或" in 12px, rgba(255,255,255,0.3), marginHorizontal 12

Skip Button (marginTop 16, alignItems center):
- Pressable: "跳过登录 · 演示模式" in 13px, rgba(255,255,255,0.35)
- On press: router.replace('/(tabs)')
- Subtle underline: textDecorationLine 'underline', textDecorationColor rgba(255,255,255,0.2)

Version info (marginTop 32, marginBottom 24, alignItems center):
- "Commander Phone · MVP v1.0 · 3月12日演示版" in 10px, rgba(255,255,255,0.2)

## Technical Requirements
- File: app/login.tsx (REPLACE existing)
- useState: email, password, showPassword, isLoading, emailFocused, passwordFocused
- useRouter from expo-router
- MotiView for all entrance animations
- LinearGradient from expo-linear-gradient
- lucide-react-native: Mail, Lock, Eye, EyeOff, ArrowRight
- NO API calls — simulate with setTimeout(1500)
- TypeScript strict, NO StyleSheet.create
```

---

### 任务 D：市场情报详情页（`app/market-intel/[id].tsx`）

**目标**：决策流卡片点击后的深度分析页，展示 AI 对某个市场机会的完整洞察。

```
You are building the Market Intelligence Detail page for "Commander Phone".
This page shows deep AI analysis of a specific market opportunity for furniture/textile export.

## Design System
- Background: #000000
- Glass cards: rgba(255,255,255,0.04) bg, rgba(255,255,255,0.08) border, borderRadius 16
- Colors: blue #60A5FA, purple #7C3AED/#A78BFA, green #10B981, amber #F59E0B, red #F87171
- Text: white (primary), rgba(255,255,255,0.52) (secondary), rgba(255,255,255,0.26) (tertiary)
- Icons: lucide-react-native + MaterialCommunityIcons from @expo/vector-icons
- Animations: MotiView spring { stiffness: 300, damping: 25 }
- NO StyleSheet.create, inline styles only

## Screen Layout (ScrollView)

### Header
- Back button row: Pressable with ChevronLeft icon (20px, white) + "返回" text (14px, muted)
- Market hero: "🇸🇦 沙特阿拉伯" (32px, fontWeight 100, white, marginTop 8)
- Subtitle: "家居软装市场 · 2026 Q1 分析报告" (14px, muted)
- Tags row: ["AI 生成", "47个数据源", "2小时前更新"] — each glass pill (10px, muted)

### AI Confidence Card
Full-width glass card, flexDirection row:
- Left: "92" in 56px, fontWeight 100, #60A5FA + "%" in 24px + "置信度" in 11px muted below
- Right: vertical divider + 3 stats stacked:
  - "数据源" label + "47个" value (blue)
  - "更新" label + "2小时前" value
  - "趋势" label + "↑ 强烈" value (green)
- Bottom: progress bar (height 3, borderRadius 2, blue 92% filled)

### Import Trend Chart
Glass card titled "近12月进口趋势" with a BarChart from react-native-gifted-charts:
- Data (monthly Saudi Arabia furniture import index, $M):
  [{value:42,label:'3月'},{value:48,label:'4月'},{value:55,label:'5月'},{value:61,label:'6月'},
   {value:58,label:'7月'},{value:52,label:'8月'},{value:67,label:'9月'},{value:74,label:'10月'},
   {value:81,label:'11月'},{value:88,label:'12月'},{value:95,label:'1月'},{value:103,label:'2月'}]
- barWidth: 18, spacing: 6, roundedTop: true
- frontColor: '#60A5FA', gradientColor: 'rgba(96,165,250,0.3)'
- backgroundColor: 'transparent', rulesColor: 'rgba(255,255,255,0.05)'
- hideYAxisText: true, xAxisColor: 'rgba(255,255,255,0.1)'
- Width: screenWidth - 64, height: 120
- Below chart: "↑ 同比增长 34% · 斋月季前6周为采购高峰" in green 11px

### Opportunity Radar
Glass card titled "机会评分" with a RadarChart from react-native-gifted-charts:
- labels: ['市场规模', '采购意愿', '价格匹配', '文化契合', '竞争空间']
- dataLabels: ['88', '91', '85', '78', '72']
- data: [88, 91, 85, 78, 72]
- maxValue: 100
- polygonConfig: { stroke: '#60A5FA', strokeWidth: 2, fill: 'rgba(96,165,250,0.2)' }
- gridConfig: { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }
- labelConfig: { fontSize: 10, color: 'rgba(255,255,255,0.6)' }
- Size: 200×200, centered

### Key Insights (3 cards)
Each insight: glass card with left colored strip (4px) + icon circle (32px) + text block
- Insight 1 (blue, TrendingUp): "斋月季前6周是家纺采购高峰，2025年沙特进口家纺同比增长34%，主要来自中国和土耳其。KABEQ 产品与当地审美高度匹配。"
- Insight 2 (green, Users): "目标买家：利雅得/吉达中型家居连锁，年采购额$50-200万，偏好OEM定制+独家设计。已识别12家高意向采购商。"
- Insight 3 (amber, AlertTriangle): "主要竞争来自土耳其（价格低15%）和印度（交期短）。差异化需强调KABEQ的设计感和快速打样能力（7天样品）。"

### Recommended Buyers (horizontal ScrollView)
Title "AI 推荐买家" + "12家已识别" badge (blue pill)
3 buyer cards (each 160px wide, glass, borderRadius 14, padding 14):
- Flag + company name (13px, fontWeight 600, white)
- City + budget (11px, muted)
- Match score: colored circle (40px) with percentage (16px, fontWeight 100)
  - 94%: #10B981 circle
  - 87%: #60A5FA circle
  - 81%: #A78BFA circle
- 2 product tag pills (10px, glass)

Buyers:
1. 🇸🇦 Al-Noor Home · 利雅得 · $120万/年 · 94% · [软装定制][OEM]
2. 🇸🇦 Desert Living · 吉达 · $85万/年 · 87% · [家纺套装][独家设计]
3. 🇦🇪 Gulf Decor · 迪拜 · $200万/年 · 81% · [高端家居][展厅陈列]

### AI Action Plan
Glass card titled "AI 行动建议":
3 numbered steps with colored circles:
- Step 1 (blue "01"): "立即准备斋月季专题图册 — 突出暖色调、祈祷毯、客厅套装，建议本周内完成"
  Sub-action: "指派 Muse 生成图册" (blue pressable, 11px)
- Step 2 (purple "02"): "定向开发 Al-Noor Home — Rex 已找到采购总监 LinkedIn，建议发送定制化开发信"
  Sub-action: "指派 Rex 立即开发" (purple pressable, 11px)
- Step 3 (green "03"): "参加 2026 迪拜家居展 (3月18-22日) — AI 已生成参展方案"
  Sub-action: "查看参展方案 →" (green pressable, 11px)

### Bottom Action Button
Full-width, height 56, borderRadius 16, LinearGradient ['#3B82F6','#1D4ED8']:
- Left: Bot icon (MaterialCommunityIcons, 'robot-outline', 20px, white)
- Text: "指派 Rex 开始开发 Al-Noor Home" (15px, fontWeight 600, white)
- Right: ChevronRight (white, 18px)
- Press: scale 0.97 + hapticLight

## Technical Requirements
- File: app/market-intel/[id].tsx
- useLocalSearchParams from expo-router (get id, display static data)
- SafeAreaView from react-native-safe-area-context
- Import PieChart, BarChart, RadarChart from 'react-native-gifted-charts'
- Import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
- Import lucide icons: ChevronLeft, TrendingUp, Users, AlertTriangle, ChevronRight
- Dimensions.get('window').width for chart sizing
- Staggered MotiView entrance (delay: index * 80)
- All data as local const, NO store, NO API
- TypeScript strict, NO StyleSheet.create
```

---

### 任务 E：资产能力包详情页（`app/asset-package.tsx`）

**目标**：展示卡贝奇工厂的完整数字能力包，是演示"工厂数据托管"的视觉高潮。

```
You are building the Asset Package page for "Commander Phone".
This page showcases a furniture factory's complete digital capability package — it's the visual climax of the "factory data hosting" demo.

## Design System
Same as project standard (see previous prompts). Background #000000, glass cards, C color tokens.

## Screen Layout (ScrollView)

### Header
- Back button + "资产能力包" title (18px, fontWeight 600)
- Brand row: "KABEQ 卡贝奇" (26px, fontWeight 100, white) + "已认证" badge (green pill with CheckCircle icon)
- Factory info: "广东·佛山 · 建厂2008年 · 年产能50,000件" (12px, muted)
- 3 quick stats in a row (glass pills): "产品线 156款" | "认证 12项" | "出口 23国"

### Overall Score Ring
Full-width glass card, alignItems center, padding 28:
- Large donut ring using PieChart from react-native-gifted-charts:
  radius: 70, innerRadius: 54
  data: [{value:87,color:'#60A5FA'},{value:13,color:'rgba(255,255,255,0.06)'}]
  centerLabelComponent: () => (
    <View alignItems center>
      <Text style={{color:'white',fontSize:40,fontWeight:'100'}}>87</Text>
      <Text style={{color:'rgba(255,255,255,0.4)',fontSize:11}}>综合能力</Text>
    </View>
  )
- Below ring: "KABEQ 已完成 87% 的数字化资产托管" in 13px, muted, textAlign center
- 4 dimension scores in a 2×2 grid below:
  Each: label (11px, muted) + score bar (height 3, borderRadius 2, colored) + value (11px, colored)
  - 产品丰富度: 92% (blue)
  - 定制能力: 88% (purple)
  - 交货速度: 75% (amber)
  - 品质认证: 90% (green)

### Capability Radar
Glass card titled "能力雷达图" with RadarChart from react-native-gifted-charts:
- labels: ['产品丰富度', '定制能力', '交货速度', '价格竞争力', '品质认证']
- data: [92, 88, 75, 82, 90]
- maxValue: 100
- polygonConfig: { stroke: '#A78BFA', strokeWidth: 2, fill: 'rgba(167,139,250,0.2)' }
- gridConfig: { stroke: 'rgba(255,255,255,0.08)' }
- labelConfig: { fontSize: 10, color: 'rgba(255,255,255,0.55)' }
- Size: 220×220, centered

### Asset Modules Grid (2 columns)
Title "已托管资产" + "6项" badge (blue pill)
6 module cards in 2-column grid (each ~(screenWidth/2 - 20)px wide, glass, borderRadius 14, padding 16):

Each card:
- Icon container: 44px circle, LinearGradient background, centered icon (22px, white)
- Module name: 13px, fontWeight 600, white, marginTop 10
- Detail: 11px, muted (file count or status)
- Status row: colored dot (6px) + status text (10px)
- Activated cards: green dot + "已激活"
- Updating cards: amber pulsing dot + "更新中"

Modules (icon gradients):
1. 📋 产品图册 (FileText, blue gradient ['#1e40af','#3b82f6']) · "156款产品" · 已激活
2. 🎬 营销视频 (Video, purple gradient ['#4c1d95','#7c3aed']) · "8个视频" · 已激活
3. 🏆 质量认证 (Award, amber gradient ['#92400e','#f59e0b']) · "ISO9001等12项" · 已激活
4. ⚙️ 定制能力 (Settings2, green gradient ['#064e3b','#10b981']) · "OEM/ODM全程" · 已激活
5. 📦 一件代发 (Package, blue gradient ['#1e3a5f','#60a5fa']) · "最低1件起发" · 已激活
6. 🌍 市场案例 (Globe, purple gradient ['#3b0764','#a78bfa']) · "23国成功案例" · 更新中

### Star Products (horizontal ScrollView)
Title "明星产品" + "156款" badge
4 product cards (each 150px wide, glass, borderRadius 14):
- Product image area (height 90px): LinearGradient ['#0f172a','#1e293b'] with product emoji centered (32px)
- Product code: 10px, muted, marginTop 8
- Product name: 12px, fontWeight 600, white, numberOfLines 1
- Price range: 11px, blue
- Market badge: amber pill (9px)

Products:
1. KS-837 岩石沙发 · $292-$380 · [中东热销]
2. KS-801 大黑牛沙发 · $340-$480 · [迪拜精品]
3. KC-1089 北欧休闲椅 · $85-$150 · [东南亚]
4. KS-3012 现代布艺沙发 · $220-$320 · [俄罗斯]

### Export Markets
Glass card titled "出口市场分布":
5 market rows with flag + country + animated bar + percentage:
Each row: flexDirection row, alignItems center, marginBottom 12
- Flag emoji (20px) + country (13px, white, width 80) + bar container (flex:1, height 4, borderRadius 2, bg rgba(255,255,255,0.08)) + bar fill (colored, width proportional) + percentage (11px, muted, width 36, textAlign right)

Markets:
🇸🇦 沙特阿拉伯 · 32% (blue)
🇷🇺 俄罗斯 · 24% (purple)
🇦🇪 阿联酋 · 18% (amber)
🇲🇾 马来西亚 · 14% (green)
🇹🇭 泰国 · 12% (teal #2DD4BF)

Bars: MotiView from={{ width: 0 }} animate={{ width: percentage% of container }} transition={{ delay: index*100, duration: 600 }}

### Bottom Actions (2 buttons side by side)
Left (glass, flex:1): Mail icon + "生成开发信" (13px, white)
Right (blue gradient, flex:1): Share2 icon + "分享能力包" (13px, white)
Both: height 50, borderRadius 14, flexDirection row, alignItems center, justifyContent center, gap 8

## Technical Requirements
- File: app/asset-package.tsx
- Import PieChart, RadarChart from 'react-native-gifted-charts'
- Import LinearGradient from expo-linear-gradient
- Import lucide icons: FileText, Video, Award, Settings2, Package, Globe, Mail, Share2, CheckCircle, ChevronLeft
- Dimensions.get('window').width for sizing
- Staggered MotiView entrance (delay: index * 60)
- All data as local const, NO store, NO API
- TypeScript strict, NO StyleSheet.create
```

---

## 三、Manus 后端集成任务（V0 完成后执行）

V0 交付代码后，Manus 按以下顺序完成集成：

### 3.1 安装新依赖

```bash
cd /home/ubuntu/commander-mobile
pnpm add react-native-gifted-charts
```

### 3.2 路由注册

V0 新建的页面需要在 `app/_layout.tsx` 中确认路由可访问：

| 新页面 | 路由路径 | 入口 |
|--------|----------|------|
| `market-intel/[id].tsx` | `/market-intel/[id]` | 决策流卡片点击 |
| `asset-package.tsx` | `/asset-package` | 首页资产区块 "查看全部" |
| `login.tsx`（替换） | `/login` | App 启动 |

### 3.3 Store 数据绑定

V0 的页面用本地 const 数据，Manus 需要把以下页面的数据替换为 store：

| 页面 | 需要绑定的 store 数据 |
|------|----------------------|
| `index.tsx` | `stats.totalInquiries`、`stats.responseRate`、`state.assets`、`state.agents` |
| `asset-package.tsx` | `state.assets`（6个资产模块的状态） |
| `market-intel/[id].tsx` | `state.decisions`（找到对应 decision 的数据） |

### 3.4 AI LLM 接入

`commander-chat.tsx` 已有完整的 AI 服务层（`services/ai.ts`），需要把 mock 响应替换为真实 LLM 调用：

```typescript
// server/routers.ts 已有的接口：
ai.analyzeInquiry(text: string) → { draft: string, confidence: number }
ai.generateOutreach(buyerName: string, product: string, market: string) → { subject: string, body: string }
```

### 3.5 演示流程路由串联

确保以下演示路径完整可走通：

```
/login → /(tabs)/index
/(tabs)/index → /asset-package（点击资产区块）
/(tabs)/index → /digital-agents（点击员工区块）
/(tabs)/decision-feed → /market-intel/[id]（点击决策卡片）
/(tabs)/crm → /crm/[id]（点击客户）
/(tabs)/commander-chat → /(tabs)/digital-agents（确认方案后）
```

---

## 四、3月12日演示脚本

### 演示时长：约 8 分钟

**第一幕（1分钟）：开场 — "这是你的 AI 外贸指挥官"**

打开 App，登录页出现。点击"演示模式"快速填充，进入主页。

> 话术："老板，这台手机就是你的外贸指挥中心。你看，现在是早上 9 点，AI 已经在帮你工作了——今天处理了 8 条询盘，成交率 73%，平均响应时间 4 分钟。"

**第二幕（2分钟）：工厂数字资产 — "你的工厂已经上云了"**

点击首页资产区块"查看全部"，进入资产能力包页面。

> 话术："你看这个能力包——156 款产品、8 个营销视频、12 项认证、OEM 定制能力、一件代发，全部数字化了。AI 给你的综合能力打了 87 分。这个能力包可以直接发给买家，他们一眼就知道你能做什么。"

指着雷达图："你的产品丰富度 92 分，品质认证 90 分，这是你的核心竞争力。"

**第三幕（2分钟）：主动开发客户 — "AI 帮你找到了买家"**

返回主页，点击"立即处理"橙色横幅，进入决策流。看到 Ahmed 询盘卡片。

> 话术："你看，AI 发现沙特买家 Ahmed 已经看了你的产品页 3 次，停留 8 分钟，斋月季只剩 23 天了。AI 评分 94 分，这是高意向客户。"

点击卡片，进入市场情报详情页。

> 话术："AI 帮你分析了整个沙特市场——进口量连续 12 个月增长，现在是最好的进入时机。这里还有 12 家推荐买家，Al-Noor Home 匹配度 94%。"

**第四幕（2分钟）：AI 自动执行 — "AI 员工帮你做了"**

点击"指派 Rex 开始开发"，跳转到 AI 对话页。输入"帮我回复 Ahmed 的询盘"。

> 话术："你只需要说一句话，AI 就会帮你生成专业的英文开发信。"

等待 AI 生成，展示英文开发信草稿。点击确认执行。

> 话术："确认之后，Rex 这个数字员工就会自动发送。你不需要会英文，不需要知道怎么写开发信。"

**第五幕（1分钟）：管理客户 — "所有客户都在这里"**

切换到客户 Tab，展示 CRM 列表。点击 Ahmed 进入详情。

> 话术："所有客户的跟进状态都在这里。AI 帮你分析了每个客户的采购意图，告诉你什么时候该跟进、说什么话。"

---

## 五、文件交付清单

V0 需要交付的文件：

| 文件 | 说明 |
|------|------|
| `app/(tabs)/index.tsx` | 主页 Watch Face 升级版（含 gifted-charts 图表） |
| `app/(tabs)/decision-feed.tsx` | 决策流视觉升级版（保留所有逻辑） |
| `app/login.tsx` | 登录页重设计版 |
| `app/market-intel/[id].tsx` | 市场情报详情页（新建） |
| `app/asset-package.tsx` | 资产能力包详情页（新建） |

Manus 在 V0 交付后负责：
- 安装 `react-native-gifted-charts`
- 修复所有移动端兼容问题（SafeAreaView、gap、MotiView 数组动画等）
- 路由注册和 Store 数据绑定
- AI LLM 接入（commander-chat）
- 演示流程端到端测试
- 生成最终 APK

---

*文档版本：v2.0 · 2026-03-06 · Commander Phone MVP*
