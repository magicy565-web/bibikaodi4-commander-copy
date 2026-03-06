/**
 * Login — Commander Phone 登录页
 * Apple Watch Ultra 风格 · 演示模式快速填充 · 跳过登录按钮
 */
import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { hapticLight, hapticSuccess } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  function fillDemo() {
    hapticLight();
    setEmail('demo@kabeq.com');
    setPassword('demo123');
  }

  function handleLogin() {
    hapticLight();
    setIsLoading(true);
    setTimeout(() => {
      hapticSuccess();
      router.replace('/(tabs)');
    }, 1500);
  }

  function handleSkip() {
    hapticLight();
    router.replace('/(tabs)');
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{
          position: 'absolute', top: -60, left: '50%', marginLeft: -150,
          width: 300, height: 300, borderRadius: 150,
          backgroundColor: 'rgba(96,165,250,0.08)',
        }}
        pointerEvents="none"
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0, ...SPRING }}
              style={{ alignItems: 'center', marginBottom: 40 }}
            >
              <View style={{
                width: 96, height: 96, borderRadius: 48,
                borderWidth: 1, borderColor: 'rgba(96,165,250,0.3)',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#60A5FA', shadowRadius: 20, shadowOpacity: 0.5,
                shadowOffset: { width: 0, height: 0 },
                marginBottom: 20,
              }}>
                <LinearGradient
                  colors={['#1e3a5f', '#0f1f3d']}
                  style={{
                    width: 80, height: 80, borderRadius: 40,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 40, fontWeight: '100', color: '#60A5FA', letterSpacing: 2 }}>C</Text>
                </LinearGradient>
              </View>

              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 150, ...SPRING }}
                style={{ alignItems: 'center' }}
              >
                <Text style={{ fontSize: 22, fontWeight: '100', color: '#ffffff', letterSpacing: 10, marginBottom: 6 }}>
                  COMMANDER
                </Text>
                <LinearGradient
                  colors={['transparent', '#60A5FA', 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ width: 120, height: 1, marginBottom: 12 }}
                />
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 250, ...SPRING }}
                style={{ alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 3, marginBottom: 4 }}>
                  你的 AI 外贸指挥官
                </Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>
                  KABEQ · 卡贝奇专属版
                </Text>
              </MotiView>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 400, ...SPRING }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                padding: 28,
                marginBottom: 20,
              }}
            >
              <Text style={{
                fontSize: 10, color: 'rgba(255,255,255,0.35)',
                letterSpacing: 3, marginBottom: 24, textAlign: 'center',
              }}>
                登录指挥中心
              </Text>

              <View style={{
                height: 52, borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: emailFocused ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)',
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, gap: 12, marginBottom: 12,
              }}>
                <Mail size={16} color="rgba(255,255,255,0.35)" />
                <TextInput
                  style={{ flex: 1, color: '#ffffff', fontSize: 15 }}
                  placeholder="邮箱 / 手机号"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              <View style={{
                height: 52, borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: passwordFocused ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)',
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, gap: 12, marginBottom: 12,
              }}>
                <Lock size={16} color="rgba(255,255,255,0.35)" />
                <TextInput
                  style={{ flex: 1, color: '#ffffff', fontSize: 15 }}
                  placeholder="密码"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => { hapticLight(); setShowPassword(!showPassword); }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                >
                  {showPassword
                    ? <EyeOff size={16} color="rgba(255,255,255,0.35)" />
                    : <Eye size={16} color="rgba(255,255,255,0.35)" />
                  }
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>演示账号</Text>
                <Pressable
                  onPress={fillDemo}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginLeft: 8 })}
                >
                  <Text style={{ color: '#60A5FA', fontSize: 11 }}>demo@kabeq.com / demo123</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: isLoading ? 0.8 : 1,
                })}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{
                    height: 54, borderRadius: 16,
                    flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'center', gap: 10,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>进入指挥中心</Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 600, ...SPRING }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginHorizontal: 12 }}>或</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              </View>

              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => ({ alignItems: 'center', opacity: pressed ? 0.6 : 1, marginBottom: 32 })}
              >
                <Text style={{
                  color: 'rgba(255,255,255,0.35)', fontSize: 13,
                  textDecorationLine: 'underline',
                  textDecorationColor: 'rgba(255,255,255,0.2)',
                }}>
                  跳过登录 · 演示模式
                </Text>
              </Pressable>

              <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginBottom: 24 }}>
                Commander Phone · MVP v1.0 · 3月12日演示版
              </Text>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
