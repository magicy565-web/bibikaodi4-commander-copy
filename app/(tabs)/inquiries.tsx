/**
 * Inquiries — 询盘管理
 *
 * 演示故事：
 * 1. 查看所有询盘（AI 已分类：高意向/中等/待验证）
 * 2. 点击询盘查看 AI 生成的回复草稿
 * 3. 一键审批发送 / 修改后发送
 */
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
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
  blue: "#60A5FA",
  red: "#F87171",
};

// ─── Types ────────────────────────────────────────────────────
type InquiryStatus = "new" | "ai_replied" | "draft_ready" | "replied" | "negotiating" | "won" | "lost" | "pending";
type IntentLevel = "high" | "medium" | "low";

interface Inquiry {
  id: string;
  buyer: string;
  company: string;
  country: string;
  flag: string;
  product: string;
  quantity: string;
  estimatedValue: string;
  status: InquiryStatus;
  intentLevel: IntentLevel;
  confidence: number;
  receivedAt: string;
  message: string;
  aiDraft?: string;
  aiAnalysis?: string;
}

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "i1",
    buyer: "James O'Brien",
    company: "O'Brien Hardware Group",
    country: "澳大利亚",
    flag: "🇦🇺",
    product: "LED工矿灯系列",
    quantity: "500套",
    estimatedValue: "$48,000",
    status: "draft_ready",
    intentLevel: "high",
    confidence: 96,
    receivedAt: "今天 03:18",
    message: "Hi, we are a major hardware distributor in Australia. We are interested in your LED industrial lights for our warehouse clients. Please provide your best price for 500 units of 200W LED high bay lights with CE certification. We need delivery within 30 days.",
    aiDraft: `Dear Mr. O'Brien,

Thank you for your inquiry about our LED Industrial High Bay Lights. We are delighted to offer you our best pricing for your warehouse clients.

**Product: LED High Bay Light 200W (CE Certified)**
- Unit Price: USD 88/pc (500 units)
- Total: USD 44,000
- Lead Time: 15 working days
- MOQ: 100 units
- Warranty: 5 years

**Key Advantages:**
✓ CE & RoHS Certified (EU standard)
✓ IP65 Waterproof Rating
✓ 130lm/W High Efficiency
✓ 5-year warranty (industry longest)

We can arrange a sample shipment within 3 days for your evaluation. Our factory has supplied to 50+ Australian distributors.

Looking forward to your positive response.

Best regards,
Sarah Chen
RealSourcing Export Manager`,
    aiAnalysis: "买家来自澳大利亚主要五金经销商，询盘具体（500套+CE认证+30天交期），意向极高。建议重点强调5年质保和CE认证，提供样品以加速决策。",
  },
  {
    id: "i2",
    buyer: "Mohammed Al-Rashid",
    company: "Al-Rashid Trading Co.",
    country: "沙特阿拉伯",
    flag: "🇸🇦",
    product: "304不锈钢餐具套装",
    quantity: "2000套",
    estimatedValue: "$32,000",
    status: "ai_replied",
    intentLevel: "high",
    confidence: 94,
    receivedAt: "今天 08:42",
    message: "We need 304 stainless steel cutlery sets for our restaurant chain. 2000 sets. Must have SASO certification. What is your best price and delivery time?",
    aiDraft: `Dear Mr. Al-Rashid,

Thank you for your inquiry. We are pleased to offer our 304 Stainless Steel Cutlery Sets with SASO certification.

**Product Specifications:**
- Material: 304 Food-Grade Stainless Steel
- Certification: SASO (Saudi Standards)
- Set includes: 5 pieces (knife, fork, spoon, dessert spoon, teaspoon)

**Pricing for 2000 sets:**
- Unit Price: USD 14.5/set
- Total: USD 29,000
- Lead Time: 15 days
- Packaging: Individual box + master carton

We have been supplying to Saudi restaurant chains for 8 years and have full SASO documentation ready.

Best regards,
RealSourcing Team`,
    aiAnalysis: "餐饮连锁采购，需要SASO认证，AI已自动回复。建议跟进询问具体餐厅数量和长期合作可能性。",
  },
  {
    id: "i3",
    buyer: "Klaus Weber",
    company: "Weber Industrietechnik GmbH",
    country: "德国",
    flag: "🇩🇪",
    product: "LED工矿灯 200W",
    quantity: "300套",
    estimatedValue: "$21,600",
    status: "draft_ready",
    intentLevel: "medium",
    confidence: 87,
    receivedAt: "今天 07:15",
    message: "Guten Tag, we are looking for LED industrial lights for our factory renovation project. 300 units of 200W. Need CE certification and 5-year warranty. Please quote.",
    aiDraft: `Dear Mr. Weber,

Guten Tag! Thank you for reaching out about your factory renovation project.

We are pleased to offer our LED High Bay Lights 200W:

**Angebot / Quotation:**
- Produkt: LED High Bay Light 200W
- Menge / Quantity: 300 units
- Preis / Price: EUR 82/unit (total EUR 24,600)
- Lieferzeit / Lead Time: 18 days
- Garantie / Warranty: 5 Jahre / 5 years
- Zertifikate / Certifications: CE, RoHS, TÜV

We have supplied to 200+ German manufacturers. References available upon request.

Mit freundlichen Grüßen,
RealSourcing Export Team`,
    aiAnalysis: "德国工厂翻新项目，明确需求（CE认证+5年质保），中等意向。AI草稿已用德语开头，符合德国商务礼仪。",
  },
  {
    id: "i4",
    buyer: "Priya Sharma",
    company: "Sharma Exports Ltd.",
    country: "印度",
    flag: "🇮🇳",
    product: "不锈钢厨具套装",
    quantity: "5000套",
    estimatedValue: "$35,000",
    status: "ai_replied",
    intentLevel: "medium",
    confidence: 78,
    receivedAt: "今天 06:30",
    message: "We need stainless steel kitchen utensil sets for export to Middle East. 5000 sets. Please send catalog and price list.",
    aiAnalysis: "印度出口商，转口中东，数量大但意向一般（只要目录和价格表）。AI已自动回复发送目录。",
  },
  {
    id: "i5",
    buyer: "Ahmed Hassan",
    company: "Hassan International",
    country: "埃及",
    flag: "🇪🇬",
    product: "304不锈钢餐具",
    quantity: "1000套",
    estimatedValue: "$12,000",
    status: "ai_replied",
    intentLevel: "low",
    confidence: 62,
    receivedAt: "今天 02:05",
    message: "Hello, what is the price for stainless steel cutlery? Need 1000 sets.",
    aiAnalysis: "询盘信息简短，无具体规格要求，意向较低。AI已发送标准报价单。",
  },
];

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<InquiryStatus, { label: string; color: string; bg: string }> = {
  new: { label: "新询盘", color: C.blue, bg: "rgba(96,165,250,0.15)" },
  ai_replied: { label: "AI已回复", color: C.green, bg: "rgba(16,185,129,0.15)" },
  draft_ready: { label: "草稿待发", color: C.amber, bg: "rgba(245,158,11,0.15)" },
  replied: { label: "已回复", color: C.t2, bg: "rgba(255,255,255,0.08)" },
  negotiating: { label: "洽谈中", color: C.PL, bg: "rgba(124,58,237,0.15)" },
  won: { label: "已成交", color: C.green, bg: "rgba(16,185,129,0.15)" },
  lost: { label: "已流失", color: C.red, bg: "rgba(248,113,113,0.15)" },
  pending: { label: "待处理", color: C.t3, bg: "rgba(255,255,255,0.06)" },
};

