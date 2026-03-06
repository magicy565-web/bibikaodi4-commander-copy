/**
 * Asset Vault — 资产库
 * v2: 修复 SVG 崩溃（<svg> → react-native-svg），实现上传 Modal，接入 store 训练进度
 */
import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Modal,
  TextInput, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import {
  Upload, FileText, Image, Film, Package,
  CheckCircle, Clock, Zap, X, Plus,
} from 'lucide-react-native';
import { hapticLight, hapticMedium, hapticSuccess } from '@/constants/haptics';
import { C } from '@/constants/theme';
import { useStore, Asset, AssetType } from '@/constants/store';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── 弧形激活环（使用 react-native-svg，修复崩溃） ───────────

function ActivationRing({
  score,
  size = 56,
  color,
}: {
  score: number;
  size?: number;
  color: string;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={cx} cy={cy} r={radius}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={cx} cy={cy} r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── 大型激活环（首页 Hero 用） ───────────────────────────────

function HeroActivationRing({ score }: { score: number }) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ position: 'relative', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke="#7C3AED"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: C.t1 }}>{score}%</Text>
        <Text style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>激活率</Text>
      </View>
    </View>
  );
}

// ─── 资产类型配置 ─────────────────────────────────────────────

const ASSET_TYPE_CONFIG: Record<AssetType, {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
}> = {
  product:  { label: '产品图册', icon: Package,     color: C.amber,   bgColor: C.amber + '20' },
  document: { label: '商务文档', icon: FileText,    color: C.blue,    bgColor: C.blue + '20' },
  case:     { label: '成功案例', icon: CheckCircle, color: C.green,   bgColor: C.green + '20' },
  media:    { label: '视频/图片', icon: Film,       color: '#A78BFA', bgColor: '#A78BFA20' },
};

const STATUS_CONFIG = {
  active:   { label: '已激活', color: C.green,  bg: C.green + '20' },
  training: { label: '训练中', color: C.amber,  bg: C.amber + '20' },
  pending:  { label: '待处理', color: C.t3,     bg: 'rgba(255,255,255,0.08)' },
};

// ─── 资产卡片 ─────────────────────────────────────────────────

