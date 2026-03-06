# Commander Phone MVP — V0 Max 视觉提升完整提示词

> **目标**：将 Commander Phone MVP 从功能完整版升级为视觉精美版，达到 Apple Watch Ultra 级别的设计质感。
> 
> **时间线**：3 月 12 日前完成
> 
> **交付物**：可直接生成 APK 的生产级代码

---

## 📋 项目背景

### 产品定位
- **用户**：中国外贸工厂老板（KABEQ 卡贝奇家具厂示例）
- **核心价值**：AI 战略指挥官 + 自动获客 + 资产智能托管
- **设计语言**：Apple Watch Ultra 风格（深色 + 高对比 + 毛玻璃 + 渐变 + 动画）
- **主色调**：紫色系（#7C3AED 主色 + #A78BFA 浅紫 + #6D28D9 深紫）

### 现状
- ✅ 功能完整（登录、主页、决策流、客户管理、AI 对话、资产管理）
- ✅ 路由串联完成（所有页面可互相跳转）
- ✅ 后端 LLM 集成（tRPC commanderChat 路由）
- ⚠️ **需要视觉提升**：动画细节、色彩搭配、排版精度、交互反馈

---

## 🎨 视觉设计规范

### 色彩系统（深色主题）

| 用途 | 颜色 | Hex | 说明 |
|------|------|-----|------|
| 主色 | 紫色 | `#7C3AED` | 按钮、强调、链接 |
| 浅紫 | 浅紫 | `#A78BFA` | 悬停、次级强调 |
| 深紫 | 深紫 | `#6D28D9` | 深层强调、边框 |
| 背景 | 黑色 | `#0F0F0F` | 屏幕背景 |
| 表面 | 深灰 | `#1A1A1A` | 卡片背景 |
| 玻璃 | 半透 | `rgba(255,255,255,0.08)` | 毛玻璃卡片 |
| 文字主 | 白色 | `#FFFFFF` | 主文本 |
| 文字次 | 浅灰 | `#A0A0A0` | 次级文本 |
| 文字弱 | 中灰 | `#666666` | 弱文本 |
| 成功 | 绿色 | `#10B981` | 成功状态 |
| 警告 | 黄色 | `#F59E0B` | 警告状态 |
| 错误 | 红色 | `#EF4444` | 错误状态 |
| 信息 | 蓝色 | `#3B82F6` | 信息状态 |

### 排版系统

| 用途 | 大小 | 粗细 | 行高 |
|------|------|------|------|
| 超大标题 | 48px | 700 | 56px |
| 大标题 | 32px | 700 | 40px |
| 标题 | 24px | 700 | 32px |
| 副标题 | 18px | 600 | 26px |
| 正文 | 16px | 400 | 24px |
| 小正文 | 14px | 400 | 20px |
| 标签 | 12px | 500 | 16px |
| 极小 | 11px | 400 | 14px |

### 间距系统（8px 基准）

```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
```

### 圆角系统

```
sm: 4px
md: 8px
lg: 12px
xl: 16px
2xl: 20px
full: 9999px
```

### 阴影系统

```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.2)
xl: 0 20px 25px rgba(0,0,0,0.3)
```

---

## 🎬 动画规范

### 弹簧动画（用于卡片进场、按钮反馈）

```typescript
const SPRING = {
  type: 'spring',
  damping: 10,
  mass: 1,
  stiffness: 100,
};

const SPRING_GENTLE = {
  type: 'spring',
  damping: 12,
  mass: 1,
  stiffness: 80,
};
```

### 过渡动画（用于展开/收起、淡入淡出）

```typescript
const TIMING_FAST = { type: 'timing', duration: 150 };
const TIMING_NORMAL = { type: 'timing', duration: 250 };
const TIMING_SLOW = { type: 'timing', duration: 350 };
```

### 常见动画模式

| 场景 | 动画 | 参数 |
|------|------|------|
| 卡片进场 | 淡入 + 上升 | opacity: 0→1, translateY: 20→0, duration: 250ms |
| 按钮按下 | 缩放 + 不透明 | scale: 1→0.97, opacity: 1→0.9, duration: 80ms |
| 展开菜单 | 高度展开 + 淡入 | maxHeight: 0→auto, opacity: 0→1, duration: 200ms |
| 列表滚动 | 视差效果 | translateY 随滚动变化 |
| 加载中 | 旋转 + 脉冲 | rotate: 0→360, opacity: 1→0.5, loop |

