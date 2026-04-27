import type { Platform } from "@/lib/types";

export interface Competitor {
  id: string;
  name: string;
  url: string;
  platforms: Platform[];
  notes: string;
  createdAt: string;
}

export interface SamplePost {
  platform: Platform;
  text: string;
  /** Локальная оценка или диапазон, например "1–3k" */
  estimatedReach: string;
  /** Напр. "3.2%" или "высокая" */
  engagement: string;
  hooks?: string[];
}

export interface CompetitorInsight {
  title: string;
  detail: string;
}

export interface CompetitorAnalysis {
  competitorId: string;
  competitorName: string;
  analyzedAt: string;
  tone: string;
  postingFrequency: string;
  targetAudience: string;
  positioning: string;
  valueProposition: string;
  contentMix: {
    promo: number;
    educational: number;
    entertaining: number;
    news: number;
  };
  /** Оценка 1–10 насколько сильна SMM-подача (эвристика модели) */
  smmMaturityScore?: number;
  strengths: string[];
  weaknesses: string[];
  contentGaps: string[];
  topHashtags: string[];
  samplePosts: SamplePost[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  differentiationOpportunities: string[];
  /** SWOT — кратко, по делу */
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  /** Ключевые инсайты в 2–4 буллетах */
  keyInsights?: CompetitorInsight[];
}

export interface CompetitorComparisonReport {
  generatedAt: string;
  overallInsights: string;
  marketSnapshot?: string;
  quickWins: string[];
  strategicRecommendations: string[];
  riskWatchlist?: string[];
  competitors: CompetitorAnalysis[];
}
