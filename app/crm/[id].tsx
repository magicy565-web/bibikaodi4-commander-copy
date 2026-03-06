import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { ChevronLeft, Mail, MessageCircle, Calendar } from 'lucide-react-native';
import Svg, { Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { C, SPRING, SPRING_GENTLE } from '@/constants/theme';
import { hapticLight, hapticMedium } from '@/constants/haptics';

interface Customer {
  id: string;
  name: string;
  company: string;
  flag: string;
  stage: string;
  urgency: 'urgent' | 'follow-up' | 'healthy';
  score: number;
  insight: string;
}

interface RadarAxis {
  label: string;
  value: number;
}

const RadarChart = ({ axes }: { axes: RadarAxis[] }) => {
  const size = 200;
  const center = size / 2;
  const maxValue = 100;
  const radius = 60;

  // 生成六边形顶点
  const getPoint = (index: number, value: number) => {
    const angle = (index * 360) / axes.length - 90;
    const rad = (angle * Math.PI) / 180;
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const points = axes.map((axis, i) => getPoint(i, axis.value));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景圆 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(123, 58, 237, 0.1)"
          stroke="rgba(123, 58, 237, 0.2)"
          strokeWidth="1"
        />

        {/* 雷达图轮廓 */}
        <Polygon
          points={polygonPoints}
          fill="rgba(59, 130, 246, 0.3)"
          stroke={C.blue}
          strokeWidth="2"
        />

        {/* 轴标签 */}
        {axes.map((axis, i) => {
          const angle = (i * 360) / axes.length - 90;
          const rad = (angle * Math.PI) / 180;
          const labelRadius = radius + 35;
          const x = center + labelRadius * Math.cos(rad);
          const y = center + labelRadius * Math.sin(rad);

          return (
            <SvgText
              key={i}
              x={x}
              y={y}
              fontSize="10"
              fill={C.t3}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {axis.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default function CustomerDetailScreen({ route }: any) {
  const customerId = route.params?.id || '1';
  const [showModal, setShowModal] = useState(false);

  // 模拟客户数据
  const customer: Customer = {
    id: customerId,
    name: 'Ahmed Al-Rashid',
    company: 'Al-Futtaim Group',
    flag: '🇸🇦',
    stage: '开发中',
    urgency: 'urgent',
    score: 94,
    insight: '斋月季采购预算 $180K，窗口期 23 天',
  };

  const radarAxes: RadarAxis[] = [
    { label: '价格敏感度', value: 75 },
    { label: '质量要求', value: 90 },
    { label: '交期要求', value: 85 },
    { label: '认证要求', value: 70 },
    { label: '定制需求', value: 65 },
  ];

  const STAGE_COLORS: Record<string, string> = {
    '开发中': C.blue,
    '询盘': C.amber,
    '报价': C.PL,
    '样品': C.green,
    '成交': C.t1,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 120,
        }}
      >
        {/* 返回按钮和标题 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Pressable
            onPress={() => {
              hapticLight();
              router.back();
            }}
          >
            <ChevronLeft size={24} color={C.t1} strokeWidth={2} />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>

        {/* Hero 区域 */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: STAGE_COLORS[customer.stage],
              opacity: 0.2,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: STAGE_COLORS[customer.stage],
              }}
            >
              {customer.name.charAt(0)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: '100',
              color: C.t1,
              marginBottom: 6,
            }}
          >
            {customer.name}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 14 }}>{customer.flag}</Text>
            <Text
              style={{
                fontSize: 14,
                color: C.t2,
                marginLeft: 6,
              }}
            >
              {customer.company}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: STAGE_COLORS[customer.stage],
              opacity: 0.15,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: STAGE_COLORS[customer.stage],
              }}
            >
              {customer.stage}
            </Text>
          </View>
        </View>

        {/* 采购意图雷达分析 */}
        <View
          style={{
            marginBottom: 32,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: C.t1,
              }}
            >
              采购意图分析
            </Text>
            <View
              style={{
                marginLeft: 8,
                backgroundColor: C.blue,
                opacity: 0.2,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '600',
                  color: C.blue,
                }}
              >
                AI
              </Text>
            </View>
          </View>

          <RadarChart axes={radarAxes} />
        </View>

        {/* AI 会议辅助卡片 */}
        <View
          style={{
            backgroundColor: C.bgCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.border,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: C.PL,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Calendar size={18} color={C.PL} strokeWidth={2} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: C.t1,
                marginLeft: 8,
              }}
            >
              AI 会议辅助
            </Text>
          </View>

          <Text
            style={{
              fontSize: 12,
              color: C.t2,
              marginBottom: 16,
            }}
          >
            明日视频会议建议
          </Text>

          {/* 建议项 */}
          {[
            { icon: '💬', title: '开场话题', text: '询问斋月期间的购买计划变化' },
            { icon: '🎯', title: '核心卖点', text: '认证和快速交货能力' },
            { icon: '⚠️', title: '预期异议', text: '价格太高？强调总拥有成本和品质保证' },
          ].map((item, i) => (
            <View key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}
              >
                <Text style={{ fontSize: 12, marginRight: 8 }}>
                  {item.icon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: C.t1,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.t2,
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View
            style={{
              backgroundColor: C.amber,
              opacity: 0.15,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: C.amber,
              }}
            >
              目标：争取样品订单确认
            </Text>
          </View>
        </View>

        {/* 跟进时间线 */}
        <View
          style={{
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: C.t1,
              marginBottom: 16,
            }}
          >
            跟进时间线
          </Text>

          {[
            { date: '今天 10:30', action: '发送报价' },
            { date: '昨天 14:00', action: '确认需求' },
            { date: '3 天前', action: '初次联系', latest: true },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                marginBottom: 16,
              }}
            >
              {/* 左侧时间线 */}
              <View
                style={{
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <MotiView
                  animate={{
                    scale: item.latest ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 2000,
                    loop: item.latest,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: item.latest ? C.green : C.border,
                    }}
                  />
                </MotiView>

                {i < 2 && (
                  <View
                    style={{
                      width: 1,
                      height: 40,
                      backgroundColor: C.border,
                      marginTop: 8,
                    }}
                  />
                )}
              </View>

              {/* 内容 */}
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    color: C.t2,
                    marginBottom: 2,
                  }}
                >
                  {item.date}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: C.t1,
                  }}
                >
                  {item.action}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 快速操作按钮 */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
          }}
        >
          {[
            { icon: Mail, label: '发邮件', color: C.blue },
            { icon: MessageCircle, label: 'WhatsApp', color: C.green },
            { icon: Calendar, label: '安排会议', color: C.PL },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Pressable
                key={i}
                onPress={() => hapticMedium()}
                style={{ flex: 1 }}
              >
                <MotiView
                  transition={SPRING_GENTLE}
                >
                  <View
                    style={{
                      backgroundColor: C.bgCard,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: C.border,
                      paddingVertical: 12,
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon size={20} color={action.color} strokeWidth={1.5} />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: C.t1,
                      }}
                    >
                      {action.label}
                    </Text>
                  </View>
                </MotiView>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
