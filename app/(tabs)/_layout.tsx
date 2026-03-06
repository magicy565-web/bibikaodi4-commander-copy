import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "rgba(0,0,0,0.95)",
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "战报",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 24} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: "资产",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 24} name="archivebox.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inquiries"
        options={{
          title: "询盘",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 24} name="tray.full.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size ?? 24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