---

## 📱 页面级视觉提升清单

### 1️⃣ 登录页 (`app/login.tsx`) — 品牌体验

**现状**：基础登录表单
**目标**：Apple Watch 风格品牌体验

#### 视觉升级点

1. **品牌区域优化**
   - 增加品牌 Logo 动画（进场时缩放 + 旋转）
   - "Commander" 文字使用渐变色（紫色 → 蓝色）
   - 副标题添加打字机效果（"AI 战略指挥官" 逐字出现）
   - 品牌区域下方添加光晕动画（脉冲效果）

2. **表单卡片优化**
   - 卡片背景：毛玻璃 + 渐变边框（紫色 → 透明）
   - 输入框焦点时：边框发光 + 阴影加强
   - 密码可见按钮：hover 时图标旋转 + 颜色变化
   - 表单错误提示：红色左边框 + 震动动画

3. **按钮交互**
   - 登录按钮：
     - 默认：紫色渐变 + 阴影
     - 按下：缩放 0.95 + 阴影减弱
     - 加载中：脉冲动画 + 加载圈
   - 演示账号按钮：次级样式（白色边框 + 透明背景）
   - 跳过按钮：文字链接样式（浅紫色 + 下划线）

4. **分隔线优化**
   - 使用渐变分隔线（两端透明 → 中间白色）
   - 中间文字 "或" 使用渐变背景

5. **页面过渡**
   - 登录成功时：卡片缩小消失 + 屏幕白光闪烁
   - 进入主页：主页卡片从下方上升进场

#### 代码示例框架

```typescript
// 品牌 Logo 进场动画
<MotiView
  from={{ opacity: 0, scale: 0.8, rotate: -10 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={SPRING}
>
  {/* Logo */}
</MotiView>

// 表单卡片毛玻璃边框
<LinearGradient
  colors={[C.PL + '50', 'transparent']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ borderRadius: 16, padding: 1 }}
>
  <View style={{ 
    backgroundColor: C.bgGlass,
    borderRadius: 15,
    padding: 24,
  }}>
    {/* 表单内容 */}
  </View>
</LinearGradient>
```

---

### 2️⃣ 主页 (`app/(tabs)/index.tsx`) — Watch Face 升级

**现状**：基础卡片布局
**目标**：Apple Watch Ultra 表盘风格

#### 视觉升级点

1. **时钟区域**
   - 超大时钟（48px 粗体）使用单色渐变
   - 日期副标题（浅灰色，12px）
   - 时钟下方添加脉冲光晕（每秒闪烁）

2. **KPI 卡片优化**
   - 卡片背景：毛玻璃 + 彩色左边框（3px）
   - 数字使用渐变色（与边框颜色对应）
   - 趋势箭头：上升绿色、下降红色，带微动画
   - 卡片 hover：背景亮度 +10%、阴影加强

3. **图表区域（BarChart）**
   - 柱子颜色：渐变（紫色 → 蓝色）
   - 背景网格线：极淡（rgba(255,255,255,0.05)）
   - 数据标签：浅灰色，12px
   - 图表进场：柱子从下往上生长（250ms 弹簧动画）

4. **数字员工卡片**
   - 员工头像：圆形 + 彩色边框（对应员工颜色）
   - 员工名字：粗体 + 渐变色
   - 任务状态：绿色脉冲指示灯（running 时）
   - 卡片点击：放大 + 跳转到员工详情

5. **资产能力包卡片**
   - 背景：毛玻璃 + 渐变上边框
   - 图标：大号（24px）+ 彩色
   - 标签：横向滚动，每个标签带微动画
   - "查看全部"按钮：箭头图标右移动画

6. **底部快捷按钮**
   - 按钮组：横向排列，间距均匀
   - 按钮样式：圆形 + 渐变背景 + 阴影
   - 按下反馈：缩放 0.95 + 震动

#### 代码示例框架

