/**
 * Watch Face — Commander Boss Phone 首页表盘
 * v2: 接入全局 store，数据真实化；修复路由 404
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Activity, Zap, TrendingUp, Bell, Settings, ChevronRight, Globe, Users } from 'lucide-react-native';
import { hapticLight, hapticMedium } from '@/constants/haptics';
import { C } from '@/constants/theme';
import { useStore } from '@/constants/store';

const { width: SCREEN_W } = Dimensions.get('window');

// 数字员工静态配置（状态由 store 中的 tasks 派生）
const AGENTS_CONFIG = [
  { id: '1', name: 'Scout', role: '市场猎手', color: C.blue },
  { id: '2', name: 'Sage',  role: '策略顾问', color: '#A78BFA' },
  { id: '3', name: 'Echo',  role: '客服专员', color: C.green },
  { id: '4', name: 'Muse',  role: '内容创作', color: C.amber },
];

function AgentRow({
  agent,
  currentTask,
}: {
  agent: typeof AGENTS_CONFIG[0];
  currentTask?: { title: string; status: string };
}) {
  const isWorking = !!currentTask && (currentTask.status === 'running' || currentTask.status === 'pending');
  const statusColor = isWorking ? C.green : C.t3;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isWorking ? agent.color + '30' : 'rgba(255,255,255,0.07)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Avatar */}
      <View style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: agent.color + '25',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: agent.color, fontWeight: '700', fontSize: 14 }}>{agent.name[0]}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.t1, fontWeight: '600', fontSize: 13 }}>
          {agent.name} · {agent.role}
        </Text>
        <Text style={{ color: isWorking ? C.t2 : C.t3, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
          {currentTask ? currentTask.title : '待命中'}
        </Text>
      </View>

      {/* Status dot */}
      {isWorking ? (
        <MotiView
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ loop: true, duration: 1800 }}
          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green }}
        />
      ) : (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.t3 }} />
      )}
    </MotiView>
  );
}

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

  // Quick Stats — 全部从 store 派生
  const QUICK_STATS = [
    {
      label: '待决策',
      value: stats.pendingDecisions,
      color: C.amber,
      icon: Zap,
      onPress: () => { hapticLight(); router.push('/(tabs)/decision-feed'); },
    },
    {
      label: '新线索',
      value: stats.newLeads,
      color: C.green,
      icon: TrendingUp,
      // 修复路由 404：跳转到 Chat 并预填指令
      onPress: () => {
        hapticLight();
        router.push({
          pathname: '/(tabs)/commander-chat',
          params: { prefill: '帮我开发新买家' },
        });
      },
    },
    {
      label: '市场信号',
      value: stats.marketSignals,
      color: C.blue,
      icon: Globe,
      // 修复路由 404：跳转到 Chat 并预填指令
      onPress: () => {
        hapticLight();
        router.push({
          pathname: '/(tabs)/commander-chat',
          params: { prefill: '扫描市场机会' },
        });
      },
    },
    {
      label: '任务执行中',
      value: stats.runningTasks,
      color: '#A78BFA',
      icon: Activity,
      onPress: () => { hapticLight(); router.push('/task-progress'); },
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <LinearGradient
        colors={['#0a0015', '#000000', '#000000']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Header */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', paddingHorizontal: 20, paddingTop: 8,
          }}>
            <Text style={{ color: C.t2, fontSize: 14 }}>{greeting}</Text>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              {stats.runningTasks > 0 && (
                <Pressable onPress={() => router.push('/task-progress')}>
                  <View style={{
                    backgroundColor: '#7C3AED30',
                    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    borderWidth: 1, borderColor: '#7C3AED50',
                  }}>
                    <MotiView
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ loop: true, duration: 1500 }}
                      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#A78BFA' }}
                    />
                    <Text style={{ color: '#A78BFA', fontSize: 12, fontWeight: '600' }}>
                      {stats.runningTasks} 任务执行中
                    </Text>
                  </View>
                </Pressable>
              )}
              <Pressable onPress={() => { hapticLight(); router.push('/settings'); }}>
                <Settings size={20} color={C.t2} />
              </Pressable>
            </View>
          </View>

          {/* Time Display */}
          <View style={{ alignItems: 'center', paddingVertical: 28 }}>
            <MotiText
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                fontSize: 88, fontWeight: '100', color: C.t1,
                letterSpacing: -4, lineHeight: 88,
              }}
            >
              {hh}:{mm}
            </MotiText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <MotiView
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ loop: true, duration: 2000 }}
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }}
              />
              <Text style={{ color: C.green, fontSize: 12, fontWeight: '500' }}>
                AI 指挥中心运行中
              </Text>
            </View>
          </View>

          {/* Quick Stats Grid — 数据来自 store */}
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {QUICK_STATS.map((stat, i) => (
                <Pressable
                  key={stat.label}
                  onPress={stat.onPress}
                  style={{ width: (SCREEN_W - 50) / 2 }}
                >
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: i * 80, type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderRadius: 16, padding: 16,
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <stat.icon size={18} color={stat.color} />
                    <Text style={{ color: stat.color, fontSize: 28, fontWeight: '700', marginTop: 8 }}>
                      {stat.value}
                    </Text>
                    <Text style={{ color: C.t2, fontSize: 12, marginTop: 2 }}>{stat.label}</Text>
                  </MotiView>
                </Pressable>
              ))}
            </View>
          </View>

          {/* AI Agents Section — 状态从 store 派生 */}
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 12,
            }}>
              <Text style={{ color: C.t1, fontSize: 16, fontWeight: '600' }}>数字员工动态</Text>
              <Pressable onPress={() => { hapticLight(); router.push('/(tabs)/digital-agents'); }}>
                <Text style={{ color: '#A78BFA', fontSize: 13 }}>查看全部</Text>
              </Pressable>
            </View>
            {AGENTS_CONFIG.map(agent => (
              <AgentRow
                key={agent.id}
                agent={agent}
                currentTask={agentTaskMap[agent.id]}
              />
            ))}
          </View>

          {/* Quick Action CTA — 数字来自 store */}
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Pressable onPress={() => { hapticMedium(); router.push('/(tabs)/decision-feed'); }}>
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
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