const INTENT_CONFIG: Record<IntentLevel, { label: string; color: string }> = {
  high: { label: "高意向", color: C.amber },
  medium: { label: "中等", color: C.blue },
  low: { label: "待验证", color: C.t3 },
};

// ─── Inquiry Detail Modal ─────────────────────────────────────
function InquiryDetailModal({
  inquiry,
  visible,
  onClose,
  onSend,
}: {
  inquiry: Inquiry | null;
  visible: boolean;
  onClose: () => void;
  onSend: (id: string) => void;
}) {
  const [draftText, setDraftText] = useState(inquiry?.aiDraft ?? "");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"draft" | "original" | "analysis">("draft");

  if (!inquiry) return null;

  const handleSend = async () => {
    setSending(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    onSend(inquiry.id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modalStyles.container}>
        {/* Header */}
        <View style={modalStyles.header}>
          <View style={{ flex: 1 }}>
            <Text style={modalStyles.headerBuyer}>
              {inquiry.flag} {inquiry.buyer}
            </Text>
            <Text style={modalStyles.headerCompany}>{inquiry.company}</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [modalStyles.closeBtn, pressed && { opacity: 0.7 }]}
          >
            <IconSymbol name="xmark" size={18} color={C.t2} />
          </Pressable>
        </View>

        {/* Product & Value */}
        <View style={modalStyles.productRow}>
          <View style={{ flex: 1 }}>
            <Text style={modalStyles.productName}>{inquiry.product}</Text>
            <Text style={modalStyles.productQty}>{inquiry.quantity}</Text>
          </View>
          <Text style={modalStyles.productValue}>{inquiry.estimatedValue}</Text>
        </View>

        {/* Tab Selector */}
        <View style={modalStyles.tabRow}>
          {[
            { key: "draft", label: "AI 草稿" },
            { key: "original", label: "原始询盘" },
            { key: "analysis", label: "AI 分析" },
          ].map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key as any)}
              style={[modalStyles.tab, tab === t.key && modalStyles.tabActive]}
            >
              <Text style={[modalStyles.tabText, tab === t.key && modalStyles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
          {tab === "draft" && (
            <TextInput
              style={modalStyles.draftInput}
              multiline
              value={draftText}
              onChangeText={setDraftText}
              placeholderTextColor={C.t3}
              textAlignVertical="top"
            />
          )}
          {tab === "original" && (
            <View style={modalStyles.originalBox}>
              <Text style={modalStyles.originalText}>{inquiry.message}</Text>
            </View>
          )}
          {tab === "analysis" && (
            <View style={modalStyles.analysisBox}>
              <View style={modalStyles.analysisHeader}>
                <Text style={{ fontSize: 20 }}>🧠</Text>
                <Text style={modalStyles.analysisTitle}>AI 买家分析</Text>
              </View>
              <Text style={modalStyles.analysisText}>{inquiry.aiAnalysis}</Text>
              <View style={modalStyles.confidenceRow}>
                <Text style={modalStyles.confidenceLabel}>意向置信度</Text>
                <View style={modalStyles.confidenceBar}>
                  <View
                    style={[
                      modalStyles.confidenceFill,
                      {
                        width: `${inquiry.confidence}%` as any,
                        backgroundColor: inquiry.confidence >= 90 ? C.green : inquiry.confidence >= 75 ? C.amber : C.blue,
                      },
                    ]}
                  />
                </View>
                <Text style={[modalStyles.confidenceValue, { color: inquiry.confidence >= 90 ? C.green : C.amber }]}>
                  {inquiry.confidence}%
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        {inquiry.aiDraft && (
          <View style={modalStyles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [modalStyles.btnSecondary, pressed && { opacity: 0.7 }]}
            >
              <Text style={modalStyles.btnSecondaryText}>稍后处理</Text>
            </Pressable>
            <Pressable
              onPress={handleSend}
              disabled={sending}
              style={({ pressed }) => [modalStyles.btnPrimary, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <IconSymbol name="paperplane.fill" size={16} color="#fff" />
              <Text style={modalStyles.btnPrimaryText}>{sending ? "发送中..." : "一键发送"}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Inquiry Card ─────────────────────────────────────────────
function InquiryCard({ inquiry, onPress }: { inquiry: Inquiry; onPress: () => void }) {
  const statusCfg = STATUS_CONFIG[inquiry.status];
  const intentCfg = INTENT_CONFIG[inquiry.intentLevel];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85 },
        inquiry.intentLevel === "high" && styles.cardUrgent,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardFlag}>{inquiry.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardBuyer}>{inquiry.buyer}</Text>
          <Text style={styles.cardCompany} numberOfLines={1}>{inquiry.company}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      <Text style={styles.cardProduct} numberOfLines={1}>{inquiry.product} · {inquiry.quantity}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardValue}>{inquiry.estimatedValue}</Text>
        <View style={[styles.intentBadge, { backgroundColor: `${intentCfg.color}15` }]}>
          <Text style={[styles.intentText, { color: intentCfg.color }]}>{intentCfg.label}</Text>
        </View>
        <Text style={styles.cardTime}>{inquiry.receivedAt}</Text>
      </View>

      {inquiry.status === "draft_ready" && (
        <View style={styles.draftHint}>
          <IconSymbol name="sparkles" size={12} color={C.PL} />
          <Text style={styles.draftHintText}>AI 草稿已就绪，点击审核发送</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function InquiriesScreen() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(MOCK_INQUIRIES);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "high" | "draft">("all");

  const filtered = inquiries.filter((i) => {
    if (filterTab === "high") return i.intentLevel === "high";
    if (filterTab === "draft") return i.status === "draft_ready";
    return true;
  });

  const stats = {
    total: inquiries.length,
    high: inquiries.filter((i) => i.intentLevel === "high").length,
    draftReady: inquiries.filter((i) => i.status === "draft_ready").length,
  };

  const handleSend = (id: string) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "replied" as InquiryStatus } : i))
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>询盘管理</Text>
            <Text style={styles.headerSubtitle}>AI 驱动 · 自动分级</Text>
          </View>
          <View style={styles.statsChip}>
            <Text style={styles.statsChipText}>
              <Text style={{ color: C.amber, fontWeight: "700" }}>{stats.draftReady}</Text> 待发送
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: "全部询盘", value: stats.total, color: C.PL },
            { label: "高意向", value: stats.high, color: C.amber },
            { label: "草稿待发", value: stats.draftReady, color: C.green },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabRow}>
          {[
            { key: "all", label: "全部" },
            { key: "high", label: "🔥 高意向" },
            { key: "draft", label: "⚡ 待发送" },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setFilterTab(tab.key as any)}
              style={[styles.tab, filterTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, filterTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Inquiry List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InquiryCard
              inquiry={item}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedInquiry(item);
                setModalVisible(true);
              }}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </View>

      <InquiryDetailModal
        inquiry={selectedInquiry}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSend={handleSend}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.t1 },
  headerSubtitle: { fontSize: 13, color: C.t3, marginTop: 2 },
  statsChip: {
    backgroundColor: "rgba(245,158,11,0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statsChipText: { fontSize: 13, color: C.t2 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "900", marginBottom: 2 },
  statLabel: { fontSize: 10, color: C.t3, fontWeight: "500" },
  tabRow: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  tabActive: { backgroundColor: C.P },
  tabText: { fontSize: 12, color: C.t2, fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  cardUrgent: {
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.04)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  cardFlag: { fontSize: 22 },
  cardBuyer: { fontSize: 14, fontWeight: "700", color: C.t1 },
  cardCompany: { fontSize: 11, color: C.t3 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardProduct: { fontSize: 13, color: C.t2, marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardValue: { fontSize: 15, fontWeight: "800", color: C.green, flex: 1 },
  intentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  intentText: { fontSize: 11, fontWeight: "600" },
  cardTime: { fontSize: 11, color: C.t3 },
  draftHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(124,58,237,0.2)",
  },
  draftHintText: { fontSize: 12, color: C.PL },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBuyer: { fontSize: 18, fontWeight: "700", color: C.t1 },
  headerCompany: { fontSize: 13, color: C.t3, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  productName: { fontSize: 15, fontWeight: "700", color: C.t1 },
  productQty: { fontSize: 12, color: C.t3, marginTop: 2 },
  productValue: { fontSize: 22, fontWeight: "900", color: C.green },
  tabRow: {
    flexDirection: "row",
    backgroundColor: C.surface,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  tabActive: { backgroundColor: C.P },
  tabText: { fontSize: 12, color: C.t2, fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  body: { flex: 1, paddingHorizontal: 16 },
  draftInput: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    fontSize: 14,
    color: C.t1,
    lineHeight: 22,
    minHeight: 300,
  },
  originalBox: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  originalText: { fontSize: 14, color: C.t2, lineHeight: 22 },
  analysisBox: {
    backgroundColor: "rgba(124,58,237,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.2)",
    padding: 16,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  analysisTitle: { fontSize: 15, fontWeight: "700", color: C.PL },
  analysisText: { fontSize: 14, color: C.t1, lineHeight: 22, marginBottom: 16 },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  confidenceLabel: { fontSize: 12, color: C.t3, width: 60 },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceFill: { height: "100%", borderRadius: 3 },
  confidenceValue: { fontSize: 14, fontWeight: "700", width: 40, textAlign: "right" },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: 15, color: C.t2, fontWeight: "600" },
  btnPrimary: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.P,
    shadowColor: C.P,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPrimaryText: { fontSize: 15, color: "#fff", fontWeight: "700" },
});
