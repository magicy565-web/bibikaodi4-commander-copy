# V0 Round 2 — 三个新页面提示词
# Commander Phone MVP · 卡贝奇家具外贸 AI 指挥官

> **分工说明**：V0 只负责 UI 组件和交互动效，所有数据用本地 const 数组，不写任何 API 调用、store 引用、路由逻辑。Manus 负责后端集成。
> **技术栈**：React Native + Expo SDK 54 + NativeWind + moti + lucide-react-native + expo-linear-gradient
> **模型**：Claude Opus 4.5

---

## 提示词 1：市场情报详情页 `market-intel/[id].tsx`

```
You are building a React Native screen for a foreign trade AI app called "Commander Phone".
This is the Market Intelligence Detail page — it shows deep AI analysis of a specific market opportunity.

## Design System (MUST follow exactly)
- Background: pure #000000
- Glass cards: backgroundColor rgba(255,255,255,0.04), borderWidth 1, borderColor rgba(255,255,255,0.08), borderRadius 16
- Primary accent: #3B82F6 (blue)
- Secondary accent: #A78BFA (purple)  
- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Danger: #EF4444 (red)
- All text: white or rgba(255,255,255,0.6) for secondary
- Font weights: 100 for large display numbers, 600 for labels, 400 for body
- Icons: lucide-react-native ONLY
- Animations: MotiView with spring { type: 'spring', stiffness: 300, damping: 25 }
- NO StyleSheet.create — inline styles only

## Screen Layout

### Header
- Back button (ChevronLeft icon, 20px, white) on left
- Title "市场情报" (white, 18px, fontWeight 600) centered
- Share button (Share2 icon) on right
- Below header: large market name "🇸🇦 沙特阿拉伯" (28px, fontWeight 100) + subtitle "家居软装市场 · 2026 Q1" (14px, rgba(255,255,255,0.5))

### AI Confidence Score Bar
Full-width glass card with:
- Left: "AI 置信度" label + "92%" in large blue text (48px, fontWeight 100)
- Right: vertical stack of 3 mini stats:
  - "数据源 · 47个" 
  - "更新 · 2小时前"
  - "趋势 ↑ 强烈"
- Bottom: thin progress bar (blue, 92% filled, borderRadius 4, height 3)

### Opportunity Score Radar (SVG-based, no external chart library)
Glass card titled "机会评分" with a hand-drawn SVG pentagon radar chart:
- 5 axes: 市场规模 / 竞争强度(反向) / 采购意愿 / 价格匹配 / 文化契合
- Scores: 88 / 72 / 91 / 85 / 78
- Outer pentagon: rgba(255,255,255,0.1) stroke
- Filled area: rgba(59,130,246,0.3) fill + #3B82F6 stroke
- Each axis label in white 10px text at the tip
- Center dot: #3B82F6, radius 4

### Key Insights (3 cards in vertical stack)
Each insight card has:
- Left colored strip (4px wide): blue/green/amber
- Icon (16px) + category label (12px, muted)
- Main insight text (14px, white, 2 lines max)
- Confidence badge (small pill, right-aligned)

Card 1 (blue strip, TrendingUp icon): "斋月季前6周是家纺采购高峰，2025年沙特进口家纺同比增长34%，主要来自中国和土耳其"
Card 2 (green strip, Users icon): "目标买家画像：利雅得/吉达的中型家居连锁，年采购额$50万-$200万，偏好OEM定制+独家设计"  
Card 3 (amber strip, AlertTriangle icon): "主要竞争来自土耳其（价格低15%）和印度（交期短），差异化需强调设计感和快速打样能力"

### Recommended Buyer Profiles (horizontal ScrollView, no scrollbar)
Title "推荐买家画像" + "AI 匹配" badge (blue pill)
3 buyer profile cards (each 160px wide, glass):
- Country flag emoji + company name
- City + annual purchase volume
- Match score: colored circle with percentage
- 2 tag pills (product preference)

Buyers:
1. 🇸🇦 Al-Noor Home · 利雅得 · $120万/年 · 94%匹配 · [软装定制] [OEM]
2. 🇸🇦 Desert Living · 吉达 · $85万/年 · 87%匹配 · [家纺套装] [独家设计]
3. 🇦🇪 Gulf Decor · 迪拜 · $200万/年 · 81%匹配 · [高端家居] [展厅陈列]

### AI Action Plan
Glass card titled "AI 行动建议" with 3 numbered steps:
Step 1 (blue circle "1"): "立即准备斋月季专题图册 — 突出暖色调、祈祷毯、客厅套装，建议本周内完成"
Step 2 (purple circle "2"): "定向开发 Al-Noor Home — Rex 已找到采购总监 LinkedIn，建议发送定制化开发信"  
Step 3 (green circle "3"): "参加 2026 迪拜家居展 (3月18-22日) — AI 已生成参展方案，点击查看"

### Bottom Action Button
Full-width button: "指派 Rex 开始开发" 
- Background: linear gradient #3B82F6 → #1D4ED8
- Height 56px, borderRadius 16
- Left: Bot icon (white, 20px)
- Text: "指派 Rex 开始开发" (white, 16px, fontWeight 600)
- Right: ChevronRight icon
- Press: scale 0.97 + hapticLight

## Data (local const, no API)
const MARKET_DATA = {
  id: 'saudi-2026q1',
  market: '沙特阿拉伯',
  flag: '🇸🇦',
  category: '家居软装市场',
  period: '2026 Q1',
  confidence: 92,
  trend: '强烈',
  dataSources: 47,
  updatedAt: '2小时前',
  radarScores: { marketSize: 88, competition: 72, buyerIntent: 91, priceMatch: 85, cultureFit: 78 },
}

## Technical Requirements
- File: app/market-intel/[id].tsx
- Use useLocalSearchParams() from expo-router to get id param (but display static data)
- SafeAreaView from react-native-safe-area-context
- ScrollView as root container
- MotiView for all card entrance animations (from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }})
- Each card has delay: index * 80
- lucide-react-native for all icons
- NO external chart library — SVG radar chart using react-native-svg (Svg, Polygon, Line, Text from react-native-svg)
- TypeScript strict
- NO StyleSheet.create
- NO API calls, NO store imports
- All data as local const
```

