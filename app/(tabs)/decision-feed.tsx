/**
 * DecisionFeed — AI 决策卡片流（MVP 闭环版）
 * 闭环：确认决策 → 自动匹配数字员工 → 下发任务 → 跳转进度追踪
 */
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import { Check, X, ChevronDown, ChevronUp, Zap, TrendingUp, Globe, Sparkles, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { hapticSuccess, hapticLight, hapticWarning } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';
import { useStore } from '@/constants/store';

const { width: SCREEN_W } = Dimensions.get('window');

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
    id: '1', type: 'opportunity',
    title: '沙特不锈钢餐具需求激增 15%',
    summary: '海关数据显示沙特 2026 年基建预算增加，工业管材需求旺盛，12 家采购商正在寻源。',
    source: '火山引擎 · 中东海关数据',
    urgency: 'high',
    metrics: [
      { label: '匹配采购商', value: '12家', trend: 'up' },
      { label: '预估询盘价值', value: '$48K', trend: 'up' },
    ],
    aiReasoning: '基于过去 6 个月的海关进出口数据，结合您的产品目录，AI 判断此市场机会匹配度达 94%。',
    suggestedAction: '生成《沙特基建市场渗透报告》',
    estimatedValue: '$48,000',
  },
  {
    id: '2', type: 'lead',
    title: '高意向买家 Ahmed Al-Rashid 待跟进',
    summary: 'LinkedIn 上的沙特采购总监，已浏览您的产品页 3 次，停留时长 8 分钟，意向信号强烈。',
    source: 'LinkedIn · AI 行为分析',
    urgency: 'high',
    metrics: [
      { label: '意向评分', value: '94分', trend: 'up' },
      { label: '最佳联系窗口', value: '今日 14:00-16:00' },
    ],
    aiReasoning: '用户行为分析显示该买家处于决策期，停留时长是行业均值的 3.2 倍，建议立即联系。',
    suggestedAction: '发送个性化 WhatsApp 开场白',
    estimatedValue: '$25,000',
  },
  {
    id: '3', type: 'content',
    title: '产品图册中东点击率低于均值',
    summary: '当前图册在中东市场点击率 2.3%，行业均值 4.8%。AI 建议调整为「沙漠奢华风」视觉风格。',
    source: 'RealSourcing · Flux AI',
    urgency: 'medium',
    metrics: [
      { label: '当前点击率', value: '2.3%', trend: 'down' },
      { label: '行业均值', value: '4.8%' },
      { label: '预期提升', value: '+2.1x', trend: 'up' },
    ],
    aiReasoning: '通过对 200+ 中东买家行为数据的分析，暖色调和奢华感视觉可提升 2.1 倍点击率。',
    suggestedAction: '重新生成中东风格图册',
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

// ─── 任务派发成功的 Toast ─────────────────────────────────────

function DispatchToast({ agentName, taskTitle }: { agentName: string; taskTitle: string }) {
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
      <Pressable onPress={() => router.push('/task-progress')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: C.green, fontSize: 12, fontWeight: '600' }}>查看</Text>
          <ArrowRight size={14} color={C.green} />
        </View>
      </Pressable>
    </MotiView>
  );
}

// ─── 可滑动决策卡片 ───────────────────────────────────────────

