/**
 * CommanderChat — AI 指挥官对话中心（深化版）
 * A. 精准意图识别：12 个外贸场景 + 实体参数提取
 * B. 方案修改对话：ActionCard 内修改渠道/员工，AI 实时更新方案
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send, Plus, ArrowRight, Check, X,
  Zap, Clock, TrendingUp, Edit3, RefreshCw,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { hapticLight, hapticSuccess, hapticWarning, hapticMedium } from '@/constants/haptics';
import { C, SPRING, SPRING_GENTLE } from '@/constants/theme';
import { useStore } from '@/constants/store';
import { callCommanderAI, AIPlan } from '@/services/ai';

// ─── 类型定义 ─────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plan?: AIPlan['plan'];
  planStatus?: 'pending' | 'confirmed' | 'dismissed';
  isTyping?: boolean;
  isRevision?: boolean;  // 是否为修改后的方案
}

const QUICK_ACTIONS = [
  { icon: '🔍', label: '扫描市场',  action: '帮我扫描沙特市场机会' },
  { icon: '👤', label: '跟进买家',  action: '帮我跟进买家 Ahmed Al-Rashid' },
  { icon: '🎨', label: '优化图册',  action: '帮我优化中东市场产品图册' },
  { icon: '📋', label: '回复询盘',  action: '帮我回复最新的询盘' },
  { icon: '💰', label: '生成报价',  action: '帮我生成一份报价单' },
  { icon: '🏆', label: '竞品分析',  action: '帮我分析竞争对手' },
];

// 渠道快捷修改选项
const CHANNEL_OPTIONS = ['WhatsApp', '邮件', 'LinkedIn'];

// ─── 打字机动效 ───────────────────────────────────────────────

function useTypewriter(text: string, enabled: boolean, speed = 16) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !text) { setDisplayed(text); setDone(true); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, enabled]);

  return { displayed, done };
}

// ─── 渠道标签 ─────────────────────────────────────────────────

function ChannelChip({ channel, color }: { channel: string; color: string }) {
  const CHANNEL_ICONS: Record<string, string> = {
    'WhatsApp': '💬', '邮件': '📧', 'LinkedIn': '🔗',
    '报告': '📊', '图册': '🎨',
  };
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: color + '18', borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 4,
      borderWidth: 1, borderColor: color + '35',
    }}>
      <Text style={{ fontSize: 11 }}>{CHANNEL_ICONS[channel] ?? '📌'}</Text>
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{channel}</Text>
    </View>
  );
}

// ─── ActionCard（Plan 模式确认卡片）──────────────────────────

function ActionCard({
  plan,
  status,
  isRevision,
  onConfirm,
  onDismiss,
  onRequestRevision,
}: {
  plan: NonNullable<AIPlan['plan']>;
  status: 'pending' | 'confirmed' | 'dismissed';
  isRevision?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  onRequestRevision: (hint: string) => void;
}) {
  const [showRevisionOptions, setShowRevisionOptions] = useState(false);

  const TYPE_COLOR: Record<string, string> = {
    lead_followup: C.blue, lead_outreach: C.cyan,
    market_scan: C.green, market_report: C.green,
    content_catalog: C.amber, content_post: C.amber,
    quote_generate: C.teal, inquiry_reply: C.blue,
    strategy: C.PL, competitor: C.orange,
    alert: C.red, general: C.t2,
  };
  const accentColor = TYPE_COLOR[plan.type] ?? C.PL;

  if (status === 'confirmed') {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
        style={{
          marginTop: 10,
          backgroundColor: C.green + '12',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.green + '35',
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.green + '25', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={14} color={C.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.green, fontSize: 12, fontWeight: '700' }}>已确认 · {plan.agentName} 执行中</Text>
          <Text style={{ color: C.t3, fontSize: 11, marginTop: 2 }}>{plan.title}</Text>
        </View>
        <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
          <View style={{ backgroundColor: C.green + '18', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={{ color: C.green, fontSize: 10, fontWeight: '600' }}>进度</Text>
            <ArrowRight size={10} color={C.green} />
          </View>
        </Pressable>
      </MotiView>
    );
  }

  if (status === 'dismissed') {
    return (
      <View style={{ marginTop: 8, backgroundColor: C.bgGlass, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ color: C.t3, fontSize: 11 }}>已跳过此方案</Text>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_GENTLE}
      style={{
        marginTop: 10,
        backgroundColor: accentColor + '0C',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isRevision ? accentColor + '50' : accentColor + '30',
        overflow: 'hidden',
      }}
    >
      {/* 顶部色条 */}
      <LinearGradient
        colors={[accentColor, accentColor + '00']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />

      <View style={{ padding: 14 }}>
        {/* 标签行 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <View style={{ backgroundColor: accentColor + '18', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Zap size={10} color={accentColor} />
            <Text style={{ color: accentColor, fontSize: 10, fontWeight: '700' }}>
              {isRevision ? '方案已修改 · 待确认' : '执行方案 · 待确认'}
            </Text>
          </View>
          {isRevision && (
            <View style={{ backgroundColor: C.amber + '18', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 }}>
              <Text style={{ color: C.amber, fontSize: 10, fontWeight: '600' }}>已更新</Text>
            </View>
          )}
        </View>

        {/* 任务标题 */}
        <Text style={{ color: C.t1, fontSize: 15, fontWeight: '700', marginBottom: 8 }}>{plan.title}</Text>

        {/* 执行动作 */}
        <View style={{ backgroundColor: C.bgGlass, borderRadius: 10, padding: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ArrowRight size={13} color={accentColor} />
          <Text style={{ color: C.t1, fontSize: 13, flex: 1, lineHeight: 18 }}>{plan.suggestedAction}</Text>
        </View>

        {/* 元数据行 */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgGlass, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: C.t3, fontSize: 10 }}>执行</Text>
            <Text style={{ color: C.t1, fontSize: 11, fontWeight: '600' }}>{plan.agentName}</Text>
          </View>
          {plan.channel && <ChannelChip channel={plan.channel} color={accentColor} />}
          {plan.estimatedValue && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.green + '12', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <TrendingUp size={10} color={C.green} />
              <Text style={{ color: C.green, fontSize: 11, fontWeight: '600' }}>{plan.estimatedValue}</Text>
            </View>
          )}
          {plan.estimatedTime && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.bgGlass, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Clock size={10} color={C.t3} />
              <Text style={{ color: C.t2, fontSize: 11 }}>{plan.estimatedTime}</Text>
            </View>
          )}
        </View>

        {/* AI 推理 */}
        <Text style={{ color: C.t3, fontSize: 11, lineHeight: 16, marginBottom: 12 }}>{plan.reasoning}</Text>

        {/* 渠道快捷修改（B 功能） */}
        <AnimatePresence>
          {showRevisionOptions && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'timing', duration: 200 }}
              style={{ marginBottom: 10, overflow: 'hidden' }}
            >
              <Text style={{ color: C.t2, fontSize: 11, marginBottom: 8 }}>切换沟通渠道：</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CHANNEL_OPTIONS.map(ch => (
                  <Pressable
                    key={ch}
                    onPress={() => {
                      hapticMedium();
                      setShowRevisionOptions(false);
                      onRequestRevision(`改成${ch}`);
                    }}
                  >
                    <View style={{
                      backgroundColor: plan.channel === ch ? accentColor + '25' : C.bgGlass,
                      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
                      borderWidth: 1,
                      borderColor: plan.channel === ch ? accentColor + '50' : C.border,
                    }}>
                      <Text style={{ color: plan.channel === ch ? accentColor : C.t1, fontSize: 12, fontWeight: '600' }}>{ch}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={onConfirm} style={{ flex: 2 }}>
            <LinearGradient
              colors={[accentColor, accentColor + 'BB']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Check size={14} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>确认执行</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => { hapticLight(); setShowRevisionOptions(v => !v); }}
            style={{ backgroundColor: C.bgGlass, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: showRevisionOptions ? accentColor + '50' : C.border }}
          >
            <Edit3 size={15} color={showRevisionOptions ? accentColor : C.t2} />
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={{ backgroundColor: C.bgGlass, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
          >
            <X size={15} color={C.t2} />
          </Pressable>
        </View>
      </View>
    </MotiView>
  );
}

// ─── 消息气泡 ─────────────────────────────────────────────────

function ChatMessage({
  message,
  onConfirmPlan,
  onDismissPlan,
  onRequestRevision,
}: {
  message: Message;
  onConfirmPlan: (msgId: string) => void;
  onDismissPlan: (msgId: string) => void;
  onRequestRevision: (msgId: string, hint: string) => void;
}) {
  const isUser = message.role === 'user';
  const { displayed } = useTypewriter(
    message.content,
    !isUser && !message.isTyping,
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING}
      style={{ marginBottom: 14, flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}
    >
      {/* Avatar */}
      <View style={{
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: isUser ? C.PL + '22' : C.green + '22',
        alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
        borderWidth: 1,
        borderColor: isUser ? C.PL + '35' : C.green + '35',
      }}>
        <Text style={{ fontSize: 14 }}>{isUser ? '👤' : '⚡'}</Text>
      </View>

      <View style={{ flex: 1, maxWidth: '87%' }}>
        {/* 气泡 */}
        {message.isTyping ? (
          <View style={{
            backgroundColor: C.bgCard, borderRadius: 16,
            paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: 1, borderColor: C.border,
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <ActivityIndicator size="small" color={C.PL} />
            <Text style={{ color: C.t2, fontSize: 13 }}>正在分析...</Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: isUser ? C.PL + '16' : C.bgCard,
            borderRadius: 16,
            paddingHorizontal: 14, paddingVertical: 10,
            borderWidth: 1,
            borderColor: isUser ? C.PL + '30' : C.border,
          }}>
            <Text style={{ color: C.t1, fontSize: 14, lineHeight: 21 }}>
              {isUser ? message.content : displayed}
            </Text>
          </View>
        )}

        {/* ActionCard */}
        {!isUser && message.plan && !message.isTyping && (
          <ActionCard
            plan={message.plan}
            status={message.planStatus ?? 'pending'}
            isRevision={message.isRevision}
            onConfirm={() => { hapticSuccess(); onConfirmPlan(message.id); }}
            onDismiss={() => { hapticWarning(); onDismissPlan(message.id); }}
            onRequestRevision={(hint) => onRequestRevision(message.id, hint)}
          />
        )}

        {/* 时间戳 */}
        {!message.isTyping && (
          <Text style={{ color: C.t3, fontSize: 10, marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
            {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </MotiView>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────

export default function CommanderChatScreen() {
  const { confirmDecision, state } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '早上好！我已扫描全球市场，发现 3 个新商机。沙特基建需求激增 15%，有 12 家采购商正在寻源。您想先了解哪个方向？',
      timestamp: new Date(Date.now() - 3600000),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const runningTaskCount = state.tasks.filter(t => t.status === 'running' || t.status === 'pending').length;

  const getHistory = useCallback(() =>
    messages
      .filter(m => !m.isTyping && m.id !== 'welcome')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content })),
    [messages]
  );

  // 获取最近一条待确认的 plan（用于修改场景的上下文）
  const getActivePlan = useCallback(() => {
    const pendingMsg = [...messages].reverse().find(m => m.plan && m.planStatus === 'pending');
    return pendingMsg?.plan;
  }, [messages]);

  const sendMessage = async (text: string, isRevisionHint = false) => {
    if (!text.trim() || isLoading) return;

    hapticLight();
    setInput('');
    setShowQuickActions(false);
    Keyboard.dismiss();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const thinkingId = `t-${Date.now()}`;
    const thinkingMsg: Message = {
      id: thinkingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMsg, thinkingMsg]);
    setIsLoading(true);

    try {
      const currentPlan = isRevisionHint ? getActivePlan() : undefined;
      const aiPlan = await callCommanderAI(text, getHistory(), currentPlan);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiPlan.reply,
        timestamp: new Date(),
        plan: aiPlan.hasPlan ? aiPlan.plan : undefined,
        planStatus: aiPlan.hasPlan ? 'pending' : undefined,
        isRevision: aiPlan.isRevision,
      };

      // 如果是修改指令，将上一条 pending ActionCard 标记为 dismissed
      if (aiPlan.isRevision) {
        setMessages(prev => {
          const updated = prev.map(m =>
            m.plan && m.planStatus === 'pending' ? { ...m, planStatus: 'dismissed' as const } : m
          );
          return [...updated.filter(m => m.id !== thinkingId), aiMsg];
        });
      } else {
        setMessages(prev => prev.map(m => m.id === thinkingId ? aiMsg : m));
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === thinkingId
          ? { ...m, isTyping: false, content: '抱歉，暂时无法处理，请稍后再试。' }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleConfirmPlan = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg?.plan) return;

    confirmDecision({
      id: msg.plan.id,
      title: msg.plan.title,
      type: msg.plan.type,
      suggestedAction: msg.plan.suggestedAction,
      estimatedValue: msg.plan.estimatedValue,
    });

    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, planStatus: 'confirmed' } : m
    ));

    const confirmMsg: Message = {
      id: `c-${Date.now()}`,
      role: 'assistant',
      content: `已将「${msg.plan.title}」分配给 ${msg.plan.agentName}，正在执行中。`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  const handleDismissPlan = (msgId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, planStatus: 'dismissed' } : m
    ));
    const dismissMsg: Message = {
      id: `d-${Date.now()}`,
      role: 'assistant',
      content: '已跳过。如需调整方案或有其他指令，随时告诉我。',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, dismissMsg]);
  };

  // B 功能：ActionCard 内触发修改
  const handleRequestRevision = (_msgId: string, hint: string) => {
    sendMessage(hint, true);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={{
          paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
          borderBottomWidth: 1, borderBottomColor: C.border,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{ color: C.t1, fontSize: 18, fontWeight: '700' }}>Commander AI</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <MotiView
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ loop: true, duration: 2000 }}
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }}
              />
              <Text style={{ color: C.t2, fontSize: 12 }}>在线 · Plan 模式</Text>
            </View>
          </View>

          {runningTaskCount > 0 && (
            <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
              <View style={{ backgroundColor: C.PL + '18', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MotiView
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ loop: true, duration: 1200 }}
                  style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.PL }}
                />
                <Text style={{ color: C.PL, fontSize: 11, fontWeight: '700' }}>{runningTaskCount} 执行中</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* 消息列表 */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onConfirmPlan={handleConfirmPlan}
              onDismissPlan={handleDismissPlan}
              onRequestRevision={handleRequestRevision}
            />
          ))}
        </ScrollView>

        {/* 快捷操作 */}
        <AnimatePresence>
          {showQuickActions && (
            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 14 }}
              transition={SPRING_GENTLE}
              style={{ paddingHorizontal: 20, paddingBottom: 10 }}
            >
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {QUICK_ACTIONS.map(action => (
                  <Pressable
                    key={action.label}
                    onPress={() => {
                      hapticLight();
                      setInput(action.action);
                      setShowQuickActions(false);
                    }}
                  >
                    <View style={{
                      backgroundColor: C.bgCard, borderRadius: 12,
                      paddingHorizontal: 12, paddingVertical: 8,
                      borderWidth: 1, borderColor: C.PL + '28',
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                    }}>
                      <Text style={{ fontSize: 13 }}>{action.icon}</Text>
                      <Text style={{ color: C.t1, fontSize: 12, fontWeight: '500' }}>{action.label}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* 输入区 */}
        <View style={{
          paddingHorizontal: 16, paddingBottom: 16, paddingTop: 10,
          borderTopWidth: 1, borderTopColor: C.border,
        }}>
          <View style={{
            flexDirection: 'row', alignItems: 'flex-end', gap: 8,
            backgroundColor: C.bgCard, borderRadius: 22,
            paddingHorizontal: 14, paddingVertical: 6,
            borderWidth: 1,
            borderColor: input.trim() ? C.PL + '45' : C.border,
          }}>
            <Pressable
              onPress={() => { hapticLight(); setShowQuickActions(v => !v); }}
              style={{ padding: 6, marginBottom: 2 }}
            >
              <Plus size={20} color={showQuickActions ? C.PL : C.t2} />
            </Pressable>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="指令 AI 指挥官..."
              placeholderTextColor={C.t3}
              style={{ flex: 1, color: C.t1, fontSize: 14, paddingVertical: 8, maxHeight: 100 }}
              multiline
              editable={!isLoading}
            />

            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
              style={{ marginBottom: 2 }}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: input.trim() && !isLoading ? C.PL : C.bgGlass,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {isLoading
                  ? <ActivityIndicator size="small" color={C.PL} />
                  : <Send size={16} color={input.trim() ? '#fff' : C.t3} />
                }
              </View>
            </Pressable>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}
