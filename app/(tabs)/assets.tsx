/**
 * AssetVault — 工厂数据智能托管中枢
 *
 * 演示故事：
 * 1. 老板上传工厂产品手册 / 报价单
 * 2. AI 自动解构 → 生成产品知识节点
 * 3. 知识节点激活后可用于自动获客
 */
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

// ─── Types ────────────────────────────────────────────────────
type AssetStatus = "uploading" | "processing" | "active" | "error";
type AssetType = "pdf" | "excel" | "image" | "other";

interface KnowledgeTag {
  label: string;
  category: "material" | "application" | "market" | "advantage" | "buyer";
}

interface ProductNeuron {
  id: string;
  name: string;
  category: string;
  summary: string;
  tags: KnowledgeTag[];
  targetMarkets: string[];
  competitiveEdge: string;
  buyerPersona: string;
  matchScore: number;
}

interface AssetFile {
  id: string;
  name: string;
  type: AssetType;
  size: string;
  status: AssetStatus;
  progress: number;
  uploadedAt: string;
  neuron?: ProductNeuron;
}

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_ASSETS: AssetFile[] = [
  {
    id: "a1",
    name: "304不锈钢餐具套装-产品手册.pdf",
    type: "pdf",
    size: "2.4 MB",
    status: "active",
    progress: 100,
    uploadedAt: "2026-03-05",
    neuron: {
      id: "n1",
      name: "304不锈钢餐具套装",
      category: "厨房用品",
      summary: "食品级304不锈钢，适用于中东高盐雾环境，耐腐蚀性能卓越，符合沙特SASO认证标准。",
      tags: [
        { label: "304不锈钢", category: "material" },
        { label: "食品级安全", category: "application" },
        { label: "耐腐蚀", category: "advantage" },
        { label: "中东市场", category: "market" },
        { label: "餐饮采购商", category: "buyer" },
      ],
      targetMarkets: ["沙特阿拉伯", "阿联酋", "科威特"],
      competitiveEdge: "通过SASO认证，同类产品中认证最全，交期最短（15天）",
      buyerPersona: "中东餐饮连锁采购总监，年采购额 $50万+",
      matchScore: 92,
    },
  },
  {
    id: "a2",
    name: "LED工矿灯报价单2026.xlsx",
    type: "excel",
    size: "1.1 MB",
    status: "active",
    progress: 100,
    uploadedAt: "2026-03-04",
    neuron: {
      id: "n2",
      name: "LED工矿灯系列",
      category: "工业照明",
      summary: "100W-500W工矿灯，IP65防护等级，适用于工厂/仓库/矿山，CE/RoHS认证，5年质保。",
      tags: [
        { label: "IP65防水", category: "advantage" },
        { label: "CE认证", category: "application" },
        { label: "工业照明", category: "application" },
        { label: "欧洲市场", category: "market" },
        { label: "工厂采购", category: "buyer" },
      ],
      targetMarkets: ["德国", "法国", "波兰", "捷克"],
      competitiveEdge: "5年质保行业最长，CE/RoHS双认证，OEM定制最快7天",
      buyerPersona: "欧洲工业设备经销商，年采购额 €30万+",
      matchScore: 88,
    },
  },
  {
    id: "a3",
    name: "工厂能力介绍-英文版.pdf",
    type: "pdf",
    size: "5.8 MB",
    status: "processing",
    progress: 65,
    uploadedAt: "2026-03-06",
  },
];

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
  teal: "#2DD4BF",
};

// ─── Tag category colors ──────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  material: C.blue,
  application: C.green,
  advantage: C.teal,
  market: C.amber,
  buyer: C.PL,
};