```typescript
// KPI 卡片毛玻璃 + 彩色左边框
<MotiView
  from={{ opacity: 0, translateX: -20 }}
  animate={{ opacity: 1, translateX: 0 }}
  transition={SPRING_GENTLE}
>
  <View style={{
    flexDirection: 'row',
    backgroundColor: C.bgGlass,
    borderRadius: 12,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: C.green,
  }}>
    <View style={{ flex: 1, padding: 12 }}>
      {/* KPI 内容 */}
    </View>
  </View>
</MotiView>

// 图表进场动画
<MotiView
  from={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={SPRING}
>
  <BarChart
    data={chartData}
    barRadius={6}
    barWidth={20}
    spacing={12}
    // ...
  />
</MotiView>
```

---

### 3️⃣ 决策流页面 (`app/(tabs)/decision-feed.tsx`) — 卡片交互升级

**现状**：基础卡片流 + 手势识别
**目标**：高级交互 + 视觉反馈

#### 视觉升级点

1. **卡片容器**
   - 背景：毛玻璃 + 渐变上边框（彩色）
   - 左侧竖条：3px 宽，对应决策类型颜色
   - 卡片阴影：加强（lg 级别）
   - 卡片进场：从下方上升 + 淡入（300ms 弹簧）

2. **卡片顶部区域**
   - 渐变横条：从左到右，颜色对应决策类型
   - 高度：2px，使用 LinearGradient
   - 源标签：浅灰色，11px

3. **卡片标题**
   - 字体：18px 粗体，白色
   - 点击时：文字颜色变浅紫，背景微亮
   - 点击反馈：按下时 opacity 0.8

4. **Metrics 芯片**
   - 背景：毛玻璃 + 极淡边框
   - 数值颜色：
     - 上升：绿色 + ↑ 图标
     - 下降：红色 + ↓ 图标
     - 平稳：灰色 + → 图标
   - 芯片进场：错开延迟（每个 50ms）

5. **AI 决策依据展开**
   - 展开按钮：紫色文字 + ChevronDown 图标
   - 展开动画：maxHeight 0→200, opacity 0→1, duration 250ms
   - 展开内容：左边框 2px 紫色，背景 rgba(紫色,0.1)
   - 内容文字：浅灰色，12px，行高 18px

6. **行动按钮**
   - 按钮组：底部横向排列
   - 按钮样式：
     - 确认：紫色渐变 + 白色文字
     - 跳过：边框样式 + 灰色文字
   - 按钮间距：8px
   - 按下反馈：缩放 0.95 + 不透明度 0.9

7. **卡片手势反馈**
   - 向左滑：卡片向左移出 + 淡出
   - 向右滑：卡片向右移出 + 淡出
   - 向上滑：卡片缩小消失
   - 滑动时：背景卡片向下移动（视差效果）

#### 代码示例框架

```typescript
// 卡片容器毛玻璃 + 彩色左边框
<MotiView
  from={{ opacity: 0, translateY: 30 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={SPRING}
>
  <View style={{
    backgroundColor: C.bgGlass,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: accentColor,
    overflow: 'hidden',
  }}>
    {/* 渐变横条 */}
    <LinearGradient
      colors={[accentColor, accentColor + '00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height: 2 }}
    />
    {/* 卡片内容 */}
  </View>
</MotiView>

// AI 依据展开动画
<MotiView
  animate={{ maxHeight: expanded ? 200 : 0, opacity: expanded ? 1 : 0 }}
  transition={TIMING_NORMAL}
  style={{ overflow: 'hidden' }}
>
  {/* 展开内容 */}
</MotiView>
```

---

### 4️⃣ 市场情报详情页 (`app/market-intel/[id].tsx`) — 数据可视化升级

**现状**：基础图表 + 文本
**目标**：高级数据可视化 + 交互

#### 视觉升级点

1. **页头区域**
   - 背景：深紫色渐变 + 毛玻璃效果
   - 标题：32px 粗体，白色
   - 副标题：14px，浅灰色
   - 返回按钮：圆形 + 半透明背景，按下时缩放

2. **BarChart 进口趋势**
   - 柱子颜色：渐变（紫色 → 蓝色）
   - 柱子宽度：24px，间距 12px
   - 背景网格：极淡（rgba(255,255,255,0.03)）
   - 数据标签：12px，浅灰色
   - 图表进场：柱子从下往上生长（300ms 弹簧）
   - 交互：点击柱子显示详细数据 tooltip

