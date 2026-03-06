/**
 * Commander AI Service — 深化版
 * A. 精准意图识别：12 个外贸场景分类 + 实体参数提取（买家名/市场/产品/渠道）
 * B. 方案修改对话：识别修改意图，返回修订后的 plan
 */

export type DecisionType =
  | 'lead_followup'      // 买家跟进
  | 'lead_outreach'      // 主动开发新买家
  | 'market_scan'        // 市场扫描
  | 'market_report'      // 市场报告
  | 'content_catalog'    // 图册/内容优化
  | 'content_post'       // 社媒内容生成
  | 'quote_generate'     // 报价单生成
  | 'inquiry_reply'      // 询盘回复
  | 'strategy'           // 业务策略
  | 'competitor'         // 竞品分析
  | 'alert'              // 紧急事项
  | 'general';           // 通用对话

/** 从指令中提取的实体参数 */
export interface IntentEntities {
  buyerName?: string;      // 买家姓名（如 Ahmed Al-Rashid）
  market?: string;         // 目标市场（如 沙特、巴西）
  product?: string;        // 产品（如 不锈钢管材）
  channel?: string;        // 沟通渠道（如 WhatsApp、邮件、LinkedIn）
  urgency?: 'low' | 'medium' | 'high';
}

export interface AIPlan {
  reply: string;
  hasPlan: boolean;
  plan?: {
    id: string;
    type: DecisionType;
    title: string;
    suggestedAction: string;
    agentId: string;
    agentName: string;
    estimatedValue?: string;
    estimatedTime?: string;
    reasoning: string;
    entities: IntentEntities;   // 提取的实体，用于方案修改时的上下文
    channel?: string;           // 执行渠道（WhatsApp/邮件/LinkedIn）
  };
  /** 是否为修改指令（B 功能） */
  isRevision?: boolean;
  /** 修改了哪个字段 */
  revisedField?: 'channel' | 'agent' | 'action' | 'title';
}

// ─── Agent 映射 ───────────────────────────────────────────────

const AGENT_MAP: Record<DecisionType, { agentId: string; agentName: string }> = {
  lead_followup:  { agentId: '3', agentName: 'Echo · 客服专员' },
  lead_outreach:  { agentId: '3', agentName: 'Echo · 客服专员' },
  market_scan:    { agentId: '1', agentName: 'Scout · 市场猎手' },
  market_report:  { agentId: '1', agentName: 'Scout · 市场猎手' },
  content_catalog:{ agentId: '4', agentName: 'Muse · 内容创作' },
  content_post:   { agentId: '4', agentName: 'Muse · 内容创作' },
  quote_generate: { agentId: '2', agentName: 'Sage · 策略顾问' },
  inquiry_reply:  { agentId: '3', agentName: 'Echo · 客服专员' },
  strategy:       { agentId: '2', agentName: 'Sage · 策略顾问' },
  competitor:     { agentId: '1', agentName: 'Scout · 市场猎手' },
  alert:          { agentId: '2', agentName: 'Sage · 策略顾问' },
  general:        { agentId: '2', agentName: 'Sage · 策略顾问' },
};

// ─── System Prompt ────────────────────────────────────────────

const SYSTEM_PROMPT = `你是 Commander AI，专为中国外贸企业老板服务的 AI 业务指挥官。

你的数字员工团队：
- Scout（市场猎手，ID:1）：市场扫描、商机挖掘、海关数据、竞品分析
- Echo（客服专员，ID:3）：买家跟进、询盘回复、WhatsApp/邮件/LinkedIn 沟通
- Muse（内容创作，ID:4）：产品图册、营销内容、社媒帖子、多语言文案
- Sage（策略顾问，ID:2）：业务策略、报价单、流程优化

工作模式：Plan 模式（老板确认后才执行）

支持的意图类型：
- lead_followup: 跟进已有买家
- lead_outreach: 开发新买家
- market_scan: 扫描市场机会
- market_report: 生成市场报告
- content_catalog: 优化产品图册
- content_post: 生成社媒内容
- quote_generate: 生成报价单
- inquiry_reply: 回复询盘
- strategy: 制定业务策略
- competitor: 竞品分析
- alert: 紧急事项处理
- general: 通用对话（无任务）

【重要】识别修改指令：
当老板说"改成邮件"、"换成 LinkedIn"、"改用 Sage"、"换个渠道"等修改性语句时，
isRevision 设为 true，revisedField 设为对应字段（channel/agent/action/title）。

请始终以 JSON 格式回复：
{
  "reply": "简洁有力的分析（2-3句，外贸老板视角）",
  "hasPlan": true/false,
  "isRevision": false,
  "revisedField": null,
  "plan": {
    "type": "意图类型",
    "title": "任务标题（简短，动词开头）",
    "suggestedAction": "具体执行动作",
    "channel": "WhatsApp|邮件|LinkedIn|报告|图册|null",
    "estimatedValue": "预估价值（可选）",
    "estimatedTime": "预估时间（可选）",
    "reasoning": "推荐理由（1句）",
    "entities": {
      "buyerName": "买家姓名（如有）",
      "market": "目标市场（如有）",
      "product": "产品（如有）",
      "channel": "渠道（如有）",
      "urgency": "low|medium|high"
    }
  }
}`;

