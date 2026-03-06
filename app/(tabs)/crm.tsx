/**
 * CRM — 外贸客户管理
 * V0 设计 + 移动端兼容修复：
 * - SafeAreaView 改为 react-native-safe-area-context
 * - MotiView 脉冲动画改为 from/animate 循环写法
 * - gap 改为 marginBottom/marginRight（兼容旧版 Android）
 * - 移除未使用的 StyleSheet / Platform / Animated 导入
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { C, SPRING_GENTLE } from '@/constants/theme';
import { hapticLight } from '@/constants/haptics';

// ─── 类型定义 ─────────────────────────────────────────────────

type Stage = '开发中' | '询盘' | '报价' | '样品' | '成交';
type UrgencyLevel = 'urgent' | 'follow-up' | 'healthy';

interface Customer {
  id: string;
  name: string;
  company: string;
  flag: string;
  stage: Stage;
  urgency: UrgencyLevel;
  score: number;
  insight: string;
  lastContact: string;
  product?: string;
  value?: string;
}

// ─── 演示数据（基于卡贝奇 KABEQ 真实产品）────────────────────

const CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    company: 'Al-Futtaim Group',
    flag: '🇸🇦',
    stage: '开发中',
    urgency: 'urgent',
    score: 94,
    insight: '斋月季采购预算 $180K，窗口期 23 天',
    lastContact: '今天 10:30',
    product: 'KS-837 岩石沙发 × 200 套',
    value: '$58,400',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'HomeStyle India',
    flag: '🇮🇳',
    stage: '报价',
    urgency: 'follow-up',
    score: 78,
    insight: '价格敏感但年采购额 $2M+，强调认证价值',
    lastContact: '昨天',
    product: 'KS-824 云沙发 × 150 套',
    value: '$36,000',
  },
  {
    id: '3',
    name: 'Fatima Al-Zahra',
    company: 'Dubai Home Decor',
    flag: '🇦🇪',
    stage: '样品',
    urgency: 'healthy',
    score: 62,
    insight: '样品已寄出 12 天，建议主动询问反馈',
    lastContact: '3 天前',
    product: 'KS-801 大黑牛 × 80 套',
    value: '$22,400',
  },
  {
    id: '4',
    name: 'Nguyen Van Minh',
    company: 'Saigon Furniture Co.',
    flag: '🇻🇳',
    stage: '询盘',
    urgency: 'follow-up',
    score: 71,
    insight: '越南连锁家居品牌，首单试订 50 套起',
    lastContact: '2 天前',
    product: 'KS-850 黑糖 × 50 套',
    value: '$14,500',
  },
];

const FILTER_OPTIONS = ['全部', '高意向', '待回复', '跟进中', '已成交'] as const;

const STAGE_COLORS: Record<Stage, string> = {
  '开发中': C.blue,
  '询盘': C.amber,
  '报价': C.PL,
  '样品': C.green,
  '成交': C.t1,
};

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  urgent: C.red,
  'follow-up': C.amber,
  healthy: C.green,
};

// ─── 客户卡片 ─────────────────────────────────────────────────

function CustomerCard({ item }: { item: Customer }) {
  const urgencyColor = URGENCY_COLORS[item.urgency];
  const stageColor = STAGE_COLORS[item.stage];

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        router.push(`/crm/${item.id}` as any);
      }}
      style={{ marginBottom: 12 }}
    >
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={SPRING_GENTLE}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: C.bgCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          {/* 左侧紧急度条 */}
          <View style={{ width: 4, backgroundColor: urgencyColor, opacity: 0.8 }} />

          {/* 主体内容 */}
          <View style={{ flex: 1, padding: 14 }}>
            {/* 顶部：旗帜 + 姓名 + 公司 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>{item.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.t1 }}>{item.name}</Text>
                <Text style={{ fontSize: 11, color: C.t2, marginTop: 1 }}>{item.company}</Text>
              </View>
              {/* 阶段标签 */}
              <View
                style={{
                  backgroundColor: stageColor + '20',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderWidth: 1,
                  borderColor: stageColor + '40',
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: stageColor }}>{item.stage}</Text>
              </View>
            </View>

            {/* 产品 + 价值 */}
            {item.product && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 11, color: C.t3, flex: 1 }}>{item.product}</Text>
                {item.value && (
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.amber }}>{item.value}</Text>
                )}
              </View>
            )}

            {/* AI 洞察 */}
            <View
              style={{
                backgroundColor: C.bgGlass,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Text style={{ fontSize: 11, color: C.t2, lineHeight: 16 }}>{item.insight}</Text>
            </View>
          </View>

          {/* 右侧：时间 + 评分圆环 */}
          <View style={{ alignItems: 'flex-end', paddingRight: 12, paddingTop: 12, paddingBottom: 12 }}>
            <Text style={{ fontSize: 11, color: C.t2, marginBottom: 8 }}>{item.lastContact}</Text>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: urgencyColor,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: urgencyColor }}>{item.score}</Text>
            </View>
          </View>
        </View>
      </MotiView>
    </Pressable>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────

export default function CRMScreen() {
  const [activeFilter, setActiveFilter] = useState<typeof FILTER_OPTIONS[number]>('全部');
  const [pulsing, setPulsing] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        {/* 标题和过滤按钮 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '100', color: C.t1, letterSpacing: -0.5 }}>客户</Text>
          <Pressable onPress={() => hapticLight()}>
            <Filter size={22} color={C.t1} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* AI 总结栏 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.bgGlass,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 16,
          }}
        >
          {/* 修复：用 from/animate 替代数组关键帧 */}
          <MotiView
            from={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.25, opacity: 0.4 }}
            transition={{ type: 'timing', duration: 1000, loop: true }}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: C.amber,
              marginRight: 8,
            }}
          />
          <Text style={{ fontSize: 12, color: C.t2, flex: 1 }}>
            今日跟进 3 · 高意向 1 · 待回复 2
          </Text>
        </View>

        {/* 过滤选项 — 用 marginRight 替代 gap */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {FILTER_OPTIONS.map((filter, idx) => (
            <Pressable
              key={filter}
              onPress={() => { setActiveFilter(filter); hapticLight(); }}
              style={{ marginRight: 8 }}
            >
              <MotiView
                animate={{
                  backgroundColor: activeFilter === filter ? C.t1 : C.bgGlass,
                  borderColor: activeFilter === filter ? C.t1 : C.border,
                }}
                transition={SPRING_GENTLE}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: activeFilter === filter ? C.bg : C.t2,
                  }}
                >
                  {filter}
                </Text>
              </MotiView>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 客户列表 */}
      <FlatList
        data={CUSTOMERS}
        renderItem={({ item }) => <CustomerCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
