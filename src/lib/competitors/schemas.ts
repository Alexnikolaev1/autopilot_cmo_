import { z } from "zod";
import { ALL_PLATFORMS } from "@/lib/types";

const platformEnum = z.enum(ALL_PLATFORMS);

const contentMixSchema = z.object({
  promo: z.number().min(0).max(100).default(25),
  educational: z.number().min(0).max(100).default(25),
  entertaining: z.number().min(0).max(100).default(25),
  news: z.number().min(0).max(100).default(25),
});

const recSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

const samplePostSchema = z.object({
  platform: platformEnum,
  text: z.string(),
  estimatedReach: z.string().default("—"),
  engagement: z.string().default("—"),
  hooks: z.array(z.string()).optional().default([]),
});

const swotSchema = z.object({
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  threats: z.array(z.string()).default([]),
});

const insightSchema = z.object({
  title: z.string(),
  detail: z.string(),
});

export const competitorAnalysisJsonSchema = z.object({
  competitorId: z.string(),
  competitorName: z.string(),
  analyzedAt: z.string().optional(),
  tone: z.string().default("—"),
  postingFrequency: z.string().default("—"),
  targetAudience: z.string().default("—"),
  positioning: z.string().default("—"),
  valueProposition: z.string().default("—"),
  contentMix: contentMixSchema,
  smmMaturityScore: z.number().min(1).max(10).optional(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  contentGaps: z.array(z.string()).default([]),
  topHashtags: z.array(z.string()).default([]),
  samplePosts: z.array(samplePostSchema).default([]),
  recommendations: z.array(recSchema).default([]),
  differentiationOpportunities: z.array(z.string()).default([]),
  swot: swotSchema.optional(),
  keyInsights: z.array(insightSchema).default([]),
});

export const comparisonReportJsonSchema = z.object({
  generatedAt: z.string().optional(),
  overallInsights: z.string().default(""),
  marketSnapshot: z.string().optional(),
  quickWins: z.array(z.string()).default([]),
  strategicRecommendations: z.array(z.string()).default([]),
  riskWatchlist: z.array(z.string()).optional(),
  competitors: z.array(competitorAnalysisJsonSchema).default([]),
});
