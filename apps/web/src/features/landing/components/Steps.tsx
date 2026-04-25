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
          ref={header.ref}
          className={`text-center mb-14 opacity-0 ${header.inView ? 'animate-fade-up' : ''}`}
        >
          <span
            className="inline-flex text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{ background: '#c9a962', color: '#1a1510', letterSpacing: '1.5px' }}
          >
            Как это работает
          </span>
          <h2 className="text-[44px] font-black mb-3 text-inverse" style={{ letterSpacing: '-1px' }}>
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
      ref={ref}
      className={`relative text-center px-8 opacity-0 ${inView ? 'animate-fade-up' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative inline-flex mb-6">
        <div
          className="rounded-full flex items-center justify-center"
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
