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
    price: '299 000',
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
          ref={header.ref}
          className={`text-center mb-14 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#1a1510', color: '#c9a962', letterSpacing: '1.5px' }}
          >
            Тарифы
          </span>
          <h2 className="text-[44px] font-black mb-3" style={{ color: '#1a1510', letterSpacing: '-1px' }}>
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
      ref={ref}
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
