/**
 * Settings — 设置页
 */
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const C = {
  bg: "#000000",
  surface: "rgba(255,255,255,0.06)",
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

function SettingRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  rightContent,
  onPress,
  danger,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.7 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <IconSymbol name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, danger && { color: C.red }]}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {rightContent ?? (
        onPress && <IconSymbol name="chevron.right" size={16} color={C.t3} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [autoReply, setAutoReply] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [highIntentAlert, setHighIntentAlert] = useState(true);

  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await AsyncStorage.removeItem("commander_logged_in");
    await AsyncStorage.removeItem("commander_user");
    router.replace("/login");
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>设置</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>王</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>王总</Text>
            <Text style={styles.profileCompany}>明辉照明有限公司</Text>
            <View style={styles.profileBadge}>
              <View style={styles.profileBadgeDot} />
              <Text style={styles.profileBadgeText}>Commander 专业版</Text>
            </View>
          </View>
          <Pressable style={styles.editBtn}>
            <IconSymbol name="pencil" size={16} color={C.PL} />
          </Pressable>
        </View>

        {/* AI 配置 */}
        <Text style={styles.sectionTitle}>AI 助理配置</Text>
        <View style={styles.section}>
          <SettingRow
            icon="sparkles"
            iconColor={C.PL}
            iconBg="rgba(124,58,237,0.2)"
            title="自动回复首次询盘"
            subtitle="AI 自动生成并发送首次回复"
            rightContent={
              <Switch
                value={autoReply}
                onValueChange={setAutoReply}
                trackColor={{ false: C.border, true: C.P }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="bell.badge.fill"
            iconColor={C.amber}
            iconBg="rgba(245,158,11,0.2)"
            title="高意向买家推送"
            subtitle="AI 识别高意向买家时立即通知"
            rightContent={
              <Switch
                value={highIntentAlert}
                onValueChange={setHighIntentAlert}
                trackColor={{ false: C.border, true: C.P }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="brain.head.profile"
            iconColor={C.green}
            iconBg="rgba(16,185,129,0.2)"
            title="AI 模型"
            subtitle="Qwen-Max (阿里云百炼)"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="globe"
            iconColor={C.blue}
            iconBg="rgba(96,165,250,0.2)"
            title="回复语言"
            subtitle="英语 · 自动检测买家语言"
            onPress={() => {}}
          />
        </View>

        {/* 数据与资产 */}
        <Text style={styles.sectionTitle}>数据与资产</Text>
        <View style={styles.section}>
          <SettingRow
            icon="archivebox.fill"
            iconColor={C.PL}
            iconBg="rgba(124,58,237,0.2)"
            title="知识库管理"
            subtitle="3 个产品已激活"
            onPress={() => router.push("/(tabs)/assets" as any)}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="icloud.and.arrow.up.fill"
            iconColor={C.green}
            iconBg="rgba(16,185,129,0.2)"
            title="数据同步"
            subtitle="上次同步：刚刚"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chart.line.uptrend.xyaxis"
            iconColor={C.amber}
            iconBg="rgba(245,158,11,0.2)"
            title="数据报告"
            subtitle="查看月度询盘分析"
            onPress={() => {}}
          />
        </View>

        {/* 通知 */}
        <Text style={styles.sectionTitle}>通知</Text>
        <View style={styles.section}>
          <SettingRow
            icon="bell.fill"
            iconColor={C.blue}
            iconBg="rgba(96,165,250,0.2)"
            title="推送通知"
            subtitle="新询盘、AI 完成任务时通知"
            rightContent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: C.border, true: C.P }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* 关于 */}
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.section}>
          <SettingRow
            icon="info.circle.fill"
            iconColor={C.t2}
            iconBg="rgba(255,255,255,0.08)"
            title="版本"
            subtitle="Commander MVP v1.0.0"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="building.2.fill"
            iconColor={C.t2}
            iconBg="rgba(255,255,255,0.08)"
            title="技术支持"
            subtitle="RealSourcing · realsourcing.com"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <SettingRow
            icon="arrow.left"
            iconColor={C.red}
            iconBg="rgba(248,113,113,0.15)"
            title="退出登录"
            danger
            onPress={handleLogout}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16 },
  header: { marginBottom: 20, paddingTop: 8 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.t1 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.1)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.P,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#fff" },
  profileName: { fontSize: 18, fontWeight: "700", color: C.t1 },
  profileCompany: { fontSize: 12, color: C.t3, marginTop: 2, marginBottom: 6 },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(124,58,237,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  profileBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.PL },
  profileBadgeText: { fontSize: 11, color: C.PL, fontWeight: "600" },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(167,139,250,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: C.t3,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "500", color: C.t1 },
  rowSubtitle: { fontSize: 12, color: C.t3, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 62,
  },
});
