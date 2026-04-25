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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(201,169,98,0.08), transparent)',
        }}
      />

      {/* Left column */}
      <div
        ref={left.ref}
        className={`flex-1 max-w-xl relative z-10 opacity-0 ${left.inView ? 'animate-fade-up' : ''}`}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
          style={{
            background: 'rgba(201,169,98,0.1)',
            border: '1px solid rgba(201,169,98,0.25)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold text-accent">
            14 дней бесплатно — без карты
          </span>
        </div>

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

        <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Создайте стильное онлайн-меню за 5 минут. Три языка, онлайн-заказы
          и интеграция с Telegram. Без программирования.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link to="/register" className="btn-accent text-base px-8 py-4">
            Начать бесплатно
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="btn-outline text-base px-8 py-4"
            style={{ color: '#fafafa', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Смотреть тарифы
          </a>
        </div>

        <div className="flex flex-wrap gap-6">
          {['Без кредитной карты', 'Настройка за 5 минут', 'Отмена в любой момент'].map((text) => (
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
        ref={right.ref}
        className={`shrink-0 relative flex items-center justify-center py-16 px-10 opacity-0 ${
          right.inView ? 'animate-fade-up animation-delay-150' : ''
        }`}
      >
        <div
          className="absolute w-72 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.12), transparent 70%)' }}
        />

        <div
          className="relative z-10 w-56"
          style={{
            border: '3px solid #2d2520',
            borderRadius: '36px',
            background: '#0f0c08',
            padding: '10px',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          <div
            className="mx-auto mb-2.5"
            style={{ width: 60, height: 6, borderRadius: 3, background: '#1a1510' }}
          />
          <div style={{ background: '#1a1510', borderRadius: 26, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{item.desc}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a962', marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute z-20"
          style={{
            top: 30, right: -10,
            background: '#c9a962', borderRadius: 14,
            padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1510' }}>📱 QR-код готов</div>
          <div style={{ fontSize: 9, color: 'rgba(26,21,16,0.65)' }}>Разместите на столиках</div>
        </div>

        <div
          className="absolute z-20"
          style={{
            bottom: 60, left: -30,
            background: '#2d2520', border: '1px solid rgba(201,169,98,0.2)', borderRadius: 14,
            padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fafafa' }}>🌐 3 языка</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Гость выбирает сам</div>
        </div>
      </div>
    </section>
  );
}
