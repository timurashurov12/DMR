# Landing Page Redesign — DMR

**Date:** 2026-04-25  
**Status:** Approved  
**Scope:** Full redesign of all landing page sections

---

## Overview

Полный редизайн главной страницы (`/`) для повышения визуальной привлекательности и конверсии. Направление: **гибрид** — тёмный герой со split-layout + светлые секции Features/Pricing ниже.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Общее направление | Гибрид: тёмный герой + светлые секции | Лучший баланс wow-эффекта и объёма переработки |
| Визуал в герое | Телефон с публичным меню | Показывает ценность глазами гостя ресторана |
| Анимации | Лёгкие scroll-анимации (fade-in/slide-up) | Добавляют живость без отвлечения |
| Валюта | Узбекские сумы | Целевой рынок — Узбекистан |
| Тарифы | 0 / 99 000 / 299 000 сум/мес | Утверждено пользователем |

---

## Architecture

Файлы под изменение (все в `apps/web/src/features/landing/`):

```
components/
  Hero.tsx          — полная переработка (split-layout + phone mockup)
  Features.tsx      — светлый фон, новые карточки с hover
  Pricing.tsx       — новые цены в сумах, обновлённый стиль карточек
  Steps.tsx         — обновлённые иконки и соединительная линия
  FAQ.tsx           — обновлённый стиль аккордеона
  CTA.tsx           — новый стиль блока (border + glow)
  Footer.tsx        — без изменений (уже хорошо)
  Nav.tsx           — НОВЫЙ компонент: sticky navbar с blur

pages/
  LandingPage.tsx   — добавить <Nav /> перед <Hero />

index.css           — добавить scroll-animation утилиты
```

---

## Section Specs

### Nav (новый компонент)

- Sticky, `position: sticky; top: 0; z-index: 50`
- Backdrop blur: `backdrop-filter: blur(16px); background: rgba(26,21,16,0.88)`
- Нижняя граница: `border-bottom: 1px solid rgba(201,169,98,0.1)`
- Левая часть: логотип (gold иконка 36×36 + «DMR»)
- Центр: ссылки «Тарифы», «Возможности», «FAQ»
- Правая часть: кнопка «Войти» (outline) + «Начать бесплатно» (gold)

### Hero

- Фон: `#1a1510` + радиальный gradient-glow от золотого (8% opacity) в правом верхнем углу
- Layout: flex row, `min-height: 100vh`, `padding: 0 64px`, `gap: 64px`
- **Левая колонка:**
  - Badge: «14 дней бесплатно — без карты» (gold pill с пульсирующей точкой)
  - Заголовок: 64px, 900 weight, «Цифровое меню / для вашего / [ресторана]» — слово «ресторана» с gold gradient
  - Подзаголовок: 18px, 55% white opacity
  - CTA: «Начать бесплатно →» (gold, shadow-glow) + «Смотреть тарифы» (white outline)
  - Trust-badges: «Без кредитной карты», «Настройка за 5 минут», «Отмена в любой момент» (green checkmarks)
- **Правая колонка:**
  - Phone mockup (220px wide, dark border-radius 36px, inner glow)
  - Экран телефона показывает публичное меню: название ресторана, переключатель языков (РУС активный / ENG / UZB неактивные), список блюд с ценами в сумах
  - Floating badge сверху-справа: «📱 QR-код готов» (gold background)
  - Floating badge снизу-слева: «🌐 3 языка / Гость выбирает сам» (dark card)

### Features

- Фон: `#fafafa`
- Header: dark pill-label «Возможности», h2 44px/900, subtitle
- Grid: 3 колонки, gap 20px, 6 карточек
- Карточки: `bg-white border border-#e8e8e8 rounded-2xl p-7`, hover: `translateY(-4px) + shadow`
- Иконки: 48×48, `bg-#1a1510 rounded-xl`, эмодзи или lucide

### Pricing

- Фон: `#f4f0e8` (тёплый кремовый для отличия от Features)
- Три колонки, max-width 900px, centered
- **Free:** белый фон, цена «0 навсегда», кнопка dark
- **Starter (highlighted):** `bg-#1a1510 border-2 border-#c9a962`, цена «99 000 сум/мес» gold, кнопка gold, badge «✦ Популярный» top-center
- **Pro:** белый фон, цена «299 000 сум/мес», кнопка dark

### Steps

- Фон: `#1a1510` (тёмный, контраст после светлого Pricing)
- Три колонки с горизонтальной линией-коннектором (gold gradient, top: 52px)
- Иконки: круглые 104×104, `bg-#2d2520`, число-бейдж top-right (gold)
- Заголовки white, описания 50% white opacity

### FAQ

- Фон: `#fafafa`
- Аккордеон: карточки `bg-white border rounded-2xl`, `+` стрелка gold, click раскрывает ответ (логика аккордеона уже есть в текущем FAQ.tsx через useState — только рестайлинг)
- Max-width 680px, centered
- **Обновить текст:** ответ на «Какие способы оплаты» — убрать «Kaspi ГП» (казахский сервис), заменить на нейтральное «банковские карты Visa/Mastercard и популярные платёжные системы»

### CTA

- Фон: `#1a1510`
- Блок: max-width 780px, `bg-gradient(#2d2520→#1a1510)`, `border rgba(c9a962, 0.2)`, `border-radius 32px`, `box-shadow glow`
- Декоративный glow в углу (radial gradient)
- Заголовок 52px, подзаголовок, одна кнопка gold

### Footer

- Без изменений (уже соответствует стилю)

---

## Animations

Использовать Intersection Observer для scroll-triggered анимаций:

```css
/* Добавить в index.css */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 0.5s ease-out forwards;
}
.opacity-0 { opacity: 0; }
```

Hook `useInView` (или простой IntersectionObserver) применяется к:
- Hero левой колонке (delay 0ms)
- Hero правой колонке / телефону (delay 150ms)
- Каждой feature-карточке (stagger 75ms)
- Pricing-карточкам (stagger 100ms)
- Step-элементам (stagger 150ms)

---

## Currency & Locale

- Все цены в сумах: `0`, `99 000 сум/мес`, `299 000 сум/мес`
- Мокап телефона: цены блюд в сумах (примеры: 45 000, 32 000, 120 000)
- Языки в телефоне: РУС / ENG / UZB
- Убрать все упоминания «казахского» — заменить на «узбекский» там где используется в тексте

---

## Implementation Notes

- Все стили через TailwindCSS 4 + существующие CSS custom properties из `index.css`
- Новые утилиты добавляются в `@layer utilities` в `index.css`
- Новый `Nav` компонент — отдельный файл `components/Nav.tsx`
- Floating phone badges реализованы через `position: absolute` внутри relative-контейнера
- Phone mockup — чистый JSX/CSS, без внешних библиотек
- FAQ accordion — локальный state (`useState`) без библиотеки

---

## Files to Create / Modify

| File | Action |
|---|---|
| `apps/web/src/features/landing/components/Nav.tsx` | CREATE |
| `apps/web/src/features/landing/components/Hero.tsx` | REWRITE |
| `apps/web/src/features/landing/components/Features.tsx` | REWRITE |
| `apps/web/src/features/landing/components/Pricing.tsx` | REWRITE |
| `apps/web/src/features/landing/components/Steps.tsx` | REWRITE |
| `apps/web/src/features/landing/components/FAQ.tsx` | REWRITE |
| `apps/web/src/features/landing/components/CTA.tsx` | REWRITE |
| `apps/web/src/features/landing/pages/LandingPage.tsx` | MODIFY (add Nav) |
| `apps/web/src/index.css` | MODIFY (add animation utilities) |
