import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { Filter, Zap } from 'lucide-react-native';
import { C, SPRING_GENTLE } from '@/constants/theme';
import { hapticLight } from '@/constants/haptics';

type Stage = '开发中' | '询盘' | '报价' | '样品' | '成交';
type UrgencyLevel = 'urgent' | 'follow-up' | 'healthy';

interface Customer {
  id: string;
  name: string;
  company: string;
  flag: string;
  stage: Stage;
  urgency: UrgencyLevel;
  score: number;
  insight: string;
  lastContact: string;
}

const CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    company: 'Al-Futtaim Group',
    flag: '🇸🇦',
    stage: '开发中',
    urgency: 'urgent',
    score: 94,
    insight: '斋月季采购预算 $180K，窗口期 23 天',
    lastContact: '今天 10:30',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'HomeStyle India',
    flag: '🇮🇳',
    stage: '报价',
    urgency: 'follow-up',
    score: 78,
    insight: '价格敏感但年采购额 $2M+，强调认证价值',
    lastContact: '昨天',
  },
  {
    id: '3',
    name: 'Fatima Al-Zahra',
    company: 'Dubai Home Decor',
    flag: '🇦🇪',
    stage: '样品',
    urgency: 'healthy',
    score: 62,
    insight: '样品已寄出 12 天，建议主动询问反馈',
    lastContact: '3 天前',
  },
];

const FILTER_OPTIONS = ['全部', '高意向', '待回复', '跟进中', '已成交'] as const;

const STAGE_COLORS: Record<Stage, string> = {
  '开发中': C.blue,
  '询盘': C.amber,
  '报价': C.PL,
  '样品': C.green,
  '成交': C.t1,
};

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  urgent: C.red,
  'follow-up': C.amber,
  healthy: C.green,
};

export default function CRMScreen() {
  const [activeFilter, setActiveFilter] = useState<typeof FILTER_OPTIONS[number]>('全部');

  const renderCustomerCard = ({ item }: { item: Customer }) => {
    const urgencyColor = URGENCY_COLORS[item.urgency];
    const stageColor = STAGE_COLORS[item.stage];

    return (
      <Pressable
        onPress={() => {
          hapticLight();
          router.push(`/crm/${item.id}`);
        }}
        style={{ marginBottom: 12 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_GENTLE}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: C.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.border,
              overflow: 'hidden',
            }}
          >
            {/* 左侧紧急度条 */}
            <View
              style={{
                width: 4,
                backgroundColor: urgencyColor,
                opacity: 0.8,
              }}
            />

            {/* 头像 */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: stageColor,
                opacity: 0.2,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 12,
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: stageColor,
                }}
              >
                {item.name.charAt(0)}
              </Text>
            </View>

            {/* 中间信息 */}
            <View
              style={{
                flex: 1,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {/* 名称和国家 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: C.t1,
                  }}
                >
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, marginLeft: 6, marginRight: 4 }}>
                  {item.flag}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: C.t2,
                  }}
                  numberOfLines={1}
                >
                  {item.company}
                </Text>
              </View>

              {/* 阶段徽章 */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: stageColor,
                    opacity: 0.15,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: stageColor,
                    }}
                  >
                    {item.stage}
                  </Text>
                </View>
              </View>

              {/* AI 洞察 */}
              <Text
                style={{
                  fontSize: 11,
                  color: C.t3,
                  fontStyle: 'italic',
                }}
                numberOfLines={1}
              >
                {item.insight}
              </Text>
            </View>

            {/* 右侧：最后联系时间和评分 */}
            <View
              style={{
                alignItems: 'flex-end',
                paddingRight: 12,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: C.t2,
                  marginBottom: 8,
                }}
              >
                {item.lastContact}
              </Text>

              {/* 评分圆环 */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: urgencyColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: urgencyColor,
                  }}
                >
                  {item.score}
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        {/* 标题和过滤按钮 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: '100',
              color: C.t1,
              letterSpacing: -0.5,
            }}
          >
            客户
          </Text>
          <Pressable
            onPress={() => hapticLight()}
          >
            <Filter size={22} color={C.t1} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* AI 总结栏 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.bgGlass,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 16,
          }}
        >
          <MotiView
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: C.amber,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              color: C.t2,
              flex: 1,
            }}
          >
            今日跟进 3 · 高意向 1 · 待回复 2
          </Text>
        </View>

        {/* 过滤选项 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTER_OPTIONS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                setActiveFilter(filter);
                hapticLight();
              }}
            >
              <MotiView
                animate={{
                  backgroundColor:
                    activeFilter === filter
                      ? C.t1
                      : C.bgGlass,
                  borderColor:
                    activeFilter === filter
                      ? C.t1
                      : C.border,
                }}
                transition={SPRING_GENTLE}
              >
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color:
                        activeFilter === filter
                          ? C.bg
                          : C.t2,
                    }}
                  >
                    {filter}
                  </Text>
                </View>
              </MotiView>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 客户列表 */}
      <FlatList
        data={CUSTOMERS}
        renderItem={renderCustomerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        scrollEnabled
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}
