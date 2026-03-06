/**
 * Market Intel Detail — 市场情报详情页
 * 展示 AI 对特定市场机会的深度分析
 */
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, TrendingUp, Users, AlertTriangle, ChevronRight } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BarChart } from 'react-native-gifted-charts';
import { hapticLight } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// 沙特市场进口趋势数据（月度，单位 $M）
const IMPORT_DATA = [
  { value: 42, label: '3月' }, { value: 48, label: '4月' },
  { value: 55, label: '5月' }, { value: 61, label: '6月' },
  { value: 58, label: '7月' }, { value: 52, label: '8月' },
  { value: 67, label: '9月' }, { value: 74, label: '10月' },
  { value: 81, label: '11月' }, { value: 88, label: '12月' },
  { value: 95, label: '1月' }, { value: 103, label: '2月' },
];

// 机会评分维度
const RADAR_SCORES = [
  { label: '市场规模', value: 88, color: C.blue },
  { label: '采购意愿', value: 91, color: C.green },
  { label: '价格匹配', value: 85, color: C.amber },
  { label: '文化契合', value: 78, color: '#A78BFA' },
  { label: '竞争空间', value: 72, color: C.teal },
];

// 推荐买家
const BUYERS = [
  {
    flag: '🇸🇦', company: 'Al-Noor Home', city: '利雅得', budget: '$120万/年',
    match: 94, matchColor: C.green, tags: ['软装定制', 'OEM'],
  },
  {
    flag: '🇸🇦', company: 'Desert Living', city: '吉达', budget: '$85万/年',
    match: 87, matchColor: C.blue, tags: ['家纺套装', '独家设计'],
  },
  {
    flag: '🇦🇪', company: 'Gulf Decor', city: '迪拜', budget: '$200万/年',
    match: 81, matchColor: '#A78BFA', tags: ['高端家居', '展厅陈列'],
  },
];

// AI 行动建议
const ACTION_STEPS = [
  {
    num: '01', color: C.blue,
    title: '立即准备斋月季专题图册',
    desc: '突出暖色调、祈祷毯、客厅套装，建议本周内完成',
    action: '指派 Muse 生成图册',
    actionColor: C.blue,
  },
  {
    num: '02', color: '#A78BFA',
    title: '定向开发 Al-Noor Home',
    desc: 'Rex 已找到采购总监 LinkedIn，建议发送定制化开发信',
    action: '指派 Rex 立即开发',
    actionColor: '#A78BFA',
  },
  {
    num: '03', color: C.green,
    title: '参加 2026 迪拜家居展 (3月18-22日)',
    desc: 'AI 已生成参展方案，预计触达 200+ 买家',
    action: '查看参展方案 →',
    actionColor: C.green,
  },
];