3. **机会评分卡片**
   - 背景：毛玻璃 + 上边框渐变
   - 评分数字：48px 粗体，渐变色（绿色 → 蓝色）
   - 评分标签：14px，浅灰色
   - 进度条：
     - 背景：rgba(255,255,255,0.1)
     - 填充：渐变色，对应评分等级
     - 动画：从 0 到目标值，duration 800ms

4. **关键洞察卡片**
   - 卡片组：竖向排列，间距 12px
   - 卡片背景：毛玻璃 + 彩色左边框（3px）
   - 左边框颜色：轮流使用 绿/蓝/紫
   - 卡片标题：14px 粗体，白色
   - 卡片内容：13px，浅灰色，行高 18px
   - 卡片进场：错开延迟（每个 100ms）

5. **推荐买家卡片**
   - 容器：横向滚动，间距 12px
   - 卡片宽度：140px，高度 auto
   - 卡片背景：毛玻璃 + 上边框渐变
   - 买家头像：圆形，40px，彩色边框
   - 买家名字：14px 粗体，白色
   - 匹配度：环形进度指示（PieChart 或自绘）
   - 卡片点击：放大 + 跳转到客户详情

6. **AI 行动建议**
   - 背景：毛玻璃 + 紫色左边框
   - 标题：16px 粗体，紫色
   - 步骤卡片：
     - 编号圆圈：紫色背景，白色数字
     - 步骤标题：14px 粗体，白色
     - 步骤描述：13px，浅灰色
   - 步骤间连接线：虚线，浅灰色
   - 指派按钮：紫色渐变，白色文字

#### 代码示例框架

```typescript
// 机会评分进度条动画
<MotiView
  animate={{ width: `${score}%` }}
  transition={{ type: 'timing', duration: 800 }}
  style={{
    height: 6,
    borderRadius: 3,
    background: `linear-gradient(90deg, #10B981, #3B82F6)`,
  }}
/>

