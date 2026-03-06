/**
 * Asset Package — 资产能力包详情页
 * 展示卡贝奇工厂的完整数字能力包，演示"工厂数据托管"的视觉高潮
 */
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  FileText, Video, Award, Settings2, Package, Globe,
  Mail, Share2, CheckCircle, ChevronLeft,
} from 'lucide-react-native';
import { PieChart } from 'react-native-gifted-charts';
import { hapticLight } from '@/constants/haptics';
import { C, SPRING } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// 4 维度评分
const DIMENSION_SCORES = [
  { label: '产品丰富度', value: 92, color: C.blue },
  { label: '定制能力', value: 88, color: '#A78BFA' },
  { label: '交货速度', value: 75, color: C.amber },
  { label: '品质认证', value: 90, color: C.green },
];

// 6 个资产模块
const ASSET_MODULES = [
  {
    Icon: FileText, name: '产品图册', detail: '156款产品',
    status: '已激活', isActive: true,
    gradientColors: ['#1e40af', '#3b82f6'] as [string, string],
  },
  {
    Icon: Video, name: '营销视频', detail: '8个视频',
    status: '已激活', isActive: true,
    gradientColors: ['#4c1d95', '#7c3aed'] as [string, string],
  },
  {
    Icon: Award, name: '质量认证', detail: 'ISO9001等12项',
    status: '已激活', isActive: true,
    gradientColors: ['#92400e', '#f59e0b'] as [string, string],
  },
  {
    Icon: Settings2, name: '定制能力', detail: 'OEM/ODM全程',
    status: '已激活', isActive: true,
    gradientColors: ['#064e3b', '#10b981'] as [string, string],
  },
  {
    Icon: Package, name: '一件代发', detail: '最低1件起发',
    status: '已激活', isActive: true,
    gradientColors: ['#1e3a5f', '#60a5fa'] as [string, string],
  },
  {
    Icon: Globe, name: '市场案例', detail: '23国成功案例',
    status: '更新中', isActive: false,
    gradientColors: ['#3b0764', '#a78bfa'] as [string, string],
  },
];

// 明星产品
const STAR_PRODUCTS = [
  { code: 'KS-837', name: '岩石沙发', price: '$292-$380', market: '中东热销', emoji: '🛋️' },
  { code: 'KS-801', name: '大黑牛沙发', price: '$340-$480', market: '迪拜精品', emoji: '🪑' },
  { code: 'KC-1089', name: '北欧休闲椅', price: '$85-$150', market: '东南亚', emoji: '💺' },
  { code: 'KS-3012', name: '现代布艺沙发', price: '$220-$320', market: '俄罗斯', emoji: '🛋️' },
];

// 出口市场
const EXPORT_MARKETS = [
  { flag: '🇸🇦', country: '沙特阿拉伯', pct: 32, color: C.blue },
  { flag: '🇷🇺', country: '俄罗斯', pct: 24, color: '#A78BFA' },
  { flag: '🇦🇪', country: '阿联酋', pct: 18, color: C.amber },
  { flag: '🇲🇾', country: '马来西亚', pct: 14, color: C.green },
  { flag: '🇹🇭', country: '泰国', pct: 12, color: C.teal },
];

// 综合评分环形图数据
const SCORE_RING_DATA = [
  { value: 87, color: C.blue },
  { value: 13, color: 'rgba(255,255,255,0.06)' },
];

