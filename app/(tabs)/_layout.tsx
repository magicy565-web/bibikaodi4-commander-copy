import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Home, Layers, Users2, MessageSquare } from 'lucide-react-native';
import { hapticLight } from '@/constants/haptics';
import { C } from '@/constants/theme';

const TABS = [
  { name: 'index',          label: '主页', icon: Home },
  { name: 'decision-feed',  label: '决策', icon: Layers },
  { name: 'crm',            label: '客户', icon: Users2 },
  { name: 'commander-chat', label: '对话', icon: MessageSquare },
];

function TabBarIcon({
  icon: Icon,
  focused,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  focused: boolean;
}) {
  return (
    <MotiView
      animate={{ scale: focused ? 1.12 : 1, translateY: focused ? -2 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <Icon
        size={22}
        color={focused ? '#ffffff' : 'rgba(255,255,255,0.38)'}
        strokeWidth={focused ? 2.5 : 1.8}
      />
    </MotiView>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,8,16,0.97)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 24,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.38)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '主页',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="decision-feed"
        options={{
          title: '决策',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={Layers} focused={focused} />,
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', fontSize: 9, minWidth: 16, height: 16 },
        }}
      />
      <Tabs.Screen
        name="crm"
        options={{
          title: '客户',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={Users2} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="commander-chat"
        options={{
          title: '对话',
          tabBarIcon: ({ focused }) => <TabBarIcon icon={MessageSquare} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
