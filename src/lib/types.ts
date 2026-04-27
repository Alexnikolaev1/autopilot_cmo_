export interface Session {
  userId: string;
  geminiApiKey: string;
}

export type Platform =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "vk"
  | "ok"
  | "max";

export const ALL_PLATFORMS = [
  "linkedin",
  "twitter",
  "instagram",
  "vk",
  "ok",
  "max",
] as const satisfies readonly Platform[];

export const SOCIAL_PLATFORMS = ["vk", "ok", "max"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type Tone =
  | "professional"
  | "humorous"
  | "inspirational"
  | "warm"
  | "casual";

export interface GeneratedPost {
  id: string;
  platform: Platform;
  text: string;
  hashtags: string[];
  bestTime: string;
  status: "draft" | "approved" | "scheduled" | "published";
  scheduledAt?: string;
  platformPostId?: string;
}

export interface ContentPlan {
  id: string;
  title: string;
  businessDescription: string;
  targetAudience: string;
  tone: Tone;
  platforms: Platform[];
  posts: GeneratedPost[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  businessType: string;
  plan?: ContentPlan;
  createdAt: string;
  status: "active" | "paused" | "completed";
}

export interface AnalyticsData {
  reach: number[];
  likes: number;
  comments: number;
  reposts: number;
  engagementRate: number;
  labels: string[];
}

export interface SocialCredentials {
  vk?: {
    accessToken: string;
    groupId: string;
    groupName: string;
  };
  ok?: {
    accessToken: string;
    applicationKey: string;
    groupId: string;
    groupName: string;
  };
  max?: {
    accessToken: string;
    channelId: string;
    channelName: string;
  };
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  url?: string;
  error?: string;
}

export const PLATFORM_META: Record<
  Platform,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    maxLength: number;
    hashtagStyle: "inline" | "block";
    description: string;
    audience: string;
  }
> = {
  vk: {
    label: "ВКонтакте",
    shortLabel: "ВК",
    color: "#4C75A3",
    bgColor: "rgba(76,117,163,0.12)",
    maxLength: 16000,
    hashtagStyle: "inline",
    description: "Крупнейшая соцсеть России",
    audience: "18-45 лет, вся Россия",
  },
  ok: {
    label: "Одноклассники",
    shortLabel: "ОК",
    color: "#F5820D",
    bgColor: "rgba(245,130,13,0.12)",
    maxLength: 40000,
    hashtagStyle: "block",
    description: "Массовая аудитория регионов",
    audience: "35-60 лет, регионы РФ",
  },
  max: {
    label: "MAX (Mail.ru)",
    shortLabel: "MAX",
    color: "#005FF9",
    bgColor: "rgba(0,95,249,0.12)",
    maxLength: 4096,
    hashtagStyle: "block",
    description: "Мессенджер-соцсеть Mail.ru",
    audience: "25-45 лет, активные пользователи",
  },
  instagram: {
    label: "Instagram",
    shortLabel: "IG",
    color: "#E1306C",
    bgColor: "rgba(225,48,108,0.12)",
    maxLength: 2200,
    hashtagStyle: "block",
    description: "Визуальный контент и сторис",
    audience: "18-35 лет, городская молодёжь",
  },
  twitter: {
    label: "Twitter / X",
    shortLabel: "TW",
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.12)",
    maxLength: 280,
    hashtagStyle: "inline",
    description: "Короткие посты и тренды",
    audience: "20-40 лет, IT и медиа",
  },
  linkedin: {
    label: "LinkedIn",
    shortLabel: "LI",
    color: "#38bdf8",
    bgColor: "rgba(56,189,248,0.12)",
    maxLength: 3000,
    hashtagStyle: "block",
    description: "B2B и профессионалы",
    audience: "25-50 лет, бизнес-аудитория",
  },
};