---

## 提示词 2：资产能力包详情页 `asset-package.tsx`

```
You are building a React Native screen for "Commander Phone" — a foreign trade AI app for furniture/textile manufacturers.
This is the Asset Package page — it shows the factory's complete digital capability package as a visual showcase.

## Design System (same as project standard)
- Background: #000000
- Glass cards: backgroundColor rgba(255,255,255,0.04), border rgba(255,255,255,0.08), borderRadius 16
- Accent colors: #3B82F6 blue, #A78BFA purple, #10B981 green, #F59E0B amber
- Icons: lucide-react-native ONLY
- Animations: MotiView spring { stiffness: 300, damping: 25 }
- NO StyleSheet.create, inline styles only

## Screen: Factory Asset Package

### Header
- Back button + "资产能力包" title (18px, fontWeight 600) + Download icon (right)
- Brand row below: "KABEQ 卡贝奇" (24px, fontWeight 100, white) + "家具制造商" badge (glass pill)
- Subtitle: "广东·佛山 · 建厂2008年 · 年产能50,000件" (12px, rgba(255,255,255,0.5))

### Overall Capability Score
Large glass card (full width):
- Center: circular progress ring (SVG, radius 60, strokeWidth 8)
  - Background ring: rgba(255,255,255,0.1)
  - Progress ring: gradient from #3B82F6 to #A78BFA, 87% filled (stroke-dasharray calculation)
  - Center text: "87" (48px, fontWeight 100, white) + "综合能力" (12px, muted) below
- Below ring: 3 mini stats in a row:
  - "产品线 · 156款" | "认证 · 12项" | "市场 · 23国"
- Bottom tag row: [沙发] [休闲椅] [茶几] [定制OEM] [一件代发] — each a small glass pill

### Capability Radar (SVG pentagon, same style as market intel page)
Glass card titled "能力雷达" with 5 axes:
- 产品丰富度: 92
- 定制能力: 88  
- 交货速度: 75
- 价格竞争力: 82
- 品质认证: 90
Pentagon radar, blue fill rgba(59,130,246,0.25), #3B82F6 stroke

### Asset Modules (2-column grid)
Title "资产模块" + "6 项已激活" badge (green pill)

6 module cards in 2-column grid (each card ~(screenWidth/2 - 24)px wide):
Each card has:
- Top: icon (24px) in colored circle (40px)
- Module name (14px, fontWeight 600, white)
- File count or status (12px, muted)
- Bottom: activated indicator (green dot + "已激活" or amber dot + "更新中")

Modules:
1. 📋 产品图册 (FileText, blue circle) · "156款产品 · 已激活"
2. 🎬 营销视频 (Video, purple circle) · "8个视频 · 已激活"  
3. 🏆 质量认证 (Award, amber circle) · "ISO9001 等12项 · 已激活"
4. ⚙️ 定制能力 (Settings, green circle) · "OEM/ODM · 已激活"
5. 📦 一件代发 (Package, blue circle) · "最低1件起 · 已激活"
6. 🌍 市场案例 (Globe, purple circle) · "23国案例 · 更新中"

### Product Highlights (horizontal ScrollView)
Title "明星产品" with 4 product cards (each 140px wide):
Each card (glass, borderRadius 12):
- Product image placeholder (80px height, gradient background #1a1a2e → #16213e, centered product emoji)
- Product name (12px, white, fontWeight 600)
- Price range (11px, blue)
- Market tag (10px, amber pill)

Products:
1. 🛋️ KB-S2024 意式极简沙发 · $180-$320 · [中东热销]
2. 🪑 KB-C1089 北欧休闲椅 · $85-$150 · [东南亚]
3. 🛋️ KB-S3012 现代布艺沙发 · $220-$380 · [俄罗斯]
4. ☕ KB-T2045 大理石茶几 · $120-$200 · [欧洲]

### Export Markets Map (simple visual)
Glass card titled "出口市场分布":
- Row of flag+country+bar visual (no real map, just styled list):
  🇸🇦 沙特阿拉伯 ████████░░ 32%
  🇷🇺 俄罗斯     ██████░░░░ 24%
  🇦🇪 阿联酋     █████░░░░░ 18%
  🇲🇾 马来西亚   ████░░░░░░ 14%
  🇹🇭 泰国       ███░░░░░░░ 12%
- Each bar: View with blue background, width proportional to percentage, height 4px, borderRadius 2

### Bottom Action
2 buttons side by side:
- Left (glass): "生成开发信" + Mail icon
- Right (blue gradient): "分享能力包" + Share2 icon

## Technical Requirements
- File: app/asset-package.tsx
- SafeAreaView from react-native-safe-area-context
- ScrollView root
- MotiView entrance animations (staggered, delay: index * 60)
- SVG radar using react-native-svg
- NO external libraries beyond what's listed
- TypeScript strict, NO StyleSheet.create, NO API calls
```

