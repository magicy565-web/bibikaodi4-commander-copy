/**
 * DigitalAgents — 数字员工团队管理
 * Apple Watch Ultra 风格三区域布局
 */
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { Play, Pause, Plus, X, Check } from 'lucide-react-native';
import { hapticLight, hapticMedium } from '@/constants/haptics';
import { C, SPRING, SPRING_GENTLE } from '@/constants/theme';
import { useStore, Task } from '@/store/useStore';
import { useEffect } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'working' | 'standby';
  color: string;
  completedToday: number;
  efficiency: number;
}

const AGENTS: Agent[] = [
  { id: '1', name: 'Scout', role: '市场猎手', status: 'working', color: C.blue, completedToday: 12, efficiency: 94 },
  { id: '2', name: 'Sage', role: '策略顾问', status: 'standby', color: C.PL, completedToday: 8, efficiency: 88 },
  { id: '3', name: 'Echo', role: '客服专员', status: 'working', color: C.green, completedToday: 23, efficiency: 96 },
  { id: '4', name: 'Muse', role: '内容创作', status: 'standby', color: C.amber, completedToday: 5, efficiency: 91 },
];

// Hero 区域弧形仪表盘
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
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      {/* 背景光晕 */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="heroGlow" cx="50%" cy="30%" r="60%">
              <Stop offset="0%" stopColor={glowColor} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGlow)" />
        </Svg>
      </View>

      {/* 弧形仪表盘 */}
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          {/* 背景圆环 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={C.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* 进度圆环 */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={glowColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* 中心内容 */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 72, fontWeight: '100', color: C.t1, lineHeight: 80 }}>
            {workingCount}
          </Text>
          <Text style={{ fontSize: 14, color: C.t2, marginTop: -4 }}>员工工作中</Text>
        </View>
      </View>

      {/* 团队战斗力标签 */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_GENTLE}
        style={{
          marginTop: 16,
          backgroundColor: glowColor + '15',
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {hasWorking && (
          <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ loop: true, type: 'timing', duration: 1000 }}
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: glowColor }}
          />
        )}
        <Text style={{ color: glowColor, fontSize: 13, fontWeight: '600' }}>
          团队战斗力 {Math.round(percentage * 100)}%
        </Text>
      </MotiView>
    </View>
  );
}

// 数据面板区域
function DataPanel({ workingCount, completedToday, totalCount }: { workingCount: number; completedToday: number; totalCount: number }) {
  const stats = [
    { value: workingCount, label: '工作中', color: C.green },
    { value: completedToday, label: '今日完成', color: C.blue },
    { value: totalCount, label: '总员工', color: C.PL },
  ];

  return (
    <View style={{
      marginHorizontal: 20,
      backgroundColor: C.bgGlass,
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: 'row',
    }}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={{
            flex: 1,
            alignItems: 'center',
            borderRightWidth: index < stats.length - 1 ? 1 : 0,
            borderRightColor: C.border,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '700', color: C.t1 }}>{stat.value}</Text>
          <Text style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>{stat.label}</Text>
          <View style={{
            width: 24,
            height: 2,
            backgroundColor: stat.color,
            borderRadius: 1,
            marginTop: 8,
          }} />
        </View>
      ))}
    </View>
  );
}

