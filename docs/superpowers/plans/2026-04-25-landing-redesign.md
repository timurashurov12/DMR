# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полностью переделать главную страницу DMR: тёмный split-hero с phone-мокапом, светлые секции Features/Pricing, лёгкие scroll-анимации, цены в узбекских сумах.

**Architecture:** Каждый компонент переписывается отдельно. Новый `Nav` компонент добавляется в `LandingPage`. `useInView` hook запускает fade-up анимацию через IntersectionObserver при попадании элемента в viewport. CSS-анимации добавляются в `index.css`.

**Tech Stack:** React 19, React Router 7, TailwindCSS 4, Vitest + React Testing Library, lucide-react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/web/src/index.css` | Modify | Добавить `@keyframes fade-up` и `.animate-fade-up` |
| `apps/web/src/features/landing/lib/useInView.ts` | Create | IntersectionObserver hook для scroll-анимаций |
| `apps/web/src/features/landing/components/Nav.tsx` | Create | Sticky navbar с blur backdrop |
| `apps/web/src/features/landing/components/Nav.test.tsx` | Create | Тест Nav |
| `apps/web/src/features/landing/components/Hero.tsx` | Rewrite | Split-layout герой с phone-мокапом |
| `apps/web/src/features/landing/components/Hero.test.tsx` | Create | Тест Hero |
| `apps/web/src/features/landing/components/Features.tsx` | Rewrite | Светлые карточки возможностей |
| `apps/web/src/features/landing/components/Features.test.tsx` | Create | Тест Features |
| `apps/web/src/features/landing/components/Pricing.tsx` | Rewrite | Тарифы в сумах |
| `apps/web/src/features/landing/components/Pricing.test.tsx` | Create | Тест Pricing |
| `apps/web/src/features/landing/components/Steps.tsx` | Rewrite | Шаги с коннектором |
| `apps/web/src/features/landing/components/Steps.test.tsx` | Create | Тест Steps |
| `apps/web/src/features/landing/components/FAQ.tsx` | Rewrite | Рестайл аккордеона, убрать Kaspi |
| `apps/web/src/features/landing/components/FAQ.test.tsx` | Create | Тест FAQ |
| `apps/web/src/features/landing/components/CTA.tsx` | Rewrite | Блок призыва с gold glow |
| `apps/web/src/features/landing/components/CTA.test.tsx` | Create | Тест CTA |
| `apps/web/src/features/landing/pages/LandingPage.tsx` | Modify | Добавить `<Nav />` перед `<Hero />` |
| `apps/web/src/test/setup.ts` | Modify | Мок IntersectionObserver |

---

## Task 1: CSS анимации + IntersectionObserver мок в setup

**Files:**
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/test/setup.ts`

- [ ] **Step 1: Добавить keyframe и утилиты в index.css**

Добавить в конец файла `apps/web/src/index.css`:

```css
/* ── SCROLL ANIMATIONS ── */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.55s ease-out forwards;
}

.animation-delay-150 { animation-delay: 150ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-450 { animation-delay: 450ms; }
.animation-delay-600 { animation-delay: 600ms; }
```

- [ ] **Step 2: Добавить мок IntersectionObserver в setup.ts**

В файле `apps/web/src/test/setup.ts` добавить:

```ts
import '@testing-library/jest-dom/vitest';

const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(() => callback([{ isIntersecting: true }])),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});
```

- [ ] **Step 3: Создать useInView hook**

Создать файл `apps/web/src/features/landing/lib/useInView.ts`:

```ts
import { useEffect, useRef, useState } from 'react';

export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/index.css apps/web/src/test/setup.ts apps/web/src/features/landing/lib/useInView.ts
git commit -m "feat(landing): add scroll animation utilities and useInView hook"
```

---

## Task 2: Nav компонент