// ─── Sub-components ───────────────────────────────────────────
function StatusBadge({ status }: { status: AssetStatus }) {
  const configs = {
    active: { label: "已激活", color: C.green, bg: "rgba(16,185,129,0.15)" },
    processing: { label: "解构中", color: C.amber, bg: "rgba(245,158,11,0.15)" },
    uploading: { label: "上传中", color: C.blue, bg: "rgba(96,165,250,0.15)" },
    error: { label: "失败", color: C.red, bg: "rgba(248,113,113,0.15)" },
  };
  const cfg = configs[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      {status === "processing" && (
        <ActivityIndicator size={8} color={cfg.color} style={{ marginRight: 4 }} />
      )}
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function FileTypeIcon({ type }: { type: AssetType }) {
  const configs = {
    pdf: { icon: "doc.text.fill" as const, color: "#F87171", bg: "rgba(248,113,113,0.15)" },
    excel: { icon: "chart.bar.fill" as const, color: "#10B981", bg: "rgba(16,185,129,0.15)" },
    image: { icon: "photo.fill" as const, color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
    other: { icon: "doc.fill" as const, color: C.t2, bg: "rgba(255,255,255,0.08)" },
  };
  const cfg = configs[type];
  return (
    <View style={[styles.fileIcon, { backgroundColor: cfg.bg }]}>
      <IconSymbol name={cfg.icon} size={20} color={cfg.color} />
    </View>
  );
}

function NeuronCard({ neuron }: { neuron: ProductNeuron }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.neuronCard}>
      <Pressable
        onPress={() => {
          setExpanded(!expanded);
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
        <View style={styles.neuronHeader}>
          <View style={styles.neuronTitleRow}>
            <View style={styles.neuronIconBg}>
              <Text style={styles.neuronIconText}>🧠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.neuronName}>{neuron.name}</Text>
              <Text style={styles.neuronCategory}>{neuron.category}</Text>
            </View>
            <View style={styles.matchScoreBadge}>
              <Text style={styles.matchScoreText}>{neuron.matchScore}</Text>
              <Text style={styles.matchScoreLabel}>分</Text>
            </View>
          </View>
          <Text style={styles.neuronSummary} numberOfLines={expanded ? undefined : 2}>
            {neuron.summary}
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {neuron.tags.slice(0, expanded ? undefined : 3).map((tag, i) => (
            <View
              key={i}
              style={[styles.tag, { backgroundColor: `${TAG_COLORS[tag.category]}20`, borderColor: `${TAG_COLORS[tag.category]}40` }]}
            >
              <Text style={[styles.tagText, { color: TAG_COLORS[tag.category] }]}>{tag.label}</Text>
            </View>
          ))}
          {!expanded && neuron.tags.length > 3 && (
            <View style={styles.tagMore}>
              <Text style={styles.tagMoreText}>+{neuron.tags.length - 3}</Text>
            </View>
          )}
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.neuronExpanded}>
          <View style={styles.neuronDetailRow}>
            <Text style={styles.neuronDetailLabel}>目标市场</Text>
            <Text style={styles.neuronDetailValue}>{neuron.targetMarkets.join(" · ")}</Text>
          </View>
          <View style={styles.neuronDetailRow}>
            <Text style={styles.neuronDetailLabel}>竞争优势</Text>
            <Text style={styles.neuronDetailValue}>{neuron.competitiveEdge}</Text>
          </View>
          <View style={styles.neuronDetailRow}>
            <Text style={styles.neuronDetailLabel}>买家画像</Text>
            <Text style={styles.neuronDetailValue}>{neuron.buyerPersona}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function AssetCard({ asset, onPress }: { asset: AssetFile; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.assetCard, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.assetCardHeader}>
        <FileTypeIcon type={asset.type} />
        <View style={styles.assetInfo}>
          <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
          <Text style={styles.assetMeta}>{asset.size} · {asset.uploadedAt}</Text>
        </View>
        <StatusBadge status={asset.status} />
      </View>

      {asset.status === "processing" && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${asset.progress}%` as any }]} />
        </View>
      )}

      {asset.neuron && <NeuronCard neuron={asset.neuron} />}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function AssetsScreen() {
  const [assets, setAssets] = useState<AssetFile[]>(MOCK_ASSETS);
  const [uploading, setUploading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "processing">("all");

  const filteredAssets = assets.filter((a) => {
    if (selectedTab === "all") return true;
    return a.status === selectedTab;
  });

  const stats = {
    total: assets.length,
    active: assets.filter((a) => a.status === "active").length,
    processing: assets.filter((a) => a.status === "processing").length,
  };

  const handleUpload = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate upload for demo
    const newAsset: AssetFile = {
      id: `a${Date.now()}`,
      name: "新产品目录-2026Q1.pdf",
      type: "pdf",
      size: "3.2 MB",
      status: "uploading",
      progress: 0,
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    setAssets((prev) => [newAsset, ...prev]);
    setUploading(true);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setAssets((prev) =>
        prev.map((a) =>
          a.id === newAsset.id
            ? { ...a, progress, status: progress < 100 ? "uploading" : "processing" }
            : a
        )
      );
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        // Simulate AI processing
        setTimeout(() => {
          setAssets((prev) =>
            prev.map((a) =>
              a.id === newAsset.id
                ? {
                    ...a,
                    status: "processing",
                    progress: 40,
                  }
                : a
            )
          );
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 500);
      }
    }, 300);
  }, []);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>资产托管</Text>
            <Text style={styles.headerSubtitle}>工厂知识库 · AI 驱动</Text>
          </View>
          <Pressable
            onPress={handleUpload}
            disabled={uploading}
            style={({ pressed }) => [styles.uploadBtn, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.uploadBtnText}>上传文件</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: "总资产", value: stats.total, color: C.PL },
            { label: "已激活", value: stats.active, color: C.green },
            { label: "处理中", value: stats.processing, color: C.amber },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* AI Capability Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBannerIcon}>
            <Text style={{ fontSize: 20 }}>⚡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiBannerTitle}>AI 知识解构引擎已就绪</Text>
            <Text style={styles.aiBannerDesc}>上传产品手册，AI 自动提取参数、市场、买家画像</Text>
          </View>
        </View>

        {/* Tab Filter */}
        <View style={styles.tabRow}>
          {[
            { key: "all", label: "全部" },
            { key: "active", label: "已激活" },
            { key: "processing", label: "处理中" },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Asset List */}
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ))}

        {/* Upload Zone */}
        <Pressable
          onPress={handleUpload}
          style={({ pressed }) => [styles.uploadZone, pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="arrow.up.circle.fill" size={32} color={C.PL} />
          <Text style={styles.uploadZoneTitle}>上传工厂文件</Text>
          <Text style={styles.uploadZoneDesc}>支持 PDF · Excel · 图片 · 视频</Text>
          <Text style={styles.uploadZoneHint}>AI 将自动解构产品知识，激活获客能力</Text>
        </Pressable>

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
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.t1 },
  headerSubtitle: { fontSize: 13, color: C.t3, marginTop: 2 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.P,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    shadowColor: C.P,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 28, fontWeight: "900", marginBottom: 2 },
  statLabel: { fontSize: 11, color: C.t3, fontWeight: "500" },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  aiBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiBannerTitle: { fontSize: 14, fontWeight: "700", color: C.PL, marginBottom: 2 },
  aiBannerDesc: { fontSize: 12, color: C.t2 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  tabActive: { backgroundColor: C.P },
  tabText: { fontSize: 13, color: C.t2, fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  assetCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  assetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 14, fontWeight: "600", color: C.t1, marginBottom: 2 },
  assetMeta: { fontSize: 11, color: C.t3 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  progressBar: {
    height: 3,
    backgroundColor: C.border,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.amber,
    borderRadius: 2,
  },
  neuronCard: {
    backgroundColor: "rgba(124,58,237,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.2)",
    padding: 12,
    marginTop: 4,
  },
  neuronHeader: { marginBottom: 8 },
  neuronTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  neuronIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(124,58,237,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  neuronIconText: { fontSize: 16 },
  neuronName: { fontSize: 14, fontWeight: "700", color: C.t1 },
  neuronCategory: { fontSize: 11, color: C.t3 },
  matchScoreBadge: {
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchScoreText: { fontSize: 18, fontWeight: "900", color: C.PL },
  matchScoreLabel: { fontSize: 9, color: C.t3 },
  neuronSummary: { fontSize: 12, color: C.t2, lineHeight: 18 },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: "500" },
  tagMore: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: C.surface2,
  },
  tagMoreText: { fontSize: 11, color: C.t3 },
  neuronExpanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(124,58,237,0.2)",
    gap: 8,
  },
  neuronDetailRow: { gap: 2 },
  neuronDetailLabel: { fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5 },
  neuronDetailValue: { fontSize: 12, color: C.t1, lineHeight: 18 },
  uploadZone: {
    borderWidth: 1.5,
    borderColor: "rgba(124,58,237,0.3)",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  uploadZoneTitle: { fontSize: 16, fontWeight: "700", color: C.PL },
  uploadZoneDesc: { fontSize: 13, color: C.t2 },
  uploadZoneHint: { fontSize: 11, color: C.t3, textAlign: "center" },
});