---

## 提示词 3：登录页 `login.tsx`（替换现有版本）

```
You are redesigning the login screen for "Commander Phone" — an AI-powered foreign trade app for factory bosses.
The existing login screen is outdated. Redesign it in Apple Watch Ultra / premium dark aesthetic.

## Design System
- Background: pure #000000 with very subtle radial gradient (rgba(59,130,246,0.08) glow at top center)
- Glass cards: rgba(255,255,255,0.04) bg, rgba(255,255,255,0.08) border
- Primary: #3B82F6
- All text: white or rgba(255,255,255,0.5) muted
- NO StyleSheet.create, inline styles only
- MotiView for entrance animations
- lucide-react-native icons

## Screen Layout (single ScrollView, vertically centered)

### Top Section (flex: 1, justify center)
- App logo: circular container (80px), gradient background #1e3a5f → #0f1f3d, centered
  Inside: a stylized "C" letter in #3B82F6, 36px, fontWeight 100
  Outer glow: shadowColor #3B82F6, shadowRadius 20, shadowOpacity 0.4
- App name: "COMMANDER" (24px, fontWeight 100, letterSpacing 8, white)
- Tagline: "你的 AI 外贸指挥官" (14px, rgba(255,255,255,0.5), letterSpacing 2)
- Version badge: glass pill "MVP · 3月12日演示版" (10px, muted)

### Login Form (glass card, marginHorizontal 24, borderRadius 20, padding 24)
- Section label: "登录指挥中心" (12px, rgba(255,255,255,0.4), letterSpacing 2, marginBottom 20)

- Phone input field:
  - Glass background rgba(255,255,255,0.06), borderRadius 12, height 52
  - Left: Phone icon (16px, rgba(255,255,255,0.4))
  - TextInput: placeholder "手机号 / 邮箱", placeholderTextColor rgba(255,255,255,0.3), white text, fontSize 15
  - No border by default, subtle border rgba(255,255,255,0.15) on focus

- Password input field (same style):
  - Left: Lock icon
  - Right: Eye/EyeOff toggle icon
  - Placeholder: "密码"

- "演示模式" quick-fill row (below password):
  Small text "演示账号：" + blue pressable text "demo@kabeq.com / demo123" (12px, #3B82F6)
  Tapping it fills both fields

- Login button (marginTop 20):
  - Height 52px, borderRadius 14
  - Background: linear gradient #3B82F6 → #1D4ED8
  - Text: "进入指挥中心" (16px, fontWeight 600, white)
  - Right: ArrowRight icon (white, 18px)
  - Press state: scale 0.97, opacity 0.9
  - Loading state: ActivityIndicator replaces text

### Bottom Section
- Divider line with "或" text centered (rgba(255,255,255,0.1) lines)
- "跳过登录 · 演示模式" pressable text (14px, rgba(255,255,255,0.4))
  Tapping navigates to main app without auth check

### Entrance Animations
- Logo fades in from top (translateY: -20 → 0, opacity 0 → 1, delay 0)
- App name fades in (delay 150)
- Form card slides up (translateY: 30 → 0, opacity 0 → 1, delay 300)
- Bottom section fades in (delay 500)
All use MotiView with spring { stiffness: 200, damping: 20 }

## Interaction Notes
- "演示模式" button fills fields with demo credentials
- "跳过登录" navigates directly to tabs (for demo purposes)
- Login button shows loading for 1.5s then navigates to tabs
- All navigation uses router.replace('/(tabs)') from expo-router

## Technical Requirements  
- File: app/login.tsx (REPLACE existing file)
- SafeAreaView from react-native-safe-area-context
- useState for phone, password, showPassword, isLoading
- useRouter from expo-router
- MotiView for all animations
- LinearGradient from expo-linear-gradient for button
- NO API calls — simulate login with setTimeout 1500ms
- TypeScript strict
- NO StyleSheet.create
```

---

## 给 V0 的统一注意事项

1. **不要引入新的 npm 包**，只用项目已有的：`moti`、`lucide-react-native`、`expo-linear-gradient`、`react-native-svg`、`expo-router`、`react-native-safe-area-context`

2. **不要写 store 引用**（不要 import useStore 或 useCommanderStore），所有数据用本地 const

3. **不要写 API 调用**（不要 fetch、axios、trpc），Manus 后续集成

4. **SVG 雷达图**用 `react-native-svg` 的 `Svg`、`Polygon`、`Line`、`Text` 组件手写，不用 victory-native 或 react-native-chart-kit

5. **所有 Pressable 用 style prop**，不用 className（NativeWind 的 Pressable 有已知问题）

6. **文件路径**：
   - `app/market-intel/[id].tsx`
   - `app/asset-package.tsx`  
   - `app/login.tsx`（替换现有文件）
