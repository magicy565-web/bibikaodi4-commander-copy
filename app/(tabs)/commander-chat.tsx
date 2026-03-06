/**
 * CommanderChat — AI 指挥官对话中心（Plan 模式 MVP 版）
 * 流程：用户输入 → AI 解析意图 → 生成 ActionCard（Plan）→ 老板确认 → 任务下发
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Plus, ArrowRight, Check, X, Zap, Clock, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { hapticLight, hapticSuccess, hapticWarning } from '@/constants/haptics';
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
}

const QUICK_ACTIONS = [
  { icon: '🔍', label: '扫描市场', action: '帮我扫描东南亚市场机会' },
  { icon: '👤', label: '跟进买家', action: '帮我跟进沙特买家 Ahmed' },
  { icon: '🎨', label: '优化图册', action: '帮我优化产品图册' },
  { icon: '📊', label: '生成报告', action: '生成本月销售分析报告' },
];

// ─── 打字机动效 Hook ──────────────────────────────────────────

function useTypewriter(text: string, enabled: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
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

// ─── ActionCard 组件（Plan 模式确认卡片）─────────────────────

function ActionCard({
  plan,
  status,
  onConfirm,
  onDismiss,
}: {
  plan: NonNullable<AIPlan['plan']>;
  status: 'pending' | 'confirmed' | 'dismissed';
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const TYPE_COLOR: Record<string, string> = {
    opportunity: C.green,
    lead:        C.blue,
    content:     C.amber,
    optimization: C.PL,
    alert:       C.red,
    general:     C.teal,
  };
  const accentColor = TYPE_COLOR[plan.type] ?? C.PL;

  if (status === 'confirmed') {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
        style={{
          marginTop: 10,
          backgroundColor: C.green + '15',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.green + '40',
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.green + '30', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={16} color={C.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.green, fontSize: 13, fontWeight: '700' }}>已确认执行</Text>
          <Text style={{ color: C.t2, fontSize: 12, marginTop: 2 }}>{plan.agentName} 正在执行任务</Text>
        </View>
        <Pressable onPress={() => { hapticLight(); router.push('/task-progress'); }}>
          <View style={{ backgroundColor: C.green + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: C.green, fontSize: 11, fontWeight: '600' }}>查看进度</Text>
            <ArrowRight size={12} color={C.green} />
          </View>
        </Pressable>
      </MotiView>
    );
  }

  if (status === 'dismissed') {
    return (
      <View style={{ marginTop: 10, backgroundColor: C.bgGlass, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ color: C.t3, fontSize: 12 }}>已跳过此方案</Text>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_GENTLE}
      style={{
        marginTop: 10,
        backgroundColor: accentColor + '0E',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: accentColor + '35',
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
        {/* Plan 标签 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <View style={{ backgroundColor: accentColor + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Zap size={10} color={accentColor} />
            <Text style={{ color: accentColor, fontSize: 10, fontWeight: '700' }}>执行方案 · 待确认</Text>
          </View>
        </View>

        {/* 任务标题 */}
        <Text style={{ color: C.t1, fontSize: 15, fontWeight: '700', marginBottom: 6 }}>{plan.title}</Text>

        {/* 执行动作 */}
        <View style={{ backgroundColor: C.bgGlass, borderRadius: 10, padding: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ArrowRight size={14} color={accentColor} />
          <Text style={{ color: C.t1, fontSize: 13, flex: 1 }}>{plan.suggestedAction}</Text>
        </View>

        {/* 元数据 */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgGlass, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: C.t3, fontSize: 10 }}>分配给</Text>
            <Text style={{ color: C.t1, fontSize: 11, fontWeight: '600' }}>{plan.agentName}</Text>
          </View>
          {plan.estimatedValue && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.green + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <TrendingUp size={10} color={C.green} />
              <Text style={{ color: C.green, fontSize: 11, fontWeight: '600' }}>{plan.estimatedValue}</Text>
            </View>
          )}
          {plan.estimatedTime && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgGlass, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Clock size={10} color={C.t3} />
              <Text style={{ color: C.t2, fontSize: 11 }}>{plan.estimatedTime}</Text>
            </View>
          )}
        </View>

        {/* AI 推理依据 */}
        <Text style={{ color: C.t3, fontSize: 11, lineHeight: 16, marginBottom: 12 }}>
          {plan.reasoning}
        </Text>

        {/* 操作按钮 */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={onConfirm}
            style={{ flex: 2 }}
          >
            <LinearGradient
              colors={[accentColor, accentColor + 'CC']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Check size={14} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>确认执行</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={{ flex: 1, backgroundColor: C.bgGlass, borderRadius: 12, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
          >
            <Text style={{ color: C.t2, fontWeight: '600', fontSize: 13 }}>暂不</Text>
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
}: {
  message: Message;
  onConfirmPlan: (msgId: string) => void;
  onDismissPlan: (msgId: string) => void;
}) {
  const isUser = message.role === 'user';
  const { displayed } = useTypewriter(
    message.content,
    !isUser && !message.isTyping && message.content.length > 0,
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING}
      style={{ marginBottom: 14, flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}
    >
      {/* Avatar */}
      <View style={{
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: isUser ? C.PL + '25' : C.green + '25',
        alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
        borderWidth: 1,
        borderColor: isUser ? C.PL + '40' : C.green + '40',
      }}>
        <Text style={{ fontSize: 15 }}>{isUser ? '👤' : '⚡'}</Text>
      </View>

      <View style={{ flex: 1, maxWidth: '86%' }}>
        {/* 气泡 */}
        {message.isTyping ? (
          <View style={{
            backgroundColor: C.bgCard,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: C.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <ActivityIndicator size="small" color={C.PL} />
            <Text style={{ color: C.t2, fontSize: 13 }}>正在分析...</Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: isUser ? C.PL + '18' : C.bgCard,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: isUser ? C.PL + '35' : C.border,
          }}>
            <Text style={{ color: C.t1, fontSize: 14, lineHeight: 21 }}>
              {isUser ? message.content : displayed}
            </Text>
          </View>
        )}

        {/* ActionCard（Plan 模式） */}
        {!isUser && message.plan && !message.isTyping && (
          <ActionCard
            plan={message.plan}
            status={message.planStatus ?? 'pending'}
            onConfirm={() => { hapticSuccess(); onConfirmPlan(message.id); }}
            onDismiss={() => { hapticWarning(); onDismissPlan(message.id); }}
          />
        )}

        {/* 时间戳 */}
        {!message.isTyping && (
          <Text style={{ color: C.t3, fontSize: 10, marginTop: 5, textAlign: isUser ? 'right' : 'left' }}>
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

  // 获取对话历史（用于 API 上下文）
  const getHistory = useCallback(() => {
    return messages
      .filter(m => !m.isTyping && m.id !== 'welcome')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    hapticLight();
    setInput('');
    setShowQuickActions(false);
    Keyboard.dismiss();

    // 添加用户消息
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // 添加 AI 思考中占位
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
      const aiPlan = await callCommanderAI(text, getHistory());

      // 替换思考占位为真实回复
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiPlan.reply,
        timestamp: new Date(),
        plan: aiPlan.hasPlan ? aiPlan.plan : undefined,
        planStatus: aiPlan.hasPlan ? 'pending' : undefined,
      };

      setMessages(prev => prev.map(m => m.id === thinkingId ? aiMsg : m));
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === thinkingId
          ? { ...m, isTyping: false, content: '抱歉，我暂时无法处理您的请求，请稍后再试。' }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPlan = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg?.plan) return;

    // 调用全局 store 下发任务
    confirmDecision({
      id: msg.plan.id,
      title: msg.plan.title,
      type: msg.plan.type,
      suggestedAction: msg.plan.suggestedAction,
      estimatedValue: msg.plan.estimatedValue,
    });

    // 更新 ActionCard 状态
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, planStatus: 'confirmed' } : m
    ));

    // 添加确认回复
    const confirmMsg: Message = {
      id: `c-${Date.now()}`,
      role: 'assistant',
      content: `好的！已将任务「${msg.plan.title}」分配给 ${msg.plan.agentName}，正在执行中。您可以随时查看进度。`,
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
      content: '好的，已跳过。如果您需要调整方案或有其他指令，随时告诉我。',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, dismissMsg]);
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
              <View style={{ backgroundColor: C.PL + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MotiView
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ loop: true, duration: 1200 }}
                  style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.PL }}
                />
                <Text style={{ color: C.PL, fontSize: 11, fontWeight: '700' }}>{runningTaskCount} 任务执行中</Text>
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
            />
          ))}
        </ScrollView>

        {/* 快捷操作 */}
        <AnimatePresence>
          {showQuickActions && (
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 16 }}
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
                      backgroundColor: C.bgCard,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: C.PL + '30',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <Text style={{ fontSize: 14 }}>{action.icon}</Text>
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
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: C.border,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
            backgroundColor: C.bgCard,
            borderRadius: 22,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: input.trim() ? C.PL + '50' : C.border,
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
              style={{
                flex: 1,
                color: C.t1,
                fontSize: 14,
                paddingVertical: 8,
                maxHeight: 100,
              }}
              multiline
              onSubmitEditing={handleSend}
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
