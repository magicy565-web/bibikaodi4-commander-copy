/**
 * Watch Face — Commander Boss Phone 首页表盘
 * v3: 升级版 — KPI 环形图、营收趋势、资产健康、员工动态、紧急决策横幅
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Zap, ChevronRight, TrendingUp, Users, Package, Globe, AlertCircle } from 'lucide-react-native';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { hapticLight, hapticMedium } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';
import { useStore } from '@/constants/store';

const { width: SCREEN_W } = Dimensions.get('window');

// 数字员工静态配置
const AGENTS_CONFIG = [
  { id: '1', name: 'Scout', role: '市场猎手', color: C.blue, task: '扫描迪拜市场机会' },
  { id: '2', name: 'Rex',   role: '开发专员', color: '#A78BFA', task: '开发 Ahmed Al-Rashid' },
  { id: '3', name: 'Echo',  role: '客服专员', color: C.green, task: '回复 Priya 询盘' },
];

// 营收趋势数据（月度，单位 $K）
const REVENUE_DATA = [
  { value: 42 }, { value: 58 }, { value: 51 }, { value: 67 },
  { value: 73 }, { value: 89 }, { value: 95 }, { value: 88 },
  { value: 102 }, { value: 118 }, { value: 124 }, { value: 138 },
];

// KPI 环形图数据
const KPI_RINGS = [
  {
    label: '今日询盘',
    centerText: '8',
    centerFontSize: 18,
    data: [
      { value: 8, color: C.blue },
      { value: 2, color: 'rgba(255,255,255,0.08)' },
    ],
    color: C.blue,
  },
  {
    label: '成交率',
    centerText: '73%',
    centerFontSize: 14,
    data: [
      { value: 73, color: C.green },
      { value: 27, color: 'rgba(255,255,255,0.08)' },
    ],
    color: C.green,
  },
  {
    label: '平均响应',
    centerText: '4min',
    centerFontSize: 12,
    data: [
      { value: 94, color: C.amber },
      { value: 6, color: 'rgba(255,255,255,0.08)' },
    ],
    color: C.amber,
  },
];

// 资产健康数据
const ASSET_PILLS = [
  { icon: '✅', name: '产品图册', detail: '156款', color: C.green, status: 'active' },
  { icon: '✅', name: '工厂视频', detail: '8个', color: C.green, status: 'active' },
  { icon: '✅', name: '质量认证', detail: '12项', color: C.green, status: 'active' },
  { icon: '🔄', name: '市场案例', detail: '更新中', color: C.amber, status: 'updating' },
];

export default function WatchFaceScreen() {
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const { state, stats } = useStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const h = new Date().getHours();
    setGreeting(h < 6 ? '深夜好' : h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好');
    return () => clearInterval(timer);
  }, []);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const ss = time.getSeconds().toString().padStart(2, '0');

  // 每个员工当前正在执行的任务（从 store 派生）
  const agentTaskMap = AGENTS_CONFIG.reduce<Record<string, { title: string; status: string } | undefined>>(
    (acc, agent) => {
      const task = state.tasks.find(
        t => t.agentId === agent.id && (t.status === 'running' || t.status === 'pending')
      );
      acc[agent.id] = task ? { title: task.title, status: task.status } : undefined;
      return acc;
    },
    {}
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* 背景蓝色星云光晕 */}
      <View
        style={{
          position: 'absolute', top: -80, left: SCREEN_W / 2 - 150,
          width: 300, height: 300, borderRadius: 150,
          backgroundColor: 'rgba(96,165,250,0.06)',
        }}
        pointerEvents="none"
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ─── Section 1: Watch Face Header ─── */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0, ...SPRING }}
            style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}
          >
            <MotiText
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                fontSize: 80, fontWeight: '100', color: C.t1,
                letterSpacing: -4, lineHeight: 80,
              }}
            >
              {hh}:{mm}
            </MotiText>
            <Text style={{ color: C.t3, fontSize: 18, fontWeight: '100', marginTop: 2 }}>
              {ss}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <MotiView
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ loop: true, duration: 2000 }}
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }}
              />
              <Text style={{ color: C.green, fontSize: 12, fontWeight: '500' }}>
                {greeting}，老板 · AI 指挥中心运行中
              </Text>
            </View>
          </MotiView>

          {/* ─── Section 2: KPI Ring Dashboard ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 80, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {KPI_RINGS.map((ring, i) => (
                <View
                  key={ring.label}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    padding: 12,
                    alignItems: 'center',
                  }}
                >
                  <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                    <PieChart
                      data={ring.data}
                      radius={30}
                      innerRadius={22}
                      donut
                      showText={false}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{
                        color: C.t1,
                        fontSize: ring.centerFontSize,
                        fontWeight: '100',
                        lineHeight: ring.centerFontSize + 2,
                      }}>
                        {ring.centerText}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: C.t3, fontSize: 9, marginTop: 6, textAlign: 'center' }}>
                    {ring.label}
                  </Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ─── Section 3: Revenue Trend ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 160, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>本月营收趋势</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={12} color={C.green} />
                  <Text style={{ color: C.green, fontSize: 11 }}>+23%</Text>
                </View>
              </View>
              <LineChart
                data={REVENUE_DATA}
                areaChart
                color={C.blue}
                startFillColor="rgba(96,165,250,0.3)"
                endFillColor="rgba(96,165,250,0)"
                hideDataPoints={false}
                dataPointsColor={C.blue}
                dataPointsRadius={3}
                hideYAxisText
                rulesColor="rgba(255,255,255,0.05)"
                backgroundColor="transparent"
                width={SCREEN_W - 72}
                height={70}
                initialSpacing={0}
                spacing={(SCREEN_W - 72) / 12}
                thickness={2}
                xAxisColor="rgba(255,255,255,0.1)"
                yAxisColor="transparent"
              />
              <Text style={{ color: C.green, fontSize: 11, marginTop: 8 }}>
                ↑ 本月 $138K · 同比 +23%
              </Text>
            </View>
          </MotiView>

          {/* ─── Section 4: Asset Health ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 240, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Package size={16} color={C.blue} />
                  <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>资产能力包</Text>
                </View>
                <Pressable
                  onPress={() => { hapticLight(); router.push('/asset-package' as any); }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={{ color: C.blue, fontSize: 12 }}>查看全部 →</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {ASSET_PILLS.map(pill => (
                  <View
                    key={pill.name}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>{pill.icon}</Text>
                    <Text style={{ color: C.t2, fontSize: 11 }}>{pill.name}</Text>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: pill.color }} />
                    <Text style={{ color: pill.color, fontSize: 10 }}>{pill.detail}</Text>
                  </View>
                ))}
              </View>
              {/* 综合能力进度条 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: '87%' }}
                    transition={{ delay: 600, duration: 800 }}
                    style={{ height: 3, borderRadius: 2, backgroundColor: C.blue }}
                  />
                </View>
                <Text style={{ color: C.t2, fontSize: 11 }}>综合能力 87分</Text>
              </View>
            </View>
          </MotiView>

          {/* ─── Section 5: Digital Team Status ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 320, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Users size={16} color={C.blue} />
                  <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>数字员工</Text>
                  <View style={{
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{ color: C.green, fontSize: 10, fontWeight: '600' }}>3人在线</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => { hapticLight(); router.push('/digital-agents'); }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={{ color: C.blue, fontSize: 12 }}>查看全部 →</Text>
                </Pressable>
              </View>
              {AGENTS_CONFIG.map((agent, i) => {
                const task = agentTaskMap[agent.id];
                return (
                  <View
                    key={agent.id}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      paddingVertical: 8,
                      borderTopWidth: i > 0 ? 1 : 0,
                      borderTopColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <View style={{
                      width: 32, height: 32, borderRadius: 16,
                      backgroundColor: agent.color + '25',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: agent.color, fontWeight: '700', fontSize: 13 }}>
                        {agent.name[0]}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.t1, fontSize: 12, fontWeight: '600' }}>
                        {agent.name} · {agent.role}
                      </Text>
                      <Text style={{ color: C.t2, fontSize: 10, marginTop: 1 }} numberOfLines={1}>
                        {task ? task.title : agent.task}
                      </Text>
                    </View>
                    <MotiView
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ loop: true, duration: 1600 }}
                      style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.green }}
                    />
                  </View>
                );
              })}
            </View>
          </MotiView>

          {/* ─── Section 6: Urgent Decision Banner ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <Pressable
              onPress={() => { hapticMedium(); router.push('/(tabs)/decision-feed'); }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
            >
              <MotiView
                animate={{ opacity: [1, 0.75, 1] }}
                transition={{ loop: true, duration: 2000 }}
                style={{
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(245,158,11,0.3)',
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(245,158,11,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={18} color={C.amber} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.t1, fontSize: 13, fontWeight: '600' }}>
                    Ahmed 询盘待回复
                  </Text>
                  <Text style={{ color: C.t2, fontSize: 11, marginTop: 2 }}>
                    斋月季窗口仅剩 23 天 · 预估 $58,400
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: C.amber, fontSize: 12, fontWeight: '600' }}>立即处理</Text>
                  <ChevronRight size={14} color={C.amber} />
                </View>
              </MotiView>
            </Pressable>
          </MotiView>

          {/* ─── 决策数量 CTA ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 480, ...SPRING }}
            style={{ paddingHorizontal: 20 }}
          >
            <Pressable
              onPress={() => { hapticMedium(); router.push('/(tabs)/decision-feed'); }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
            >
              <LinearGradient
                colors={['#7C3AED', '#5B21B6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16, padding: 18,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MotiView
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ loop: true, duration: 1500 }}
                    style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffffff' }}
                  />
                  <View>
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>
                      {stats.pendingDecisions} 项决策等待您
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                      AI 已完成分析，点击处理
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '100', lineHeight: 36 }}>
                    {stats.pendingDecisions}
                  </Text>
                  <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
                </View>
              </LinearGradient>
            </Pressable>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
