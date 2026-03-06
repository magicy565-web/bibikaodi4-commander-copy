import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '@/constants/store';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="light" backgroundColor="#000000" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="task-progress" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="market-radar" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="inbound-funnel" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="outbound-campaigns" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="content-studio" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ai-training" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
