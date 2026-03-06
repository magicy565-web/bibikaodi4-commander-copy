/**
 * TaskProgress — 任务执行进度追踪页（决策闭环第三步）
 * 展示所有已下发任务的实时进度、执行员工、完成结果
 */
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Check, X, Clock, Zap, ChevronLeft, ArrowRight } from 'lucide-react-native';
import { hapticLight } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';
import { useStore, Task } from '@/constants/store';
import { useEffect } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Hero 弧形仪表盘（v0 Apple Watch Ultra 风格）────────────────
function HeroGauge({ completed, total }: { completed: number; total: number }) {
  const progress = useSharedValue(0);
  const targetProgress = total > 0 ? completed / total : 0;
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withTiming(targetProgress, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  }, [targetProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="taskHeroGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#7C3AED" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#taskHeroGlow)" />
        </Svg>
      </View>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={C.border} strokeWidth={strokeWidth} fill="transparent" />
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={C.PL} strokeWidth={strokeWidth} fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, fontWeight: '200', color: C.t1 }}>
            {completed}<Text style={{ color: C.t3 }}>/{total}</Text>
          </Text>
          <Text style={{ fontSize: 13, color: C.t2, marginTop: 4 }}>任务完成率</Text>
        </View>
      </View>
    </View>
  );
}

const STATUS_CONFIG = {
  pending: { label: '等待中', color: C.t3, icon: Clock },
  running: { label: '执行中', color: C.amber, icon: Zap },
  done:    { label: '已完成', color: C.green, icon: Check },
  failed:  { label: '失败',   color: C.red,   icon: X },
};

function TaskCard({ task }: { task: Task }) {
  const config = STATUS_CONFIG[task.status];

  const formatTime = (d?: Date) => {
    if (!d) return '';
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING}
      style={{
        backgroundColor: C.bgCard,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: task.status === 'done' ? C.green + '30' : task.status === 'running' ? C.amber + '30' : C.border,
        padding: 16,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {/* 顶部进度条 */}
      <View style={{ height: 3, backgroundColor: C.bgGlass, borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${task.progress}%` }}
          transition={{ type: 'timing', duration: 600 }}
          style={{ height: 3, backgroundColor: config.color, borderRadius: 2 }}
        />
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: C.t1, fontSize: 14, fontWeight: '700', lineHeight: 20 }}>{task.title}</Text>
          <Text style={{ color: C.t2, fontSize: 12, marginTop: 4 }}>分配给：{task.agentName}</Text>
        </View>
        <View style={{ backgroundColor: config.color + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {task.status === 'running' ? (
            <MotiView
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ loop: true, duration: 1200 }}
            >
              <config.icon size={12} color={config.color} />
            </MotiView>
          ) : (
            <config.icon size={12} color={config.color} />
          )}
          <Text style={{ color: config.color, fontSize: 11, fontWeight: '700' }}>{config.label}</Text>
        </View>
      </View>

      {/* 进度数字 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text style={{ color: config.color, fontSize: 40, fontWeight: '100' }}>{task.progress}<Text style={{ fontSize: 16, fontWeight: '300', color: C.t2 }}>%</Text></Text>
        {task.startedAt && (
          <Text style={{ color: C.t3, fontSize: 12 }}>开始于 {formatTime(task.startedAt)}</Text>
        )}
        {task.completedAt && (
          <Text style={{ color: C.green, fontSize: 12 }}>完成于 {formatTime(task.completedAt)}</Text>
        )}
      </View>

      {/* 预估价值 */}
      {task.estimatedValue && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Text style={{ color: C.t3, fontSize: 12 }}>预估价值</Text>
          <Text style={{ color: C.green, fontSize: 14, fontWeight: '700' }}>{task.estimatedValue}</Text>
        </View>
      )}

      {/* 完成结果 */}
      <AnimatePresence>
        {task.status === 'done' && task.result && (
          <MotiView
            from={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 200 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ overflow: 'hidden' }}
          >
            <View style={{ backgroundColor: C.green + '10', borderRadius: 12, padding: 12, borderLeftWidth: 2, borderLeftColor: C.green }}>
              <Text style={{ color: C.green, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>✓ 执行结果</Text>
              <Text style={{ color: C.t2, fontSize: 12, lineHeight: 18 }}>{task.result}</Text>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </MotiView>
  );
}

export default function TaskProgressScreen() {
  const { state } = useStore();
  const { tasks } = state;

  const runningCount = tasks.filter(t => t.status === 'running' || t.status === 'pending').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completedCount = doneCount;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient
        colors={['#0a0015', '#000000']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => { hapticLight(); router.back(); }}>
            <View style={{ backgroundColor: C.bgGlass, borderRadius: 10, padding: 8 }}>
              <ChevronLeft size={20} color={C.t1} />
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.t1, fontSize: 20, fontWeight: '700' }}>任务执行追踪</Text>
            <Text style={{ color: C.t2, fontSize: 12, marginTop: 2 }}>
              {runningCount > 0 ? `${runningCount} 个任务执行中` : '所有任务已完成'}
            </Text>
          </View>
        </View>

        {/* ── 区域一：Hero 弧形仪表盘（v0 Apple Watch Ultra 风格）── */}
        <HeroGauge completed={completedCount} total={tasks.length} />

        {/* ── 区域二：数据面板（竖线分隔样式）── */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, backgroundColor: C.bgGlass, borderRadius: 16, paddingVertical: 16, marginBottom: 20 }}>
          {[
            { label: '执行中', value: runningCount, color: C.amber },
            { label: '已完成', value: doneCount, color: C.green },
            { label: '总任务', value: tasks.length, color: C.PL },
          ].map((item, index, arr) => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', borderRightWidth: index < arr.length - 1 ? 1 : 0, borderRightColor: C.border }}>
              <Text style={{ fontSize: 28, fontWeight: '300', color: C.t1 }}>{item.value}</Text>
              <Text style={{ fontSize: 12, color: C.t2, marginTop: 4, marginBottom: 8 }}>{item.label}</Text>
              <View style={{ width: 40, height: 2, backgroundColor: C.border, borderRadius: 1, overflow: 'hidden' }}>
                <View style={{ width: tasks.length > 0 ? `${(item.value / tasks.length) * 100}%` : '0%', height: '100%', backgroundColor: item.color, borderRadius: 1 }} />
              </View>
            </View>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {tasks.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ color: C.t2, fontSize: 16, marginBottom: 16 }}>暂无执行中的任务</Text>
              <Pressable onPress={() => { hapticLight(); router.back(); }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.PL + '20', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 }}>
                  <Text style={{ color: C.PL, fontWeight: '600' }}>返回决策中心</Text>
                  <ArrowRight size={16} color={C.PL} />
                </View>
              </Pressable>
            </View>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