// ─── 主调用函数 ───────────────────────────────────────────────

export async function callCommanderAI(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  currentPlan?: AIPlan['plan'],  // 当前 ActionCard 的方案（用于修改场景）
): Promise<AIPlan> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return getMockResponse(userMessage, currentPlan);
  }

  try {
    // 如果有当前方案，将其作为上下文注入
    const contextNote = currentPlan
      ? `\n\n【当前待确认方案】\n类型: ${currentPlan.type}\n标题: ${currentPlan.title}\n动作: ${currentPlan.suggestedAction}\n渠道: ${currentPlan.channel ?? '未指定'}\n员工: ${currentPlan.agentName}`
      : '';

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT + contextNote },
      ...conversationHistory.slice(-8),
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
        temperature: 0.6,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const raw = JSON.parse(data.choices[0].message.content) as AIPlan;

    if (raw.hasPlan && raw.plan) {
      const agent = AGENT_MAP[raw.plan.type as DecisionType] ?? AGENT_MAP.general;
      raw.plan = {
        ...raw.plan,
        id: `plan-${Date.now()}`,
        agentId: agent.agentId,
        agentName: agent.agentName,
        entities: raw.plan.entities ?? {},
      };
    }

    return raw;
  } catch (err) {
    console.error('Commander AI error:', err);
    return getMockResponse(userMessage, currentPlan);
  }
}

// ─── 智能 Mock 响应 ───────────────────────────────────────────

