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