export default function AssetPackagePage() {
  const cardW = (SCREEN_W - 52) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ─── Header ─── */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0, ...SPRING }}
            style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}
          >
            <Pressable
              onPress={() => { hapticLight(); router.back(); }}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 4,
                opacity: pressed ? 0.6 : 1, marginBottom: 12,
              })}
            >
              <ChevronLeft size={20} color={C.t1} />
              <Text style={{ color: C.t2, fontSize: 14 }}>返回</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Text style={{ fontSize: 26, fontWeight: '100', color: C.t1 }}>KABEQ 卡贝奇</Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <CheckCircle size={11} color={C.green} />
                <Text style={{ color: C.green, fontSize: 10, fontWeight: '600' }}>已认证</Text>
              </View>
            </View>

            <Text style={{ color: C.t3, fontSize: 12, marginBottom: 12 }}>
              广东·佛山 · 建厂2008年 · 年产能50,000件
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['产品线 156款', '认证 12项', '出口 23国'].map(pill => (
                <View
                  key={pill}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: C.t2, fontSize: 11 }}>{pill}</Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ─── 综合评分环 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 80, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 12 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, borderWidth: 1, borderColor: C.border,
              padding: 24, alignItems: 'center',
            }}>
              <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <PieChart
                  data={SCORE_RING_DATA}
                  radius={70}
                  innerRadius={54}
                  donut
                  showText={false}
                />
                <View style={{
                  position: 'absolute',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: C.t1, fontSize: 40, fontWeight: '100', lineHeight: 44 }}>87</Text>
                  <Text style={{ color: C.t3, fontSize: 11 }}>综合能力</Text>
                </View>
              </View>

              <Text style={{ color: C.t2, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
                KABEQ 已完成 87% 的数字化资产托管
              </Text>

              {/* 4 维度 2×2 网格 */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' }}>
                {DIMENSION_SCORES.map((dim, i) => (
                  <View key={dim.label} style={{ width: (SCREEN_W - 80) / 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: C.t3, fontSize: 11 }}>{dim.label}</Text>
                      <Text style={{ color: dim.color, fontSize: 11, fontWeight: '600' }}>{dim.value}%</Text>
                    </View>
                    <View style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${dim.value}%` }}
                        transition={{ delay: 300 + i * 80, duration: 600 }}
                        style={{ height: 3, borderRadius: 2, backgroundColor: dim.color }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </MotiView>

          {/* ─── 资产模块网格 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 160, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>已托管资产</Text>
              <View style={{
                backgroundColor: 'rgba(96,165,250,0.15)',
                borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
              }}>
                <Text style={{ color: C.blue, fontSize: 10, fontWeight: '600' }}>6项</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {ASSET_MODULES.map((mod, i) => (
                <MotiView
                  key={mod.name}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 200 + i * 60, ...SPRING }}
                  style={{
                    width: cardW,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16,
                  }}
                >
                  <LinearGradient
                    colors={mod.gradientColors}
                    style={{
                      width: 44, height: 44, borderRadius: 22,
                      alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                    }}
                  >
                    <mod.Icon size={22} color="#ffffff" />
                  </LinearGradient>
                  <Text style={{ color: C.t1, fontSize: 13, fontWeight: '600', marginBottom: 3 }}>{mod.name}</Text>
                  <Text style={{ color: C.t3, fontSize: 11, marginBottom: 8 }}>{mod.detail}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    {mod.isActive ? (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
                    ) : (
                      <MotiView
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ loop: true, duration: 1400 }}
                        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber }}
                      />
                    )}
                    <Text style={{ color: mod.isActive ? C.green : C.amber, fontSize: 10 }}>{mod.status}</Text>
                  </View>
                </MotiView>
              ))}
            </View>
          </MotiView>

          {/* ─── 明星产品 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 320, ...SPRING }}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 10 }}>
              <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600' }}>明星产品</Text>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
              }}>
                <Text style={{ color: C.t3, fontSize: 10 }}>156款</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {STAR_PRODUCTS.map((prod, i) => (
                <View
                  key={i}
                  style={{
                    width: 150, backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#0f172a', '#1e293b']}
                    style={{
                      height: 90, alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 36 }}>{prod.emoji}</Text>
                  </LinearGradient>
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: C.t3, fontSize: 10, marginBottom: 2 }}>{prod.code}</Text>
                    <Text style={{ color: C.t1, fontSize: 12, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
                      {prod.name}
                    </Text>
                    <Text style={{ color: C.blue, fontSize: 11, marginBottom: 6 }}>{prod.price}</Text>
                    <View style={{
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start',
                    }}>
                      <Text style={{ color: C.amber, fontSize: 9 }}>{prod.market}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </MotiView>

          {/* ─── 出口市场分布 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, ...SPRING }}
            style={{ paddingHorizontal: 20, marginBottom: 16 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16,
            }}>
              <Text style={{ color: C.t1, fontSize: 14, fontWeight: '600', marginBottom: 14 }}>出口市场分布</Text>
              {EXPORT_MARKETS.map((mkt, i) => (
                <View key={mkt.country} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 18, width: 28 }}>{mkt.flag}</Text>
                  <Text style={{ color: C.t1, fontSize: 13, width: 80 }}>{mkt.country}</Text>
                  <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 8 }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${mkt.pct}%` }}
                      transition={{ delay: 500 + i * 100, duration: 600 }}
                      style={{ height: 4, borderRadius: 2, backgroundColor: mkt.color }}
                    />
                  </View>
                  <Text style={{ color: C.t3, fontSize: 11, width: 32, textAlign: 'right' }}>{mkt.pct}%</Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ─── 底部操作按钮 ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 480, ...SPRING }}
            style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 12 }}
          >
            <Pressable
              onPress={() => { hapticLight(); router.push('/(tabs)/commander-chat'); }}
              style={({ pressed }) => ({
                flex: 1, height: 50, borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1, borderColor: C.border,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Mail size={16} color={C.t1} />
              <Text style={{ color: C.t1, fontSize: 13 }}>生成开发信</Text>
            </Pressable>

            <Pressable
              onPress={() => hapticLight()}
              style={({ pressed }) => ({
                flex: 1, height: 50, borderRadius: 14, overflow: 'hidden',
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}
              >
                <Share2 size={16} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 13 }}>分享能力包</Text>
              </LinearGradient>
            </Pressable>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