function AssetCard({ asset }: { asset: Asset }) {
  const typeConf = ASSET_TYPE_CONFIG[asset.type];
  const statusConf = STATUS_CONFIG[asset.status];
  const Icon = typeConf.icon;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: asset.status === 'active'
          ? typeConf.color + '30'
          : 'rgba(255,255,255,0.07)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {/* 左侧彩色竖线 */}
      <View style={{
        position: 'absolute', left: 0, top: 12, bottom: 12,
        width: 3, borderRadius: 2,
        backgroundColor: asset.status === 'active' ? typeConf.color : 'transparent',
      }} />

      {/* 激活环 + 图标 */}
      <View style={{ position: 'relative', width: 56, height: 56 }}>
        <ActivationRing
          score={asset.trainingProgress}
          size={56}
          color={typeConf.color}
        />
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={typeConf.color} />
        </View>
        {/* 训练中脉冲 */}
        {asset.status === 'training' && (
          <MotiView
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.3, 1] }}
            transition={{ loop: true, duration: 1800 }}
            style={{
              position: 'absolute', top: -3, left: -3, right: -3, bottom: -3,
              borderRadius: 32, borderWidth: 1.5,
              borderColor: typeConf.color + '60',
            }}
          />
        )}
      </View>

      {/* 信息 */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.t1, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
          {asset.name}
        </Text>
        <Text style={{ color: C.t3, fontSize: 12, marginTop: 2 }}>
          {typeConf.label} · {asset.size}
        </Text>

        {/* 训练进度条 */}
        {asset.status === 'training' && (
          <View style={{ marginTop: 8 }}>
            <View style={{
              height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <MotiView
                animate={{ width: `${asset.trainingProgress}%` as any }}
                transition={{ type: 'timing', duration: 600 }}
                style={{ height: '100%', backgroundColor: typeConf.color, borderRadius: 2 }}
              />
            </View>
            <Text style={{ color: typeConf.color, fontSize: 11, marginTop: 4 }}>
              AI 学习中 {asset.trainingProgress}%
            </Text>
          </View>
        )}
      </View>

      {/* 右侧：激活分 + 状态 */}
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        {asset.status === 'active' && (
          <Text style={{ color: typeConf.color, fontSize: 22, fontWeight: '700' }}>
            {asset.activationScore}
          </Text>
        )}
        {asset.status === 'training' && (
          <ActivityIndicator size="small" color={typeConf.color} />
        )}
        {asset.status === 'pending' && (
          <Clock size={18} color={C.t3} />
        )}
        <View style={{
          backgroundColor: statusConf.bg,
          borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
        }}>
          <Text style={{ color: statusConf.color, fontSize: 11, fontWeight: '600' }}>
            {statusConf.label}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

// ─── 上传 Modal ───────────────────────────────────────────────

const UPLOAD_TYPES: { type: AssetType; label: string; desc: string; icon: any; color: string }[] = [
  { type: 'product',  label: '产品图册',  desc: 'PDF / PPT / 图片集',   icon: Package,     color: C.amber },
  { type: 'document', label: '商务文档',  desc: '合同 / 报价单 / 规格书', icon: FileText,    color: C.blue },
  { type: 'case',     label: '成功案例',  desc: '项目案例 / 客户评价',   icon: CheckCircle, color: C.green },
  { type: 'media',    label: '视频/图片', desc: '工厂视频 / 产品图',     icon: Film,        color: '#A78BFA' },
];

function UploadModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { uploadAsset } = useStore();
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [assetName, setAssetName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (!selectedType || !assetName.trim()) return;
    hapticSuccess();
    setUploading(true);

    setTimeout(() => {
      uploadAsset({
        name: assetName.trim(),
        type: selectedType,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(Math.random() * 20 + 1).toFixed(1)} MB`,
      });
      setUploading(false);
      setSelectedType(null);
      setAssetName('');
      onClose();
    }, 800);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <View style={{
            backgroundColor: '#0F0F1A',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}>
            {/* Handle */}
            <View style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignSelf: 'center', marginBottom: 20,
            }} />

            {/* Title */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: C.t1, fontSize: 18, fontWeight: '700' }}>上传资产</Text>
              <Pressable onPress={onClose}>
                <X size={22} color={C.t2} />
              </Pressable>
            </View>

            {/* 资产名称输入 */}
            <Text style={{ color: C.t2, fontSize: 13, marginBottom: 8 }}>资产名称</Text>
            <TextInput
              value={assetName}
              onChangeText={setAssetName}
              placeholder="例：2025 Q1 产品目录"
              placeholderTextColor={C.t3}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 14,
                color: C.t1, fontSize: 15,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                marginBottom: 20,
              }}
            />

            {/* 类型选择 */}
            <Text style={{ color: C.t2, fontSize: 13, marginBottom: 12 }}>资产类型</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {UPLOAD_TYPES.map(t => {
                const Icon = t.icon;
                const selected = selectedType === t.type;
                return (
                  <Pressable
                    key={t.type}
                    onPress={() => { hapticLight(); setSelectedType(t.type); }}
                    style={{
                      width: (SCREEN_W - 68) / 2,
                      backgroundColor: selected ? t.color + '20' : 'rgba(255,255,255,0.04)',
                      borderRadius: 14, padding: 14,
                      borderWidth: 1.5,
                      borderColor: selected ? t.color : 'rgba(255,255,255,0.08)',
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                    }}
                  >
                    <Icon size={18} color={selected ? t.color : C.t2} />
                    <View>
                      <Text style={{ color: selected ? t.color : C.t1, fontWeight: '600', fontSize: 13 }}>
                        {t.label}
                      </Text>
                      <Text style={{ color: C.t3, fontSize: 11 }}>{t.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* 上传按钮 */}
            <Pressable
              onPress={handleUpload}
              disabled={!selectedType || !assetName.trim() || uploading}
            >
              <LinearGradient
                colors={
                  selectedType && assetName.trim()
                    ? ['#7C3AED', '#5B21B6']
                    : ['#333', '#222']
                }
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14, padding: 16,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 8,
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Upload size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                      上传并开始 AI 训练
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Text style={{ color: C.t3, fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              上传后 AI 将自动学习资产内容，通常需要 20-30 秒
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────

export default function AssetVaultScreen() {
  const [showUpload, setShowUpload] = useState(false);
  const { state } = useStore();
  const { assets } = state;

  const activeCount = assets.filter(a => a.status === 'active').length;
  const trainingCount = assets.filter(a => a.status === 'training').length;
  const avgScore = activeCount > 0
    ? Math.round(
        assets
          .filter(a => a.status === 'active')
          .reduce((s, a) => s + a.activationScore, 0) / activeCount
      )
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <LinearGradient
        colors={['#001a0a', '#000000', '#000000']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Header */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, marginBottom: 20,
          }}>
            <View>
              <Text style={{ color: C.t1, fontSize: 22, fontWeight: '700' }}>资产库</Text>
              <Text style={{ color: C.t3, fontSize: 13, marginTop: 2 }}>
                AI 知识库 · {activeCount} 项已激活
              </Text>
            </View>
            <Pressable
              onPress={() => { hapticMedium(); setShowUpload(true); }}
              style={{
                backgroundColor: C.green + '20',
                borderRadius: 14, padding: 12,
                borderWidth: 1, borderColor: C.green + '40',
              }}
            >
              <Plus size={20} color={C.green} />
            </Pressable>
          </View>

          {/* Hero 激活环 */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <HeroActivationRing score={avgScore} />
            <Text style={{ color: C.t2, fontSize: 13, marginTop: 12 }}>
              {activeCount} 个资产已激活 · {trainingCount > 0 ? `${trainingCount} 个训练中` : '全部就绪'}
            </Text>
          </View>

          {/* Stats Bar */}
          <View style={{
            flexDirection: 'row', marginHorizontal: 20, marginBottom: 24,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          }}>
            {[
              { label: '已激活', value: activeCount,    color: C.green },
              { label: '训练中', value: trainingCount,  color: C.amber },
              { label: '平均激活分', value: avgScore,   color: C.blue },
              { label: '总资产', value: assets.length,  color: C.t2 },
            ].map((s, i) => (
              <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
                {i > 0 && (
                  <View style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 1, backgroundColor: 'rgba(255,255,255,0.08)',
                  }} />
                )}
                <Text style={{ color: s.color, fontSize: 22, fontWeight: '700' }}>{s.value}</Text>
                <Text style={{ color: C.t3, fontSize: 11, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Asset List */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ color: C.t2, fontSize: 13, marginBottom: 12 }}>
              全部资产 ({assets.length})
            </Text>
            {assets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </View>

          {/* 上传 CTA（底部提示） */}
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Pressable onPress={() => { hapticMedium(); setShowUpload(true); }}>
              <View style={{
                borderRadius: 16, padding: 18,
                borderWidth: 2, borderStyle: 'dashed',
                borderColor: 'rgba(124,58,237,0.3)',
                backgroundColor: 'rgba(124,58,237,0.06)',
                alignItems: 'center', gap: 8,
              }}>
                <Upload size={24} color="#7C3AED" />
                <Text style={{ color: '#A78BFA', fontWeight: '600', fontSize: 15 }}>
                  上传新资产
                </Text>
                <Text style={{ color: C.t3, fontSize: 12 }}>
                  产品图册、案例、视频等
                </Text>
              </View>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* 上传 Modal */}
      <UploadModal visible={showUpload} onClose={() => setShowUpload(false)} />
    </View>
  );
}
