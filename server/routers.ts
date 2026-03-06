import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

// ─── AI Router ────────────────────────────────────────────────
const aiRouter = router({
  /**
   * 分析询盘意向并生成回复草稿
   */
  analyzeInquiry: publicProcedure
    .input(
      z.object({
        buyerName: z.string(),
        company: z.string(),
        country: z.string(),
        product: z.string(),
        message: z.string(),
        companyProfile: z.string().optional().default("中国外贸工厂，主营不锈钢餐具和LED工矿灯"),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are an expert foreign trade AI assistant for a Chinese manufacturer.
Your job is to:
1. Analyze the buyer's inquiry intent (high/medium/low)
2. Generate a professional English reply email
3. Provide a brief buyer analysis in Chinese

Company Profile: ${input.companyProfile}

Return JSON with:
{
  "intentLevel": "high" | "medium" | "low",
  "confidence": number (0-100),
  "analysis": "Chinese analysis of buyer intent",
  "draftReply": "Professional English email reply"
}`;

      const userPrompt = `Buyer: ${input.buyerName} from ${input.company}, ${input.country}
Product: ${input.product}
Message: ${input.message}

Analyze and generate reply.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content as string;
        const result = JSON.parse(content);
        return {
          success: true,
          intentLevel: result.intentLevel ?? "medium",
          confidence: result.confidence ?? 75,
          analysis: result.analysis ?? "AI 分析完成",
          draftReply: result.draftReply ?? "Draft reply generated.",
        };
      } catch (err) {
        return {
          success: false,
          intentLevel: "medium" as const,
          confidence: 70,
          analysis: "AI 分析暂时不可用，请稍后重试",
          draftReply: `Dear ${input.buyerName},\n\nThank you for your inquiry about ${input.product}. We would be happy to provide you with more information.\n\nBest regards,\nSales Team`,
        };
      }
    }),

  /**
   * 解构产品文档，生成知识节点
   */
  extractProductKnowledge: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        content: z.string().optional().default(""),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are an expert at analyzing factory product documents and extracting structured knowledge for B2B export marketing.

Extract product knowledge and return JSON:
{
  "productName": "string",
  "category": "string",
  "summary": "string (2-3 sentences in Chinese)",
  "tags": [{"label": "string", "category": "material|application|advantage|market|buyer"}],
  "targetMarkets": ["country1", "country2"],
  "competitiveEdge": "string in Chinese",
  "buyerPersona": "string in Chinese",
  "matchScore": number (60-99)
}`;

      const userPrompt = `File: ${input.fileName} (${input.fileType})
${input.content ? `Content preview: ${input.content.slice(0, 500)}` : "Extract based on filename."}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content as string;
        const result = JSON.parse(content);
        return { success: true, ...result };
      } catch (err) {
        return {
          success: false,
          productName: input.fileName.replace(/\.[^.]+$/, ""),
          category: "产品",
          summary: "AI 正在解析产品信息...",
          tags: [],
          targetMarkets: [],
          competitiveEdge: "解析中",
          buyerPersona: "解析中",
          matchScore: 75,
        };
      }
    }),

  /**
   * Commander AI 聊天接口 — 支持多轮对话 + 方案生成
   */
  commanderChat: publicProcedure
    .input(
      z.object({
        userMessage: z.string(),
        conversationHistory: z.array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
          })
        ).optional().default([]),
        currentPlan: z.object({
          type: z.string(),
          title: z.string(),
          suggestedAction: z.string(),
          channel: z.string().optional(),
          agentName: z.string(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const SYSTEM_PROMPT = `你是 Commander，一个专为中国外贸工厂老板设计的 AI 战略指挥官。
你的核心能力：
1. 精准识别外贸业务意图（买家跟进/市场开拓/内容优化/报价生成等）
2. 生成可执行的业务方案，分配给合适的 AI 员工
3. 支持方案修改（渠道/员工/动作调整）

可用 AI 员工：
- Scout（市场猎手）：市场扫描、情报分析
- Sage（策略顾问）：业务策略、竞品分析
- Echo（客服专员）：买家跟进、询盘回复
- Muse（内容创作）：图册生成、社媒内容
- Rex（开发猎手）：主动开发新买家

当前公司：KABEQ 卡贝奇，广东佛山家具厂，主营沙发/家居软装，主要市场：中东/俄罗斯/东南亚。

始终用中文回复。如果用户的指令可以转化为可执行方案，返回 hasPlan: true 并填写 plan 字段。

返回 JSON 格式：
{
  "reply": "自然语言回复",
  "hasPlan": boolean,
  "plan": {
    "type": "lead_followup|lead_outreach|market_scan|market_report|content_catalog|content_post|quote_generate|inquiry_reply|strategy|competitor|alert|general",
    "title": "方案标题",
    "suggestedAction": "具体执行动作",
    "agentId": "1|2|3|4|5",
    "agentName": "Scout · 市场猎手|Sage · 策略顾问|Echo · 客服专员|Muse · 内容创作|Rex · 开发猎手",
    "estimatedValue": "预估价值（可选）",
    "estimatedTime": "预估时间（可选）",
    "reasoning": "决策依据",
    "channel": "WhatsApp|邮件|LinkedIn（可选）"
  },
  "isRevision": boolean,
  "revisedField": "channel|agent|action|title（可选）"
}`;

      const contextNote = input.currentPlan
        ? `\n\n【当前待确认方案】\n类型: ${input.currentPlan.type}\n标题: ${input.currentPlan.title}\n动作: ${input.currentPlan.suggestedAction}\n渠道: ${input.currentPlan.channel ?? '未指定'}\n员工: ${input.currentPlan.agentName}`
        : '';

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + contextNote },
            ...input.conversationHistory.slice(-8),
            { role: 'user', content: input.userMessage },
          ],
          response_format: { type: 'json_object' },
        });
        const content = response.choices[0].message.content as string;
        const result = JSON.parse(content);
        return { success: true, ...result };
      } catch (err) {
        return {
          success: false,
          reply: '指挥官暂时离线，请稍后重试。',
          hasPlan: false,
        };
      }
    }),
});

// ─── App Router ───────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