// 员工卡片
function AgentCard({
  agent,
  activeTasks,
  onToggle,
  onAssign,
}: {
  agent: Agent;
  activeTasks: Task[];
  onToggle: () => void;
  onAssign: () => void;
}) {
  const isWorking = agent.status === 'working';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING}
      style={{
        backgroundColor: C.bgCard,
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        {/* 头像 - 64x64 渐变圆形 */}
        <View style={{ position: 'relative' }}>
          {/* 脉冲光环（working 状态） */}
          {isWorking && (
            <>
              <MotiView
                from={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ loop: true, type: 'timing', duration: 1500 }}
                style={{
                  position: 'absolute',
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  borderWidth: 2,
                  borderColor: agent.color,
                }}
              />
              <MotiView
                from={{ opacity: 0.3, scale: 1 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ loop: true, type: 'timing', duration: 1500, delay: 300 }}
                style={{
                  position: 'absolute',
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  borderWidth: 1,
                  borderColor: agent.color,
                  borderStyle: 'dashed',
                }}
              />
            </>
          )}
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: agent.color + '25',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: agent.color }}>{agent.name[0]}</Text>
          </View>
        </View>

        {/* 名称和角色 */}
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.t1 }}>{agent.name}</Text>
          <Text style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>{agent.role}</Text>
        </View>

        {/* 状态徽章 */}
        <View style={{
          backgroundColor: isWorking ? C.green + '20' : C.t3 + '20',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isWorking ? C.green : C.t3,
          }} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: isWorking ? C.green : C.t3 }}>
            {isWorking ? '工作中' : '待命'}
          </Text>
        </View>
      </View>

      {/* 来自决策中心的任务 */}
      {activeTasks.length > 0 && (
        <View style={{ marginBottom: 14 }}>
          {activeTasks.map((task) => (
            <View
              key={task.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: C.bgGlass,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderLeftWidth: 3,
                borderLeftColor: C.P,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: C.t1, fontWeight: '500' }}>{task.title}</Text>
                <Text style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>
                  进度 {task.progress}%
                </Text>
              </View>
              {/* 小型进度弧 */}
              <View style={{ width: 32, height: 32 }}>
                <Svg width={32} height={32}>
                  <Circle
                    cx={16}
                    cy={16}
                    r={12}
                    stroke={C.border}
                    strokeWidth={3}
                    fill="transparent"
                  />
                  <Circle
                    cx={16}
                    cy={16}
                    r={12}
                    stroke={C.P}
                    strokeWidth={3}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 12}
                    strokeDashoffset={2 * Math.PI * 12 * (1 - task.progress / 100)}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="16, 16"
                  />
                </Svg>
                <Text style={{
                  position: 'absolute',
                  width: 32,
                  textAlign: 'center',
                  top: 9,
                  fontSize: 8,
                  fontWeight: '700',
                  color: C.t1,
                }}>
                  {task.progress}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 效率进度条 */}
      <View style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: C.t2 }}>效率</Text>
          <Text style={{ fontSize: 11, color: agent.efficiency >= 90 ? C.green : C.amber, fontWeight: '600' }}>
            {agent.efficiency}%
          </Text>
        </View>
        <View style={{ height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' }}>
          <MotiView
            from={{ width: '0%' }}
            animate={{ width: `${agent.efficiency}%` }}
            transition={{ type: 'timing', duration: 800 }}
            style={{
              height: 4,
              backgroundColor: agent.efficiency >= 90 ? C.green : C.amber,
              borderRadius: 2,
              shadowColor: agent.efficiency >= 90 ? C.green : C.amber,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
            }}
          />
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => {
            hapticLight();
            onToggle();
          }}
          style={{
            flex: 1,
            backgroundColor: agent.color + '20',
            borderRadius: 12,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {isWorking ? <Pause size={14} color={agent.color} /> : <Play size={14} color={agent.color} />}
          <Text style={{ color: agent.color, fontWeight: '600', fontSize: 13 }}>
            {isWorking ? '暂停' : '启动'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            hapticLight();
            onAssign();
          }}
          style={{
            flex: 1,
            backgroundColor: C.bgGlass,
            borderRadius: 12,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Plus size={14} color={C.t1} />
          <Text style={{ color: C.t1, fontWeight: '600', fontSize: 13 }}>分配任务</Text>
        </Pressable>
      </View>
    </MotiView>
  );
}

// 分配任务 Modal
function AssignTaskModal({
  visible,
  agentName,
  onClose,
  onAssign,
}: {
  visible: boolean;
  agentName: string;
  onClose: () => void;
  onAssign: (title: string) => void;
}) {
  const [taskTitle, setTaskTitle] = useState('');
  const quickTasks = [
    '分析市场竞品数据',
    '生成客户触达话术',
    '追踪采购商动态',
    '优化产品描述文案',
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <MotiView
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            transition={SPRING}
            style={{
              backgroundColor: C.bgCard,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.t1 }}>
                分配任务给 {agentName}
              </Text>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={C.t2} />
              </Pressable>
            </View>

            {/* 快速任务选项 */}
            <Text style={{ fontSize: 12, color: C.t2, marginBottom: 12 }}>快速选择</Text>
            <View style={{ gap: 8 }}>
              {quickTasks.map((task) => (
                <Pressable
                  key={task}
                  onPress={() => {
                    hapticMedium();
                    onAssign(task);
                  }}
                  style={{
                    backgroundColor: C.bgGlass,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 14, color: C.t1 }}>{task}</Text>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: C.P + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Plus size={14} color={C.P} />
                  </View>
                </Pressable>
              ))}
            </View>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function DigitalAgentsScreen() {
  const [agents, setAgents] = useState(AGENTS);
  const [assignTarget, setAssignTarget] = useState<Agent | null>(null);
  const { tasks, addTask } = useStore();

  const workingCount = agents.filter((a) => a.status === 'working').length;
  const totalTasksToday = agents.reduce((sum, a) => sum + a.completedToday, 0);

  const handleToggle = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: a.status === 'working' ? 'standby' : 'working' }
          : a
      )
    );
  };

  const handleAssign = (title: string) => {
    if (assignTarget) {
      addTask({
        title,
        agent: assignTarget.name as any,
        status: 'running',
        progress: 0,
      });
      setAssignTarget(null);
    }
  };

  const getAgentTasks = (agentName: string) => {
    return tasks.filter((t) => t.agent === agentName && t.status === 'running');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: C.t1 }}>数字员工团队</Text>
            <Text style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>您的虚拟业务执行团队</Text>
          </View>

          {/* Hero 区域 */}
          <HeroGauge workingCount={workingCount} totalCount={agents.length} />

          {/* 数据面板 */}
          <DataPanel
            workingCount={workingCount}
            completedToday={totalTasksToday}
            totalCount={agents.length}
          />

          {/* 员工卡片列表 */}
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: C.t1, marginBottom: 12 }}>
              团队成员
            </Text>
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                activeTasks={getAgentTasks(agent.name)}
                onToggle={() => handleToggle(agent.id)}
                onAssign={() => setAssignTarget(agent)}
              />
            ))}
          </View>

          {/* 招募卡片 */}
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <Pressable
              onPress={() => hapticMedium()}
              style={{
                backgroundColor: C.P + '10',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: C.P + '30',
                borderStyle: 'dashed',
                padding: 20,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: C.P + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Plus size={20} color={C.P} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.t1 }}>招募新数字员工</Text>
              <Text style={{ fontSize: 12, color: C.t2 }}>扩展您的虚拟团队能力</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 分配任务 Modal */}
      <AssignTaskModal
        visible={!!assignTarget}
        agentName={assignTarget?.name || ''}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssign}
      />
    </View>
  );
}
