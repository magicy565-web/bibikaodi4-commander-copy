/**
 * DecisionFeed — AI 决策卡片流
 * Apple Watch Ultra 风格三区域布局
 * 核心交互：左滑驳回（暂搁置）/ 右滑确认 / 长按展开
 */
import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, interpolate, Extrapolation } from 'react-native-reanimated';
import { Check, X, ChevronDown, ChevronUp, Zap, TrendingUp, Globe, Sparkles } from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { hapticSuccess, hapticLight, hapticWarning } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';

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
    id: '1', type: 'opportunity',
    title: '沙特不锈钢餐具需求激增 15%',
    summary: '海关数据显示沙特 2026 年基建预算增加，工业管材需求旺盛，12 家采购商正在寻源。',
    source: '火山引擎 · 中东海关数据',
    urgency: 'high',
    metrics: [{ label: '匹配采购商', value: '12家', trend: 'up' }, { label: '预估询盘价值', value: '$48K', trend: 'up' }],
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
    metrics: [{ label: '意向评分', value: '94分', trend: 'up' }, { label: '最佳联系窗口', value: '今日 14:00-16:00' }],
    suggestedAction: '发送个性化 WhatsApp 开场白',
    estimatedValue: '$25,000',
  },
  {
    id: '3', type: 'content',
    title: '产品图册中东点击率低于均值',
    summary: '当前图册在中东市场点击率 2.3%，行业均值 4.8%。AI 建议调整为「沙漠奢华风」视觉风格。',
    source: 'RealSourcing · Flux AI',
    urgency: 'medium',
    metrics: [{ label: '当前点击率', value: '2.3%', trend: 'down' }, { label: '行业均值', value: '4.8%' }, { label: '预期提升', value: '+2.1x', trend: 'up' }],
    suggestedAction: '重新生成中东风格图册',
  },
];

const TYPE_CONFIG = {
  opportunity: { color: C.green, label: '市场机会', icon: Globe },
  lead: { color: C.amber, label: '高意向买家', icon: Zap },
  content: { color: C.blue, label: '内容优化', icon: Sparkles },
  optimization: { color: C.PL, label: '流程优化', icon: TrendingUp },
  alert: { color: C.red, label: '紧急提醒', icon: Zap },
};

const URGENCY_COLOR = { low: C.t3, medium: C.amber, high: C.red };

// ============ 区域一：Hero 区域组件 ============
function HeroSection({ pendingCount, highestUrgencyType, isExecuting }: {
  pendingCount: number;
  highestUrgencyType: string;
  isExecuting: boolean;
}) {
  return (
    <View style={{ height: SCREEN_H * 0.28, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {/* 紫色光晕背景 */}
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
        <Defs>
          <RadialGradient id="purpleGlow" cx="50%" cy="0%" rx="80%" ry="100%">
            <Stop offset="0%" stopColor={C.P} stopOpacity="0.25" />
            <Stop offset="50%" stopColor={C.P} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={C.bg} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#purpleGlow)" />
      </Svg>

      {/* 执行中脉冲徽章 */}
      {isExecuting && (
        <MotiView
          from={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.2, opacity: 0.4 }}
          transition={{ loop: true, type: 'timing', duration: 1200 }}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
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
      )}

      {/* 超大数字 */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Text style={{
          color: C.t1,
          fontSize: 96,
          fontWeight: '100',
          letterSpacing: -4,
          textAlign: 'center',
        }}>
          {pendingCount}
        </Text>
      </MotiView>

      {/* 副标题 */}
      <Text style={{
        color: C.t2,
        fontSize: 14,
        marginTop: -8,
        textAlign: 'center',
      }}>
        {highestUrgencyType} · 需立即处理
      </Text>
    </View>
  );
}

// ============ 区域二：活动环组件 ============
function ActivityRing({ progress, color, size, strokeWidth }: {
  progress: number;
  color: string;
  size: number;
  strokeWidth: number;
}) {
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      {/* 背景环 */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color + '20'}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* 进度环 */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

function DataRingsSection({ cards }: { cards: DecisionCard[] }) {
  const total = cards.length || 1;
  const opportunityCount = cards.filter(c => c.type === 'opportunity').length;
  const leadCount = cards.filter(c => c.type === 'lead').length;
  const contentCount = cards.filter(c => c.type === 'content').length;

  const rings = [
    { label: '市场机会', count: opportunityCount, color: C.green, progress: opportunityCount / total },
    { label: '买家跟进', count: leadCount, color: C.amber, progress: leadCount / total },
    { label: '内容优化', count: contentCount, color: C.blue, progress: contentCount / total },
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
            <ActivityRing
              progress={ring.progress}
              color={ring.color}
              size={64}
              strokeWidth={6}
            />
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: ring.color, fontSize: 18, fontWeight: '700' }}>
                {ring.count}
              </Text>
            </View>
          </View>
          <Text style={{ color: C.t2, fontSize: 11, marginTop: 8 }}>{ring.label}</Text>
        </MotiView>
      ))}
    </View>
  );
}

