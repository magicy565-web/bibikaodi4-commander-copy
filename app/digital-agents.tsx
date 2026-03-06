/**
 * DigitalAgents — 数字员工团队管理（MVP 闭环联动版）
 * 接入全局 store，实时显示从决策中心下发的任务进度
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Plus, AlertCircle, ArrowRight, X } from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { hapticLight, hapticMedium, hapticSuccess } from '@/constants/haptics';
import { C, SPRING, SPRING_GENTLE } from '@/constants/theme';
import { useStore, Task } from '@/constants/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Hero 弧形仪表盘（v0 Apple Watch Ultra 风格）────────────────

function HeroGauge({ workingCount, totalCount }: { workingCount: number; totalCount: number }) {
  const progress = useSharedValue(0);
  const percentage = totalCount > 0 ? workingCount / totalCount : 0;
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const hasWorking = workingCount > 0;
  const glowColor = hasWorking ? C.green : C.P;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 28 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="agentHeroGlow" cx="50%" cy="30%" r="60%">
              <Stop offset="0%" stopColor={glowColor} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#agentHeroGlow)" />
        </Svg>
      </View>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={C.border} strokeWidth={strokeWidth} fill="transparent" />
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={glowColor} strokeWidth={strokeWidth} fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 72, fontWeight: '100', color: C.t1, lineHeight: 80 }}>{workingCount}</Text>
          <Text style={{ fontSize: 14, color: C.t2, marginTop: -4 }}>员工工作中</Text>
        </View>
      </View>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ marginTop: 16, backgroundColor: glowColor + '15', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        {hasWorking && (
          <MotiView
            from={{ opacity: 0.4 }} animate={{ opacity: 1 }}
            transition={{ loop: true, type: 'timing', duration: 1000 }}
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: glowColor }}
          />
        )}
        <Text style={{ color: glowColor, fontSize: 13, fontWeight: '600' }}>团队战斗力 {Math.round(percentage * 100)}%</Text>
      </MotiView>
    </View>
  );
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'standby' | 'busy' | 'offline';
  color: string;
  currentTask?: string;
  completedToday: number;
  uptime: string;
  efficiency: number;
}

const BASE_AGENTS: Agent[] = [
  {
    id: '1', name: 'Scout', role: '市场猎手', status: 'working', color: C.blue,
    currentTask: '扫描 LinkedIn 中东家居采购商，已发现 47 条线索',
    completedToday: 47, uptime: '18h 42m', efficiency: 94,
  },
  {
    id: '2', name: 'Sage',  role: '策略顾问', status: 'standby', color: C.PL,
    completedToday: 8, uptime: '24h 0m', efficiency: 88,
  },
  {
    id: '3', name: 'Echo',  role: '客服专员', status: 'busy', color: C.green,
    currentTask: '起草 Ahmed Al-Rashid KS-837 英文报价回复',
    completedToday: 23, uptime: '24h 0m', efficiency: 96,
  },
  {
    id: '4', name: 'Muse',  role: '内容创作', status: 'working', color: C.amber,
    currentTask: '生成「沙漠奢华风」 KS-837 阿拉伯语图册',
    completedToday: 5, uptime: '12h 30m', efficiency: 91,
  },
];

const PRESET_TASKS = [
  '扫描中东家具采购商线索',
  '回复 Ahmed 询盘报价邮件',
  '生成迪拜市场进入报告',
  '分析斜月季最优报价策略',
  '生成 KS-837 阿拉伯语产品图册',
];

const STATUS_CONFIG = {
  working: { label: '工作中', color: C.green, icon: Play },
  standby: { label: '待命',   color: C.t2,    icon: Pause },
  busy:    { label: '忙碌',   color: C.amber,  icon: AlertCircle },
  offline: { label: '离线',   color: C.t3,     icon: AlertCircle },
};

// ─── 效率进度条 ───────────────────────────────────────────────

function EfficiencyBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ height: 3, backgroundColor: C.bgGlass, borderRadius: 2, overflow: 'hidden' }}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'timing', duration: 800, delay: 200 }}
          style={{ height: 3, backgroundColor: color, borderRadius: 2 }}
        />
      </View>
    </View>
  );
}

// ─── 分配任务 Modal ───────────────────────────────────────────

function AssignTaskModal({ agent, visible, onClose, onAssign }: {
  agent: Agent;
  visible: boolean;
  onClose: () => void;
  onAssign: (task: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }} onPress={onClose}>
        <MotiView
          from={{ translateY: 300 }}
          animate={{ translateY: 0 }}
          exit={{ translateY: 300 }}
          transition={SPRING_GENTLE}
          style={{ backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: C.t1, fontSize: 17, fontWeight: '700' }}>分配任务给 {agent.name}</Text>
            <Pressable onPress={onClose}>
              <View style={{ backgroundColor: C.bgGlass, borderRadius: 8, padding: 6 }}>
                <X size={16} color={C.t2} />
              </View>
            </Pressable>
          </View>
          {PRESET_TASKS.map(task => (
            <Pressable key={task} onPress={() => { hapticSuccess(); onAssign(task); onClose(); }}>
              <View style={{ backgroundColor: C.bgGlass, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: C.t1, fontSize: 14, fontWeight: '500' }}>{task}</Text>
                <ArrowRight size={16} color={C.t3} />
              </View>
            </Pressable>
          ))}
        </MotiView>
      </Pressable>
    </Modal>
  );
}

// ─── 员工卡片 ─────────────────────────────────────────────────

function AgentCard({ agent, activeTasks, onToggle, onAssign }: {
  agent: Agent;
  activeTasks: Task[];
  onToggle: (id: string) => void;
  onAssign: (agent: Agent) => void;
}) {
  const config = STATUS_CONFIG[agent.status];
  const effColor = agent.efficiency >= 90 ? C.green : agent.efficiency >= 80 ? C.amber : C.red;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING}
      style={{
        backgroundColor: C.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: agent.status === 'working' ? agent.color + '30' : C.border,
        padding: 18,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 3, backgroundColor: agent.color, marginHorizontal: -18, marginTop: -18, marginBottom: 14 }} />

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View style={{ position: 'relative' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: agent.color + '30', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: agent.color }}>{agent.name[0]}</Text>
            </View>
            {/* 工作中的脉冲光环 */}
            {agent.status === 'working' && (
              <MotiView
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ loop: true, duration: 2000 }}
                style={{
                  position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
                  borderRadius: 28, borderWidth: 2, borderColor: agent.color,
                }}
              />
            )}
          </View>
          <View>
            <Text style={{ color: C.t1, fontSize: 16, fontWeight: '700' }}>{agent.name}</Text>
            <Text style={{ color: C.t2, fontSize: 12, marginTop: 2 }}>{agent.role}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: config.color + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: config.color }} />
          <Text style={{ color: config.color, fontSize: 11, fontWeight: '600' }}>{config.label}</Text>
        </View>
      </View>

      {/* 当前任务（来自决策中心下发的优先显示） */}
      {activeTasks.length > 0 ? (
        <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
          <View style={{ backgroundColor: C.PL + '15', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: C.PL + '30', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View>
              <Text style={{ color: C.PL, fontSize: 10, fontWeight: '600', marginBottom: 3 }}>决策中心任务</Text>
              <Text style={{ color: C.t1, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{activeTasks[0].title}</Text>
              {/* 任务进度条 */}
              <View style={{ height: 3, backgroundColor: C.bgGlass, borderRadius: 2, marginTop: 6, width: 160, overflow: 'hidden' }}>
                <MotiView
                  animate={{ width: `${activeTasks[0].progress}%` }}
                  transition={{ type: 'timing', duration: 600 }}
                  style={{ height: 3, backgroundColor: activeTasks[0].status === 'done' ? C.green : C.PL, borderRadius: 2 }}
                />
              </View>
              <Text style={{ color: C.t3, fontSize: 10, marginTop: 3 }}>{activeTasks[0].progress}% · {activeTasks[0].status === 'done' ? '已完成' : '执行中'}</Text>
            </View>
            <ArrowRight size={14} color={C.PL} style={{ marginLeft: 'auto' }} />
          </View>
        </Pressable>
      ) : agent.currentTask ? (
        <View style={{ backgroundColor: C.bgGlass, borderRadius: 12, padding: 10, marginBottom: 12 }}>
          <Text style={{ color: C.t2, fontSize: 11, marginBottom: 4 }}>当前任务</Text>
          <Text style={{ color: C.t1, fontSize: 13, fontWeight: '500' }}>{agent.currentTask}</Text>
        </View>
      ) : null}

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1, backgroundColor: C.bgGlass, borderRadius: 12, padding: 10 }}>
          <Text style={{ color: C.t2, fontSize: 10 }}>今日完成</Text>
          <Text style={{ color: C.t1, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{agent.completedToday}</Text>
          <Text style={{ color: C.t3, fontSize: 9, marginTop: 2 }}>项任务</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.bgGlass, borderRadius: 12, padding: 10 }}>
          <Text style={{ color: C.t2, fontSize: 10 }}>运行时长</Text>
          <Text style={{ color: C.t1, fontSize: 14, fontWeight: '700', marginTop: 4 }}>{agent.uptime}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.bgGlass, borderRadius: 12, padding: 10 }}>
          <Text style={{ color: C.t2, fontSize: 10 }}>效率</Text>
          <Text style={{ color: effColor, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{agent.efficiency}%</Text>
          <EfficiencyBar value={agent.efficiency} color={effColor} />
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => { hapticMedium(); onToggle(agent.id); }}
          style={{ flex: 1, backgroundColor: agent.color + '20', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={{ color: agent.color, fontWeight: '600', fontSize: 13 }}>
            {agent.status === 'working' || agent.status === 'busy' ? '暂停' : '启动'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { hapticLight(); onAssign(agent); }}
          style={{ flex: 1, backgroundColor: C.bgGlass, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={{ color: C.t1, fontWeight: '600', fontSize: 13 }}>分配任务</Text>
        </Pressable>
      </View>
    </MotiView>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────

export default function DigitalAgentsScreen() {
  const { state } = useStore();
  const [agents, setAgents] = useState<Agent[]>(BASE_AGENTS);
  const [assignTarget, setAssignTarget] = useState<Agent | null>(null);

  const handleToggle = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (a.status === 'working' || a.status === 'busy') {
        return { ...a, status: 'standby', currentTask: undefined };
      }
      return { ...a, status: 'working' };
    }));
  };

  const handleAssign = (agentId: string, task: string) => {
    setAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, status: 'working', currentTask: task, completedToday: a.completedToday } : a
    ));
  };

  const workingCount = agents.filter(a => a.status === 'working' || a.status === 'busy').length;
  const totalTasksToday = agents.reduce((sum, a) => sum + a.completedToday, 0);
  const runningTasksFromDecision = state.tasks.filter(t => t.status === 'running'|| t.status === 'pending').length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: C.t1, fontSize: 22, fontWeight: '700' }}>数字员工团队</Text>
              <Text style={{ color: C.t2, fontSize: 13, marginTop: 2 }}>您的虚拟业务执行团队</Text>
            </View>
            {runningTasksFromDecision > 0 && (
              <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
                <MotiView
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ loop: true, duration: 2000 }}
                  style={{ backgroundColor: C.PL + '20', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <MotiView
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ loop: true, duration: 1200 }}
                    style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.PL }}
                  />
                  <Text style={{ color: C.PL, fontWeight: '700', fontSize: 12 }}>{runningTasksFromDecision} 任务执行中</Text>
                </MotiView>
              </Pressable>
            )}
          </View>

          {/* ── 区域一：Hero 弧形仪表盘（v0 Apple Watch Ultra 风格）── */}
          <HeroGauge workingCount={workingCount} totalCount={agents.length} />

          {/* ── 区域二：数据面板（竖线分隔样式）── */}
          <View style={{ marginHorizontal: 20, backgroundColor: C.bgGlass, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', marginBottom: 24 }}>
            {[
              { value: workingCount, label: '工作中', color: C.green },
              { value: totalTasksToday, label: '今日完成', color: C.blue },
              { value: agents.length, label: '总员工', color: C.PL },
            ].map((stat, index, arr) => (
              <View key={stat.label} style={{ flex: 1, alignItems: 'center', borderRightWidth: index < arr.length - 1 ? 1 : 0, borderRightColor: C.border }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: C.t1 }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>{stat.label}</Text>
                <View style={{ width: 24, height: 2, backgroundColor: stat.color, borderRadius: 1, marginTop: 8 }} />
              </View>
            ))}
          </View>

          {/* Agents List */}
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: C.t1, fontSize: 16, fontWeight: '600' }}>团队成员</Text>
              <Pressable onPress={() => hapticMedium()}>
                <View style={{ backgroundColor: C.PL + '20', borderRadius: 8, padding: 6 }}>
                  <Plus size={16} color={C.PL} />
                </View>
              </Pressable>
            </View>

            {agents.map(agent => {
              const activeTasks = state.tasks.filter(t => t.agentId === agent.id && (t.status === 'running' || t.status === 'pending' || t.status === 'done'));
              return (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  activeTasks={activeTasks}
                  onToggle={handleToggle}
                  onAssign={setAssignTarget}
                />
              );
            })}
          </View>

          {/* Recruitment Card */}
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <Pressable onPress={() => hapticMedium()}>
              <LinearGradient
                colors={[C.P + '26', C.P + '0D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, borderWidth: 1, borderColor: C.PL + '40', padding: 16, alignItems: 'center', gap: 8 }}
              >
                <Plus size={24} color={C.PL} />
                <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>招募新数字员工</Text>
                <Text style={{ color: C.t2, fontSize: 12 }}>扩展您的虚拟团队能力</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 分配任务 Modal */}
      {assignTarget && (
        <AssignTaskModal
          agent={assignTarget}
          visible={!!assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssign={(task) => handleAssign(assignTarget.id, task)}
        />
      )}
    </View>
  );
}
