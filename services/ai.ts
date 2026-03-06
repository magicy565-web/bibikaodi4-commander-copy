/**
 * Commander AI Service — OpenAI API 接入层
 * Plan 模式：AI 解析意图 → 返回结构化执行方案 → 等待老板确认
 */

export type DecisionType = 'opportunity' | 'lead' | 'content' | 'optimization' | 'alert' | 'general';

export interface AIPlan {
  /** AI 的自然语言分析回复 */
  reply: string;
  /** 是否包含可执行的任务方案 */
  hasPlan: boolean;
  /** 执行方案（Plan 模式下需要老板确认） */
  plan?: {
    id: string;
    type: DecisionType;
    title: string;
    suggestedAction: string;
    agentName: string;
    agentId: string;
    estimatedValue?: string;
    estimatedTime?: string;
    reasoning: string;
  };
}

const AGENT_MAP: Record<DecisionType, { agentId: string; agentName: string }> = {
  opportunity:  { agentId: '1', agentName: 'Scout · 市场猎手' },
  lead:         { agentId: '3', agentName: 'Echo · 客服专员' },
  content:      { agentId: '4', agentName: 'Muse · 内容创作' },
  optimization: { agentId: '2', agentName: 'Sage · 策略顾问' },
  alert:        { agentId: '2', agentName: 'Sage · 策略顾问' },
  general:      { agentId: '2', agentName: 'Sage · 策略顾问' },
};

const SYSTEM_PROMPT = `你是 Commander AI，一位专为中国外贸企业老板服务的 AI 业务指挥官。

你的团队由四位数字员工组成：
- Scout（市场猎手）：负责市场扫描、商机挖掘、海关数据分析
- Echo（客服专员）：负责买家跟进、询盘回复、WhatsApp/邮件沟通
- Muse（内容创作）：负责产品图册、营销内容、多语言文案生成
- Sage（策略顾问）：负责业务策略、流程优化、竞品分析

你的工作模式是 Plan 模式（需要老板确认后才执行）：
1. 理解老板的意图
2. 制定具体的执行方案
3. 推荐最合适的数字员工
4. 等待老板确认后才真正执行

请始终以 JSON 格式回复，结构如下：
{
  "reply": "自然语言分析（2-3句话，简洁有力）",
  "hasPlan": true/false,
  "plan": {
    "type": "opportunity|lead|content|optimization|alert|general",
    "title": "任务标题（简短）",
    "suggestedAction": "具体执行动作（动词开头，如：发送/生成/分析）",
    "estimatedValue": "预估商业价值（如 $25,000，没有则省略）",
    "estimatedTime": "预估完成时间（如 30分钟，没有则省略）",
    "reasoning": "为什么这样做（1句话）"
  }
}

如果老板只是在聊天或问问题，hasPlan 设为 false，plan 字段省略。
如果老板有明确的业务需求，hasPlan 设为 true，并给出完整的 plan。`;

export async function callCommanderAI(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<AIPlan> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  // 如果没有 API Key，返回智能 Mock 响应
  if (!apiKey) {
    return getMockResponse(userMessage);
  }

  try {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-6), // 保留最近 6 条对话上下文
      { role: 'user' as const, content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const raw = JSON.parse(data.choices[0].message.content) as AIPlan;

    // 补充 agentId/agentName
    if (raw.hasPlan && raw.plan) {
      const agent = AGENT_MAP[raw.plan.type] ?? AGENT_MAP.general;
      raw.plan = {
        ...raw.plan,
        id: `plan-${Date.now()}`,
        agentId: agent.agentId,
        agentName: agent.agentName,
      };
    }

    return raw;
  } catch (err) {
    console.error('Commander AI error:', err);
    return getMockResponse(userMessage);
  }
}

// ─── 智能 Mock 响应（无 API Key 时使用）────────────────────────

function getMockResponse(input: string): AIPlan {
  const lower = input.toLowerCase();

  if (lower.includes('沙特') || lower.includes('买家') || lower.includes('跟进') || lower.includes('客户')) {
    return {
      reply: '检测到高意向买家跟进需求。Ahmed Al-Rashid 已浏览您的产品页 3 次，停留时长 8 分钟，当前处于决策窗口期，建议立即行动。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'lead',
        title: '跟进高意向买家 Ahmed Al-Rashid',
        suggestedAction: '发送个性化 WhatsApp 开场白',
        agentId: '3',
        agentName: 'Echo · 客服专员',
        estimatedValue: '$25,000',
        estimatedTime: '30 分钟',
        reasoning: '买家行为数据显示其处于决策期，停留时长是均值的 3.2 倍，立即联系成单概率最高。',
      },
    };
  }

  if (lower.includes('市场') || lower.includes('扫描') || lower.includes('商机') || lower.includes('机会')) {
    return {
      reply: '正在分析全球市场数据。东南亚不锈钢市场近期需求激增，沙特基建预算增加 15%，已识别出 12 家高意向采购商。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'opportunity',
        title: '生成沙特基建市场渗透报告',
        suggestedAction: '生成《沙特基建市场渗透报告》',
        agentId: '1',
        agentName: 'Scout · 市场猎手',
        estimatedValue: '$48,000',
        estimatedTime: '1 小时',
        reasoning: '海关数据显示沙特市场匹配度达 94%，现在进入时机最佳。',
      },
    };
  }

  if (lower.includes('图册') || lower.includes('内容') || lower.includes('海报') || lower.includes('优化')) {
    return {
      reply: '分析您的内容数据：当前产品图册在中东市场点击率 2.3%，低于行业均值 4.8%。调整为「沙漠奢华风」视觉风格后，预计点击率提升 2.1 倍。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'content',
        title: '重新生成中东风格产品图册',
        suggestedAction: '重新生成中东「沙漠奢华风」图册',
        agentId: '4',
        agentName: 'Muse · 内容创作',
        estimatedTime: '45 分钟',
        reasoning: '200+ 中东买家行为数据显示暖色调奢华感可显著提升点击率。',
      },
    };
  }

  if (lower.includes('报告') || lower.includes('分析') || lower.includes('策略')) {
    return {
      reply: '收到，我来为您制定业务策略方案。基于近期数据，建议优先聚焦中东市场的高价值客户群体。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'optimization',
        title: '制定中东市场 Q2 策略方案',
        suggestedAction: '生成中东市场 Q2 业务策略报告',
        agentId: '2',
        agentName: 'Sage · 策略顾问',
        estimatedTime: '2 小时',
        reasoning: '当前中东市场信号最强，集中资源可获得最大 ROI。',
      },
    };
  }

  // 通用回复
  return {
    reply: '我已收到您的指令。目前团队状态：Scout 正在扫描东南亚市场，Echo 正在处理 3 个询盘，Muse 正在生成中东风格内容。有什么具体需要我协调的吗？',
    hasPlan: false,
  };
}