// ============ 区域三：决策卡片组件 ============
function SwipeableCard({ card, onConfirm, onDismiss }: {
  card: DecisionCard;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const translateX = useSharedValue(0);
  const config = TYPE_CONFIG[card.type];

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        translateX.value = withSpring(SCREEN_W);
        runOnJS(hapticSuccess)();
        runOnJS(onConfirm)(card.id);
      } else if (e.translationX < -100) {
        translateX.value = withSpring(-SCREEN_W);
        runOnJS(hapticWarning)();
        runOnJS(onDismiss)(card.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const bgStyle = useAnimatedStyle(() => {
    const confirmOpacity = interpolate(translateX.value, [0, 100], [0, 1], Extrapolation.CLAMP);
    const dismissOpacity = interpolate(translateX.value, [-100, 0], [1, 0], Extrapolation.CLAMP);
    return { opacity: Math.max(confirmOpacity, dismissOpacity) };
  });

  // 高紧急度卡片的外发光样式
  const glowStyle = card.urgency === 'high' ? {
    shadowColor: config.color,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  } : {};

  return (
    <View style={{ marginBottom: 12, position: 'relative' }}>
      {/* Swipe hint background */}
      <Animated.View style={[{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24
      }, bgStyle]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Check size={24} color={C.green} />
          <Text style={{ color: C.green, fontWeight: '700' }}>确认执行</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: C.red, fontWeight: '700' }}>暂时搁置</Text>
          <X size={24} color={C.red} />
        </View>
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={animStyle}>
          <View style={[{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: card.urgency === 'high' ? config.color + '40' : 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
            flexDirection: 'row',
          }, glowStyle]}>
            {/* 左侧 4px 彩色竖边框 */}
            <View style={{
              width: 4,
              backgroundColor: config.color,
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
            }} />

            <View style={{ flex: 1 }}>
              {/* 顶部渐变横条 */}
              <LinearGradient
                colors={[config.color, config.color + '00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
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

                {/* Metrics - 横向滚动 chip 样式 */}
                {card.metrics && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 14, marginHorizontal: -18 }}
                    contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}
                  >
                    {card.metrics.map(m => (
                      <View key={m.label} style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <Text style={{ color: C.t3, fontSize: 11 }}>{m.label}</Text>
                        <Text style={{
                          color: m.trend === 'up' ? C.green : m.trend === 'down' ? C.red : C.t1,
                          fontSize: 13,
                          fontWeight: '700'
                        }}>{m.value}</Text>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* Expand/Collapse */}
                {card.aiReasoning && (
                  <Pressable
                    onPress={() => { hapticLight(); setExpanded(!expanded); }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 }}
                  >
                    <Text style={{ color: C.PL, fontSize: 12 }}>AI 决策依据</Text>
                    {expanded ? <ChevronUp size={14} color={C.PL} /> : <ChevronDown size={14} color={C.PL} />}
                  </Pressable>
                )}

                {expanded && card.aiReasoning && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' as any }}
                    style={{ marginTop: 10, padding: 12, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: 12, borderLeftWidth: 2, borderLeftColor: C.PL }}
                  >
                    <Text style={{ color: C.t2, fontSize: 12, lineHeight: 18 }}>{card.aiReasoning}</Text>
                  </MotiView>
                )}

                {/* Action Buttons - 新样式 */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <Pressable
                    onPress={() => { hapticSuccess(); onConfirm(card.id); }}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[C.green, C.green + 'cc']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 12,
                        paddingVertical: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <Check size={16} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                        {card.suggestedAction ?? '确认执行'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    onPress={() => { hapticLight(); onDismiss(card.id); }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      width: 48,
                      height: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
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

export default function DecisionFeedScreen() {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleConfirm = (id: string) => {
    setIsExecuting(true);
    setTimeout(() => {
      setCards(prev => prev.filter(c => c.id !== id));
      setIsExecuting(false);
    }, 300);
  };

  const handleDismiss = (id: string) => {
    setTimeout(() => setCards(prev => prev.filter(c => c.id !== id)), 300);
  };

  // 获取最高紧急度的卡片类型
  const highestUrgencyCard = cards.find(c => c.urgency === 'high') || cards[0];
  const highestUrgencyType = highestUrgencyCard ? TYPE_CONFIG[highestUrgencyCard.type].label : '无待处理';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* 区域一：Hero 区域 */}
        <HeroSection
          pendingCount={cards.length}
          highestUrgencyType={highestUrgencyType}
          isExecuting={isExecuting}
        />

        {/* 区域二：数据图表区域 */}
        <DataRingsSection cards={cards} />

        {/* Swipe hint */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: C.t3, fontSize: 11 }}>← 右滑确认</Text>
          <Text style={{ color: C.t3, fontSize: 11 }}>左滑搁置 →</Text>
        </View>

        {/* 区域三：决策卡片区域 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          style={{ flex: 1 }}
        >
          <AnimatePresence>
            {cards.map((card, i) => (
              <MotiView
                key={card.id}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: C.green + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Check size={40} color={C.green} />
              </View>
              <Text style={{ color: C.t1, fontSize: 18, fontWeight: '700' }}>全部处理完毕</Text>
              <Text style={{ color: C.t2, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                AI 正在持续监控市场，有新机会会立即通知您
              </Text>
            </MotiView>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
