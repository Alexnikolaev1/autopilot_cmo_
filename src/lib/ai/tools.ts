import { tool } from "ai";
import { z } from "zod";
import { ALL_PLATFORMS } from "@/lib/types";

export const tools = {
  generateMarketingPlan: tool({
    description:
      "Generate a structured weekly marketing content plan for a business",
    parameters: z.object({
      businessDescription: z
        .string()
        .describe("Description of the business and its products/services"),
      targetAudience: z
        .string()
        .describe("Description of the target audience"),
      platforms: z
        .array(z.enum(ALL_PLATFORMS))
        .describe("Social media platforms to create content for"),
      tone: z
        .enum(["professional", "humorous", "inspirational", "warm", "casual"])
        .describe("Communication tone for the content"),
      postsPerWeek: z
        .number()
        .min(1)
        .max(21)
        .describe("Number of posts per week"),
    }),
    execute: async ({ businessDescription, targetAudience, platforms, tone, postsPerWeek }) => {
      // This is handled by the AI model itself via streaming
      // Tool definition here for structured output parsing
      return {
        title: `Content Plan for ${businessDescription}`,
        posts: platforms.flatMap((platform) =>
          Array.from({ length: Math.ceil(postsPerWeek / platforms.length) }, (_, i) => ({
            platform,
            text: `[Post ${i + 1} for ${platform}]`,
            hashtags: ["#marketing", "#content"],
            bestTime:
              platform === "instagram"
                ? "18:00-20:00"
                : platform === "vk"
                ? "12:00-14:00"
                : platform === "ok"
                ? "10:00-12:00"
                : platform === "max"
                ? "13:00-15:00"
                : "12:00-14:00",
          }))
        ),
      };
    },
  }),

  generateAdCopy: tool({
    description: "Generate advertising copy with headline, body, and CTA",
    parameters: z.object({
      product: z.string().describe("Product or service being advertised"),
      tone: z
        .enum(["professional", "humorous", "inspirational"])
        .describe("Tone of the ad copy"),
      targetPlatform: z
        .enum(["facebook", "instagram", "google", "vk", "ok", "max"])
        .describe("Platform where the ad will be shown"),
      callToAction: z.string().describe("Desired user action"),
    }),
    execute: async ({ product, tone, callToAction }) => {
      return {
        variants: [
          { headline: `Discover ${product}`, body: "Transform your experience today.", cta: callToAction },
          { headline: `Why ${product}?`, body: "Join thousands of satisfied customers.", cta: callToAction },
          { headline: `${product} — Now Available`, body: "Limited time offer. Don't miss out.", cta: callToAction },
        ],
      };
    },
  }),

  analyseContentPerformance: tool({
    description: "Analyse the performance of published content (mock data for MVP)",
    parameters: z.object({
      postId: z.string().describe("ID of the post to analyse"),
      platform: z
        .enum(ALL_PLATFORMS)
        .describe("Platform of the post"),
    }),
    execute: async ({ postId, platform }) => {
      // Mock analytics data — replace with real API calls in production
      const mockData = {
        postId,
        platform,
        reach: Math.floor(Math.random() * 5000) + 500,
        likes: Math.floor(Math.random() * 300) + 20,
        comments: Math.floor(Math.random() * 50) + 2,
        shares: Math.floor(Math.random() * 30) + 1,
        engagementRate: (Math.random() * 5 + 1).toFixed(2) + "%",
        bestPerformingTime: "18:00-20:00",
        recommendation: "Consider posting more visual content for higher engagement.",
      };
      return mockData;
    },
  }),
};
