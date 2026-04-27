import type { Project, AnalyticsData } from "@/lib/types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: 'Кофейня "Арома"',
    businessType: "HoReCa · Малый бизнес",
    status: "active",
    createdAt: "2024-04-01",
    plan: {
      id: "plan_1",
      title: "Осенний контент-план",
      businessDescription: "Кофейня с авторскими напитками",
      targetAudience: "Молодёжь 20-35, ценители кофе",
      tone: "warm",
      platforms: ["vk", "ok"],
      posts: [
        {
          id: "post_1",
          platform: "vk",
          text: "☕ Утро начинается с нас! Попробуйте новый сезонный латте с карамелью и морской солью. Осень — лучшее время для уюта.",
          hashtags: ["#кофе", "#осень", "#латте", "#уют"],
          bestTime: "09:00",
          status: "approved",
        },
        {
          id: "post_2",
          platform: "ok",
          text: "Октябрь — это кофейный сезон. Загляните к нам за новым осенним меню ☕🍁",
          hashtags: ["#кофе", "#осень", "#кофейня"],
          bestTime: "14:00",
          status: "scheduled",
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        },
      ],
      createdAt: "2024-04-01",
    },
  },
  {
    id: "proj_2",
    name: "IT-консалтинг Nexus",
    businessType: "B2B · Технологии",
    status: "paused",
    createdAt: "2024-04-10",
    plan: {
      id: "plan_2",
      title: "B2B ВК/ОК-стратегия",
      businessDescription: "IT-консалтинговая компания",
      targetAudience: "Руководители и CTO компаний 50-500 чел.",
      tone: "professional",
      platforms: ["ok"],
      posts: [
        {
          id: "post_3",
          platform: "ok",
          text: "Как автоматизация процессов помогает B2B-командам снижать операционные расходы на 35% за квартал...",
          hashtags: ["#b2b", "#automation", "#itconsulting", "#roi"],
          bestTime: "10:00",
          status: "draft",
        },
      ],
      createdAt: "2024-04-10",
    },
  },
];

export const MOCK_ANALYTICS: AnalyticsData = {
  reach: [1200, 980, 1800, 1100, 2300, 3200, 1820],
  likes: 847,
  comments: 134,
  reposts: 89,
  engagementRate: 4.7,
  labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
};

export const STATS = {
  postsGenerated: 47,
  postsScheduled: 18,
  postsPublished: 29,
  engagementRate: 4.7,
};
