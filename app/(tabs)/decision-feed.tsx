/**
 * DecisionFeed — AI 决策卡片流
 * 视觉：v0 Apple Watch Ultra 三区域布局
 * 功能：Manus 业务闭环（确认 → 下发任务 → 进度追踪）
 */
import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { Check, X, ChevronDown, ChevronUp, Zap, TrendingUp, Globe, Sparkles, ArrowRight } from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { hapticSuccess, hapticLight, hapticWarning } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';
import { useStore } from '@/constants/store';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type DecisionType = 'opportunity' | 'lead' | 'content' | 'optimization' | 'alert';
type Urgency = 'low' | 'medium' | 'high';

interface DecisionCard {
  id: string;
  type: DecisionType;
  title: string;
  summary: string;
  source: string;
  urgency: Urgency;
  metrics?: { label: string; value: string; trend?: 'up' | 'down' }[];
  aiReasoning?: string;
  suggestedAction?: string;
  estimatedValue?: string;
}

const MOCK_CARDS: DecisionCard[] = [
  {
    id: '1', type: 'lead',
    title: 'Ahmed 询盘：KS-837 岩石沙发 200 套',
    summary: '沙特 Al-Futtaim 集团采购总监 Ahmed 发来询盘，斜月季前采购窗口仅剩 23 天，意向评分 94/100。已浏览产品页 3 次，停留 8 分钟。',
    source: 'RealSourcing · AI 行为分析',
    urgency: 'high',
    metrics: [
      { label: '采购数量', value: '200 套', trend: 'up' },
      { label: '预估价値', value: '$58,400', trend: 'up' },
      { label: '斜月窗口', value: '23 天' },
    ],
    aiReasoning: 'Ahmed 已浏览 KS-837 页面 3 次，停留时长是均値 3.2 倍，斜月季采购窗口紧迫。出厂价 ¥3,260/套，FOB 报价约 $292/套，200 套总价 $58,400。建议今日回复。',
    suggestedAction: '生成个性化英文报价 + WhatsApp 开场白',
    estimatedValue: '$58,400',
  },
  {
    id: '2', type: 'opportunity',
    title: '迪拜市场：奢华皮革沙发需求激增 +34%',
    summary: '迪拜 2025 年豪宅竪工量创历史新高，高端皮革沙发需求激增。KS-801 大黑牛和 KS-850 黑糖与当地审美高度匹配，已识别 12 家高意向采购商。',
    source: '迪拜房居展 · 市场情报库',
    urgency: 'medium',
    metrics: [
      { label: '市场增速', value: '+34% YoY', trend: 'up' },
      { label: '目标产品', value: 'KS-801/KS-850' },
      { label: '潜在买家', value: '12 家', trend: 'up' },
    ],
    aiReasoning: '迪拜 2025 年新建豪宅 12,000 套，高端皮革家具需求大幅增长。KS-801 大黑牛和 KS-850 黑糖的奢华皮革设计与当地审美高度匹配，建议立即开发。',
    suggestedAction: '生成《迪拜高端皮革家具市场进入报告》',
    estimatedValue: '$120,000',
  },
  {
    id: '3', type: 'content',
    title: 'KABEQ 中东图册点击率低于行业均値 2.1x',
    summary: 'KS-837 和 KS-824 在中东市场点击率 2.3%，行业均値 4.8%。AI 建议重新生成「沙漠奢华风」 + 阿拉伯语标注版本。',
    source: 'RealSourcing · Flux AI 内容分析',
    urgency: 'low',
    metrics: [
      { label: '当前点击率', value: '2.3%', trend: 'down' },
      { label: '行业均値', value: '4.8%' },
      { label: '预期提升', value: '+2.1x', trend: 'up' },
    ],
    aiReasoning: '分析 200+ 中东买家行为数据，本地化视觉（暖金色调 + 阿拉伯文标注）可将点击率提升至行业均値以上。涉及产品：KS-837 岩石沙发和 KS-824 云沙发。',
    suggestedAction: '重新生成「沙漠奢华风」 KS-837 阿拉伯语图册',
  },
];

const TYPE_CONFIG = {
  opportunity: { color: C.green,  label: '市场机会', icon: Globe },
  lead:        { color: C.amber,  label: '高意向买家', icon: Zap },
  content:     { color: C.blue,   label: '内容优化', icon: Sparkles },
  optimization:{ color: C.PL,     label: '流程优化', icon: TrendingUp },
  alert:       { color: C.red,    label: '紧急提醒', icon: Zap },
};

const URGENCY_COLOR: Record<Urgency, string> = {
  low: C.t3, medium: C.amber, high: C.red,
};

