# Commander Phone MVP — TODO

## 基础架构
- [x] 配置深色主题色彩体系（紫色主色调）
- [x] 搭建底部 Tab 导航（战报/资产/询盘/设置）
- [x] 创建登录页（品牌 Splash + 手机号登录）
- [x] 生成 App Logo 并配置品牌信息

## 工厂数据智能托管 (AssetVault)
- [x] 文件上传区域 UI（PDF/Excel/图片）
- [x] 上传进度与状态显示
- [x] AI 解构动画与进度展示
- [x] 产品知识节点 (ProductNeuron) 卡片
- [x] 资产列表（未处理/解构中/已激活）
- [x] 知识标签展示（材质/应用/市场/优势/买家）

## 自动获客 AI 模块 (Warroom)
- [x] 老板战报首页（今日 KPI 数据）
- [x] AI 工作日志列表（时间线样式）
- [x] 询盘管理列表（5 条真实感数据）
- [x] 询盘详情（AI 草稿 + 置信度）
- [x] 一键发送/审批 AI 回复
- [x] 高意向询盘标红高亮

## AI 能力集成
- [x] 对接后端 AI 服务（invokeLLM）
- [x] 询盘分析 API（意图识别 + 草稿生成）
- [x] 产品知识提取 API

## UI 打磨与演示
- [x] 深色毛玻璃卡片风格统一
- [x] 演示数据填充（真实感 Mock）
- [x] App 名称/图标/启动页配置
- [x] 设置页（AI 配置 + 退出登录）

## 待优化（3月12日前）
- [ ] 真实 AI 接口联调（当前为 mock 数据演示）
- [ ] Android APK 构建与真机测试
- [ ] 演示流程脚本完善

## 设计迁移（bibikaodi4 Apple Watch Ultra 风格）
- [ ] 安装 moti、lucide-react-native、expo-linear-gradient 依赖
- [ ] 迁移 constants/theme.ts（C 颜色系统 + SPRING 动画配置）
- [ ] 迁移 constants/store.tsx（全局状态管理 + 任务闭环）
- [ ] 迁移 services/ai.ts（Commander AI 意图识别 + 12 外贸场景）
- [ ] 重写首页为 Watch Face 表盘样式（超大时钟 + 快速统计 + 数字员工动态）
- [ ] 重写 Tab 导航（MotiView 弹簧动画 + lucide 图标）
- [ ] 重写 AssetVault（活动环 + LinearGradient 上传区域）
- [ ] 新增 DecisionFeed 决策卡片流（三区域布局 + 滑动手势）
- [ ] 新增 CommanderChat AI 对话（打字机动效 + ActionCard）
- [ ] 重写询盘/设置页为 bibikaodi4 风格

## Tab 清理（2026-03-06）
- [x] 删除 app/(tabs)/assets.tsx（旧版资产托管页）
- [x] 删除 app/(tabs)/inquiries.tsx（旧版询盘管理页）
- [x] 从 Tab 导航中移除对应入口（两个文件本就不在 bibikaodi4 Tab 导航中）