function getMockResponse(input: string, currentPlan?: AIPlan['plan']): AIPlan {
  const lower = input.toLowerCase();

  // ── B. 修改指令识别 ──────────────────────────────────────────
  if (currentPlan) {
    // 渠道修改
    if (lower.includes('邮件') || lower.includes('email')) {
      return {
        reply: '已将沟通渠道从 WhatsApp 改为邮件。邮件更正式，适合首次建立书面记录，Echo 将发送专业的开场邮件。',
        hasPlan: true,
        isRevision: true,
        revisedField: 'channel',
        plan: {
          ...currentPlan,
          id: `plan-${Date.now()}`,
          channel: '邮件',
          suggestedAction: currentPlan.suggestedAction.replace('WhatsApp', '邮件').replace('开场白', '开场邮件'),
          reasoning: '邮件更正式，适合建立书面沟通记录，提升专业形象。',
        },
      };
    }
    if (lower.includes('linkedin') || lower.includes('领英')) {
      return {
        reply: '已切换到 LinkedIn。这位买家是采购总监，LinkedIn 触达更专业，也方便查看其公司背景。',
        hasPlan: true,
        isRevision: true,
        revisedField: 'channel',
        plan: {
          ...currentPlan,
          id: `plan-${Date.now()}`,
          channel: 'LinkedIn',
          suggestedAction: currentPlan.suggestedAction.replace('WhatsApp', 'LinkedIn').replace('邮件', 'LinkedIn'),
          reasoning: 'LinkedIn 适合 B2B 高层触达，可同时建立专业人脉。',
        },
      };
    }
    if (lower.includes('whatsapp') || lower.includes('微信') || lower.includes('即时')) {
      return {
        reply: '已改回 WhatsApp。即时通讯响应更快，适合当前的决策窗口期，Echo 将发送简短有力的开场白。',
        hasPlan: true,
        isRevision: true,
        revisedField: 'channel',
        plan: {
          ...currentPlan,
          id: `plan-${Date.now()}`,
          channel: 'WhatsApp',
          suggestedAction: currentPlan.suggestedAction.replace('邮件', 'WhatsApp 开场白').replace('LinkedIn', 'WhatsApp 开场白'),
          reasoning: '决策窗口期内即时触达成单概率最高。',
        },
      };
    }
    // 员工修改
    if (lower.includes('sage') || lower.includes('策略') || lower.includes('顾问')) {
      return {
        reply: '已将执行员工从 Echo 改为 Sage。Sage 擅长策略性沟通，更适合高价值客户的首次触达。',
        hasPlan: true,
        isRevision: true,
        revisedField: 'agent',
        plan: { ...currentPlan, id: `plan-${Date.now()}`, agentId: '2', agentName: 'Sage · 策略顾问' },
      };
    }
    if (lower.includes('scout') || lower.includes('市场') || lower.includes('猎手')) {
      return {
        reply: '已切换到 Scout。Scout 可以在联系前先深度调研该买家的采购历史，让触达更有针对性。',
        hasPlan: true,
        isRevision: true,
        revisedField: 'agent',
        plan: { ...currentPlan, id: `plan-${Date.now()}`, agentId: '1', agentName: 'Scout · 市场猎手' },
      };
    }
  }

  // ── A. 精准意图识别 ──────────────────────────────────────────

  // 买家跟进（含买家名提取）
  const buyerMatch = input.match(/(?:跟进|联系|触达|开发)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z-]+)*)/);
  const buyerName = buyerMatch?.[1];

  if (lower.includes('跟进') || lower.includes('联系买家') || lower.includes('回复买家')) {
    const name = buyerName ?? 'Ahmed Al-Rashid';
    return {
      reply: `检测到买家跟进指令。${name} 上次浏览您的产品页停留 8 分钟，当前处于决策窗口期，建议通过 WhatsApp 即时触达，成单概率最高。`,
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'lead_followup',
        title: `跟进买家 ${name}`,
        suggestedAction: `发送个性化 WhatsApp 开场白给 ${name}`,
        channel: 'WhatsApp',
        agentId: '3', agentName: 'Echo · 客服专员',
        estimatedValue: '$25,000',
        estimatedTime: '30 分钟',
        reasoning: '买家行为数据显示其处于决策期，即时触达成单概率最高。',
        entities: { buyerName: name, channel: 'WhatsApp', urgency: 'high' },
      },
    };
  }

  // 开发新买家
  if (lower.includes('开发') || lower.includes('新客户') || lower.includes('找买家') || lower.includes('寻源')) {
    const market = extractMarket(lower);
    return {
      reply: `收到开发新买家指令。${market ? `${market}市场` : '目标市场'}近期采购信号活跃，Scout 可从海关数据中筛选出高匹配度的潜在买家名单。`,
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'lead_outreach',
        title: `开发${market ? market : ''}新买家`,
        suggestedAction: `筛选${market ? market : '目标市场'}高意向采购商名单并发送开场邮件`,
        channel: '邮件',
        agentId: '1', agentName: 'Scout · 市场猎手',
        estimatedValue: '$30,000+',
        estimatedTime: '2 小时',
        reasoning: '海关数据 + 行为分析双重筛选，确保触达精准度。',
        entities: { market: market ?? undefined, channel: '邮件', urgency: 'medium' },
      },
    };
  }

  // 市场扫描
  if (lower.includes('扫描') || lower.includes('市场机会') || lower.includes('商机')) {
    const market = extractMarket(lower);
    return {
      reply: `正在分析${market ? market : '全球'}市场数据。${market === '沙特' ? '沙特基建预算增加 15%，工业管材需求旺盛，' : ''}已识别出多个高价值采购机会。`,
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'market_scan',
        title: `扫描${market ? market : '全球'}市场机会`,
        suggestedAction: `生成《${market ?? '全球'}市场机会报告》并识别高意向采购商`,
        channel: '报告',
        agentId: '1', agentName: 'Scout · 市场猎手',
        estimatedValue: '$48,000',
        estimatedTime: '1 小时',
        reasoning: `${market ? market + '市场' : '目标市场'}采购信号强烈，现在进入时机最佳。`,
        entities: { market: market ?? undefined, urgency: 'high' },
      },
    };
  }

  // 询盘回复
  if (lower.includes('询盘') || lower.includes('回复') || lower.includes('inq')) {
    return {
      reply: '检测到询盘回复需求。Echo 将分析买家背景，生成个性化的专业回复，包含产品规格、价格区间和交货周期。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'inquiry_reply',
        title: '回复高意向询盘',
        suggestedAction: '生成个性化询盘回复（含规格/报价/交货期）',
        channel: '邮件',
        agentId: '3', agentName: 'Echo · 客服专员',
        estimatedTime: '20 分钟',
        reasoning: '专业及时的回复可将询盘转化率提升 40%。',
        entities: { channel: '邮件', urgency: 'high' },
      },
    };
  }

  // 报价单
  if (lower.includes('报价') || lower.includes('quote') || lower.includes('价格')) {
    const buyerN = buyerName ?? '买家';
    return {
      reply: `收到报价指令。Sage 将根据当前原材料价格、运费和市场行情，为${buyerN}生成一份有竞争力的报价单。`,
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'quote_generate',
        title: `为${buyerN}生成报价单`,
        suggestedAction: `生成专业报价单（含 FOB/CIF 条款）`,
        channel: '邮件',
        agentId: '2', agentName: 'Sage · 策略顾问',
        estimatedTime: '15 分钟',
        reasoning: '实时市场价格 + 专业条款，提升报价专业度和成单率。',
        entities: { buyerName: buyerN !== '买家' ? buyerN : undefined, channel: '邮件', urgency: 'medium' },
      },
    };
  }

  // 图册/内容优化
  if (lower.includes('图册') || lower.includes('内容') || lower.includes('海报') || lower.includes('优化') || lower.includes('视觉')) {
    const market = extractMarket(lower);
    return {
      reply: `当前产品图册在${market ? market : '中东'}市场点击率 2.3%，低于行业均值 4.8%。Muse 将重新生成符合当地审美的视觉风格，预计点击率提升 2.1 倍。`,
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'content_catalog',
        title: `重新生成${market ? market : '中东'}风格产品图册`,
        suggestedAction: `生成${market ?? '中东'}「沙漠奢华风」产品图册`,
        channel: '图册',
        agentId: '4', agentName: 'Muse · 内容创作',
        estimatedTime: '45 分钟',
        reasoning: '200+ 买家行为数据显示本地化视觉可显著提升点击率。',
        entities: { market: market ?? '中东', urgency: 'medium' },
      },
    };
  }

  // 竞品分析
  if (lower.includes('竞品') || lower.includes('竞争对手') || lower.includes('对标')) {
    return {
      reply: '收到竞品分析指令。Scout 将从多个数据源抓取竞争对手的产品定价、市场份额和客户评价，生成对标分析报告。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'competitor',
        title: '竞品深度分析报告',
        suggestedAction: '生成竞品对标分析报告（定价/市场份额/客户评价）',
        channel: '报告',
        agentId: '1', agentName: 'Scout · 市场猎手',
        estimatedTime: '1.5 小时',
        reasoning: '了解竞争格局是制定差异化策略的前提。',
        entities: { urgency: 'low' },
      },
    };
  }

  // 策略
  if (lower.includes('策略') || lower.includes('方案') || lower.includes('计划') || lower.includes('建议')) {
    return {
      reply: '收到策略制定指令。Sage 将结合当前市场数据和您的产品优势，制定一份可落地的业务拓展方案。',
      hasPlan: true,
      plan: {
        id: `plan-${Date.now()}`,
        type: 'strategy',
        title: '制定业务拓展策略方案',
        suggestedAction: '生成 Q2 业务拓展策略报告（含优先市场和行动计划）',
        channel: '报告',
        agentId: '2', agentName: 'Sage · 策略顾问',
        estimatedTime: '2 小时',
        reasoning: '系统性策略可将资源集中在 ROI 最高的方向。',
        entities: { urgency: 'low' },
      },
    };
  }

  // 通用回复
  return {
    reply: '我已收到您的指令。请告诉我更多细节，例如目标市场、买家名称或具体需求，我可以为您制定更精准的执行方案。',
    hasPlan: false,
  };
}

// ─── 工具函数 ─────────────────────────────────────────────────

function extractMarket(text: string): string | null {
  const markets: Record<string, string> = {
    '沙特': '沙特', '沙特阿拉伯': '沙特', 'saudi': '沙特',
    '巴西': '巴西', 'brazil': '巴西',
    '东南亚': '东南亚', '越南': '越南', '印尼': '印尼', '泰国': '泰国',
    '中东': '中东', '阿联酋': '阿联酋', '迪拜': '迪拜',
    '欧洲': '欧洲', '德国': '德国', '法国': '法国',
    '美国': '美国', '北美': '北美',
    '非洲': '非洲', '印度': '印度',
  };
  for (const [key, val] of Object.entries(markets)) {
    if (text.includes(key)) return val;
  }
  return null;
}