// ─── 区域一：Hero 区域（v0 设计）────────────────────────────────

function HeroSection({ pendingCount, highestUrgencyType, isExecuting, onExecutingPress }: {
  pendingCount: number;
  highestUrgencyType: string;
  isExecuting: boolean;
  onExecutingPress: () => void;
}) {
  return (
    <View style={{ height: SCREEN_H * 0.28, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {/* 紫色光晕背景 */}
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
        <Defs>
          <RadialGradient id="purpleGlow2" cx="50%" cy="0%" rx="80%" ry="100%">
            <Stop offset="0%" stopColor={C.P} stopOpacity="0.25" />
            <Stop offset="50%" stopColor={C.P} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={C.bg} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#purpleGlow2)" />
      </Svg>

      {/* 执行中脉冲徽章（可点击跳转进度页）*/}
      {isExecuting && (
        <Pressable onPress={onExecutingPress} style={{ position: 'absolute', top: 20, right: 20 }}>
          <MotiView
            from={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.15, opacity: 0.4 }}
            transition={{ loop: true, type: 'timing', duration: 1200 }}
            style={{
              backgroundColor: C.green + '30',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green }} />
            <Text style={{ color: C.green, fontSize: 12, fontWeight: '600' }}>执行中</Text>
          </MotiView>
        </Pressable>
      )}

      {/* 超大数字 */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Text style={{
          color: C.t1, fontSize: 96, fontWeight: '100',
          letterSpacing: -4, textAlign: 'center',
        }}>
          {pendingCount}
        </Text>
      </MotiView>

      {/* 副标题 */}
      <Text style={{ color: C.t2, fontSize: 14, marginTop: -8, textAlign: 'center' }}>
        {pendingCount > 0 ? `${highestUrgencyType} · 需立即处理` : '全部处理完毕'}
      </Text>
    </View>
  );
}

// ─── 活动环（v0 设计）────────────────────────────────────────

function ActivityRing({ progress, color, size, strokeWidth }: {
  progress: number; color: string; size: number; strokeWidth: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={radius}
        stroke={color + '20'} strokeWidth={strokeWidth} fill="transparent" />
      <Circle cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={strokeWidth} fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
  );
}

// ─── 区域二：数据环（v0 设计）────────────────────────────────

function DataRingsSection({ cards }: { cards: DecisionCard[] }) {
  const total = Math.max(cards.length, 1);
  const rings = [
    { label: '市场机会', count: cards.filter(c => c.type === 'opportunity').length, color: C.green },
    { label: '买家跟进', count: cards.filter(c => c.type === 'lead').length, color: C.amber },
    { label: '内容优化', count: cards.filter(c => c.type === 'content').length, color: C.blue },
  ];

  return (
    <View style={{
      height: SCREEN_H * 0.18,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
    }}>
      {rings.map((ring, index) => (
        <MotiView
          key={ring.label}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 150, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ alignItems: 'center' }}
        >
          <View style={{ position: 'relative' }}>
            <ActivityRing progress={ring.count / total} color={ring.color} size={64} strokeWidth={6} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: ring.color, fontSize: 18, fontWeight: '700' }}>{ring.count}</Text>
            </View>
          </View>
          <Text style={{ color: C.t2, fontSize: 11, marginTop: 8 }}>{ring.label}</Text>
        </MotiView>
      ))}
    </View>
  );
}

// ─── 派发成功 Toast（Manus 功能）────────────────────────────────

function DispatchToast({ agentName, taskTitle, onPress }: {
  agentName: string; taskTitle: string; onPress: () => void;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        position: 'absolute', bottom: 110, left: 20, right: 20, zIndex: 100,
        backgroundColor: C.green + '15',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.green + '50',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.green + '25', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={18} color={C.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.green, fontWeight: '700', fontSize: 13 }}>任务已下发给 {agentName}</Text>
        <Text style={{ color: C.t2, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{taskTitle}</Text>
      </View>
      <Pressable onPress={onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: C.green, fontSize: 12, fontWeight: '600' }}>查看</Text>
          <ArrowRight size={14} color={C.green} />
        </View>
      </Pressable>
    </MotiView>
  );
}

// ─── 区域三：决策卡片（v0 视觉 + Manus 功能）────────────────────

