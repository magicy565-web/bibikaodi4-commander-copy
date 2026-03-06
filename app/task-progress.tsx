/**
 * 任务进度追踪页面 - Apple Watch Ultra 风格
 * 三区域布局：Hero 弧形仪表盘 / 数据面板 / 任务卡片列表
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { C, SPRING } from '../constants/theme';
import { useStore, Task, AgentType } from '../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// 员工对应颜色
const AGENT_COLORS: Record<AgentType, string> = {
  Scout: C.blue,
  Sage: C.PL,
  Echo: C.green,
  Muse: C.amber,
};

// ==================== Hero 区域：弧形仪表盘 ====================
function HeroGauge({ completed, total }: { completed: number; total: number }) {
  const progress = useSharedValue(0);
  const targetProgress = total > 0 ? completed / total : 0;
  
  // 仪表盘尺寸
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    progress.value = withTiming(targetProgress, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [targetProgress]);
  
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));
  
  return (
    <View style={styles.heroContainer}>
      {/* 紫色光晕背景 */}
      <View style={styles.heroGlow}>
        <Svg width={SCREEN_WIDTH} height={280} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={C.P} stopOpacity={0.3} />
              <Stop offset="50%" stopColor={C.P} stopOpacity={0.1} />
              <Stop offset="100%" stopColor={C.P} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={280} fill="url(#heroGlow)" />
        </Svg>
      </View>
      
      {/* 弧形仪表盘 */}
      <View style={styles.gaugeWrapper}>
        <Svg width={size} height={size}>
          {/* 底环 - 灰色 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={C.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* 进度环 - 渐变紫色 */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={C.PL}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {/* 中心文字 */}
        <View style={styles.gaugeCenter}>
          <Text style={styles.gaugeNumber}>
            {completed}<Text style={styles.gaugeSlash}>/</Text>{total}
          </Text>
          <Text style={styles.gaugeLabel}>任务完成率</Text>
        </View>
      </View>
    </View>
  );
}

// ==================== 数据面板区域 ====================
function DataPanel({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const running = tasks.filter(t => t.status === 'running').length;
  const done = tasks.filter(t => t.status === 'done').length;
  
  const items = [
    { label: '执行中', value: running, color: C.amber, ratio: total > 0 ? running / total : 0 },
    { label: '已完成', value: done, color: C.green, ratio: total > 0 ? done / total : 0 },
    { label: '总任务', value: total, color: C.PL, ratio: 1 },
  ];
  
  return (
    <View style={styles.dataPanel}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <View style={styles.dataDivider} />}
          <View style={styles.dataItem}>
            <Text style={styles.dataValue}>{item.value}</Text>
            <Text style={styles.dataLabel}>{item.label}</Text>
            {/* 迷你进度条 */}
            <View style={styles.miniProgressBg}>
              <MotiView
                from={{ width: 0 }}
                animate={{ width: `${item.ratio * 100}%` }}
                transition={{ type: 'timing', duration: 800 }}
                style={[styles.miniProgressFill, { backgroundColor: item.color }]}
              />
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

// ==================== 任务卡片 ====================
function TaskCard({ task, index }: { task: Task; index: number }) {
  const isRunning = task.status === 'running';
  const isDone = task.status === 'done';
  const agentColor = AGENT_COLORS[task.agent];
  
  // 进度条颜色：完成时绿色，否则琥珀色
  const progressColor = isDone ? C.green : C.amber;
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 80 }}
    >
      {/* 运行中的脉冲光晕 */}
      {isRunning && (
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{
            type: 'timing',
            duration: 1500,
            loop: true,
          }}
          style={[styles.cardGlow, { borderColor: C.amber }]}
        />
      )}
      
      <View style={[
        styles.taskCard,
        isDone && styles.taskCardDone,
      ]}>
        {/* 顶部进度条 */}
        <View style={styles.progressBarBg}>
          <MotiView
            from={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ type: 'timing', duration: 600 }}
            style={[styles.progressBarFill, { backgroundColor: progressColor }]}
          />
        </View>
        
        {/* 完成徽章 */}
        {isDone && (
          <View style={styles.doneBadge}>
            <Feather name="check" size={14} color={C.bg} />
          </View>
        )}
        
        {/* 卡片内容 */}
        <View style={styles.cardContent}>
          {/* 左侧：进度数字 */}
          <View style={styles.progressSection}>
            <Text style={[styles.progressNumber, { color: progressColor }]}>
              {task.progress}
            </Text>
            <Text style={styles.progressPercent}>%</Text>
          </View>
          
          {/* 右侧：任务信息 */}
          <View style={styles.taskInfo}>
            {/* 员工名称 + 状态标签 */}
            <View style={styles.taskHeader}>
              <View style={styles.agentRow}>
                <View style={[styles.agentDot, { backgroundColor: agentColor }]} />
                <Text style={styles.agentName}>{task.agent}</Text>
              </View>
              <View style={[
                styles.statusTag,
                { backgroundColor: isRunning ? C.amber + '20' : isDone ? C.green + '20' : C.t3 + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: isRunning ? C.amber : isDone ? C.green : C.t2 }
                ]}>
                  {isRunning ? '执行中' : isDone ? '已完成' : '待执行'}
                </Text>
              </View>
            </View>
            
            {/* 任务标题 */}
            <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
            
            {/* 结果（如果有） */}
            {isDone && task.result && (
              <View style={styles.resultBlock}>
                <Text style={styles.resultText} numberOfLines={2}>{task.result}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </MotiView>
  );
}

