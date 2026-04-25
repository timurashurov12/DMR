import { useInView } from '@/features/landing/lib/useInView';

const features = [
  {
    emoji: '🌐',
    title: 'Мультиязычность',
    description: 'Меню на русском, узбекском и английском. Гости выбирают язык сами.',
  },
  {
    emoji: '📲',
    title: 'QR-код для меню',
    description: 'Автоматическая генерация QR-кодов для каждого меню. Печатайте или отправляйте гостям.',
  },
  {
    emoji: '📱',
    title: 'Адаптивный дизайн',
    description: 'Идеально выглядит на любом устройстве: смартфоне, планшете или десктопе.',
  },
  {
    emoji: '⚡',
    title: 'Быстрое управление',
    description: 'Добавление блюд, изменение цен и обновление меню в несколько кликов.',
  },
  {
    emoji: '📊',
    title: 'Аналитика заказов',
    description: 'Отслеживайте популярность блюд и поведение гостей.',
  },
  {
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
          ref={header.ref}
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
      ref={ref}
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
      <p className="text-sm leading-relaxed" style={{ color: '#6b6560' }}>{feature.description}</p>
    </div>
  );
}
