# DMR — Digital Menu Restaurant

Каталог меню ресторана (временное название продукта).

Монорепозиторий: публичный SPA-каталог меню (mobile-first), админка, NestJS API, Supabase (PostgreSQL).

## Структура

- `apps/api` — NestJS, Prisma, JWT-авторизация, CRUD типов меню / категорий / блюд, публичное API меню, перевод через Gemini.
- `apps/web` — публичный каталог и админка (Vite + React). Архитектура **features + shared**:
  - `src/shared/` — общие компоненты (Layout, LanguageSwitcher), контексты (LocaleContext), API (публичное).
  - `src/features/home/` — главная (выбор типа меню).
  - `src/features/menu/` — страница меню по типу.
  - `src/features/admin/` — админка (логин, CRUD, переводы), доступна по `/admin`.
- `apps/admin` — отдельное приложение не используется; админка встроена в `apps/web`.

## Требования

- Node.js 18+
- Аккаунт Supabase (бесплатный tier) и проект с PostgreSQL
- (Опционально) Google AI Studio — ключ Gemini API для автоперевода

## Настройка

1. Клонировать репозиторий и установить зависимости:

```bash
npm install
```

2. Настроить БД:

- В [Supabase Dashboard](https://supabase.com/dashboard) создать проект.
- В Settings → Database скопировать Connection string (URI).
- В корне репозитория создать `.env` (см. `.env.example`):

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
API_PORT=3000
JWT_SECRET="ваш-секретный-ключ"
GEMINI_API_KEY=""
FRONTEND_URL="http://localhost:5173"
ADMIN_URL="http://localhost:5174"
```

3. Применить миграции и сиды:

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

После сида будут созданы языки (ru, en, kk), типы меню (Основное, Барное, Чайная карта, Винная карта, Детское) и пользователь админки: **admin@demo.local** / **admin123**.

4. Запуск:

```bash
# Терминал 1 — API
npm run dev:api

# Терминал 2 — Публичный каталог
npm run dev:web

# Терминал 3 — Админка
npm run dev:admin
```

- Каталог: http://localhost:5173  
- Админка: http://localhost:5174  
- API: http://localhost:3000  

Для фронтов при другом порте API задайте `VITE_API_URL` (например в `apps/web/.env` и `apps/admin/.env`): `VITE_API_URL=http://localhost:3000`.

В админке войти под admin@demo.local / admin123, заполнить меню на русском и при необходимости нажать «Перевести» для заполнения остальных языков (нужен `GEMINI_API_KEY`).

## Публичное API

- `GET /menu-types?locale=ru` — список типов меню с названиями на выбранном языке.
- `GET /menu?menuTypeId=<id>&locale=ru` или `GET /menu?type=main&locale=ru` — категории и блюда выбранного типа меню.

Ответы кэшируются на бэкенде по ключу (menuTypeId, locale); кэш сбрасывается при изменениях через админку и при переводе.