**Files:**
- Create: `apps/web/src/features/landing/components/Nav.tsx`
- Create: `apps/web/src/features/landing/components/Nav.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/Nav.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from './Nav';

describe('Nav', () => {
  const renderNav = () =>
    render(<MemoryRouter><Nav /></MemoryRouter>);

  it('renders logo text', () => {
    renderNav();
    expect(screen.getByText('DMR')).toBeTruthy();
  });

  it('renders navigation links', () => {
    renderNav();
    expect(screen.getByText('Тарифы')).toBeTruthy();
    expect(screen.getByText('Возможности')).toBeTruthy();
    expect(screen.getByText('FAQ')).toBeTruthy();
  });

  it('renders login and register buttons', () => {
    renderNav();
    expect(screen.getByText('Войти')).toBeTruthy();
    expect(screen.getByText('Начать бесплатно')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/Nav.test.tsx
```

Ожидается: FAIL — `Cannot find module './Nav'`

- [ ] **Step 3: Создать Nav.tsx**

Создать `apps/web/src/features/landing/components/Nav.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-16 py-4 backdrop-blur-md"
      style={{
        background: 'rgba(26, 21, 16, 0.88)',
        borderBottom: '1px solid rgba(201, 169, 98, 0.1)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-dark" />
        </div>
        <span className="text-lg font-bold text-inverse">DMR</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#pricing" className="text-sm font-medium text-inverse/55 hover:text-inverse transition-colors">
          Тарифы
        </a>
        <a href="#features" className="text-sm font-medium text-inverse/55 hover:text-inverse transition-colors">
          Возможности
        </a>
        <a href="#faq" className="text-sm font-medium text-inverse/55 hover:text-inverse transition-colors">
          FAQ
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="text-sm text-inverse/60 px-4 py-2 rounded-lg transition-colors hover:text-inverse"
          style={{ border: '1px solid rgba(255, 255, 255, 0.12)' }}
        >
          Войти
        </Link>
        <Link
          to="/register"
          className="text-sm font-bold text-dark bg-accent px-5 py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
        >
          Начать бесплатно
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/Nav.test.tsx
```

Ожидается: PASS (3 теста)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/Nav.tsx apps/web/src/features/landing/components/Nav.test.tsx
git commit -m "feat(landing): add sticky Nav component"
```

---

## Task 3: Обновить LandingPage

**Files:**
- Modify: `apps/web/src/features/landing/pages/LandingPage.tsx`

- [ ] **Step 1: Обновить LandingPage.tsx**

Заменить содержимое `apps/web/src/features/landing/pages/LandingPage.tsx`:

```tsx
import { Nav } from '@/features/landing/components/Nav';
import { Hero } from '@/features/landing/components/Hero';
import { Features } from '@/features/landing/components/Features';
import { Pricing } from '@/features/landing/components/Pricing';
import { Steps } from '@/features/landing/components/Steps';
import { FAQ } from '@/features/landing/components/FAQ';
import { CTA } from '@/features/landing/components/CTA';
import { Footer } from '@/features/landing/components/Footer';

export function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <Pricing />
      <Steps />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/landing/pages/LandingPage.tsx
git commit -m "feat(landing): add Nav to LandingPage"
```

---

## Task 4: Hero компонент

**Files:**
- Rewrite: `apps/web/src/features/landing/components/Hero.tsx`
- Create: `apps/web/src/features/landing/components/Hero.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/Hero.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from './Hero';