// 关键洞察卡片错开进场
{insights.map((insight, idx) => (
  <MotiView
    key={idx}
    from={{ opacity: 0, translateX: -20 }}
    animate={{ opacity: 1, translateX: 0 }}
    transition={{ ...SPRING_GENTLE, delay: idx * 100 }}
  >
    {/* 卡片内容 */}
  </MotiView>
))}
```

---

### 5️⃣ 资产能力包页面 (`app/asset-package.tsx`) — 仪表板升级

**现状**：基础图表 + 网格
**目标**：高级仪表板 + 交互

#### 视觉升级点

1. **页头区域**
   - 背景：深蓝色渐变 + 毛玻璃
   - 标题：28px 粗体，白色
   - 副标题：14px，浅灰色
   - 返回按钮：圆形 + 半透明

2. **PieChart 综合评分**
   - 圆形大小：200px
   - 背景圆：rgba(255,255,255,0.1)
   - 填充圆：渐变色（紫 → 蓝）
   - 中心数字：48px 粗体，渐变色
   - 百分比标签：14px，浅灰色
   - 进场动画：圆形从 0° 旋转到目标角度（600ms）

3. **4 维度评分网格**
   - 网格：2x2 布局
   - 卡片背景：毛玻璃 + 上边框渐变
   - 维度标题：12px 粗体，浅紫色
   - 评分条：
     - 背景：rgba(255,255,255,0.1)
     - 填充：对应维度颜色
     - 动画：从 0 到目标值，duration 600ms
   - 评分数字：16px 粗体，白色
   - 卡片进场：错开延迟（每个 80ms）

4. **资产模块网格**
   - 网格：3 列布局（移动端可调为 2 列）
   - 卡片背景：毛玻璃 + 彩色上边框
   - 模块图标：32px，彩色
   - 模块名字：14px 粗体，白色
   - 模块描述：12px，浅灰色
   - 卡片点击：放大 + 背景亮度 +10%
   - 卡片进场：网格布局动画（stagger）

5. **明星产品卡片**
   - 容器：横向滚动，间距 12px
   - 卡片宽度：120px，高度 160px
   - 卡片背景：毛玻璃 + 渐变边框
   - 产品图片：120x100px，圆角 8px
   - 产品名字：12px 粗体，白色
   - 产品 emoji：20px，居中
   - 卡片点击：放大 + 跳转到产品详情

6. **出口市场分布图**
   - 图表类型：BarChart（横向）
   - 柱子颜色：渐变（紫 → 蓝）
   - 柱子高度：对应百分比
   - 背景网格：极淡
   - 数据标签：12px，浅灰色
   - 图表进场：柱子从左往右生长（300ms）

7. **底部操作按钮**
   - 按钮组：横向排列，间距 12px
   - 按钮宽度：均等分
   - 按钮样式：
     - 主按钮：紫色渐变 + 白色文字
     - 次按钮：边框样式 + 灰色文字
   - 按下反馈：缩放 0.95 + 不透明度 0.9

#### 代码示例框架

```typescript
// PieChart 进场动画
<MotiView
  from={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={SPRING}
>
  <PieChart
    data={pieData}
    donut
    innerRadius={70}
    // ...
  />
</MotiView>

// 维度评分条动画
{dimensions.map((dim, idx) => (
  <MotiView
    key={idx}
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ ...SPRING_GENTLE, delay: idx * 80 }}
  >
    <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
      <MotiView
        animate={{ width: `${dim.score}%` }}
        transition={{ type: 'timing', duration: 600 }}
        style={{ height: '100%', backgroundColor: dim.color, borderRadius: 3 }}
      />
    </View>
  </MotiView>
))}
```

---

### 6️⃣ Commander Chat 页面 (`app/(tabs)/commander-chat.tsx`) — 对话交互升级

**现状**：基础对话 + ActionCard
**目标**：高级交互 + 打字机动效

#### 视觉升级点

1. **消息气泡**
   - 用户消息：
     - 背景：紫色渐变
     - 文字：白色，14px
     - 圆角：12px
     - 对齐：右侧
   - AI 消息：
     - 背景：毛玻璃 + 极淡边框
     - 文字：白色，14px
     - 圆角：12px
     - 对齐：左侧
   - 消息进场：淡入 + 上升（200ms）

2. **打字机动效**
   - AI 消息逐字出现（速度：16ms/字）
   - 光标闪烁（opacity 脉冲）
   - 完成后光标消失

3. **ActionCard 优化**
   - 卡片背景：毛玻璃 + 彩色上边框
   - 标签：
     - 执行方案标签：彩色背景 + 白色文字
     - 已修改标签：黄色背景 + 黑色文字
   - 标题：16px 粗体，白色
   - 执行动作：13px，白色，左对齐
   - 元数据行：12px，浅灰色，芯片样式
   - 推理：12px，浅灰色，行高 16px
   - 卡片进场：从下方上升 + 淡入（300ms 弹簧）

4. **渠道修改选项**
   - 展开按钮：紫色文字 + ChevronDown 图标
   - 展开动画：maxHeight 0→auto, opacity 0→1, duration 200ms
   - 渠道选项：
     - 未选中：灰色边框 + 透明背景
     - 已选中：彩色边框 + 彩色半透明背景
     - 点击反馈：缩放 0.95 + 颜色变化

5. **快捷操作按钮**
   - 按钮组：网格布局（2x3）
   - 按钮样式：圆形 + 渐变背景 + 阴影
   - 按钮图标：20px，白色
   - 按钮标签：12px，白色
   - 按下反馈：缩放 0.95 + 阴影减弱

6. **输入框区域**
   - 背景：毛玻璃 + 上边框渐变
   - 输入框：
     - 背景：透明
     - 文字：白色，16px
     - 占位符：浅灰色
     - 焦点时：上边框发光
   - 发送按钮：
     - 默认：灰色
     - 有内容时：紫色渐变
     - 按下：缩放 0.95

#### 代码示例框架

```typescript
// 消息气泡进场
<MotiView
  from={{ opacity: 0, translateY: 20 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={TIMING_FAST}
>
  {/* 消息内容 */}
</MotiView>

// ActionCard 进场
<MotiView
  from={{ opacity: 0, translateY: 10 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={SPRING_GENTLE}
>
  {/* ActionCard 内容 */}
</MotiView>

// 渠道选项展开
<MotiView
  from={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={TIMING_FAST}
>
  {/* 渠道选项 */}
</MotiView>
```

---

### 7️⃣ 客户管理页面 (`app/(tabs)/crm.tsx`) — 列表优化

**现状**：基础列表
**目标**：高级列表 + 交互

#### 视觉升级点

1. **页头区域**
   - 背景：蓝色渐变 + 毛玻璃
   - 标题：28px 粗体，白色
   - 搜索框：毛玻璃 + 搜索图标

2. **客户卡片**
   - 背景：毛玻璃 + 彩色左边框
   - 客户头像：圆形，40px，彩色边框
   - 客户名字：14px 粗体，白色
   - 客户信息：12px，浅灰色
   - 采购意图：彩色标签（高/中/低）
   - 卡片点击：背景亮度 +10% + 跳转详情
   - 卡片进场：错开延迟（每个 50ms）

3. **列表动画**
   - 列表进场：卡片从下方上升（stagger）
   - 列表滚动：视差效果（卡片向下移动）

#### 代码示例框架

```typescript
// 客户卡片
<MotiView
  from={{ opacity: 0, translateX: -20 }}
  animate={{ opacity: 1, translateX: 0 }}
  transition={{ ...SPRING_GENTLE, delay: idx * 50 }}
>
  <Pressable
    onPress={() => router.push(`/crm/${customer.id}`)}
    style={({ pressed }) => ({
      backgroundColor: pressed ? C.bgGlass + 'cc' : C.bgGlass,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: customer.color,
      padding: 12,
    })}
  >
    {/* 卡片内容 */}
  </Pressable>
</MotiView>
```

---

### 8️⃣ 客户详情页 (`app/crm/[id].tsx`) — 详情页优化

**现状**：基础详情
**目标**：高级详情 + 交互

#### 视觉升级点

1. **页头区域**
   - 背景：客户颜色渐变 + 毛玻璃
   - 客户头像：圆形，80px，彩色边框
   - 客户名字：28px 粗体，白色
   - 客户信息：14px，浅灰色

2. **采购意图分析卡片**
   - 背景：毛玻璃 + 彩色上边框
   - 意图等级：大号数字 + 彩色
   - 意图描述：14px，白色
   - 置信度条：渐变色，动画填充

3. **会议建议卡片**
   - 背景：毛玻璃 + 紫色左边框
   - 建议标题：14px 粗体，紫色
   - 建议内容：13px，浅灰色，行高 18px
   - 建议进场：错开延迟

4. **底部操作按钮**
   - 按钮组：横向排列
   - 按钮样式：紫色渐变 + 白色文字

---

## 🎯 交互反馈规范

### 按钮反馈

```typescript
// 主按钮（紫色）
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    {
      backgroundColor: C.PL,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    pressed && {
      transform: [{ scale: 0.95 }],
      opacity: 0.9,
    }
  ]}
>
  <Text style={{ color: '#fff', fontWeight: '600' }}>按钮</Text>
</Pressable>

// 次按钮（边框）
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    {
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    pressed && {
      backgroundColor: 'rgba(255,255,255,0.05)',
    }
  ]}
>
  <Text style={{ color: C.t1, fontWeight: '600' }}>按钮</Text>
</Pressable>
```

### 卡片反馈

```typescript
// 卡片点击反馈
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    {
      backgroundColor: C.bgGlass,
      borderRadius: 12,
      padding: 12,
    },
    pressed && {
      backgroundColor: C.bgGlass + 'cc',
      transform: [{ scale: 0.98 }],
    }
  ]}
>
  {/* 卡片内容 */}
</Pressable>
```

### 触觉反馈

```typescript
import * as Haptics from 'expo-haptics';

// 轻微反馈（按钮点击）
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// 中等反馈（切换、确认）
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// 成功反馈
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// 错误反馈
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 🔧 技术实现清单

### 必需依赖

```json
{
  "moti": "^0.28.0",
  "expo-linear-gradient": "^14.0.0",
  "lucide-react-native": "^0.263.0",
  "react-native-gifted-charts": "^1.4.0",
  "expo-haptics": "^15.0.0"
}
```

### 代码结构建议

```
app/
  ├── (tabs)/
  │   ├── index.tsx          ← Watch Face 主页
  │   ├── decision-feed.tsx  ← 决策流
  │   ├── commander-chat.tsx ← AI 对话
  │   └── crm.tsx            ← 客户列表
  ├── login.tsx              ← 登录页
  ├── market-intel/
  │   └── [id].tsx           ← 市场情报详情
  ├── asset-package.tsx      ← 资产能力包
  └── crm/
      └── [id].tsx           ← 客户详情

constants/
  ├── theme.ts               ← 色彩系统 + 动画配置
  ├── haptics.ts             ← 触觉反馈
  └── store.tsx              ← 全局状态

components/
  ├── ui/
  │   ├── card.tsx           ← 通用卡片
  │   ├── button.tsx         ← 通用按钮
  │   ├── badge.tsx          ← 标签
  │   └── progress-bar.tsx   ← 进度条
  └── animations/
      ├── fade-in.tsx        ← 淡入动画
      ├── slide-up.tsx       ← 上升动画
      └── stagger.tsx        ← 错开动画
```

---

## 📊 性能优化建议

1. **图表优化**
   - 使用 `useMemo` 缓存图表数据
   - 图表进场动画使用 `useNativeDriver`
   - 避免频繁重新渲染

2. **列表优化**
   - 使用 `FlatList` 而非 `ScrollView` + `.map()`
   - 实现虚拟滚动（长列表）
   - 使用 `keyExtractor` 优化 key

3. **动画优化**
   - 使用 `moti` 的原生驱动动画
   - 避免在动画中更新状态
   - 使用 `useCallback` 缓存事件处理器

4. **渲染优化**
   - 使用 `React.memo` 包装纯组件
   - 避免在 render 中创建新对象
   - 使用 `useMemo` 缓存计算结果

---

## 🧪 测试清单

### 功能测试
- [ ] 所有页面可正常加载
- [ ] 所有路由可正常跳转
- [ ] 所有按钮可正常点击
- [ ] 所有表单可正常提交

### 视觉测试
- [ ] 所有动画流畅运行（60fps）
- [ ] 所有色彩准确显示
- [ ] 所有文字清晰可读
- [ ] 所有图表正确显示

### 交互测试
- [ ] 所有按钮反馈正确
- [ ] 所有卡片反馈正确
- [ ] 所有手势识别正确
- [ ] 所有触觉反馈正确

### 兼容性测试
- [ ] iOS 14+ 兼容
- [ ] Android 8+ 兼容
- [ ] Web 浏览器兼容
- [ ] 深色模式正确显示

---

## 📝 交付标准

### 代码质量
- ✅ TypeScript 零错误
- ✅ ESLint 通过
- ✅ 代码注释完整
- ✅ 命名规范统一

### 性能指标
- ✅ 首屏加载 < 2s
- ✅ 动画帧率 ≥ 55fps
- ✅ 内存占用 < 100MB
- ✅ 电池消耗 < 5%/小时

### 用户体验
- ✅ 所有页面可用
- ✅ 所有交互流畅
- ✅ 所有反馈清晰
- ✅ 所有错误可恢复

---

## 🚀 交付流程

1. **代码完成** → 本地测试通过
2. **检查点保存** → `webdev_save_checkpoint`
3. **APK 生成** → Management UI Publish 按钮
4. **真机测试** → iOS/Android 设备验证
5. **演示脚本** → 准备 3 月 12 日演示

---

## 📞 技术支持

如遇到以下问题，请参考对应解决方案：

| 问题 | 解决方案 |
|------|--------|
| 动画卡顿 | 检查是否使用了 `useNativeDriver`，避免在动画中更新状态 |
| 图表不显示 | 检查数据格式是否正确，确保 `data` 数组非空 |
| 颜色不对 | 检查 `theme.ts` 中的颜色定义，确保使用了正确的色值 |
| 路由不跳转 | 检查路由路径是否正确，确保文件存在 |
| 触觉不反馈 | 检查是否在真机上测试，模拟器不支持触觉反馈 |

---

**最后更新**：2026-03-06 13:30 GMT+8  
**项目版本**：Commander Phone MVP v1.0  
**设计语言**：Apple Watch Ultra 风格  
**目标交付**：2026-03-12
