# Деплой фронтенда и бэкенда

Репозиторий — монорепозиторий (`apps/web`, `apps/api`). Фронт и API деплоятся **отдельными проектами**; сначала поднимите API и получите его публичный URL, затем пропишите его во фронте.

---

## 1. Общий порядок

1. Развернуть **бэкенд** (Vercel или Render) и дождаться успешного деплоя.
2. Скопировать URL API (например `https://dmr-api.vercel.app` или `https://dmr-api.onrender.com`).
3. Развернуть **фронт** на Vercel с переменной **`VITE_API_URL`** = этот URL (без `/` в конце).
4. В настройках API указать **`FRONTEND_URL`** = URL фронта на Vercel (для CORS).
5. При необходимости пересобрать фронт после смены env.

---

## 2. Бэкенд (NestJS + Prisma)

### Вариант A — Vercel (второй проект)

Подходит, если устраивает serverless (лимиты времени/размера, холодные старты). Локальные **`/uploads`** на диске в проде не для постоянного хранения файлов.

1. [Vercel](https://vercel.com) → **Add New** → **Project** → импорт репозитория.
2. **Root Directory:** `apps/api` (важно).
3. **Framework Preset:** Vercel должен определить NestJS; Build/Output оставляйте по умолчанию, если не ругается.
4. **Environment Variables** (минимум):

   | Переменная        | Описание |
   |-------------------|----------|
   | `DATABASE_URL`    | PostgreSQL (лучше **pooler**, например Supabase *Session mode* / pooler URL для serverless). |
   | `JWT_SECRET`      | Случайная длинная строка. |
   | `FRONTEND_URL`    | URL фронта, например `https://your-app.vercel.app`. |
   | `ADMIN_URL`       | Обычно тот же URL, что и фронт (если админка на том же домене). |

   Опционально: `TRANSLATE_PROVIDER`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`.

5. **Миграции БД:** один раз выполните миграции к этой же `DATABASE_URL` (локально или в CI):

   ```bash
   cd apps/api && npx prisma migrate deploy
   ```

   Либо добавьте шаг в Post-Deploy, если платформа позволяет.

6. **Deploy.** Скопируйте домен проекта (например `https://xxx.vercel.app`).

### Вариант B — Render (классический Node-процесс)

В корне репозитория есть `render.yaml` (Blueprint).

1. [Render](https://render.com) → **New** → **Blueprint** → подключить репозиторий.
2. В сервисе в **Environment** задать те же переменные, что и выше (и при необходимости остальные).
3. Деплой сам выполнит `prisma migrate deploy` перед стартом (см. `render.yaml`).

---

## 3. Фронтенд (Vite + React) на Vercel

1. **New Project** → тот же репозиторий.
2. **Root Directory:** `apps/web`.
3. В корне `apps/web` уже есть `vercel.json` (сборка `npm run build`, вывод `dist`, SPA rewrites). Build/Output в UI можно не переопределять.
4. **Environment Variables:**

   | Переменная | Описание |
   |------------|----------|
   | `VITE_API_URL` | Полный URL API, например `https://dmr-api.vercel.app` — **без** завершающего `/`. |
   | `VITE_TELEGRAM_BOT_USERNAME` | Опционально, имя бота без `@` для ссылок в админке. |

5. **Deploy.** После смены `VITE_*` нужен **новый деплой** (переменные вшиваются на этапе сборки).

---

## 4. Проверка

- Откройте фронт по URL Vercel, зайдите в админку / публичное меню.
- Если запросы к API падают с CORS или 401 — проверьте `FRONTEND_URL` на бэкенде и `VITE_API_URL` на фронте.
- Swagger: `https://<ваш-api-домен>/api` (если включён в `main.ts`).

---

## 5. Локальный `.env` (напоминание)

Секреты из репозитория не коммитьте. В Vercel/Render задавайте переменные только в панели (Production / Preview).
