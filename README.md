# 🚀 Autopilot CMO — AI-директор по маркетингу

Полноценный SaaS на Next.js 14 для автоматической генерации, планирования и публикации контента с помощью **Gemini 2.5 Flash-Lite**.

**Репозиторий:** [github.com/Alexnikolaev1/autopilot_cmo_](https://github.com/Alexnikolaev1/autopilot_cmo_) · **Демо (Vercel):** [autopilotcmo-psi.vercel.app](https://autopilotcmo-psi.vercel.app)

## ✦ Возможности

- **Генератор контент-планов** — недельные планы для ВКонтакте, Одноклассников и MAX
- **Генератор постов** — готовые тексты с хештегами и рекомендациями
- **Планировщик публикаций** — контент-календарь с расписанием
- **AI-аналитика** — еженедельные отчёты с выводами и рекомендациями
- **Тёмная премиум-тема** — профессиональный интерфейс

## 🛠 Стек

| Технология | Назначение |
|---|---|
| Next.js 14 (App Router) | Фреймворк |
| TypeScript | Типизация |
| Tailwind CSS | Стили |
| Vercel AI SDK | Стриминг AI-ответов |
| @ai-sdk/google | Gemini интеграция |
| Zod | Валидация данных |
| Sonner | Toast-уведомления |
| Recharts | Графики аналитики |
| @upstash/redis (опц.) | Rate limit, idempotency, метрики между serverless-инстансами |

## 🚀 Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Alexnikolaev1/autopilot_cmo_.git
cd autopilot_cmo_
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить переменные окружения

```bash
cp .env.local.example .env.local
```

Откройте `.env.local` и добавьте ваш Gemini API ключ:

```env
GEMINI_API_KEY=ваш_ключ_здесь
SESSION_SECRET=любая_случайная_строка_32_символа
```

Получить Gemini API Key: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 4. Запустить в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📦 Деплой на Vercel

```bash
npm install -g vercel
vercel
```

### Обязательные переменные

- `GEMINI_API_KEY`
- `SESSION_SECRET` (строка ≥ 32 символов; без неё сессия и шифрование cookie не стартуют)
- `OK_SECRET_KEY` — если пользуетесь Одноклассниками

### Рекомендуется для production (много инстансов / корректный rate limit)

Подключите **Upstash Redis** из [Vercel Marketplace (Storage / Redis)](https://vercel.com/marketplace?category=storage&search=redis) к проекту. Поддерживаются варианты env: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, либо legacy `KV_*`, либо только `REDIS_URL`. Тогда **rate limit**, **идемпотентность** публикаций и **счётчики метрик** согласованы **между всеми инстансами**.

### Проверка сборки локально (как на Vercel)

```bash
npm install
npm run build
```

## 📁 Структура проекта

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Стриминг чат с Gemini
│   │   ├── publish/       # Публикация постов (mock)
│   │   └── generate-plan/ # Генерация контент-плана
│   ├── dashboard/
│   │   ├── new-project/   # Генератор контента
│   │   └── analytics/     # Аналитика + AI-отчёты
│   ├── login/             # Авторизация через API Key
│   ├── onboarding/        # Онбординг (3 шага)
│   ├── projects/          # Список проектов
│   └── settings/          # Настройки
├── components/
│   ├── ui/                # Button, Card, Input, Modal...
│   ├── layout/            # Sidebar
│   ├── dashboard/         # StatsCard
│   ├── content/           # PlanPreview
│   └── analytics/         # PerformanceChart
└── lib/
    ├── ai/                # Gemini клиент + инструменты
    ├── auth.ts            # Server Actions авторизации
    ├── get-session.ts     # Получение сессии
    ├── scheduler.ts       # Планировщик публикаций
    ├── mock-data.ts       # Демо-данные
    └── types.ts           # TypeScript типы
```

## 🔒 Безопасность

- API ключ хранится в httpOnly cookie (AES-256-GCM)
- Middleware защищает все приватные роуты
- Zod валидация всех входящих данных
- Социальные токены и сессия шифруются (AES-256-GCM)
- `POST /api/publish` поддерживает идемпотентность (`x-idempotency-key`)
- API защищено базовым rate limit на пользователя

## 🗺 Roadmap

- [ ] Подключение реальных API платформ (Meta, Twitter, LinkedIn)
- [ ] База данных (PostgreSQL / Vercel KV)
- [ ] Vercel Cron Jobs для автопубликации
- [ ] Загрузка изображений через Vercel Blob
- [ ] Мультиязычность
- [ ] Командная работа (multi-user)

## 📄 Лицензия

MIT