function SwipeableCard({ card, onConfirm, onDismiss }: {
  card: DecisionCard;
  onConfirm: (card: DecisionCard) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const translateX = useSharedValue(0);
  const config = TYPE_CONFIG[card.type];

  const gesture = Gesture.Pan()
    .onUpdate((e) => { translateX.value = e.translationX; })
    .onEnd((e) => {
      if (e.translationX > 100) {
        translateX.value = withSpring(SCREEN_W * 1.5, { stiffness: 300, damping: 25 });
        runOnJS(hapticSuccess)();
        runOnJS(onConfirm)(card);
      } else if (e.translationX < -100) {
        translateX.value = withSpring(-SCREEN_W * 1.5, { stiffness: 300, damping: 25 });
        runOnJS(hapticWarning)();
        runOnJS(onDismiss)(card.id);
      } else {
        translateX.value = withSpring(0, { stiffness: 400, damping: 28 });
      }
    });

  // 独立左右背景层，避免颜色混叠
  const confirmBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  const dismissBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  // rotateZ 物理倾斜感
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${interpolate(translateX.value, [-SCREEN_W / 2, 0, SCREEN_W / 2], [-12, 0, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));

  const glowStyle = card.urgency === 'high' ? {
    shadowColor: config.color,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  } : {};

  return (
    <View style={{ marginBottom: 12, position: 'relative' }}>
      {/* 右滑确认背景 */}
      <Animated.View style={[{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20,
        backgroundColor: C.green + '15',
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
      }, confirmBgStyle]}>
        <Check size={24} color={C.green} />
        <Text style={{ color: C.green, fontWeight: '700', marginLeft: 8 }}>确认执行</Text>
      </Animated.View>

      {/* 左滑搁置背景 */}
      <Animated.View style={[{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20,
        backgroundColor: C.red + '15',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 24,
      }, dismissBgStyle]}>
        <Text style={{ color: C.red, fontWeight: '700', marginRight: 8 }}>暂时搁置</Text>
        <X size={24} color={C.red} />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={cardStyle}>
          <View style={[{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: card.urgency === 'high' ? config.color + '40' : 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
            flexDirection: 'row',
          }, glowStyle]}>
            {/* 左侧 4px 彩色竖边框 */}
            <View style={{ width: 4, backgroundColor: config.color, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />

            <View style={{ flex: 1 }}>
              {/* 顶部渐变横条 */}
              <LinearGradient
                colors={[config.color, config.color + '00']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: 3 }}
              />

              <View style={{ padding: 18 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={{ backgroundColor: config.color + '20', borderRadius: 8, padding: 6 }}>
                      <config.icon size={14} color={config.color} />
                    </View>
                    <Text style={{ color: config.color, fontSize: 12, fontWeight: '600' }}>{config.label}</Text>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: URGENCY_COLOR[card.urgency] }} />
                  </View>
                  <Text style={{ color: C.t3, fontSize: 11 }}>{card.source}</Text>
                </View>

                <Text style={{ color: C.t1, fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 22 }}>{card.title}</Text>
                <Text style={{ color: C.t2, fontSize: 13, lineHeight: 19 }}>{card.summary}</Text>

                {/* Metrics 横向滚动 chip */}
                {card.metrics && (
                  <ScrollView
                    horizontal showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 14, marginHorizontal: -18 }}
                    contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}
                  >
                    {card.metrics.map(m => (
                      <View key={m.label} style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                      }}>
                        <Text style={{ color: C.t3, fontSize: 11 }}>{m.label}</Text>
                        <Text style={{
                          color: m.trend === 'up' ? C.green : m.trend === 'down' ? C.red : C.t1,
                          fontSize: 13, fontWeight: '700',
                        }}>{m.value}</Text>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* AI 决策依据展开（修复：用 maxHeight 替代 height: 'auto'）*/}
                {card.aiReasoning && (
                  <Pressable
                    onPress={() => { hapticLight(); setExpanded(!expanded); }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 }}
                  >
                    <Text style={{ color: C.PL, fontSize: 12 }}>AI 决策依据</Text>
                    {expanded ? <ChevronUp size={14} color={C.PL} /> : <ChevronDown size={14} color={C.PL} />}
                  </Pressable>
                )}

                <MotiView
                  animate={{ maxHeight: expanded ? 200 : 0, opacity: expanded ? 1 : 0 }}
                  transition={{ type: 'timing', duration: 250 }}
                  style={{ overflow: 'hidden' }}
                >
                  <View style={{ marginTop: 10, padding: 12, backgroundColor: C.P + '15', borderRadius: 12, borderLeftWidth: 2, borderLeftColor: C.PL }}>
                    <Text style={{ color: C.t2, fontSize: 12, lineHeight: 18 }}>{card.aiReasoning}</Text>
                  </View>
                </MotiView>

                {/* 预估价值 */}
                {card.estimatedValue && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    <TrendingUp size={13} color={C.green} />
                    <Text style={{ color: C.t2, fontSize: 12 }}>预估价值</Text>
                    <Text style={{ color: C.green, fontSize: 14, fontWeight: '700' }}>{card.estimatedValue}</Text>
                  </View>
                )}

                {/* 操作按钮 */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <Pressable onPress={() => { hapticSuccess(); onConfirm(card); }} style={{ flex: 1 }}>
                    <LinearGradient
                      colors={[C.green, C.green + 'cc']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <Check size={16} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                        {card.suggestedAction ?? '确认执行'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    onPress={() => { hapticLight(); onDismiss(card.id); }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={20} color={C.t2} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────

export default function DecisionFeedScreen() {
  const { confirmDecision, state } = useStore();
  const [cards, setCards] = useState<DecisionCard[]>(MOCK_CARDS);
  const [toast, setToast] = useState<{ agentName: string; taskTitle: string } | null>(null);

  const isExecuting = state.tasks.some(t => t.status === 'running' || t.status === 'pending');
  const runningTaskCount = state.tasks.filter(t => t.status === 'running' || t.status === 'pending').length;

  const handleConfirm = (card: DecisionCard) => {
    // 延迟移除卡片，等待滑出动画
    setTimeout(() => setCards(prev => prev.filter(c => c.id !== card.id)), 500);

    // ✅ 调用 confirmDecision 下发任务到全局 store
    const task = confirmDecision({
      id: card.id,
      title: card.title,
      type: card.type,
      estimatedValue: card.estimatedValue,
      suggestedAction: card.suggestedAction,
    });

    // 显示派发成功 Toast
    setToast({ agentName: task.agentName, taskTitle: task.title });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDismiss = (id: string) => {
    setTimeout(() => setCards(prev => prev.filter(c => c.id !== id)), 500);
  };

  const highestUrgencyCard = cards.find(c => c.urgency === 'high') ?? cards[0];
  const highestUrgencyType = highestUrgencyCard ? TYPE_CONFIG[highestUrgencyCard.type].label : '无待处理';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* ── 区域一：Hero ── */}
        <HeroSection
          pendingCount={cards.length}
          highestUrgencyType={highestUrgencyType}
          isExecuting={isExecuting}
          onExecutingPress={() => { hapticLight(); router.push('/task-progress'); }}
        />

        {/* ── 区域二：数据环 ── */}
        <DataRingsSection cards={cards} />

        {/* 滑动提示 + 执行中徽章 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: C.t3, fontSize: 11 }}>← 右滑确认执行</Text>
          {runningTaskCount > 0 && (
            <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
              <MotiView
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ loop: true, duration: 2000 }}
                style={{ backgroundColor: C.PL + '25', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.PL }} />
                <Text style={{ color: C.PL, fontWeight: '700', fontSize: 11 }}>{runningTaskCount} 执行中</Text>
              </MotiView>
            </Pressable>
          )}
          <Text style={{ color: C.t3, fontSize: 11 }}>左滑搁置 →</Text>
        </View>

        {/* ── 区域三：决策卡片 ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          style={{ flex: 1 }}
        >
          <AnimatePresence>
            {cards.map((card, i) => (
              <MotiView
                key={card.id}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: i * 100, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <SwipeableCard card={card} onConfirm={handleConfirm} onDismiss={handleDismiss} />
              </MotiView>
            ))}
          </AnimatePresence>

          {cards.length === 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ alignItems: 'center', paddingTop: 40 }}
            >
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.green + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Check size={40} color={C.green} />
              </View>
              <Text style={{ color: C.t1, fontSize: 18, fontWeight: '700' }}>全部处理完毕</Text>
              <Text style={{ color: C.t2, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                AI 正在持续监控市场，有新机会会立即通知您
              </Text>
              {state.tasks.length > 0 && (
                <Pressable
                  onPress={() => { hapticLight(); router.push('/task-progress'); }}
                  style={{ marginTop: 24 }}
                >
                  <LinearGradient
                    colors={[C.P, C.PL]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>查看任务进度</Text>
                    <ArrowRight size={16} color="#fff" />
                  </LinearGradient>
                </Pressable>
              )}
            </MotiView>
          )}
        </ScrollView>

        {/* 派发成功 Toast */}
        <AnimatePresence>
          {toast && (
            <DispatchToast
              agentName={toast.agentName}
              taskTitle={toast.taskTitle}
              onPress={() => { hapticLight(); router.push('/task-progress'); }}
            />
          )}
        </AnimatePresence>

      </SafeAreaView>
    </View>
  );
}