function SwipeableCard({ card, onConfirm, onDismiss }: {
  card: DecisionCard;
  onConfirm: (card: DecisionCard) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
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

  // 修复：独立的左右背景层，避免颜色混叠
  const confirmBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  const dismissBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
  }));

  // 修复：补充 rotateZ，增加物理倾斜感
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${interpolate(translateX.value, [-SCREEN_W / 2, 0, SCREEN_W / 2], [-12, 0, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));

  return (
    <View style={{ marginBottom: 12, position: 'relative' }}>
      {/* 右滑确认背景 */}
      <Animated.View style={[{
        position: 'absolute', inset: 0, borderRadius: 20,
        backgroundColor: C.green + '15',
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
      }, confirmBgStyle]}>
        <Check size={24} color={C.green} />
        <Text style={{ color: C.green, fontWeight: '700', marginLeft: 8 }}>确认执行</Text>
      </Animated.View>

      {/* 左滑搁置背景 */}
      <Animated.View style={[{
        position: 'absolute', inset: 0, borderRadius: 20,
        backgroundColor: C.red + '15',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 24,
      }, dismissBgStyle]}>
        <Text style={{ color: C.red, fontWeight: '700', marginRight: 8 }}>暂时搁置</Text>
        <X size={24} color={C.red} />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={cardStyle}>
          <View style={{
            backgroundColor: C.bgCard,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: card.urgency === 'high' ? config.color + '40' : C.border,
            overflow: 'hidden',
          }}>
            <View style={{ height: 3, backgroundColor: config.color }} />

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

              {/* Metrics */}
              {card.metrics && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  {card.metrics.map(m => (
                    <View key={m.label} style={{ backgroundColor: C.bgGlass, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ color: C.t2, fontSize: 10 }}>{m.label}</Text>
                      <Text style={{ color: m.trend === 'up' ? C.green : m.trend === 'down' ? C.red : C.t1, fontSize: 14, fontWeight: '700' }}>{m.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* AI 决策依据 — 修复：用 maxHeight 动画替代 height: 'auto' */}
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

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Pressable
                  onPress={() => { hapticSuccess(); onConfirm(card); }}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={[config.color, config.color + 'cc']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                      {card.suggestedAction ?? '确认执行'}
                    </Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  onPress={() => { hapticLight(); onDismiss(card.id); }}
                  style={{ backgroundColor: C.bgGlass, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' }}
                >
                  <Text style={{ color: C.t2, fontWeight: '600', fontSize: 14 }}>暂不</Text>
                </Pressable>
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

  const handleConfirm = (card: DecisionCard) => {
    // 1. 从列表移除（延迟 500ms 等动画完成）
    setTimeout(() => setCards(prev => prev.filter(c => c.id !== card.id)), 500);

    // 2. 下发任务到全局 store
    const task = confirmDecision({
      id: card.id,
      title: card.title,
      type: card.type,
      estimatedValue: card.estimatedValue,
      suggestedAction: card.suggestedAction,
    });

    // 3. 显示派发成功 Toast
    setToast({ agentName: task.agentName, taskTitle: task.title });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDismiss = (id: string) => {
    setTimeout(() => setCards(prev => prev.filter(c => c.id !== id)), 500);
  };

  const runningTaskCount = state.tasks.filter(t => t.status === 'running' || t.status === 'pending').length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient
        colors={['#0a0015', '#000000']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: C.t1, fontSize: 22, fontWeight: '700' }}>决策中心</Text>
            <Text style={{ color: C.t2, fontSize: 13, marginTop: 2 }}>AI 正在为您主动发现商机</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {runningTaskCount > 0 && (
              <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
                <MotiView
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ loop: true, duration: 2000 }}
                  style={{ backgroundColor: C.PL + '25', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.PL }} />
                  <Text style={{ color: C.PL, fontWeight: '700', fontSize: 12 }}>{runningTaskCount} 执行中</Text>
                </MotiView>
              </Pressable>
            )}
            <View style={{ backgroundColor: C.red + '30', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: C.red, fontWeight: '700', fontSize: 13 }}>{cards.length} 待处理</Text>
            </View>
          </View>
        </View>

        {/* Swipe hint */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: C.t3, fontSize: 11 }}>← 右滑确认执行</Text>
          <Text style={{ color: C.t3, fontSize: 11 }}>左滑暂时搁置 →</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          <AnimatePresence>
            {cards.map((card, i) => (
              <MotiView
                key={card.id}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: i * 80, ...SPRING }}
              >
                <SwipeableCard card={card} onConfirm={handleConfirm} onDismiss={handleDismiss} />
              </MotiView>
            ))}
          </AnimatePresence>

          {cards.length === 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ alignItems: 'center', paddingTop: 80 }}
            >
              <MotiView
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ loop: true, duration: 2500 }}
                style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.green + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
              >
                <Check size={32} color={C.green} />
              </MotiView>
              <Text style={{ color: C.t1, fontSize: 18, fontWeight: '700' }}>全部处理完毕</Text>
              <Text style={{ color: C.t2, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                AI 正在持续监控市场{'\n'}有新机会会立即通知您
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
          {toast && <DispatchToast agentName={toast.agentName} taskTitle={toast.taskTitle} />}
        </AnimatePresence>
      </SafeAreaView>
    </View>
  );
}