describe('Hero', () => {
  const renderHero = () =>
    render(<MemoryRouter><Hero /></MemoryRouter>);

  it('renders free trial badge', () => {
    renderHero();
    expect(screen.getByText(/14 дней бесплатно/i)).toBeTruthy();
  });

  it('renders main heading', () => {
    renderHero();
    expect(screen.getByText(/Цифровое меню/i)).toBeTruthy();
  });

  it('renders register CTA', () => {
    renderHero();
    const links = screen.getAllByRole('link');
    const registerLink = links.find((l) => l.textContent?.includes('Начать бесплатно'));
    expect(registerLink).toBeTruthy();
    expect(registerLink?.getAttribute('href')).toBe('/register');
  });

  it('renders phone mockup section', () => {
    renderHero();
    expect(screen.getByText('Ristorante Milano')).toBeTruthy();
  });

  it('renders trust badges', () => {
    renderHero();
    expect(screen.getByText(/Без кредитной карты/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/Hero.test.tsx
```

Ожидается: FAIL

- [ ] **Step 3: Переписать Hero.tsx**

Заменить содержимое `apps/web/src/features/landing/components/Hero.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

export function Hero() {
  const left = useInView();
  const right = useInView();

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden px-16 gap-16"
      style={{ background: '#1a1510' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(201,169,98,0.08), transparent)',
        }}
      />

      {/* Left column */}
      <div
        ref={left.ref as React.RefObject<HTMLDivElement>}
        className={`flex-1 max-w-xl relative z-10 opacity-0 ${left.inView ? 'animate-fade-up' : ''}`}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
          style={{
            background: 'rgba(201,169,98,0.1)',
            border: '1px solid rgba(201,169,98,0.25)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full bg-accent"
            style={{ animation: 'pulse 2s infinite' }}
          />
          <span className="text-sm font-semibold text-accent">
            14 дней бесплатно — без карты
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-6xl font-black leading-tight mb-5 text-inverse"
          style={{ letterSpacing: '-1.5px' }}
        >
          Цифровое меню
          <br />
          для вашего
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #c9a962, #e8c97a, #c9a962)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ресторана
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Создайте стильное онлайн-меню за 5 минут. Три языка, онлайн-заказы
          и интеграция с Telegram. Без программирования.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link to="/register" className="btn-accent text-base px-8 py-4">
            Начать бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#pricing" className="btn-outline text-base px-8 py-4" style={{ color: '#fafafa', borderColor: 'rgba(255,255,255,0.2)' }}>
            Смотреть тарифы
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-6">
          {[
            'Без кредитной карты',
            'Настройка за 5 минут',
            'Отмена в любой момент',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(34,197,94,0.15)' }}
              >
                <Check className="w-3 h-3 text-success" />
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right column — phone mockup */}
      <div
        ref={right.ref as React.RefObject<HTMLDivElement>}
        className={`shrink-0 relative flex items-center justify-center py-16 px-10 opacity-0 ${
          right.inView ? 'animate-fade-up animation-delay-150' : ''
        }`}
      >
        {/* Glow behind phone */}
        <div
          className="absolute w-72 h-96 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(201,169,98,0.12), transparent 70%)',
          }}
        />

        {/* Phone */}
        <div
          className="relative z-10 w-56"
          style={{
            border: '3px solid #2d2520',
            borderRadius: '36px',
            background: '#0f0c08',
            padding: '10px',
            boxShadow:
              '0 40px 80px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Notch */}
          <div
            className="mx-auto mb-2.5"
            style={{ width: 60, height: 6, borderRadius: 3, background: '#1a1510' }}
          />

          {/* Screen */}
          <div style={{ background: '#1a1510', borderRadius: 26, overflow: 'hidden' }}>
            {/* Header */}
            <div
              style={{
                padding: '10px 14px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="font-bold text-inverse" style={{ fontSize: 15 }}>
                Ristorante Milano
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                Главное меню
              </div>
              <div className="flex gap-1.5">
                {['РУС', 'ENG', 'UZB'].map((lang, i) => (
                  <span
                    key={lang}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: i === 0 ? '#c9a962' : 'rgba(255,255,255,0.07)',
                      color: i === 0 ? '#1a1510' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Menu items */}
            <div className="flex flex-col gap-2" style={{ padding: '12px 14px' }}>
              {[
                { name: 'Паста карбонара', desc: 'Спагетти, бекон, пармезан', price: '45 000 сум' },
                { name: 'Греческий салат', desc: 'Томаты, огурец, фета', price: '32 000 сум' },
                { name: 'Стейк рибай', desc: '250г, соус на выбор', price: '120 000 сум' },
                { name: 'Тирамису', desc: 'Классический, 150г', price: '28 000 сум' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center"
                  style={{ background: '#2d2520', borderRadius: 12, padding: '10px 12px' }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#fafafa', marginBottom: 2 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a962', marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating badge top-right */}
        <div
          className="absolute z-20"
          style={{
            top: 30,
            right: -10,
            background: '#c9a962',
            borderRadius: 14,
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1510' }}>📱 QR-код готов</div>
          <div style={{ fontSize: 9, color: 'rgba(26,21,16,0.65)' }}>Разместите на столиках</div>
        </div>

        {/* Floating badge bottom-left */}
        <div
          className="absolute z-20"
          style={{
            bottom: 60,
            left: -30,
            background: '#2d2520',
            border: '1px solid rgba(201,169,98,0.2)',
            borderRadius: 14,
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fafafa' }}>🌐 3 языка</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Гость выбирает сам</div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/Hero.test.tsx
```

Ожидается: PASS (5 тестов)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/Hero.tsx apps/web/src/features/landing/components/Hero.test.tsx
git commit -m "feat(landing): rewrite Hero with split layout and phone mockup"
```

---

## Task 5: Features компонент

**Files:**
- Rewrite: `apps/web/src/features/landing/components/Features.tsx`
- Create: `apps/web/src/features/landing/components/Features.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/Features.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from './Features';

describe('Features', () => {
  it('renders section heading', () => {
    render(<Features />);
    expect(screen.getByText('Всё для удобного меню')).toBeTruthy();
  });

  it('renders all 6 feature cards', () => {
    render(<Features />);
    expect(screen.getByText('Мультиязычность')).toBeTruthy();
    expect(screen.getByText('QR-код для меню')).toBeTruthy();
    expect(screen.getByText('Адаптивный дизайн')).toBeTruthy();
    expect(screen.getByText('Быстрое управление')).toBeTruthy();
    expect(screen.getByText('Аналитика заказов')).toBeTruthy();
    expect(screen.getByText('Telegram бот')).toBeTruthy();
  });

  it('mentions узбекский in multilanguage description', () => {
    render(<Features />);
    expect(screen.getByText(/узбекском/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/Features.test.tsx
```

Ожидается: FAIL (тест «mentions узбекский» — текущий компонент упоминает «казахском»)

- [ ] **Step 3: Переписать Features.tsx**

Заменить содержимое `apps/web/src/features/landing/components/Features.tsx`:

```tsx
import { Languages, QrCode, Smartphone, Zap, BarChart3, MessageCircle } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

const features = [
  {
    icon: Languages,
    emoji: '🌐',
    title: 'Мультиязычность',
    description: 'Меню на русском, узбекском и английском. Гости выбирают язык сами.',
  },
  {
    icon: QrCode,
    emoji: '📲',
    title: 'QR-код для меню',
    description: 'Автоматическая генерация QR-кодов для каждого меню. Печатайте или отправляйте гостям.',
  },
  {
    icon: Smartphone,
    emoji: '📱',
    title: 'Адаптивный дизайн',
    description: 'Идеально выглядит на любом устройстве: смартфоне, планшете или десктопе.',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'Быстрое управление',
    description: 'Добавление блюд, изменение цен и обновление меню в несколько кликов.',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Аналитика заказов',
    description: 'Отслеживайте популярность блюд и поведение гостей.',
  },
  {
    icon: MessageCircle,
    emoji: '✈️',
    title: 'Telegram бот',
    description: 'Уведомления о новых заказах прямо в ваш Telegram.',
  },
];

export function Features() {
  const header = useInView();

  return (
    <section id="features" className="py-24 px-16" style={{ background: '#fafafa' }}>
      <div className="landing-container">
        <div
          ref={header.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-14 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#1a1510', color: '#c9a962', letterSpacing: '1.5px' }}
          >
            Возможности
          </span>
          <h2 className="text-4xl font-black mb-3" style={{ color: '#1a1510', letterSpacing: '-1px' }}>
            Всё для удобного меню
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            Простой интерфейс — управляйте меню без помощи программиста
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} delay={i * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  delay,
}: {
  feature: (typeof features)[0];
  delay: number;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`bg-white rounded-2xl p-7 opacity-0 transition-shadow duration-300 hover:shadow-lg cursor-default ${
        inView ? 'animate-fade-up' : ''
      }`}
      style={{
        border: '1px solid #e8e8e8',
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
        style={{ background: '#1a1510' }}
      >
        {feature.emoji}
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1510' }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
    </div>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/Features.test.tsx
```

Ожидается: PASS (3 теста)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/Features.tsx apps/web/src/features/landing/components/Features.test.tsx
git commit -m "feat(landing): rewrite Features with light cards and scroll animations"
```

---

## Task 6: Pricing компонент

**Files:**
- Rewrite: `apps/web/src/features/landing/components/Pricing.tsx`
- Create: `apps/web/src/features/landing/components/Pricing.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/Pricing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Pricing } from './Pricing';

describe('Pricing', () => {
  const renderPricing = () =>
    render(<MemoryRouter><Pricing /></MemoryRouter>);

  it('renders section heading', () => {
    renderPricing();
    expect(screen.getByText('Выберите свой план')).toBeTruthy();
  });

  it('renders Free plan as free', () => {
    renderPricing();
    expect(screen.getByText(/навсегда/i)).toBeTruthy();
  });

  it('renders Starter plan price in sum', () => {
    renderPricing();
    expect(screen.getByText(/99 000/)).toBeTruthy();
    expect(screen.getByText(/сум\/мес/)).toBeTruthy();
  });

  it('renders Pro plan price in sum', () => {
    renderPricing();
    expect(screen.getByText(/299 000/)).toBeTruthy();
  });

  it('marks Starter as popular', () => {
    renderPricing();
    expect(screen.getByText(/Популярный/i)).toBeTruthy();
  });

  it('all plan CTAs link to /register', () => {
    renderPricing();
    const links = screen.getAllByRole('link');
    const registerLinks = links.filter((l) => l.getAttribute('href') === '/register');
    expect(registerLinks.length).toBe(3);
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/Pricing.test.tsx
```

Ожидается: FAIL (цены в тенге, не в сумах)

- [ ] **Step 3: Переписать Pricing.tsx**

Заменить содержимое `apps/web/src/features/landing/components/Pricing.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'навсегда',
    description: 'Идеально для знакомства с сервисом',
    features: [
      '1 тип меню',
      'До 20 позиций',
      'Базовое оформление',
      'QR-код для меню',
      'Поддержка 1 языка',
    ],
    cta: 'Начать бесплатно',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '99 000',
    period: 'сум/мес',
    description: 'Для небольших кафе и ресторанов',
    features: [
      '3 типа меню',
      'До 100 позиций',
      'Мультиязычность (3 языка)',
      'Онлайн-заказы',
      'Telegram уведомления',
      'Без QR-брендинга',
    ],
    cta: 'Начать пробный период',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '299 000',
    period: 'сум/мес',
    description: 'Для требовательных проектов',
    features: [
      'Безлимит меню и позиций',
      'Мультиязычность (3 языка)',
      'Онлайн-заказы',
      'Telegram уведомления',
      'Брендированный QR-код',
      'Приоритетная поддержка',
      'Аналитика заказов',
    ],
    cta: 'Начать пробный период',
    highlight: false,
  },
];

export function Pricing() {
  const header = useInView();

  return (
    <section id="pricing" className="py-24 px-16" style={{ background: '#f4f0e8' }}>
      <div className="landing-container">
        <div
          ref={header.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-14 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#1a1510', color: '#c9a962', letterSpacing: '1.5px' }}
          >
            Тарифы
          </span>
          <h2 className="text-4xl font-black mb-3" style={{ color: '#1a1510', letterSpacing: '-1px' }}>
            Выберите свой план
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            Все тарифы включают 14-дневный пробный период. Без скрытых платежей и обязательств.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  delay,
}: {
  plan: (typeof plans)[0];
  delay: number;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative rounded-3xl p-9 opacity-0 ${inView ? 'animate-fade-up' : ''}`}
      style={{
        animationDelay: `${delay}ms`,
        background: plan.highlight ? '#1a1510' : '#ffffff',
        border: plan.highlight ? '2px solid #c9a962' : '1px solid #e5e0d5',
      }}
    >
      {plan.highlight && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-3.5 text-xs font-bold px-4 py-1.5 rounded-full"
          style={{ background: '#c9a962', color: '#1a1510', whiteSpace: 'nowrap' }}
        >
          ✦ Популярный
        </div>
      )}

      <div className="mb-6">
        <h3
          className="text-xl font-extrabold mb-1"
          style={{ color: plan.highlight ? '#fafafa' : '#1a1510' }}
        >
          {plan.name}
        </h3>
        <p className="text-sm" style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#6b6560' }}>
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <span
          className="text-4xl font-black"
          style={{ color: plan.highlight ? '#c9a962' : '#1a1510' }}
        >
          {plan.price}
        </span>
        <span
          className="text-base ml-1"
          style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#6b6560' }}
        >
          {plan.period}
        </span>
      </div>

      <ul className="space-y-2.5 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: plan.highlight ? 'rgba(201,169,98,0.15)' : 'rgba(34,197,94,0.12)',
              }}
            >
              <Check
                className="w-3 h-3"
                style={{ color: plan.highlight ? '#c9a962' : '#22c55e' }}
              />
            </div>
            <span
              className="text-sm"
              style={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#1a1510' }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to="/register"
        className={plan.highlight ? 'btn-accent w-full justify-center' : 'btn-primary w-full justify-center'}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/Pricing.test.tsx
```

Ожидается: PASS (6 тестов)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/Pricing.tsx apps/web/src/features/landing/components/Pricing.test.tsx
git commit -m "feat(landing): rewrite Pricing with Uzbek som prices"
```

---

## Task 7: Steps компонент

**Files:**
- Rewrite: `apps/web/src/features/landing/components/Steps.tsx`
- Create: `apps/web/src/features/landing/components/Steps.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/Steps.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Steps } from './Steps';

describe('Steps', () => {
  it('renders heading', () => {
    render(<Steps />);
    expect(screen.getByText('3 простых шага')).toBeTruthy();
  });

  it('renders all 3 step titles', () => {
    render(<Steps />);
    expect(screen.getByText('Регистрация')).toBeTruthy();
    expect(screen.getByText('Создание меню')).toBeTruthy();
    expect(screen.getByText('QR-код готов')).toBeTruthy();
  });

  it('renders step numbers', () => {
    render(<Steps />);
    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('02')).toBeTruthy();
    expect(screen.getByText('03')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/Steps.test.tsx
```

Ожидается: FAIL (номера шагов «01», «02», «03» не рендерятся в текущей версии)

- [ ] **Step 3: Переписать Steps.tsx**

Заменить содержимое `apps/web/src/features/landing/components/Steps.tsx`:

```tsx
import { UserPlus, Utensils, QrCode } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Регистрация',
    description: 'Создайте аккаунт за 30 секунд. Укажите название и тип вашего заведения.',
  },
  {
    icon: Utensils,
    number: '02',
    title: 'Создание меню',
    description: 'Добавьте блюда, категории и цены. Загрузите фотографии.',
  },
  {
    icon: QrCode,
    number: '03',
    title: 'QR-код готов',
    description: 'Скачайте QR-код и разместите на столиках. Гости сканируют и видят меню.',
  },
];

export function Steps() {
  const header = useInView();

  return (
    <section id="how-it-works" className="py-24 px-16" style={{ background: '#1a1510' }}>
      <div className="landing-container">
        <div
          ref={header.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-14 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#c9a962', color: '#1a1510', letterSpacing: '1.5px' }}
          >
            Как это работает
          </span>
          <h2 className="text-4xl font-black mb-3 text-inverse" style={{ letterSpacing: '-1px' }}>
            3 простых шага
          </h2>
          <p className="text-lg max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            От регистрации до готового цифрового меню — меньше чем за 10 минут
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-0 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute h-px"
            style={{
              top: 52,
              left: 'calc(16.66% + 16px)',
              right: 'calc(16.66% + 16px)',
              background: 'linear-gradient(90deg, rgba(201,169,98,0.3), rgba(201,169,98,0.6), rgba(201,169,98,0.3))',
            }}
          />

          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, delay }: { step: (typeof steps)[0]; delay: number }) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative text-center px-8 opacity-0 ${inView ? 'animate-fade-up' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative inline-flex mb-6">
        <div
          className="w-26 h-26 rounded-full flex items-center justify-center"
          style={{
            width: 104,
            height: 104,
            background: '#2d2520',
            border: '1px solid rgba(201,169,98,0.15)',
          }}
        >
          <step.icon className="w-10 h-10 text-accent" />
        </div>
        <span
          className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
          style={{ background: '#c9a962', color: '#1a1510' }}
        >
          {step.number}
        </span>
      </div>
      <h3 className="text-xl font-bold text-inverse mb-3">{step.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {step.description}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/Steps.test.tsx
```

Ожидается: PASS (3 теста)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/Steps.tsx apps/web/src/features/landing/components/Steps.test.tsx
git commit -m "feat(landing): rewrite Steps with connector line and numbered badges"
```

---

## Task 8: FAQ компонент

**Files:**
- Rewrite: `apps/web/src/features/landing/components/FAQ.tsx`
- Create: `apps/web/src/features/landing/components/FAQ.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/FAQ.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAQ } from './FAQ';

describe('FAQ', () => {
  it('renders heading', () => {
    render(<FAQ />);
    expect(screen.getByText('Часто задаваемые вопросы')).toBeTruthy();
  });

  it('renders all questions', () => {
    render(<FAQ />);
    expect(screen.getByText('Сколько стоит пробный период?')).toBeTruthy();
    expect(screen.getByText('Можно ли отменить подписку?')).toBeTruthy();
    expect(screen.getByText('Нужны ли технические навыки?')).toBeTruthy();
  });

  it('opens answer on click', () => {
    render(<FAQ />);
    const question = screen.getByText('Сколько стоит пробный период?');
    fireEvent.click(question);
    expect(screen.getByText(/абсолютно бесплатный/i)).toBeTruthy();
  });

  it('does not mention Kaspi', () => {
    render(<FAQ />);
    expect(screen.queryByText(/Kaspi/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/FAQ.test.tsx
```

Ожидается: FAIL (тест «does not mention Kaspi» — текущая версия содержит «Kaspi ГП»)

- [ ] **Step 3: Переписать FAQ.tsx**

Заменить содержимое `apps/web/src/features/landing/components/FAQ.tsx`:

```tsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

const faqs = [
  {
    question: 'Сколько стоит пробный период?',
    answer: 'Пробный период абсолютно бесплатный и длится 14 дней. Вам не нужно указывать данные банковской карты для начала.',
  },
  {
    question: 'Можно ли отменить подписку?',
    answer: 'Да, вы можете отменить подписку в любой момент в личном кабинете. После отмены доступ к платным функциям сохранится до конца оплаченного периода.',
  },
  {
    question: 'Какие способы оплаты поддерживаются?',
    answer: 'Принимаем банковские карты Visa и Mastercard, а также популярные платёжные системы. Список доступных методов расширяется.',
  },
  {
    question: 'Можно ли использовать сервис для нескольких заведений?',
    answer: 'Да, на тарифах Starter и Pro вы можете управлять несколькими заведениями из одного аккаунта.',
  },
  {
    question: 'Нужны ли технические навыки?',
    answer: 'Нет, наш сервис создан для людей без технического образования. Интерфейс интуитивно понятен и не требует обучения.',
  },
  {
    question: 'Есть ли мобильное приложение?',
    answer: 'Для гостей меню работает в браузере без установки приложения. Для администрирования также можно использовать браузер на любом устройстве.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const header = useInView();

  return (
    <section id="faq" className="py-24 px-16" style={{ background: '#fafafa' }}>
      <div className="landing-container">
        <div
          ref={header.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-12 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#1a1510', color: '#c9a962', letterSpacing: '1.5px' }}
          >
            Вопросы
          </span>
          <h2 className="text-4xl font-black mb-3" style={{ color: '#1a1510', letterSpacing: '-1px' }}>
            Часто задаваемые вопросы
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            Ответы на популярные вопросы о нашем сервисе
          </p>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e8e8e8' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-stone-50"
              >
                <span className="font-semibold pr-4" style={{ color: '#1a1510' }}>
                  {faq.question}
                </span>
                <ChevronDown
                  className="w-5 h-5 shrink-0 transition-transform duration-200"
                  style={{
                    color: '#c9a962',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/FAQ.test.tsx
```

Ожидается: PASS (4 теста)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/FAQ.tsx apps/web/src/features/landing/components/FAQ.test.tsx
git commit -m "feat(landing): restyle FAQ accordion and remove Kaspi reference"
```

---

## Task 9: CTA компонент

**Files:**
- Rewrite: `apps/web/src/features/landing/components/CTA.tsx`
- Create: `apps/web/src/features/landing/components/CTA.test.tsx`

- [ ] **Step 1: Написать тест**

Создать `apps/web/src/features/landing/components/CTA.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CTA } from './CTA';

describe('CTA', () => {
  const renderCTA = () =>
    render(<MemoryRouter><CTA /></MemoryRouter>);

  it('renders heading', () => {
    renderCTA();
    expect(screen.getByText('Готовы начать?')).toBeTruthy();
  });

  it('renders register link', () => {
    renderCTA();
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/register');
    expect(link.textContent).toContain('Создать аккаунт бесплатно');
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
cd apps/web && npx vitest run src/features/landing/components/CTA.test.tsx
```

Ожидается: FAIL

- [ ] **Step 3: Переписать CTA.tsx**

Заменить содержимое `apps/web/src/features/landing/components/CTA.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useInView } from '@/features/landing/lib/useInView';

export function CTA() {
  const { ref, inView } = useInView();

  return (
    <section className="py-24 px-16" style={{ background: '#1a1510' }}>
      <div className="landing-container">
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`max-w-3xl mx-auto text-center rounded-3xl px-16 py-20 relative overflow-hidden opacity-0 ${
            inView ? 'animate-fade-up' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #2d2520 0%, #1a1510 100%)',
            border: '1px solid rgba(201, 169, 98, 0.2)',
            boxShadow: '0 0 80px -20px rgba(201, 169, 98, 0.1)',
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,169,98,0.08), transparent 70%)',
            }}
          />

          <h2
            className="text-5xl font-black text-inverse mb-4 relative"
            style={{ letterSpacing: '-1px' }}
          >
            Готовы начать?
          </h2>
          <p className="text-lg mb-10 relative" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Присоединяйтесь к сотням заведений, которые уже используют цифровое меню DMR
          </p>
          <Link to="/register" className="btn-accent text-base px-8 py-4 inline-flex relative">
            Создать аккаунт бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
cd apps/web && npx vitest run src/features/landing/components/CTA.test.tsx
```

Ожидается: PASS (2 теста)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/landing/components/CTA.tsx apps/web/src/features/landing/components/CTA.test.tsx
git commit -m "feat(landing): rewrite CTA with dark glow box"
```

---

## Task 10: Финальная проверка

- [ ] **Step 1: Запустить все тесты лэндинга**

```bash
cd apps/web && npx vitest run src/features/landing/
```

Ожидается: все тесты PASS, 0 failures

- [ ] **Step 2: Запустить TypeScript проверку**

```bash
cd apps/web && npx tsc --noEmit
```

Ожидается: 0 ошибок

- [ ] **Step 3: Запустить dev сервер и проверить вручную**

```bash
cd apps/web && npm run dev
```

Открыть `http://localhost:5173` и проверить:
- [ ] Nav отображается sticky сверху
- [ ] Hero: split-layout, телефон с мокапом, floating badges видны
- [ ] Features: светлые карточки, hover-анимация работает
- [ ] Pricing: 3 плана, цены «0», «99 000 сум/мес», «299 000 сум/мес»
- [ ] Starter выделен золотой рамкой и бейджем «Популярный»
- [ ] Steps: числа 01/02/03, горизонтальная линия между ними
- [ ] FAQ: аккордеон открывается/закрывается по клику
- [ ] CTA: тёмный блок с gold glow
- [ ] Scroll-анимации: элементы fade-in при прокрутке

- [ ] **Step 4: Финальный коммит**

```bash
git add -A
git commit -m "feat(landing): complete landing page redesign

- Dark split-hero with phone mockup (public menu, uzbek prices)
- Light Features and Pricing sections
- Uzbek som pricing: Free / 99 000 / 299 000 сум/мес
- Sticky Nav with blur backdrop
- Scroll fade-up animations via IntersectionObserver
- Updated language references: uzbek instead of kazakh
- Removed Kaspi payment reference, replaced with Visa/Mastercard"
```