// ==================== 主页面 ====================
export default function TaskProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks } = useStore();
  
  const completedCount = tasks.filter(t => t.status === 'done').length;
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 返回按钮 */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Feather name="arrow-left" size={24} color={C.t1} />
      </Pressable>
      
      {/* 标题 */}
      <Text style={styles.pageTitle}>任务进度</Text>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero 区域：弧形仪表盘 */}
        <HeroGauge completed={completedCount} total={tasks.length} />
        
        {/* 数据面板 */}
        <DataPanel tasks={tasks} />
        
        {/* 任务卡片列表 */}
        <View style={styles.taskList}>
          {tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ==================== 样式 ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: C.t1,
    textAlign: 'center',
    marginTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  
  // Hero 区域
  heroContainer: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  gaugeWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugeNumber: {
    fontSize: 48,
    fontWeight: '200',
    color: C.t1,
  },
  gaugeSlash: {
    color: C.t3,
  },
  gaugeLabel: {
    fontSize: 13,
    color: C.t2,
    marginTop: 4,
  },
  
  // 数据面板
  dataPanel: {
    flexDirection: 'row',
    backgroundColor: C.bgGlass,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataDivider: {
    width: 1,
    backgroundColor: C.border,
  },
  dataValue: {
    fontSize: 28,
    fontWeight: '300',
    color: C.t1,
  },
  dataLabel: {
    fontSize: 12,
    color: C.t2,
    marginTop: 4,
    marginBottom: 8,
  },
  miniProgressBg: {
    width: 40,
    height: 2,
    backgroundColor: C.border,
    borderRadius: 1,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 1,
  },
  
  // 任务列表
  taskList: {
    gap: 12,
  },
  
  // 任务卡片
  taskCard: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskCardDone: {
    borderLeftWidth: 3,
    borderLeftColor: C.green,
  },
  cardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    borderWidth: 2,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: C.border,
  },
  progressBarFill: {
    height: '100%',
  },
  doneBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
  },
  progressNumber: {
    fontSize: 40,
    fontWeight: '100',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '300',
    color: C.t2,
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '500',
    color: C.t2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: C.t1,
    lineHeight: 20,
  },
  resultBlock: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: C.green,
  },
  resultText: {
    fontSize: 13,
    color: C.green,
    lineHeight: 18,
  },
});
