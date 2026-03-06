/**
 * CRM 客户详情页
 * V0 设计 + 移动端兼容修复：
 * - SafeAreaView 改为 react-native-safe-area-context
 * - 移除未使用的 Animated 导入
 * - route.params 改为 expo-router useLocalSearchParams
 * - Modal 替换为内联展开（避免 Android Modal 层级问题）
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Mail, MessageCircle, Calendar, Brain } from 'lucide-react-native';
import Svg, { Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { C, SPRING, SPRING_GENTLE } from '@/constants/theme';
import { hapticLight, hapticMedium } from '@/constants/haptics';

// ─── 类型定义 ─────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  company: string;
  flag: string;
  stage: string;
  urgency: 'urgent' | 'follow-up' | 'healthy';
  score: number;
  insight: string;
  product?: string;
  value?: string;
  country?: string;
  email?: string;
}

interface RadarAxis {
  label: string;
  value: number;
}

// ─── 雷达图组件 ───────────────────────────────────────────────

const RadarChart = ({ axes }: { axes: RadarAxis[] }) => {
  const size = 200;
  const center = size / 2;
  const maxValue = 100;
  const radius = 60;

  const getPoint = (index: number, value: number) => {
    const angle = (index * 360) / axes.length - 90;
    const rad = (angle * Math.PI) / 180;
    const r = (value / maxValue) * radius;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const points = axes.map((axis, i) => getPoint(i, axis.value));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={radius} fill="rgba(123,58,237,0.1)" stroke="rgba(123,58,237,0.2)" strokeWidth="1" />
        <Polygon points={polygonPoints} fill="rgba(59,130,246,0.3)" stroke={C.blue} strokeWidth="2" />
        {axes.map((axis, i) => {
          const angle = (i * 360) / axes.length - 90;
          const rad = (angle * Math.PI) / 180;
          const labelRadius = radius + 35;
          const x = center + labelRadius * Math.cos(rad);
          const y = center + labelRadius * Math.sin(rad);
          return (
            <SvgText key={i} x={x} y={y} fontSize="10" fill={C.t3} textAnchor="middle" dy="4">
              {axis.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

// ─── 演示数据（基于卡贝奇 KABEQ 真实产品）────────────────────

const CUSTOMER_DATA: Record<string, Customer> = {
  '1': {
    id: '1',
    name: 'Ahmed Al-Rashid',
    company: 'Al-Futtaim Group',
    flag: '🇸🇦',
    stage: '开发中',
    urgency: 'urgent',
    score: 94,
    insight: '斋月季采购预算 $180K，窗口期 23 天',
    product: 'KS-837 岩石沙发 × 200 套',
    value: '$58,400',
    country: '沙特阿拉伯',
    email: 'ahmed@alfuttaim.com',
  },
  '2': {
    id: '2',
    name: 'Priya Sharma',
    company: 'HomeStyle India',
    flag: '🇮🇳',
    stage: '报价',
    urgency: 'follow-up',
    score: 78,
    insight: '价格敏感但年采购额 $2M+，强调认证价值',
    product: 'KS-824 云沙发 × 150 套',
    value: '$36,000',
    country: '印度',
    email: 'priya@homestyleindia.com',
  },
  '3': {
    id: '3',
    name: 'Fatima Al-Zahra',
    company: 'Dubai Home Decor',
    flag: '🇦🇪',
    stage: '样品',
    urgency: 'healthy',
    score: 62,
    insight: '样品已寄出 12 天，建议主动询问反馈',
    product: 'KS-801 大黑牛 × 80 套',
    value: '$22,400',
    country: '阿联酋',
    email: 'fatima@dubaihomedecor.ae',
  },
  '4': {
    id: '4',
    name: 'Nguyen Van Minh',
    company: 'Saigon Furniture Co.',
    flag: '🇻🇳',
    stage: '询盘',
    urgency: 'follow-up',
    score: 71,
    insight: '越南连锁家居品牌，首单试订 50 套起',
    product: 'KS-850 黑糖 × 50 套',
    value: '$14,500',
    country: '越南',
    email: 'minh@saigonfurniture.vn',
  },
};

const URGENCY_COLORS = { urgent: C.red, 'follow-up': C.amber, healthy: C.green };
const STAGE_COLORS: Record<string, string> = {
  '开发中': C.blue, '询盘': C.amber, '报价': C.PL, '样品': C.green, '成交': C.t1,
};

// ─── 主页面 ───────────────────────────────────────────────────

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [aiExpanded, setAiExpanded] = useState(false);

  const customer = CUSTOMER_DATA[id ?? '1'] ?? CUSTOMER_DATA['1'];
  const urgencyColor = URGENCY_COLORS[customer.urgency];
  const stageColor = STAGE_COLORS[customer.stage] ?? C.t1;

  const radarAxes: RadarAxis[] = [
    { label: '价格敏感', value: 75 },
    { label: '质量要求', value: 90 },
    { label: '交期要求', value: 85 },
    { label: '认证要求', value: 70 },
    { label: '定制需求', value: 65 },
  ];

  const aiSuggestions = [
    { icon: '💬', title: '开场话题', text: `提及斋月季备货，强调 ${customer.product?.split('×')[0].trim()} 的交期保障` },
    { icon: '🎯', title: '核心卖点', text: '工厂直供 + ISO 认证 + 定制化能力，比同类竞品快 15 天出货' },
    { icon: '⚠️', title: '预期异议', text: '价格高于市场均价 → 强调 10 年质保 + 售后服务体系' },
  ];

  const timeline = [
    { date: '今天 10:30', action: '发送报价单', latest: false },
    { date: '昨天 14:00', action: '确认产品需求', latest: false },
    { date: '3 天前', action: '初次联系', latest: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 返回按钮 */}
        <Pressable
          onPress={() => { hapticLight(); router.back(); }}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <ChevronLeft size={20} color={C.t2} strokeWidth={1.5} />
          <Text style={{ fontSize: 14, color: C.t2, marginLeft: 4 }}>客户</Text>
        </Pressable>

        {/* 客户头部信息 */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={SPRING}>
          <View
            style={{
              backgroundColor: C.bgCard,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: C.border,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 40, marginRight: 14 }}>{customer.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: C.t1 }}>{customer.name}</Text>
                <Text style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>{customer.company}</Text>
                <Text style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{customer.country} · {customer.email}</Text>
              </View>
              {/* 评分 */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: urgencyColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: urgencyColor }}>{customer.score}</Text>
              </View>
            </View>

            {/* 阶段 + 产品 + 价值 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              <View
                style={{
                  backgroundColor: stageColor + '20',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: stageColor + '40',
                  marginRight: 8,
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: stageColor }}>{customer.stage}</Text>
              </View>
              {customer.product && (
                <Text style={{ fontSize: 11, color: C.t2, flex: 1, marginBottom: 6 }}>{customer.product}</Text>
              )}
              {customer.value && (
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.amber, marginBottom: 6 }}>{customer.value}</Text>
              )}
            </View>

            {/* AI 洞察 */}
            <View
              style={{
                backgroundColor: C.bgGlass,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: C.border,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: C.t2, lineHeight: 18 }}>{customer.insight}</Text>
            </View>
          </View>
        </MotiView>

        {/* 雷达图 — 采购意图分析 */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING_GENTLE, delay: 100 }}>
          <View
            style={{
              backgroundColor: C.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.border,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.t1, marginBottom: 16 }}>采购意图分析</Text>
            <RadarChart axes={radarAxes} />
          </View>
        </MotiView>

        {/* AI 会议建议 */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING_GENTLE, delay: 150 }}>
          <Pressable
            onPress={() => { setAiExpanded(!aiExpanded); hapticLight(); }}
          >
            <View
              style={{
                backgroundColor: C.bgCard,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: C.border,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: aiExpanded ? 16 : 0 }}>
                <Brain size={16} color={C.PL} strokeWidth={1.5} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: C.t1, flex: 1 }}>AI 会议辅助建议</Text>
                <Text style={{ fontSize: 12, color: C.t2 }}>{aiExpanded ? '收起' : '展开'}</Text>
              </View>

              {aiExpanded && (
                <MotiView from={{ opacity: 0, translateY: -8 }} animate={{ opacity: 1, translateY: 0 }} transition={SPRING_GENTLE}>
                  {aiSuggestions.map((s, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        marginBottom: 12,
                        backgroundColor: C.bgGlass,
                        borderRadius: 10,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: C.border,
                      }}
                    >
                      <Text style={{ fontSize: 16, marginRight: 10 }}>{s.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.t1, marginBottom: 2 }}>{s.title}</Text>
                        <Text style={{ fontSize: 11, color: C.t2, lineHeight: 16 }}>{s.text}</Text>
                      </View>
                    </View>
                  ))}
                  <View
                    style={{
                      backgroundColor: C.amber + '20',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: C.amber + '40',
                      marginTop: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.amber }}>目标：争取样品订单确认</Text>
                  </View>
                </MotiView>
              )}
            </View>
          </Pressable>
        </MotiView>

        {/* 跟进时间线 */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING_GENTLE, delay: 200 }}>
          <View
            style={{
              backgroundColor: C.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.border,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.t1, marginBottom: 16 }}>跟进时间线</Text>
            {timeline.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: i < timeline.length - 1 ? 0 : 0 }}>
                {/* 时间线轴 */}
                <View style={{ alignItems: 'center', marginRight: 12, width: 16 }}>
                  <MotiView
                    from={item.latest ? { scale: 1 } : undefined}
                    animate={item.latest ? { scale: 1.3 } : undefined}
                    transition={item.latest ? { type: 'timing', duration: 1000, loop: true } : undefined}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: item.latest ? C.green : C.border,
                      }}
                    />
                  </MotiView>
                  {i < timeline.length - 1 && (
                    <View style={{ width: 1, height: 36, backgroundColor: C.border, marginTop: 4 }} />
                  )}
                </View>
                {/* 内容 */}
                <View style={{ flex: 1, paddingBottom: i < timeline.length - 1 ? 0 : 0, marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, color: C.t2, marginBottom: 2 }}>{item.date}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.t1 }}>{item.action}</Text>
                </View>
              </View>
            ))}
          </View>
        </MotiView>

        {/* 快速操作按钮 */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ ...SPRING, delay: 250 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { icon: Mail, label: '发邮件', color: C.blue },
              { icon: MessageCircle, label: 'WhatsApp', color: C.green },
              { icon: Calendar, label: '安排会议', color: C.PL },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Pressable
                  key={i}
                  onPress={() => hapticMedium()}
                  style={{ flex: 1, marginRight: i < 2 ? 10 : 0 }}
                >
                  <View
                    style={{
                      backgroundColor: C.bgCard,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: C.border,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Icon size={20} color={action.color} strokeWidth={1.5} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.t1, marginTop: 6 }}>{action.label}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
