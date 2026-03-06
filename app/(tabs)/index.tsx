/**
 * Boss Warroom — 老板战报首页
 *
 * 演示故事：
 * 1. 今日 KPI 数据总览（询盘/回复/高意向）
 * 2. AI 工作日志（AI 今天帮你做了什么）
 * 3. 高意向询盘快览（需要老板关注的 Top 3）
 */
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

// ─── Color constants ──────────────────────────────────────────
const C = {
  bg: "#000000",
  surface: "rgba(255,255,255,0.06)",
  surface2: "rgba(255,255,255,0.10)",
  border: "rgba(255,255,255,0.11)",
  P: "#7C3AED",
  PL: "#A78BFA",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.52)",
  t3: "rgba(255,255,255,0.26)",
  green: "#10B981",
  amber: "#F59E0B",
  amberL: "#FCD34D",
  blue: "#60A5FA",
  red: "#F87171",
};

// ─── Types ────────────────────────────────────────────────────
interface AILogItem {
  id: string;
  time: string;
  action: string;
  buyer: string;
  company: string;
  country: string;
  flag: string;
  product: string;
  status: "sent" | "draft" | "pending";
  confidence: number;
}

interface TopInquiry {
  id: string;
  buyer: string;
  company: string;
  country: string;
  flag: string;
  product: string;
  value: string;
  confidence: number;
  urgency: "high" | "normal";
  receivedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────
const AI_LOGS: AILogItem[] = [
  {
    id: "l1",
    time: "08:42",
    action: "自动回复首次询盘",
    buyer: "Mohammed Al-Rashid",
    company: "Al-Rashid Trading Co.",
    country: "沙特阿拉伯",
    flag: "🇸🇦",
    product: "304不锈钢餐具套装",
    status: "sent",
    confidence: 94,
  },
  {
    id: "l2",
    time: "07:15",
    action: "生成报价草稿",
    buyer: "Klaus Weber",
    company: "Weber Industrietechnik GmbH",
    country: "德国",
    flag: "🇩🇪",
    product: "LED工矿灯 200W",
    status: "draft",
    confidence: 87,
  },
  {
    id: "l3",
    time: "06:30",
    action: "自动回复首次询盘",
    buyer: "Priya Sharma",
    company: "Sharma Exports Ltd.",
    country: "印度",
    flag: "🇮🇳",
    product: "不锈钢厨具套装",
    status: "sent",
    confidence: 91,
  },
  {
    id: "l4",
    time: "03:18",
    action: "识别高意向买家",
    buyer: "James O'Brien",
    company: "O'Brien Hardware Group",
    country: "澳大利亚",
    flag: "🇦🇺",
    product: "LED工矿灯系列",
    status: "pending",
    confidence: 96,
  },
  {
    id: "l5",
    time: "02:05",
    action: "自动回复首次询盘",
    buyer: "Ahmed Hassan",
    company: "Hassan International",
    country: "埃及",
    flag: "🇪🇬",
    product: "304不锈钢餐具",
    status: "sent",
    confidence: 82,
  },
];

const TOP_INQUIRIES: TopInquiry[] = [
  {
    id: "i1",
    buyer: "James O'Brien",
    company: "O'Brien Hardware Group",
    country: "澳大利亚",
    flag: "🇦🇺",
    product: "LED工矿灯系列 × 500套",
    value: "$48,000",
    confidence: 96,
    urgency: "high",
    receivedAt: "03:18",
  },
  {
    id: "i2",
    buyer: "Mohammed Al-Rashid",
    company: "Al-Rashid Trading Co.",
    country: "沙特阿拉伯",
    flag: "🇸🇦",
    product: "304不锈钢餐具套装 × 2000套",
    value: "$32,000",
    confidence: 94,
    urgency: "high",
    receivedAt: "08:42",
  },
  {
    id: "i3",
    buyer: "Klaus Weber",
    company: "Weber Industrietechnik",
    country: "德国",
    flag: "🇩🇪",
    product: "LED工矿灯 200W × 300套",
    value: "$21,600",
    confidence: 87,
    urgency: "normal",
    receivedAt: "07:15",
  },
];

// ─── Animated Counter ─────────────────────────────────────────
function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplayed(start);
      if (start >= value) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <Text style={[styles.kpiValue, { color }]}>{displayed}</Text>;
}