export default function MarketIntelDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ─── Header ─── */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0, ...SPRING }}
            style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}
          >
            <Pressable
              onPress={() => { hapticLight(); router.back(); }}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 4,
                opacity: pressed ? 0.6 : 1, marginBottom: 12,
              })}
            >
              <ChevronLeft size={20} color={C.t1} />
              <Text style={{ color: C.t2, fontSize: 14 }}>返回</Text>
            </Pressable>

            <Text style={{ fontSize: 32, fontWeight: '100', color: C.t1 }}>🇸🇦 沙特阿拉伯</Text>
            <Text style={{ color: C.t2, fontSize: 14, marginTop: 4 }}>家居软装市场 · 2026 Q1 分析报告</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {['AI 生成', '47个数据源', '2小时前更新'].map(tag => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: C.t3, fontSize: 10 }}>{tag}</Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ─── AI 置信度卡片 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 80, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 12 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, borderWidth: 1, borderColor: C.border,
              padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16,
            }}>
              <View style={{ alignItems: 'center', minWidth: 80 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={{ color: C.blue, fontSize: 52, fontWeight: '100', lineHeight: 56 }}>92</Text>
                  <Text style={{ color: C.blue, fontSize: 22, fontWeight: '100', marginBottom: 6 }}>%</Text>
                </View>
                <Text style={{ color: C.t3, fontSize: 11 }}>置信度</Text>
              </View>

              <View style={{ width: 1, height: 60, backgroundColor: C.border }} />

              <View style={{ flex: 1, gap: 8 }}>
                {[
                  { label: '数据源', value: '47个', color: C.blue },
                  { label: '更新', value: '2小时前', color: C.t2 },
                  { label: '趋势', value: '↑ 强烈', color: C.green },
                ].map(item => (
                  <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: C.t3, fontSize: 11 }}>{item.label}</Text>
                    <Text style={{ color: item.color, fontSize: 11, fontWeight: '600' }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
            {/* 置信度进度条 */}
            <View style={{ marginTop: 8, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: '92%' }}
                transition={{ delay: 400, duration: 800 }}
                style={{ height: 3, borderRadius: 2, backgroundColor: C.blue }}
              />
            </View>
          </MotiView>

          {/* ─── 进口趋势图 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 160, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 12 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>近12月进口趋势</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={12} color={C.green} />
                  <Text style={{ color: C.green, fontSize: 11 }}>+34%</Text>
                </View>
              </View>
              <BarChart
                data={IMPORT_DATA}
                barWidth={18}
                spacing={6}
                roundedTop
                frontColor={C.blue}
                gradientColor="rgba(96,165,250,0.3)"
                isAnimated
                hideYAxisText
                xAxisColor="rgba(255,255,255,0.1)"
                rulesColor="rgba(255,255,255,0.05)"
                backgroundColor="transparent"
                width={SCREEN_W - 72}
                height={120}
                xAxisLabelTextStyle={{ color: C.t3, fontSize: 9 }}
                noOfSections={3}
                yAxisTextStyle={{ color: C.t3, fontSize: 9 }}
              />
              <Text style={{ color: C.green, fontSize: 11, marginTop: 8 }}>
                ↑ 同比增长 34% · 斋月季前6周为采购高峰
              </Text>
            </View>
          </MotiView>

          {/* ─── 机会评分 (简化版雷达图) ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 240, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 12 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16,
            }}>
              <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600', marginBottom: 14 }}>机会评分</Text>
              {RADAR_SCORES.map((item, i) => (
                <View key={item.label} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: C.t2, fontSize: 12 }}>{item.label}</Text>
                    <Text style={{ color: item.color, fontSize: 12, fontWeight: '600' }}>{item.value}</Text>
                  </View>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 300 + i * 80, duration: 600 }}
                      style={{ height: 4, borderRadius: 2, backgroundColor: item.color }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ─── 关键洞察 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 320, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 12 }}
          >
            <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>关键洞察</Text>
            {[
              {
                color: C.blue, Icon: TrendingUp,
                text: '斋月季前6周是家纺采购高峰，2025年沙特进口家纺同比增长34%，主要来自中国和土耳其。KABEQ 产品与当地审美高度匹配。',
              },
              {
                color: C.green, Icon: Users,
                text: '目标买家：利雅得/吉达中型家居连锁，年采购额$50-200万，偏好OEM定制+独家设计。已识别12家高意向采购商。',
              },
              {
                color: C.amber, Icon: AlertTriangle,
                text: '主要竞争来自土耳其（价格低15%）和印度（交期短）。差异化需强调KABEQ的设计感和快速打样能力（7天样品）。',
              },
            ].map((insight, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 14, borderWidth: 1, borderColor: C.border,
                  padding: 14, marginBottom: 8,
                  flexDirection: 'row', gap: 12,
                  borderLeftWidth: 4, borderLeftColor: insight.color,
                }}
              >
                <View style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: insight.color + '20',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <insight.Icon size={16} color={insight.color} />
                </View>
                <Text style={{ color: C.t2, fontSize: 12, lineHeight: 18, flex: 1 }}>
                  {insight.text}
                </Text>
              </View>
            ))}
          </MotiView>

          {/* ─── 推荐买家 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, ...SPRING }}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 10 }}>
              <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>AI 推荐买家</Text>
              <View style={{
                backgroundColor: 'rgba(96,165,250,0.15)',
                borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
              }}>
                <Text style={{ color: C.blue, fontSize: 10, fontWeight: '600' }}>12家已识别</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {BUYERS.map((buyer, i) => (
                <View
                  key={i}
                  style={{
                    width: 160, backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14,
                  }}
                >
                  <Text style={{ fontSize: 20, marginBottom: 4 }}>{buyer.flag}</Text>
                  <Text style={{ color: C.t1, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>{buyer.company}</Text>
                  <Text style={{ color: C.t3, fontSize: 11, marginBottom: 8 }}>{buyer.city} · {buyer.budget}</Text>

                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    borderWidth: 2, borderColor: buyer.matchColor,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                  }}>
                    <Text style={{ color: buyer.matchColor, fontSize: 15, fontWeight: '100' }}>{buyer.match}%</Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {buyer.tags.map(tag => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: C.t3, fontSize: 9 }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </MotiView>

          {/* ─── AI 行动建议 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 480, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>AI 行动建议</Text>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16,
            }}>
              {ACTION_STEPS.map((step, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row', gap: 12, marginBottom: i < ACTION_STEPS.length - 1 ? 16 : 0,
                  }}
                >
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: step.color + '20',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Text style={{ color: step.color, fontSize: 11, fontWeight: '700' }}>{step.num}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.t1, fontSize: 13, fontWeight: '600', marginBottom: 3 }}>{step.title}</Text>
                    <Text style={{ color: C.t2, fontSize: 11, lineHeight: 16, marginBottom: 6 }}>{step.desc}</Text>
                    <Pressable
                      onPress={() => hapticLight()}
                      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    >
                      <Text style={{ color: step.actionColor, fontSize: 11, fontWeight: '600' }}>{step.action}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ─── 底部行动按钮 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 560, ...SPRING }}
            style={{ paddingHorizontal: 20 }}
          >
            <Pressable
              onPress={() => { hapticLight(); router.push('/(tabs)/commander-chat'); }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  height: 56, borderRadius: 16,
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                }}
              >
                <MaterialCommunityIcons name="robot-outline" size={20} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                  指派 Rex 开始开发 Al-Noor Home
                </Text>
                <ChevronRight size={18} color="#ffffff" />
              </LinearGradient>
            </Pressable>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