// ─── AI Log Item ──────────────────────────────────────────────
function AILogCard({ log }: { log: AILogItem }) {
  const statusConfig = {
    sent: { label: "已发送", color: C.green, icon: "checkmark.circle.fill" as const },
    draft: { label: "草稿待发", color: C.amber, icon: "doc.fill" as const },
    pending: { label: "待处理", color: C.blue, icon: "clock.fill" as const },
  };
  const cfg = statusConfig[log.status];

  return (
    <View style={styles.logCard}>
      <View style={styles.logTimeline}>
        <View style={[styles.logDot, { backgroundColor: cfg.color }]} />
        <View style={styles.logLine} />
      </View>
      <View style={styles.logContent}>
        <View style={styles.logHeader}>
          <Text style={styles.logTime}>{log.time}</Text>
          <View style={[styles.logStatusBadge, { backgroundColor: `${cfg.color}20` }]}>
            <Text style={[styles.logStatusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.logAction}>{log.action}</Text>
        <View style={styles.logBuyerRow}>
          <Text style={styles.logFlag}>{log.flag}</Text>
          <Text style={styles.logBuyer}>{log.buyer}</Text>
          <Text style={styles.logCompany}>· {log.company}</Text>
        </View>
        <Text style={styles.logProduct}>{log.product}</Text>
        <View style={styles.logConfidenceRow}>
          <Text style={styles.logConfidenceLabel}>AI 置信度</Text>
          <View style={styles.logConfidenceBar}>
            <View style={[styles.logConfidenceFill, { width: `${log.confidence}%` as any, backgroundColor: log.confidence >= 90 ? C.green : C.amber }]} />
          </View>
          <Text style={[styles.logConfidenceValue, { color: log.confidence >= 90 ? C.green : C.amber }]}>
            {log.confidence}%
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Top Inquiry Card ─────────────────────────────────────────
function TopInquiryCard({ inquiry, rank }: { inquiry: TopInquiry; rank: number }) {
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/inquiries" as any);
      }}
      style={({ pressed }) => [styles.topInquiryCard, pressed && { opacity: 0.85 }, inquiry.urgency === "high" && styles.topInquiryUrgent]}
    >
      <View style={styles.topInquiryRank}>
        <Text style={[styles.rankText, { color: rankColors[rank] }]}>#{rank + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.topInquiryHeader}>
          <Text style={styles.topInquiryFlag}>{inquiry.flag}</Text>
          <Text style={styles.topInquiryBuyer}>{inquiry.buyer}</Text>
          {inquiry.urgency === "high" && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>高意向</Text>
            </View>
          )}
        </View>
        <Text style={styles.topInquiryProduct} numberOfLines={1}>{inquiry.product}</Text>
        <View style={styles.topInquiryFooter}>
          <Text style={styles.topInquiryValue}>{inquiry.value}</Text>
          <Text style={styles.topInquiryTime}>{inquiry.receivedAt} 到达</Text>
        </View>
      </View>
      <View style={styles.topInquiryScore}>
        <Text style={[styles.scoreValue, { color: inquiry.confidence >= 90 ? C.green : C.amber }]}>
          {inquiry.confidence}
        </Text>
        <Text style={styles.scoreLabel}>分</Text>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function WarroomScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("早上好");
    else if (hour < 18) setGreeting("下午好");
    else setGreeting("晚上好");
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const todayStats = {
    newInquiries: 12,
    aiReplied: 8,
    highIntent: 3,
    pendingValue: "$101,600",
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.PL}
            colors={[C.P]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}，王总 👋</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.notifBtn}
          >
            <IconSymbol name="bell.badge.fill" size={22} color={C.amber} />
          </Pressable>
        </View>

        {/* AI Status Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiStatusDot} />
          <Text style={styles.aiBannerText}>
            AI 助理 Commy 今日已自动处理 <Text style={{ color: C.green, fontWeight: "700" }}>8</Text> 条询盘
          </Text>
          <IconSymbol name="chevron.right" size={14} color={C.t3} />
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, styles.kpiCardLarge]}>
            <Text style={styles.kpiLabel}>今日新询盘</Text>
            <AnimatedNumber value={todayStats.newInquiries} color={C.PL} />
            <Text style={styles.kpiChange}>↑ 3 较昨日</Text>
          </View>
          <View style={styles.kpiCardRight}>
            <View style={[styles.kpiCard, styles.kpiCardSmall]}>
              <Text style={styles.kpiLabel}>AI 已回复</Text>
              <AnimatedNumber value={todayStats.aiReplied} color={C.green} />
            </View>
            <View style={[styles.kpiCard, styles.kpiCardSmall, styles.kpiCardUrgent]}>
              <Text style={styles.kpiLabel}>高意向</Text>
              <AnimatedNumber value={todayStats.highIntent} color={C.amber} />
            </View>
          </View>
        </View>

        {/* Pending Value */}
        <View style={styles.valueCard}>
          <View style={styles.valueCardLeft}>
            <Text style={styles.valueLabel}>待跟进询盘总价值</Text>
            <Text style={styles.valueAmount}>{todayStats.pendingValue}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/inquiries" as any)}
            style={({ pressed }) => [styles.valueBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.valueBtnText}>查看全部</Text>
            <IconSymbol name="chevron.right" size={14} color={C.PL} />
          </Pressable>
        </View>

        {/* Top Inquiries */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 高意向询盘 Top 3</Text>
          <Text style={styles.sectionSubtitle}>需要你今天跟进</Text>
        </View>
        {TOP_INQUIRIES.map((inq, i) => (
          <TopInquiryCard key={inq.id} inquiry={inq} rank={i} />
        ))}

        {/* AI Work Log */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>⚡ AI 今日工作日志</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>实时</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Commy 正在 24 小时为你工作</Text>
        </View>

        {AI_LOGS.map((log) => (
          <AILogCard key={log.id} log={log} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingTop: 8,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: C.t1 },
  headerSubtitle: { fontSize: 13, color: C.t3, marginTop: 3 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  aiBannerText: { flex: 1, fontSize: 13, color: C.t2 },
  kpiGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  kpiCardLarge: { flex: 1.2 },
  kpiCardRight: { flex: 1, gap: 10 },
  kpiCardSmall: { flex: 1 },
  kpiCardUrgent: {
    borderColor: "rgba(245,158,11,0.3)",
    backgroundColor: "rgba(245,158,11,0.06)",
  },
  kpiLabel: { fontSize: 11, color: C.t3, fontWeight: "500", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  kpiValue: { fontSize: 38, fontWeight: "900", lineHeight: 44 },
  kpiChange: { fontSize: 11, color: C.green, marginTop: 4 },
  valueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    padding: 16,
    marginBottom: 20,
  },
  valueCardLeft: { flex: 1 },
  valueLabel: { fontSize: 12, color: C.t3, marginBottom: 4 },
  valueAmount: { fontSize: 28, fontWeight: "900", color: C.PL },
  valueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(124,58,237,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  valueBtnText: { fontSize: 12, color: C.PL, fontWeight: "600" },
  sectionHeader: { marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.t1 },
  sectionSubtitle: { fontSize: 12, color: C.t3, marginTop: 2 },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveText: { fontSize: 10, color: C.green, fontWeight: "600" },
  topInquiryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  topInquiryUrgent: {
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.05)",
  },
  topInquiryRank: {
    width: 28,
    alignItems: "center",
  },
  rankText: { fontSize: 14, fontWeight: "800" },
  topInquiryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  topInquiryFlag: { fontSize: 16 },
  topInquiryBuyer: { fontSize: 14, fontWeight: "700", color: C.t1 },
  urgentBadge: {
    backgroundColor: "rgba(245,158,11,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  urgentText: { fontSize: 10, color: C.amber, fontWeight: "700" },
  topInquiryProduct: { fontSize: 12, color: C.t2, marginBottom: 6 },
  topInquiryFooter: { flexDirection: "row", alignItems: "center", gap: 10 },
  topInquiryValue: { fontSize: 15, fontWeight: "800", color: C.green },
  topInquiryTime: { fontSize: 11, color: C.t3 },
  topInquiryScore: { alignItems: "center" },
  scoreValue: { fontSize: 22, fontWeight: "900" },
  scoreLabel: { fontSize: 9, color: C.t3 },
  logCard: {
    flexDirection: "row",
    marginBottom: 4,
  },
  logTimeline: {
    width: 24,
    alignItems: "center",
    paddingTop: 4,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  logLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: C.border,
  },
  logContent: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginLeft: 8,
    marginBottom: 10,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  logTime: { fontSize: 12, color: C.t3, fontWeight: "500" },
  logStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logStatusText: { fontSize: 11, fontWeight: "600" },
  logAction: { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 6 },
  logBuyerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  logFlag: { fontSize: 14 },
  logBuyer: { fontSize: 13, fontWeight: "600", color: C.t1 },
  logCompany: { fontSize: 12, color: C.t2 },
  logProduct: { fontSize: 12, color: C.t3, marginBottom: 8 },
  logConfidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logConfidenceLabel: { fontSize: 10, color: C.t3, width: 60 },
  logConfidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  logConfidenceFill: {
    height: "100%",
    borderRadius: 2,
  },
  logConfidenceValue: { fontSize: 12, fontWeight: "700", width: 36, textAlign: "right" },
});
